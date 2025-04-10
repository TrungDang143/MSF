using api.AppUtils;
using api.DTO.Account;
using api.Interface;
using Azure.Core;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Data.SqlClient;
using System.Data;

namespace api.Services
{
    public class AccountService : IAccount
    {
        private readonly IConfiguration _config;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public AccountService(IConfiguration config, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment webHostEnvironment)
        {
            _config = config;
            _httpContextAccessor = httpContextAccessor;
            _webHostEnvironment = webHostEnvironment;
        }

        public BaseResponse ChangeRoleUser(ChangeRoleUserDto inputDto)
        {
            throw new NotImplementedException();
        }

        public BaseResponse ChangeStatusUser(ChangeStatusUserDto inputDto)
        {
            throw new NotImplementedException();
        }

        public BaseResponse CreateUser(CreateUserDto inputDto)
        {
            throw new NotImplementedException();
        }

        public BaseResponse DeleteUser(DeleteUserDto inputDto)
        {
            throw new NotImplementedException();
        }

        public BaseResponse FindUserByUsernameOrEmail(FindUserByUsernameOrEmailDto inputDto)
        {
            throw new NotImplementedException();
        }

        public BaseResponse GetAllUserAccounts()
        {
            var res = new BaseResponse();
            int roleID_Admin = 1;
            int roleID_SubAdmin = 3;
            int roleID_User = 2;
            GetAllAccountsOutDto model = new GetAllAccountsOutDto();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("sp_GetAllAccount", conn))
                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        DataTable dt = new DataTable();
                        adapter.Fill(dt);

                        if (dt.Rows.Count > 0)
                        {
                            DataTable dtAdmin = dt.Clone();
                            DataTable dtSubAdmin = dt.Clone();
                            DataTable dtUser = dt.Clone();

                            for (int i = 0; i < dt.Rows.Count; i++)
                            {
                                if ((int)dt.Rows[i]["roleID"] == roleID_Admin)
                                {
                                    dtAdmin.ImportRow(dt.Rows[i]);
                                }
                                else if ((int)dt.Rows[i]["roleID"] == roleID_SubAdmin)
                                {
                                    dtSubAdmin.ImportRow(dt.Rows[i]);
                                }
                                else if ((int)dt.Rows[i]["roleID"] == roleID_User)
                                {
                                    dtUser.ImportRow(dt.Rows[i]);
                                }
                            }

                            model.Admins = dtAdmin.ConvertToList<Account>();
                            model.SubAdmins = dtSubAdmin.ConvertToList<Account>();
                            model.Users = dtUser.ConvertToList<Account>();

                            res.Message = "Success!";
                            res.Data = model;
                            res.Result = AppConstant.RESULT_SUCCESS;
                        }
                        else
                        {
                            res.Message = "Không tìm thấy tài khoản";
                            res.Result = AppConstant.RESULT_ERROR;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }

            return res;
        }

        public BaseResponse GetDetailUserInfo(GetDetailUserInfoInDto inputDto)
        {
            var res = new BaseResponse();
            GetDetailUserInfoOutDto model = new GetDetailUserInfoOutDto();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetUserByUserID", conn))
                using (SqlCommand cmd_role = new SqlCommand("sp_GetRole", conn))
                using (SqlCommand cmd_status = new SqlCommand("sp_GetStatus", conn))
                using (SqlCommand cmd_gender = new SqlCommand("sp_GetGenders", conn))
                using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                using (SqlDataAdapter adapter_role = new SqlDataAdapter(cmd_role))
                using (SqlDataAdapter adapter_status = new SqlDataAdapter(cmd_status))
                using (SqlDataAdapter adapter_gender = new SqlDataAdapter(cmd_gender))
                {
                    conn.Open();

                    var userIDPrm = new SqlParameter("@UserID", inputDto.UserID);

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(userIDPrm);

                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    model.UserID = (int)dt.Rows[0]["UserID"];
                    model.Username = dt.Rows[0]["Username"].ToString();
                    //model.PasswordHash = dt.Rows[0]["PasswordHash"].ToString();
                    model.Email = dt.Rows[0]["Email"].ToString();
                    model.FullName = dt.Rows[0]["FullName"]?.ToString();
                    model.PhoneNumber = dt.Rows[0]["PhoneNumber"]?.ToString();
                    model.Avatar = getAvatarBase64(dt.Rows[0]["Avatar"]?.ToString());
                    var date = dt.Rows[0]["DateOfBirth"] != DBNull.Value ? (DateTime)dt.Rows[0]["DateOfBirth"] : new DateTime();
                    model.DateOfBirth = date > new DateTime() ? date.ToString("dd-MM-yyyy") : string.Empty;
                    model.Gender = dt.Rows[0]["Gender"] != DBNull.Value ? (byte?)dt.Rows[0]["Gender"] : null;
                    model.Address = dt.Rows[0]["Address"]?.ToString();
                    model.Status = dt.Rows[0]["Status"] != DBNull.Value ? (byte?)dt.Rows[0]["Status"] : null;
                    var createAt = dt.Rows[0]["CreatedAt"] != DBNull.Value ? (DateTime)dt.Rows[0]["CreatedAt"] : new DateTime();
                    model.CreatedAt = createAt > new DateTime() ? createAt.ToString("hh:mm:ss dd-MM-yyyy") : "###";
                    var updateAt = dt.Rows[0]["UpdatedAt"] != DBNull.Value ? (DateTime)dt.Rows[0]["UpdatedAt"] : new DateTime();
                    model.UpdatedAt = updateAt > new DateTime() ? updateAt.ToString("hh:mm:ss dd-MM-yyyy") : "###";
                    model.GoogleID = dt.Rows[0]["GoogleID"]?.ToString();
                    model.FacebookID = dt.Rows[0]["FacebookID"]?.ToString();
                    model.Otp = dt.Rows[0]["otp"]?.ToString();
                    model.RoleID = dt.Rows[0]["roleID"] != DBNull.Value ? (int?)dt.Rows[0]["roleID"] : null;
                    var locktime = dt.Rows[0]["LockTime"] != DBNull.Value ? (DateTime)dt.Rows[0]["LockTime"] : new DateTime();
                    model.LockTime = locktime > new DateTime() ? locktime.ToString("hh:mm:ss dd-MM-yyyy") : "###";
                    model.RemainTime = dt.Rows[0]["RemainTime"] != DBNull.Value ? (byte?)dt.Rows[0]["RemainTime"] : null;

                    dt.Clear();
                    cmd_role.CommandType = CommandType.StoredProcedure;
                    adapter_role.Fill(dt);
                    model.ListRole = dt.ConvertToList<Role>();

                    dt.Clear();
                    cmd_status.CommandType = CommandType.StoredProcedure;
                    adapter_status.Fill(dt);
                    model.ListStatus = dt.ConvertToList<Status>();

                    dt.Clear();
                    cmd_gender.CommandType = CommandType.StoredProcedure;
                    adapter_gender.Fill(dt);
                    model.ListGender = dt.ConvertToList<Gender>();

                    res.Data = model;
                    res.Result = AppConstant.RESULT_SUCCESS;
                    res.Message = "Get detail user info thanh cong";
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }
            return res;
        }

        public BaseResponse GetUserInfo(GetUserInfoInDto inputDto)
        {
            var res = new BaseResponse();
            GetUserInfoOutDto model = new GetUserInfoOutDto();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetUserByUsernameOrEmail", conn))
                using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                {
                    conn.Open();

                    var usernamePrm = new SqlParameter("@UsernameOrEmail", inputDto.Username);

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(usernamePrm);

                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    model.Avatar = getAvatarBase64(dt.Rows[0]["Avatar"].ToString());
                    model.Address = dt.Rows[0]["Address"].ToString();
                    model.PhoneNumber = dt.Rows[0]["PhoneNumber"].ToString();
                    model.Gender = dt.Rows[0]["Gender"] != DBNull.Value ? (byte)dt.Rows[0]["Gender"] : null;
                    model.DateOfBirth = dt.Rows[0]["DateOfBirth"] != DBNull.Value ? (DateTime)dt.Rows[0]["DateOfBirth"] : null;
                    model.Email = dt.Rows[0]["Email"].ToString();
                    model.Fullname = dt.Rows[0]["FullName"].ToString();
                    model.Username = dt.Rows[0]["Username"].ToString();
                    model.Status = dt.Rows[0]["Status"] != DBNull.Value ? (byte)dt.Rows[0]["Status"] : null;
                    model.IsFB = !string.IsNullOrEmpty(dt.Rows[0]["FacebookID"].ToString());
                    model.IsGG = !string.IsNullOrEmpty(dt.Rows[0]["GoogleID"].ToString());
                    model.RoleID = dt.Rows[0]["roleID"] != DBNull.Value ? (int)dt.Rows[0]["roleID"] : null;

                    res.Data = model;
                    res.Result = AppConstant.RESULT_SUCCESS;
                    res.Message = "Get user info thanh cong";
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }
            return res;
        }

        object DbNullIfNull(object value) =>
            value switch
            {
                null => DBNull.Value,
                string s when string.IsNullOrWhiteSpace(s) => DBNull.Value,
                _ => value
            };
        private string getAvatarBase64(string path)
        {
            var imagePath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads/avatars", path);
            string base64 = string.Empty;

            if (System.IO.File.Exists(imagePath))
            {
                var imageBytes = System.IO.File.ReadAllBytes(imagePath);
                var base64String = Convert.ToBase64String(imageBytes);
                base64 = "data:image/png;base64," + base64String;
            }

            return base64;

        }
        private string saveAvatar(string base64)
        {
            var base64String = base64.Replace("data:image/png;base64,", "")
                                   .Replace("data:image/jpeg;base64,", "");

            byte[] imageBytes = Convert.FromBase64String(base64String);
            var fileName = Guid.NewGuid().ToString() + ".png";
            var filePath = Path.Combine("wwwroot/uploads", fileName);

            System.IO.File.WriteAllBytes(filePath, imageBytes);

            var request = _httpContextAccessor.HttpContext.Request;
            var imageUrl = $"{request.Scheme}://{request.Host}/uploads/avatars/{fileName}";

            return filePath;
        }
        public BaseResponse UpdateUser(UpdateUserDto inputDto)
        {
            var res = new BaseResponse();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_UpdateUserInfo", conn))
                {
                    conn.Open();
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    if (string.IsNullOrEmpty(inputDto.Avatar))
                    {
                        inputDto.Avatar = saveAvatar(inputDto.Avatar);

                    }

                    cmd.Parameters.AddWithValue("@UserID", inputDto.UserID);
                    cmd.Parameters.AddWithValue("@FullName", DbNullIfNull(inputDto.FullName)); //DBNull.Value
                    cmd.Parameters.AddWithValue("@PhoneNumber", DbNullIfNull(inputDto.PhoneNumber));
                    cmd.Parameters.AddWithValue("@Avatar", DbNullIfNull(inputDto.Avatar));
                    cmd.Parameters.AddWithValue("@DateOfBirth", DbNullIfNull(inputDto.DateOfBirth));
                    cmd.Parameters.AddWithValue("@Gender", DbNullIfNull(inputDto.Gender));
                    cmd.Parameters.AddWithValue("@Address", DbNullIfNull(inputDto.Address));
                    cmd.Parameters.AddWithValue("@Status", DbNullIfNull(inputDto.statusID));
                    cmd.Parameters.AddWithValue("@GoogleID", DbNullIfNull(inputDto.GoogleID));
                    cmd.Parameters.AddWithValue("@FacebookID", DbNullIfNull(inputDto.FacebookID));
                    cmd.Parameters.AddWithValue("@roleID", DbNullIfNull(inputDto.roleID));

                    cmd.ExecuteNonQuery();

                    res.Result = AppConstant.RESULT_SUCCESS;
                    res.Message = "update thanh cong";
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }
            return res;
        }
    }
}

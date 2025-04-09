using api.AppUtils;
using api.DTO.Account;
using api.Interface;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Data.SqlClient;
using System.Data;

namespace api.Services
{
    public class AccountService : IAccount
    {
        private readonly IConfiguration _config;

        public AccountService(IConfiguration config)
        {
            _config = config;
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
            int roleID_User= 2;
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

                            for (int i = 0; i< dt.Rows.Count; i++)
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
                using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
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
                    model.Avatar = dt.Rows[0]["Avatar"]?.ToString();
                    model.DateOfBirth = dt.Rows[0]["DateOfBirth"] != DBNull.Value ? (DateTime?)dt.Rows[0]["DateOfBirth"] : null;
                    model.Gender = dt.Rows[0]["Gender"] != DBNull.Value ? (byte?)dt.Rows[0]["Gender"] : null;
                    model.Address = dt.Rows[0]["Address"]?.ToString();
                    model.Status = dt.Rows[0]["Status"] != DBNull.Value ? (byte?)dt.Rows[0]["Status"] : null;
                    model.CreatedAt = dt.Rows[0]["CreatedAt"] != DBNull.Value ? (DateTime?)dt.Rows[0]["CreatedAt"] : null;
                    model.UpdatedAt = dt.Rows[0]["UpdatedAt"] != DBNull.Value ? (DateTime?)dt.Rows[0]["UpdatedAt"] : null;
                    model.GoogleID = dt.Rows[0]["GoogleID"]?.ToString();
                    model.FacebookID = dt.Rows[0]["FacebookID"]?.ToString();
                    model.Otp = dt.Rows[0]["otp"]?.ToString();
                    model.RoleID = dt.Rows[0]["roleID"] != DBNull.Value ? (int?)dt.Rows[0]["roleID"] : null;
                    model.LockTime = dt.Rows[0]["LockTime"] != DBNull.Value ? (DateTime?)dt.Rows[0]["LockTime"] : null;
                    model.RemainTime = dt.Rows[0]["RemainTime"] != DBNull.Value ? (byte?)dt.Rows[0]["RemainTime"] : null;

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

                    model.Avatar = dt.Rows[0]["Avatar"].ToString();
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
            }catch(Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }
            return res;
        }

        public BaseResponse UpdateUser(UpdateUserDto inputDto)
        {
            throw new NotImplementedException();
        }
    }
}

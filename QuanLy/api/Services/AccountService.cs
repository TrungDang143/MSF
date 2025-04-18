using api.AppUtils;
using api.DTO.Account;
using api.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Linq.Expressions;
using System.Net;

namespace api.Services
{
    public class AccountService : IAccount
    {
        public BaseResponse CreateUser(CreateUserDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_CreateUser2", conn))
                using (SqlCommand cmd_permission = new SqlCommand("sp_UpdateUserPermissions", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    var passwordHash = HashPassword.Encrypt(inputDto.password);
                    if (!string.IsNullOrEmpty(inputDto.avatar))
                    {
                        inputDto.avatar = ImageBase64Helper.SaveAvatar(inputDto.avatar);
                    }
                    else
                    {
                        inputDto.avatar = ImageBase64Helper.SaveAvatar(AppConstant.DEFAULT_AVATAR);
                    }

                    cmd.Parameters.AddWithValue("@Username", inputDto.username);
                    cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);
                    cmd.Parameters.AddWithValue("@Email", inputDto.email);
                    cmd.Parameters.AddWithValue("@FullName", (object?)inputDto.fullName ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@PhoneNumber", (object?)inputDto.phoneNumber ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Avatar", (object?)inputDto.avatar ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@DateOfBirth", inputDto.dateOfBirth.HasValue ? inputDto.dateOfBirth.Value : (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@Gender", inputDto.gender.HasValue ? inputDto.gender.Value : (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@Address", (object?)inputDto.address ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Status", inputDto.status);
                    cmd.Parameters.AddWithValue("@GoogleID", (object?)inputDto.googleId ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@FacebookID", (object?)inputDto.facebookId ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@RoleID", inputDto.roleId.HasValue ? inputDto.roleId.Value : "Default");
                    cmd.Parameters.AddWithValue("@IsExternalAvatar", 0);

                    var rtnValue = new SqlParameter("@rtnValue", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output,
                    };
                    var rtnStatus = new SqlParameter("@rtnStatus", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output,
                    };
                    cmd.Parameters.Add(rtnValue);
                    cmd.Parameters.Add(rtnStatus);

                    conn.Open();
                    cmd.ExecuteNonQuery();

                    if((int)rtnStatus.Value == 1)
                    {
                        if (inputDto.permissionIds != null)
                        {
                            cmd_permission.CommandType = CommandType.StoredProcedure;
                            cmd_permission.Parameters.AddWithValue("@UserID", (int)rtnValue.Value);
                            var permissionIdsString = string.Join(",", inputDto.permissionIds);
                            cmd_permission.Parameters.AddWithValue("@PermissionIDs", !string.IsNullOrEmpty(permissionIdsString) ? permissionIdsString : DBNull.Value);
                            cmd_permission.ExecuteNonQuery();
                        }

                        res.Message = "Thêm user thành công!";
                        res.Result = AppConstant.RESULT_SUCCESS;
                    }
                    else
                    {
                        res.Message = "Thông tin user đã tồn tại!";
                        res.Result = AppConstant.RESULT_ERROR;
                    }

                }

                return res;
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }
            return res;
        }

        public BaseResponse DeleteUser(DeleteUserDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_DeleteUser", conn))
                {
                    conn.Open();
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserID", inputDto.UserID);

                    cmd.ExecuteNonQuery();
                }

                res.Result = AppConstant.RESULT_SUCCESS;
                res.Message = "Xoa thanh cong";
            }
            catch(Exception ex)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }

        public BaseResponse GetAllUserAccounts()
        {
            var res = new BaseResponse();
            GetAllAccountsOutDto model = new GetAllAccountsOutDto();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("sp_GetAllAccount", conn))
                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    using (SqlCommand cmd_role = new SqlCommand("sp_GetRole", conn))
                    using (SqlDataAdapter adapter_role = new SqlDataAdapter(cmd_role))
                    using (SqlCommand cmd_status = new SqlCommand("sp_GetStatus", conn))
                    using (SqlDataAdapter adapter_status = new SqlDataAdapter(cmd_status))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd_role.CommandType = CommandType.StoredProcedure;
                        cmd_status.CommandType = CommandType.StoredProcedure;

                        DataTable dt = new DataTable();
                        adapter.Fill(dt);
                        DataTable dt_role = new DataTable();
                        adapter_role.Fill(dt_role);
                        DataTable dt_status = new DataTable();
                        adapter_status.Fill(dt_status);

                        dt.Columns.Add("RoleName", typeof(String));
                        dt.Columns.Add("StatusName", typeof(String));

                        if (dt.Rows.Count > 0)
                        {
                            for (int i = 0; i < dt.Rows.Count; i++)
                            {
                                if (!string.IsNullOrEmpty(dt.Rows[i]["Avatar"]?.ToString()))
                                {
                                    dt.Rows[i]["Avatar"] = ImageBase64Helper.GetAvatar(dt.Rows[i]["IsExternalAvatar"].ToString(), dt.Rows[i]["Avatar"].ToString());
                                }
                                if (!string.IsNullOrEmpty(dt.Rows[i]["roleID"]?.ToString()))
                                {
                                    
                                    dt.Rows[i]["RoleName"] = getRoleName(dt_role, dt.Rows[i]["roleID"].ToString());
                                }
                                if (!string.IsNullOrEmpty(dt.Rows[i]["Status"]?.ToString()))
                                {
                                    
                                    dt.Rows[i]["StatusName"] = getStatusName(dt_status, dt.Rows[i]["Status"].ToString());
                                }
                                //dt.Rows[i]["GoogleID"] = !string.IsNullOrEmpty(dt.Rows[i]["GoogleID"]?.ToString()) ? true : false;
                                //dt.Rows[i]["FacebookID"] = !string.IsNullOrEmpty(dt.Rows[i]["FacebookID"]?.ToString()) ? true : false;

                                //var date = dt.Rows[0]["DateOfBirth"] != DBNull.Value ? (DateTime)dt.Rows[0]["DateOfBirth"] : new DateTime();
                                //dt.Rows[0]["DateOfBirth"] = date > new DateTime() ? date.ToString("dd-MM-yyyy") : string.Empty;
                            }

                            model.Users = dt.ConvertToList<Account>();
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
        private string getRoleName(DataTable dt, string roleID)
        {
            string result = string.Empty;
            foreach(DataRow dr in dt.Rows)
            {
                if (dr[0].ToString() == roleID)
                {
                    result = dr[1].ToString();
                    break;
                }
            }
            return result;
        }
        private string getStatusName(DataTable dt, string statusID)
        {
            string result = string.Empty;
            foreach (DataRow dr in dt.Rows)
            {
                if (dr[0].ToString() == statusID)
                {
                    result = dr[1].ToString();
                    break;
                }
            }
            return result;
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
                    model.Avatar = ImageBase64Helper.GetAvatar(dt.Rows[0]["IsExternalAvatar"].ToString(), dt.Rows[0]["Avatar"].ToString());
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
                using (SqlCommand cmd_gender = new SqlCommand("sp_GetGenders", conn))
                using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                using (SqlDataAdapter adapter_gender = new SqlDataAdapter(cmd_gender))
                {
                    conn.Open();

                    var usernamePrm = new SqlParameter("@UsernameOrEmail", inputDto.Username);

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(usernamePrm);

                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    model.Avatar = ImageBase64Helper.GetAvatar(dt.Rows[0]["IsExternalAvatar"].ToString(), dt.Rows[0]["Avatar"].ToString());
                    model.Address = dt.Rows[0]["Address"].ToString();
                    model.PhoneNumber = dt.Rows[0]["PhoneNumber"].ToString();
                    model.Gender = dt.Rows[0]["Gender"] != DBNull.Value ? (byte)dt.Rows[0]["Gender"] : null;
                    var date = dt.Rows[0]["DateOfBirth"] != DBNull.Value ? (DateTime)dt.Rows[0]["DateOfBirth"] : new DateTime();
                    model.DateOfBirth = date > new DateTime() ? date.ToString("dd-MM-yyyy") : string.Empty;
                    model.Email = dt.Rows[0]["Email"].ToString();
                    model.FullName = dt.Rows[0]["FullName"].ToString();
                    model.Username = dt.Rows[0]["Username"].ToString();
                    model.Status = dt.Rows[0]["Status"] != DBNull.Value ? (byte)dt.Rows[0]["Status"] : null;
                    model.FacebookID = !string.IsNullOrEmpty(dt.Rows[0]["FacebookID"].ToString());
                    model.GoogleID= !string.IsNullOrEmpty(dt.Rows[0]["GoogleID"].ToString());
                    model.RoleID = dt.Rows[0]["roleID"] != DBNull.Value ? (int)dt.Rows[0]["roleID"] : null;

                    dt.Clear();
                    cmd_gender.CommandType = CommandType.StoredProcedure;
                    adapter_gender.Fill(dt);
                    model.ListGender = dt.ConvertToList<Gender>();

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

                    if (!string.IsNullOrEmpty(inputDto.Avatar))
                    {
                        inputDto.Avatar = ImageBase64Helper.SaveAvatar(inputDto.Avatar);
                    }
                    else
                    {
                        inputDto.Avatar = AppConstant.DEFAULT_AVATAR;
                    }

                    cmd.Parameters.AddWithValue("@UserID", inputDto.UserID);
                    cmd.Parameters.AddWithValue("@FullName"     , Utils.DbNullIfNull(inputDto.FullName)); //DBNull.Value
                    cmd.Parameters.AddWithValue("@PhoneNumber"  , Utils.DbNullIfNull(inputDto.PhoneNumber));
                    cmd.Parameters.AddWithValue("@Avatar"       , Utils.DbNullIfNull(inputDto.Avatar));
                    cmd.Parameters.AddWithValue("@DateOfBirth"  , Utils.DbNullIfNull(inputDto.DateOfBirth));
                    cmd.Parameters.AddWithValue("@Gender"       , Utils.DbNullIfNull(inputDto.Gender));
                    cmd.Parameters.AddWithValue("@Address"      , Utils.DbNullIfNull(inputDto.Address));
                    cmd.Parameters.AddWithValue("@Status"       , Utils.DbNullIfNull(inputDto.statusID));
                    cmd.Parameters.AddWithValue("@GoogleID"     , Utils.DbNullIfNull(inputDto.GoogleID));
                    cmd.Parameters.AddWithValue("@FacebookID"   , Utils.DbNullIfNull(inputDto.FacebookID));
                    if (inputDto.roleID != null && inputDto.roleID == 1) inputDto.roleID = null;
                    cmd.Parameters.AddWithValue("@roleID"       , Utils.DbNullIfNull(inputDto.roleID));

                    cmd.ExecuteNonQuery();

                    res.Result = AppConstant.RESULT_SUCCESS;
                    res.Message = "Cập nhật thành công!";
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }
            return res;
        }

        public BaseResponse GetAllUserPermission(GetAllUserPermissionDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetAllPermissionsForUser", conn))
                using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                {
                    conn.Open();
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserID", inputDto.UserID);

                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    List<int> listPermissionIDs = new List<int>();
                    foreach(DataRow dr in dt.Rows)
                    {
                        listPermissionIDs.Add((int)dr[0]);
                    }
                    res.Data = listPermissionIDs;
                }

                res.Result = AppConstant.RESULT_SUCCESS;
                res.Message = "Get user permission thanh cong";
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }

        public BaseResponse UpdateUserPermission(UpdateUserPermissionDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_UpdateUserPermissions", conn))
                using (SqlCommand cmd_role = new SqlCommand("sp_GetRoleIDByUserID", conn))
                {
                    conn.Open();

                    cmd_role.CommandType = CommandType.StoredProcedure;
                    cmd_role.Parameters.AddWithValue("@UserID", inputDto.UserID);
                    var resultParam = new SqlParameter("@rtnvalue", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd_role.Parameters.Add(resultParam);

                    cmd_role.ExecuteNonQuery();

                    //int status = (int)cmd.Parameters["@Result"].Value;

                    if ((int)resultParam.Value != null)
                    {
                        if( (int)resultParam.Value == 1)
                        {
                            res.Message = "Không thể thay đổi quyền của role Admin!";
                            res.Result = AppConstant.RESULT_ERROR;
                            return res;
                        }
                    }


                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserID", inputDto.UserID);
                    var permissionIdsString = string.Join(",", inputDto.PermissionIds);
                    cmd.Parameters.AddWithValue("@PermissionIDs", !string.IsNullOrEmpty(permissionIdsString) ? permissionIdsString : DBNull.Value);

                    cmd.ExecuteNonQuery();

                    res.Message = "Cập nhật quyền user thành công!";
                    res.Result = AppConstant.RESULT_SUCCESS;
                }
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }

        public BaseResponse GetAllRole()
        {
            var res = new BaseResponse();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd_role = new SqlCommand("sp_GetRole", conn))
                using (SqlDataAdapter adapter_role = new SqlDataAdapter(cmd_role))
                {
                    conn.Open();

                    DataTable dt = new DataTable();

                    cmd_role.CommandType = CommandType.StoredProcedure;
                    adapter_role.Fill(dt);
                    List<Role> listRole = dt.ConvertToList<Role>();


                    res.Data = listRole;
                    res.Result = AppConstant.RESULT_SUCCESS;
                    res.Message = "Get role thanh cong";
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }
            return res;
        }

        public BaseResponse GetRoleGenderStatus()
        {
            var res = new BaseResponse();

            GetRoleGenderStatusOutDto model = new GetRoleGenderStatusOutDto();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd_role = new SqlCommand("sp_GetRole", conn))
                using (SqlDataAdapter adapter_role = new SqlDataAdapter(cmd_role))
                using (SqlCommand cmd_gender = new SqlCommand("sp_GetGenders", conn))
                using (SqlDataAdapter adapter_gender = new SqlDataAdapter(cmd_gender))
                using (SqlCommand cmd_status = new SqlCommand("sp_GetStatus", conn))
                using (SqlDataAdapter adapter_status = new SqlDataAdapter(cmd_status))
                {
                    conn.Open();

                    cmd_role.CommandType = CommandType.StoredProcedure;
                    cmd_gender.CommandType = CommandType.StoredProcedure;
                    cmd_status.CommandType = CommandType.StoredProcedure;

                    DataTable dt_role = new DataTable();
                    adapter_role.Fill(dt_role);

                    DataTable dt_gender = new DataTable();
                    adapter_gender.Fill(dt_gender);

                    DataTable dt_status = new DataTable();
                    adapter_status.Fill(dt_status);

                    model.listGender = dt_gender.ConvertToList<Gender>();
                    model.listStatus = dt_status.ConvertToList<Status>();
                    model.listRole = dt_role.ConvertToList<Role>();

                    res.Data = model;
                    res.Message = "Gen role status gender thanh cong";
                    res.Result = AppConstant.RESULT_SUCCESS;
                }
            }catch( Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }

            return res;
        }
    }
}

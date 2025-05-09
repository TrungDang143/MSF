using api.AppUtils;
using api.DTO.Account;
using api.DTO.SystemSetting;
using api.Interface;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using System;
using System.Data;
using System.Linq.Expressions;
using System.Net;

namespace api.Services
{
    public class AccountService : IAccount
    {
        public async Task<BaseResponse> CreateUser(CreateUserDto inputDto, int roleID)
        {
            var res = new BaseResponse();

            if (inputDto.roleId == 1 && roleID != 1)
            {
                res.Message = "Không thể set role Admin!";
                res.Result = AppConstant.RESULT_ERROR;
                return res;
            }

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
                    cmd.Parameters.AddWithValue("@isAdmin", roleID == 1 ? true : false);

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

                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();

                    if ((int)rtnStatus.Value == 1)
                    {
                        if (inputDto.permissionIds != null)
                        {
                            cmd_permission.CommandType = CommandType.StoredProcedure;
                            cmd_permission.Parameters.AddWithValue("@UserID", (int)rtnValue.Value);
                            if (inputDto.permissionIds != null)
                            {
                                string permissionIdsString = string.Join(",", inputDto.permissionIds);
                                cmd_permission.Parameters.AddWithValue("@PermissionIDs", !string.IsNullOrEmpty(permissionIdsString) ? permissionIdsString : DBNull.Value);
                            }
                            else
                            {
                                cmd_permission.Parameters.AddWithValue("@PermissionIDs", DBNull.Value);
                            }
                            await cmd_permission.ExecuteNonQueryAsync();
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

        public async Task<BaseResponse> DeleteUser(DeleteUserDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_DeleteUser", conn))
                {
                    await conn.OpenAsync();
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserID", inputDto.UserID);

                    await cmd.ExecuteNonQueryAsync();
                }

                res.Result = AppConstant.RESULT_SUCCESS;
                res.Message = "Xoa thanh cong";
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }

        public async Task<BaseResponse> GetAccounts(GetAccountsDto inputDto)
        {
            var res = new BaseResponse();
            GetAllAccountsOutDto model = new GetAllAccountsOutDto();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    await conn.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand("sp_GetAccount", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@UsernameOrEmail", Utils.DbNullIfNull(inputDto.UsernameOrEmail));
                        cmd.Parameters.AddWithValue("@fullName", Utils.DbNullIfNull(inputDto.Fullname));
                        cmd.Parameters.AddWithValue("@roleID", Utils.DbNullIfNull(inputDto.RoleID, Utils.IsGreaterThanZero(inputDto.RoleID)));
                        cmd.Parameters.AddWithValue("@permissionID", Utils.DbNullIfNull(inputDto.PermissionID, Utils.IsGreaterThanZero(inputDto.PermissionID)));
                        cmd.Parameters.AddWithValue("@pageNumber", Utils.DbNullIfNull(inputDto.pageNumber, Utils.IsGreaterThanZero(inputDto.pageNumber)));
                        cmd.Parameters.AddWithValue("@pageSize", Utils.DbNullIfNull(inputDto.pageSize, Utils.IsGreaterThanZero(inputDto.pageSize)));
                        cmd.Parameters.AddWithValue("@isDeleted", false);
                        SqlParameter totalRows = new SqlParameter("@totalRows", SqlDbType.Int)
                        {
                            Direction = ParameterDirection.Output
                        };
                        cmd.Parameters.Add(totalRows);
                        DataTable dt = new DataTable();

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            dt.Load(reader);

                            if (dt.Rows.Count > 0)
                            {
                                dt.Columns.Add("StatusName", typeof(String));

                                if (dt.Rows.Count > 0)
                                {
                                    for (int i = 0; i < dt.Rows.Count; i++)
                                    {
                                        if (!string.IsNullOrEmpty(dt.Rows[i]["Avatar"]?.ToString()))
                                        {
                                            dt.Rows[i]["Avatar"] = ImageBase64Helper.GetAvatar(dt.Rows[i]["IsExternalAvatar"].ToString(), dt.Rows[i]["Avatar"].ToString());
                                        }
                                        if (!string.IsNullOrEmpty(dt.Rows[i]["Status"]?.ToString()))
                                        {
                                            dt.Rows[i]["StatusName"] = int.Parse(dt.Rows[i]["Status"].ToString()) == 1 ? "Kích hoạt" : "Vô hiệu hoá";
                                        }
                                    }
                                }

                                model.Users = dt.ConvertToList<Account>();
                                res.Message = "Success!";
                                res.Data = model;
                                res.Result = AppConstant.RESULT_SUCCESS;
                                res.TotalRows = (int)totalRows.Value;
                            }
                            else
                            {
                                res.Message = "Không tìm thấy tài khoản thoả mãn!";
                                res.Result = AppConstant.RESULT_ERROR;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_SYSTEM_ERROR;
            }

            return res;
        }
        public async Task<BaseResponse> GetDetailUserInfo(GetDetailUserInfoInDto inputDto)
        {
            var res = new BaseResponse();
            GetDetailUserInfoOutDto model = new GetDetailUserInfoOutDto();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetDetailUserByUserID", conn))
                using (SqlCommand cmd_status = new SqlCommand("sp_GetStatus", conn))
                using (SqlCommand cmd_gender = new SqlCommand("sp_GetGenders", conn))
                {
                    await conn.OpenAsync();

                    var userIDPrm = new SqlParameter("@UserID", inputDto.UserID);

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(userIDPrm);

                    DataTable dt = new DataTable();
                    DataTable dt_status = new DataTable();
                    DataTable dt_gender = new DataTable();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        dt.Load(reader);
                        if (dt.Rows.Count != 1)
                        {
                            res.Message = "User không tồn tại!";
                            res.Result = AppConstant.RESULT_ERROR;
                            return res;
                        }

                        model.UserID            = (int)dt.Rows[0]["UserID"];
                        model.Username          = dt.Rows[0]["Username"].ToString();
                        model.Email             = dt.Rows[0]["Email"].ToString();
                        model.FullName          = dt.Rows[0]["FullName"]?.ToString();
                        model.PhoneNumber       = dt.Rows[0]["PhoneNumber"]?.ToString();
                        model.Avatar            = ImageBase64Helper.GetAvatar(dt.Rows[0]["IsExternalAvatar"].ToString(), dt.Rows[0]["Avatar"].ToString());

                        var date                = dt.Rows[0]["DateOfBirth"] != DBNull.Value ? (DateTime)dt.Rows[0]["DateOfBirth"] : new DateTime();
                        model.DateOfBirth       = date > new DateTime() ? date.ToString("dd-MM-yyyy") : string.Empty;

                        model.Gender            = dt.Rows[0]["Gender"] != DBNull.Value ? (byte?)dt.Rows[0]["Gender"] : null;
                        model.Address           = dt.Rows[0]["Address"]?.ToString();
                        model.Status            = dt.Rows[0]["Status"] != DBNull.Value ? (byte?)dt.Rows[0]["Status"] : null;

                        var createAt            = dt.Rows[0]["CreatedAt"] != DBNull.Value ? (DateTime)dt.Rows[0]["CreatedAt"] : new DateTime();
                        model.CreatedAt         = createAt > new DateTime() ? createAt.ToString("hh:mm:ss dd-MM-yyyy") : AppConstant.NO_INFO;

                        var updateAt            = dt.Rows[0]["UpdatedAt"] != DBNull.Value ? (DateTime)dt.Rows[0]["UpdatedAt"] : new DateTime();
                        model.UpdatedAt         = updateAt > new DateTime() ? updateAt.ToString("hh:mm:ss dd-MM-yyyy") : AppConstant.NO_INFO;

                        model.isGoogle          = !string.IsNullOrEmpty(dt.Rows[0]["GoogleID"].ToString());
                        model.isFacebook        = !string.IsNullOrEmpty(dt.Rows[0]["FacebookID"].ToString());
                        model.Otp               = dt.Rows[0]["otp"] != DBNull.Value ? dt.Rows[0]["otp"].ToString() : AppConstant.NO_INFO;
                        model.Roles             = dt.Rows[0]["Roles"] != DBNull.Value ? dt.Rows[0]["Roles"].ToString() : AppConstant.NO_INFO;

                        var locktime            = dt.Rows[0]["LockTime"] != DBNull.Value ? (DateTime)dt.Rows[0]["LockTime"] : new DateTime();
                        model.LockTime          = locktime > new DateTime() ? locktime.ToString("hh:mm:ss dd-MM-yyyy") : AppConstant.NO_INFO;

                        model.RemainTime        = dt.Rows[0]["RemainTime"] != DBNull.Value ? dt.Rows[0]["RemainTime"].ToString() : AppConstant.NO_INFO;
                        model.IsExternalAvatar  = dt.Rows[0]["IsExternalAvatar"] != DBNull.Value ? (bool)dt.Rows[0]["IsExternalAvatar"] : false;
                    }

                    cmd_gender.CommandType = CommandType.StoredProcedure;
                    cmd_status.CommandType = CommandType.StoredProcedure;
                    using (SqlDataReader reader_status = await cmd_status.ExecuteReaderAsync())
                    {
                        dt_status.Load(reader_status);
                        model.ListStatus = dt_status.ConvertToList<Status>();
                    }
                    using (SqlDataReader reader_gender = await cmd_gender.ExecuteReaderAsync())
                    {
                        dt_gender.Load(reader_gender);
                        model.ListGender = dt_gender.ConvertToList<Gender>();
                    }

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

        public async Task<BaseResponse> GetUserInfo(GetUserInfoInDto inputDto)
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
                    await conn.OpenAsync();

                    var usernamePrm = new SqlParameter("@UsernameOrEmail", inputDto.Username);

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(usernamePrm);

                    DataTable dt = new DataTable();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        dt.Load(reader);
                    }

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
                    model.GoogleID = !string.IsNullOrEmpty(dt.Rows[0]["GoogleID"].ToString());
                    model.RoleID = dt.Rows[0]["roleID"] != DBNull.Value ? (int)dt.Rows[0]["roleID"] : null;

                    dt.Clear();
                    cmd_gender.CommandType = CommandType.StoredProcedure;
                    using (SqlDataReader reader = await cmd_gender.ExecuteReaderAsync())
                    {
                        dt.Load(reader);
                    }
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

        public async Task<BaseResponse> UpdateUser(UpdateUserDto inputDto, string? username, int? roleID)
        {
            var res = new BaseResponse();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_UpdateUserInfo", conn))
                {
                    await conn.OpenAsync();
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    if (!string.IsNullOrEmpty(inputDto.Avatar) && inputDto.isExternalAvatar == false)
                    {
                        try
                        {
                            inputDto.Avatar = ImageBase64Helper.SaveAvatar(inputDto.Avatar);
                            cmd.Parameters.AddWithValue("@IsExternalAvatar", inputDto.isExternalAvatar);
                        }
                        catch
                        {
                            inputDto.Avatar = AppConstant.DEFAULT_AVATAR;
                            cmd.Parameters.AddWithValue("@IsExternalAvatar", false);
                        }
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@IsExternalAvatar", true);
                    }

                    if (!string.IsNullOrEmpty(username) && (username != inputDto.Username))
                    {
                        if (inputDto.roleID == null || inputDto.roleID == 1) inputDto.roleID = null;
                        cmd.Parameters.AddWithValue("@roleID", Utils.DbNullIfNull(inputDto.roleID));
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@roleID", Utils.DbNullIfNull(null));
                        inputDto.PermissionIds = null;
                    }
                    cmd.Parameters.AddWithValue("@UserID", inputDto.UserID);
                    cmd.Parameters.AddWithValue("@FullName", Utils.DbNullIfNull(inputDto.FullName)); //DBNull.Value
                    cmd.Parameters.AddWithValue("@PhoneNumber", Utils.DbNullIfNull(inputDto.PhoneNumber));
                    cmd.Parameters.AddWithValue("@Avatar", Utils.DbNullIfNull(inputDto.Avatar));
                    cmd.Parameters.AddWithValue("@DateOfBirth", Utils.DbNullIfNull(inputDto.DateOfBirth));
                    cmd.Parameters.AddWithValue("@Gender", Utils.DbNullIfNull(inputDto.Gender));
                    cmd.Parameters.AddWithValue("@Address", Utils.DbNullIfNull(inputDto.Address));
                    cmd.Parameters.AddWithValue("@Status", Utils.DbNullIfNull(inputDto.status));
                    cmd.Parameters.AddWithValue("@GoogleID", Utils.DbNullIfNull(inputDto.GoogleID));
                    cmd.Parameters.AddWithValue("@FacebookID", Utils.DbNullIfNull(inputDto.FacebookID));

                    await cmd.ExecuteNonQueryAsync();

                    UpdateUserPermission(inputDto.UserID, inputDto.PermissionIds, roleID, res);
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }
            return res;
        }

        /// <summary>
        /// lay tat ca quyen (role + extend)
        /// </summary>
        /// <param name="inputDto"></param>
        /// <returns></returns>
        public async Task<BaseResponse> GetAllUserPermission(GetAllUserPermissionDto inputDto, int roleID)
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
                    cmd.Parameters.AddWithValue("@isAdmin", roleID == 1 ? true : false);

                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    List<int> listPermissionIDs = new List<int>();
                    foreach (DataRow dr in dt.Rows)
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

        /// <summary>
        /// lam lai
        /// </summary>
        /// <param name="UserID"></param>
        /// <param name="PermissionIds"></param>
        /// <param name="roleID"></param>
        /// <param name="res"></param>
        private async void UpdateUserPermission(int UserID, List<int>? PermissionIds, int? roleID, BaseResponse res)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_UpdateUserPermissions", conn))
                using (SqlCommand cmd_role = new SqlCommand("sp_GetRoleIDByUserID", conn))
                {
                    await conn.OpenAsync();

                    cmd_role.CommandType = CommandType.StoredProcedure;
                    cmd_role.Parameters.AddWithValue("@UserID", UserID);

                    DataTable dt = new DataTable();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        dt.Load(reader);
                    }
                    int isAdmin = 0;
                    foreach (DataRow dr in dt.Rows)
                    {
                        if (dr[0].ToString() == "1")
                        {
                            isAdmin = 1;
                            break;
                        }
                    }

                    if (isAdmin == 1)
                    {
                        res.Message = "Không thể thay đổi quyền của role Admin!";
                        res.Result = AppConstant.RESULT_ERROR;
                        return;
                    }

                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserID", UserID);
                    cmd.Parameters.AddWithValue("@isAdmin", roleID == 1 ? true : false);
                    if (PermissionIds != null)
                    {
                        var permissionIdsString = string.Join(",", PermissionIds);
                        cmd.Parameters.AddWithValue("@PermissionIDs", !string.IsNullOrEmpty(permissionIdsString) ? permissionIdsString : DBNull.Value);
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@PermissionIDs", DBNull.Value);
                    }

                    cmd.ExecuteNonQuery();

                    res.Message = "Cập nhật user thành công!";
                    res.Result = AppConstant.RESULT_SUCCESS;
                }
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_SYSTEM_ERROR;
                res.Message = ex.Message;
            }

            return;
        }

        public async Task<BaseResponse> GetRole(GetRoleDto inputDto)
        {
            var res = new BaseResponse();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd_role = new SqlCommand("sp_GetRole", conn))
                using (SqlDataAdapter adapter_role = new SqlDataAdapter(cmd_role))
                {
                    await conn.OpenAsync();

                    DataTable dt = new DataTable();

                    cmd_role.CommandType = CommandType.StoredProcedure;
                    cmd_role.Parameters.AddWithValue("@roleName", Utils.DbNullIfNull(inputDto.roleName));
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
        //public async Task<BaseResponse> GetRoleByPaging(GetRoleDto inputDto)
        //{
        //    var res = new BaseResponse();
        //    try
        //    {
        //        using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
        //        using (SqlCommand cmd_role = new SqlCommand("sp_GetRoleByPaging", conn))
        //        using (SqlDataAdapter adapter_role = new SqlDataAdapter(cmd_role))
        //        {
        //            await conn.OpenAsync();

        //            DataTable dt = new DataTable();

        //            cmd_role.CommandType = CommandType.StoredProcedure;
        //            cmd_role.Parameters.AddWithValue("@roleName", Utils.DbNullIfNull(inputDto.roleName));
        //            cmd_role.Parameters.AddWithValue("@PageSize", Utils.DbNullIfNull(inputDto.pageSize));
        //            cmd_role.Parameters.AddWithValue("@PageNumber", Utils.DbNullIfNull(inputDto.pageNumber));
        //            SqlParameter rowCount = new SqlParameter("@TotalRows", SqlDbType.Int)
        //            {
        //                Direction = ParameterDirection.Output,
        //            };
        //            using (SqlDataReader reader = await cmd_role.ExecuteReaderAsync())
        //            {
        //                dt.Load(reader);
        //            }
        //            List<Role> listRole = dt.ConvertToList<Role>();


        //            res.Data = listRole;
        //            res.Result = AppConstant.RESULT_SUCCESS;
        //            res.Message = "Get role thanh cong";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        res.Message = ex.Message;
        //        res.Result = AppConstant.RESULT_ERROR;
        //    }
        //    return res;
        //}

        public async Task<BaseResponse> GetRoleGenderStatus()
        {
            var res = new BaseResponse();

            GetRoleGenderStatusOutDto model = new GetRoleGenderStatusOutDto();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd_role = new SqlCommand("sp_GetRole", conn))
                using (SqlCommand cmd_gender = new SqlCommand("sp_GetGenders", conn))
                using (SqlCommand cmd_status = new SqlCommand("sp_GetStatus", conn))
                {
                    conn.Open();

                    cmd_role.CommandType = CommandType.StoredProcedure;
                    cmd_role.Parameters.AddWithValue("@roleName", DBNull.Value);
                    cmd_gender.CommandType = CommandType.StoredProcedure;
                    cmd_status.CommandType = CommandType.StoredProcedure;

                    DataTable dt_role = new DataTable();
                    DataTable dt_gender = new DataTable();
                    DataTable dt_status = new DataTable();

                    using (SqlDataReader reader_role = await cmd_role.ExecuteReaderAsync())
                    using (SqlDataReader reader_status = await cmd_status.ExecuteReaderAsync())
                    using (SqlDataReader reader_gender = await cmd_gender.ExecuteReaderAsync())
                    {
                        dt_role.Load(reader_role);
                        dt_status.Load(reader_status);
                        dt_gender.Load(reader_gender);
                    }

                    model.listRole = dt_role.ConvertToList<Role>();
                    model.listStatus = dt_status.ConvertToList<Status>();
                    model.listGender = dt_gender.ConvertToList<Gender>();

                    res.Data = model;
                    res.Message = "Gen role status gender thanh cong";
                    res.Result = AppConstant.RESULT_SUCCESS;
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }

            return res;
        }

        public async Task<BaseResponse> GetActivePasswordRule()
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetSettingsByPrefix", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();

                    cmd.Parameters.AddWithValue("@Prefix", "Password");
                    cmd.Parameters.AddWithValue("@IsActive", 1);

                    DataTable dt = new DataTable();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        dt.Load(reader);
                    }

                    int minLength = AppConstant.MIN_PASSWORD_LENGTH;
                    foreach (DataRow dr in dt.Rows)
                    {
                        if (dr["SettingKey"].ToString() == "Password.MinLength")
                        {
                            minLength = int.Parse(dr["SettingValue"].ToString());
                            dr["Description"] += minLength.ToString();
                            break;
                        }
                    }

                    res.Data = new
                    {
                        minPasswordLength = minLength,
                        rulePassword = dt.ConvertToList<PasswordRule>(),
                    };
                    res.Message = "Get active rule password thanh cong";
                    res.Result = AppConstant.RESULT_SUCCESS;
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }

            return res;
        }

        public async Task<BaseResponse> ChangeUserPassword(ChangeUserPasswordDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_ChangePassword", conn))
                {
                    await conn.OpenAsync();

                    string password = HashPassword.Encrypt(inputDto.newPassword);

                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Username", inputDto.username);
                    cmd.Parameters.AddWithValue("@newpassword", password);
                    SqlParameter rtnValue = new SqlParameter("@ReturnStatus", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(rtnValue);

                    await cmd.ExecuteNonQueryAsync();

                    if ((int)rtnValue.Value == 1)
                    {
                        res.Message = "Cập nhật mật khẩu thành công!";
                        res.Result = AppConstant.RESULT_SUCCESS;
                    }
                    else
                    {
                        res.Message = "Tài khoản không tồn tại!";
                        res.Result = AppConstant.RESULT_ERROR;
                    }
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_SYSTEM_ERROR;
            }

            return res;
        }

        public async Task<BaseResponse> ChangeMyPassword(ChangeMyPasswordDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_ChangeMyPassword", conn))
                {
                    await conn.OpenAsync();

                    string newPassword = HashPassword.Encrypt(inputDto.newPassword);
                    string oldPassword = HashPassword.Encrypt(inputDto.oldPassword);

                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Username", inputDto.username);
                    cmd.Parameters.AddWithValue("@newHashPassword", newPassword);
                    cmd.Parameters.AddWithValue("@oldHashPassword", oldPassword);
                    SqlParameter rtnValue = new SqlParameter("@ReturnStatus", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(rtnValue);

                    await cmd.ExecuteNonQueryAsync();

                    if ((int)rtnValue.Value == 1)
                    {
                        res.Message = "Cập nhật mật khẩu thành công!";
                        res.Result = AppConstant.RESULT_SUCCESS;
                    }
                    else
                    {
                        res.Message = "Tài khoản không tồn tại hoặc sai mật khẩu!";
                        res.Result = AppConstant.RESULT_ERROR;
                    }
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_SYSTEM_ERROR;
            }

            return res;
        }

        public BaseResponse LoginUser(LoginUserDto inputDto, string? username)
        {
            var res = new BaseResponse();
            if (username == inputDto.username)
            {
                res.Message = "Không thể đăng nhập chính bạn!";
                res.Result = AppConstant.RESULT_ERROR;
            }
            else
            {
                res.Message = "Đăng nhập thành công!";
                res.Result = AppConstant.RESULT_SUCCESS;
                res.Data = inputDto.token;
            }
            return res;
        }

        public async Task<BaseResponse> LogoutUser(LogoutUserDto inputDto, string? username)
        {
            var res = new BaseResponse();
            if (username == inputDto.username)
            {
                res.Message = "Không thể đăng xuất chính bạn!";
                res.Result = AppConstant.RESULT_ERROR;
            }
            else
                try
                {
                    using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                    using (SqlCommand cmd = new SqlCommand("sp_LogoutUser", conn))
                    {
                        await conn.OpenAsync();

                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@Username", inputDto.username);

                        await cmd.ExecuteNonQueryAsync();

                        res.Message = "Logout user thành công!";
                        res.Result = AppConstant.RESULT_SUCCESS;
                    }
                }
                catch (Exception ex)
                {
                    res.Message = ex.Message;
                    res.Result = AppConstant.RESULT_SYSTEM_ERROR;
                }

            return res;
        }

        public async Task<BaseResponse> UpdateUserRoles(UpdateUserRolesDto inputDto, int roleID)
        {
            var res = new BaseResponse();
            if (roleID != 1)
            {
                res.Message = "Không thể đăng xuất chính bạn!";
                res.Result = AppConstant.RESULT_ERROR;
            }
            else
                try
                {
                    //using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                    //using (SqlCommand cmd = new SqlCommand("sp_LogoutUser", conn))
                    //{
                    //    await conn.OpenAsync();

                    //    cmd.CommandType = CommandType.StoredProcedure;
                    //    cmd.Parameters.AddWithValue("@Username", inputDto.username);

                    //    await cmd.ExecuteNonQueryAsync();

                    //    res.Message = "Logout user thành công!";
                    //    res.Result = AppConstant.RESULT_SUCCESS;
                    //}
                }
                catch (Exception ex)
                {
                    res.Message = ex.Message;
                    res.Result = AppConstant.RESULT_SYSTEM_ERROR;
                }

            return res;
        }
    }
}

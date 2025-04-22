using api.AppUtils;
using api.DTO.SystemSetting;
using api.DTO.UserSetting;
using api.Interface;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Data.SqlClient;
using System.Data;

namespace api.Services
{
    public class SystemSettingService : ISystemSetting
    {
        public async Task<BaseResponse> CreateRole(CreateRoleDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_CreateRole", conn))
                using (SqlCommand cmd_perm = new SqlCommand("sp_UpdateRolePermission", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();

                    cmd.Parameters.AddWithValue("@RoleName", inputDto.RoleName);
                    cmd.Parameters.AddWithValue("@Description", Utils.DbNullIfNull(inputDto.Description));
                    var rtnStatus = new SqlParameter("@rtnStatus", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output,
                    };
                    var rtnValue = new SqlParameter("@rtnValue", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };

                    cmd.Parameters.Add(rtnStatus);
                    cmd.Parameters.Add(rtnValue);
                    await cmd.ExecuteNonQueryAsync();

                    if ((int)rtnStatus.Value == 1)
                    {
                        cmd_perm.CommandType = CommandType.StoredProcedure;
                        cmd_perm.Parameters.AddWithValue("@roleID", rtnValue.Value);
                        
                        var listPermissionIds = (inputDto.PermissionIDs != null && inputDto.PermissionIDs.Count > 0) 
                            ? string.Join(",", inputDto.PermissionIDs.Select(id => id == 15 ? "admin" : id.ToString())) 
                            : string.Empty;

                        cmd_perm.Parameters.AddWithValue("@permissionIDs", Utils.DbNullIfNull(listPermissionIds));
                        await cmd_perm.ExecuteNonQueryAsync();

                        res.Message = "Tạo role thành công!";
                        res.Result = AppConstant.RESULT_SUCCESS;
                    }
                    else
                    {
                        res.Message = "Role đã tồn tại!";
                        res.Result = AppConstant.RESULT_ERROR;
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
               
        public async Task<BaseResponse> DeleteRole(DeleteRoleDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_DeleteRole", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();

                    var listId = string.Join(",", inputDto.RoleIds.Select(id => id == 1 ? "admin" : id.ToString()));
                    cmd.Parameters.AddWithValue("@roleIds", listId);

                    await cmd.ExecuteNonQueryAsync();

                    res.Message = "Xoá role thành công!";
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
               
        public async Task<BaseResponse> GetListRole()
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetRole", conn))
                {
                    await conn.OpenAsync();
                    cmd.CommandType = CommandType.StoredProcedure;
                    DataTable dt = new DataTable();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        dt.Load(reader);
                    }

                    res.Data = dt.ConvertToList<RoleDetail>();
                    res.Message = "Get list role thanh cong";
                    res.Result = AppConstant.RESULT_SUCCESS;
                }
            }catch(Exception ex)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }
               
        public async Task<BaseResponse> GetPasswordRule()
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
                    cmd.Parameters.AddWithValue("@IsActive", DBNull.Value);

                    DataTable dt = new DataTable();
                    using (var reader = await cmd.ExecuteReaderAsync()) 
                    {
                        dt.Load(reader);
                    }

                    int minLength = AppConstant.MIN_PASSWORD_LENGTH;
                    foreach(DataRow dr in dt.Rows)
                    {
                        if (dr["SettingKey"].ToString() == "Password.MinLength")
                        {
                            minLength = int.Parse(dr["SettingValue"].ToString());
                            dt.Rows.Remove(dr);
                            break;
                        }
                    }

                    res.Data = new
                    {
                        minPasswordLength = minLength,
                        rulePassword = dt.ConvertToList<PasswordRule>(),
                    };
                    res.Message = "Get rule password thanh cong";
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
               
        public async Task<BaseResponse> UpdatePasswordRule(UpdatePasswordRuleDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_UpdateSystemSetting", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();

                    cmd.Parameters.AddWithValue("@SettingKey", "Password.MinLength");
                    cmd.Parameters.AddWithValue("@SettingValue", inputDto.minLength);
                    await cmd.ExecuteNonQueryAsync();

                    foreach(var rule in inputDto.passwordRules)
                    {
                        cmd.Parameters.Clear();
                        cmd.Parameters.AddWithValue("@SettingKey", rule.SettingKey);
                        cmd.Parameters.AddWithValue("@IsActive", rule.IsActive);
                        await cmd.ExecuteNonQueryAsync();
                    }

                    res.Message = "Update Password rule thanh cong!";
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
               
        public async Task<BaseResponse> UpdateRolePermission(UpdateRolePermissionDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_UpdateRolePermissions", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();

                    cmd.Parameters.AddWithValue("@RoleId", inputDto.RoleID);
                    cmd.Parameters.AddWithValue("@PermissionIds", inputDto.PermissionIDs.Select(id => id == 15 ? "admin" : id.ToString()));
                    await cmd.ExecuteNonQueryAsync();

                    res.Message = "Cập nhật thành công!";
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
    }
}

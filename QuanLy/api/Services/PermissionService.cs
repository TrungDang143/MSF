﻿using api.AppUtils;
using api.DTO.Account;
using api.DTO.Perrmission;
using api.Interface;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Data.SqlClient;
using System.Data;

namespace api.Services
{
    public class PermissionService : IPermission
    {
        public async Task<BaseResponse> GetAllPermission(int roleID)
        {
            var res = new BaseResponse();
            GetAllPermissionOutDto model = new GetAllPermissionOutDto();
            try
            {
                using( SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using( SqlCommand cmd = new SqlCommand("sp_GetPermissionByRoleIds", conn))
                {
                    await conn.OpenAsync();
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@roleIds", Utils.DbNullIfNull(null));
                    cmd.Parameters.AddWithValue("@isAdmin", roleID == 1 ? true : false);

                    DataTable dt = new DataTable();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        dt.Load(reader);
                    }

                    DataTable dt_user = dt.Clone();
                    DataTable dt_role = dt.Clone();
                    DataTable dt_content = dt.Clone();
                    DataTable dt_permission = dt.Clone();
                    DataTable dt_sys = dt.Clone();

                    foreach(DataRow dr in dt.Rows)
                    {
                        if (dr[1].ToString().Contains("admin."))
                        {
                            if(roleID == 1)
                                dt_sys.ImportRow(dr);
                        }
                        else if (dr[1].ToString().Contains("_roles"))
                        {
                            dt_role.ImportRow(dr);
                        }
                        else if (dr[1].ToString().Contains("_content"))
                        {
                            dt_content.ImportRow(dr);
                        }
                        else if (dr[1].ToString().Contains("_permissions"))
                        {
                            dt_permission.ImportRow(dr);
                        }
                        else if (dr[1].ToString().Contains("_users"))
                        {
                            dt_user.ImportRow(dr);                    
                        }
                        else
                        {
                            if (roleID == 1)
                                dt_sys.ImportRow(dr);
                        }
                    }

                    model.Permission_Permission = dt_permission.ConvertToList<Permission>();
                    model.Permission_Content = dt_content.ConvertToList<Permission>();
                    model.Permission_User = dt_user.ConvertToList<Permission>();
                    model.Permission_System = dt_sys.ConvertToList<Permission>();
                    model.Permission_Role = dt_role.ConvertToList<Permission>();

                    res.Data = model;
                    res.Message = "Get permission thanh cong";
                    res.Result = AppConstant.RESULT_SUCCESS;
                }    
            }catch(Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_SYSTEM_ERROR;
            }

            return res;
        }

        public async Task<BaseResponse> GetPermissionByRoleIds(GetPermissionByRoleIDDto inputDto, int roleID)
        {
            var res = new BaseResponse();
            string roleIds = string.Empty;
            if (inputDto.RoleIds == null || inputDto.RoleIds.Count <= 0)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = "Không thể lấy permission của user!";
                return res;
            }
            else
            {
                roleIds = string.Join(",", inputDto.RoleIds.Distinct());
                if(roleIds.Length < 1)
                {
                    res.Result = AppConstant.RESULT_ERROR;
                    res.Message = "Không thể lấy permission của user!";
                    return res;
                }
            }

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetPermissionByRoleIds", conn))
                {
                    await conn.OpenAsync();
                    cmd.CommandType = CommandType.StoredProcedure;                 
                    cmd.Parameters.AddWithValue("@roleIds", Utils.DbNullIfNull(roleIds));
                    cmd.Parameters.AddWithValue("@isAdmin", roleID == 1 ? true : false);

                    DataTable dt = new DataTable();
                    using(SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        dt.Load(reader);
                    }

                    res.Data = dt.ConvertToList<RolePermission>();
                }

                res.Result = AppConstant.RESULT_SUCCESS;
                res.Message = "Get permission thanh cong";
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_SYSTEM_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }

        public async Task<BaseResponse> GetPermissionForUserbyRoleIds(GetPermissionForUserbyRoleIdsInDto inputDto, int roleID)
        {
            var res = new BaseResponse();
            string roleIds = inputDto.RoleIds;
            if (string.IsNullOrWhiteSpace(roleIds))
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = "Không thể lấy permission của role!";
                return res;
            }

            try
            {
                List<GetPermissionForUserbyRoleIdsOutDto> model = new List<GetPermissionForUserbyRoleIdsOutDto>();

                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetPermissionForUserbyRoleIds", conn))
                {
                    await conn.OpenAsync();
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@userID", inputDto.UserID);
                    cmd.Parameters.AddWithValue("@roleIds", Utils.DbNullIfNull(roleIds));
                    cmd.Parameters.AddWithValue("@isAdmin", roleID == 1 ? true : false);

                    DataTable dt = new DataTable();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        dt.Load(reader);
                    }

                    foreach (DataRow dr in dt.Rows)
                    {
                        int _roleID = int.Parse(dr[0].ToString());
                        List<int> _permissionIds = string.IsNullOrWhiteSpace(dr[1].ToString()) 
                                                    ? new List<int>()
                                                    : dr[1].ToString().Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => int.Parse(s.Trim())).ToList(); ;
                        
                        var rolePermission = new GetPermissionForUserbyRoleIdsOutDto()
                        {
                            RoleID = _roleID,
                            PermissionIds = _permissionIds
                        };
                        model.Add(rolePermission);
                    }
                    res.Data = model;
                }

                res.Result = AppConstant.RESULT_SUCCESS;
                res.Message = "Get permission cua user thanh cong";
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_SYSTEM_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }
    }
}

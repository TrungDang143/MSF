using api.AppUtils;
using api.DTO.Perrmission;
using api.Interface;
using Microsoft.Data.SqlClient;
using System.Data;

namespace api.Services
{
    public class PermissionService : IPermission
    {
        public BaseResponse GetAllPermission()
        {
            var res = new BaseResponse();
            GetAllPermissionOutDto model = new GetAllPermissionOutDto();
            try
            {
                using( SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using( SqlCommand cmd = new SqlCommand("sp_GetAllPermissions",conn))
                using( SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    DataTable dt_user = dt.Clone();
                    DataTable dt_role = dt.Clone();
                    DataTable dt_content = dt.Clone();
                    DataTable dt_permission = dt.Clone();
                    DataTable dt_sys = dt.Clone();

                    foreach(DataRow dr in dt.Rows)
                    {
                        if (dr[1].ToString().Contains("users"))
                        {
                            dt_user.ImportRow(dr);
                        }else if (dr[1].ToString().Contains("roles"))
                        {
                            dt_role.ImportRow(dr);
                        }
                        else if (dr[1].ToString().Contains("content"))
                        {
                            dt_content.ImportRow(dr);
                        }
                        else if (dr[1].ToString().Contains("permissions"))
                        {
                            dt_permission.ImportRow(dr);
                        }
                        else
                        {
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
                res.Result = AppConstant.RESULT_ERROR;
            }

            return res;
        }
    }
}

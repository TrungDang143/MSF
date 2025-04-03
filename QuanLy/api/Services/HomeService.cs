using api.AppUtils;
using api.DTO.Home;
using api.Interface;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace api.Services
{
    public class HomeService:IHome
    {
        public BaseResponse GetFullName(GetFullNameInputDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();
                    var rtnValue = new SqlParameter("@ReturnValue", SqlDbType.NVarChar, 100)
                    {
                        Direction = ParameterDirection.Output
                    };
                    var username = new SqlParameter("@UsernameOrEmail", inputDto.UsernameOrEmail);

                    using (SqlCommand cmd = new SqlCommand("sp_GetFullName", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(rtnValue);
                        cmd.Parameters.Add(username);
                        cmd.ExecuteNonQuery();

                        if (!string.IsNullOrEmpty(rtnValue.Value.ToString()))
                        {
                            res.Message = "Success!";
                            res.Data = rtnValue.Value;
                            res.Result = AppConstant.RESULT_SUCCESS;
                        }
                        else
                        {
                            res.Message = "Tên đăng nhập không tồn tại!";
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
    }
}

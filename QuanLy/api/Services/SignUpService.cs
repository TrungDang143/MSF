using api.AppUtils;
using api.DTO.SignUp;
using api.Interface;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace api.Services
{
    public class SignUpService : ISignUp
    {
        public BaseResponse SignUp(SignUpInputDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();
                    string password = HashPassword.Encrypt(inputDto.Password);

                    var resultParam = new SqlParameter("@ReturnStatus", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    var userPrm = new SqlParameter("@Username", inputDto.Username);
                    var passwordPrm = new SqlParameter("@PasswordHash", password);
                    var emailPrm = new SqlParameter("@Email", inputDto.Email);

                    using (SqlCommand cmd = new SqlCommand("sp_CreateUser", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(userPrm);
                        cmd.Parameters.Add(passwordPrm);
                        cmd.Parameters.Add(emailPrm);
                        cmd.Parameters.Add(resultParam);
                        
                        cmd.ExecuteNonQuery();

                        if ((int)resultParam.Value == 1)
                        {
                            res.Message = "Success!";
                            res.Result = AppConstant.RESULT_SUCCESS;
                        }
                        else
                        {
                            res.Message = "Đăng ký không thành công!";
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

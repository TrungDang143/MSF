using api.AppUtils;
using api.DTO.Forgot;
using api.Interface;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using QlyBaiGuiXe.Setting;

namespace api.Services
{
    public class ForgotService: IForgot
    {

        public BaseResponse SendOTP(GetOTPInputDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING)) 
                { 
                    conn.Open();
                    var usernameParam = new SqlParameter("@username", inputDto.Username);
                    var emailParam = new SqlParameter("@email", inputDto.Email);
                    var status = new SqlParameter("@ReturnStatus", System.Data.SqlDbType.Int)
                    {
                        Direction = System.Data.ParameterDirection.Output,
                    };
                    
                    using (SqlCommand cmd = new SqlCommand("sp_CreateOTP", conn))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add(usernameParam);
                        cmd.Parameters.Add(emailParam);
                        cmd.Parameters.Add(status);

                        cmd.ExecuteNonQuery();

                        if ((int)status.Value == 1)
                        {
                            string code = getOTP(usernameParam, emailParam, res);
                            if (!string.IsNullOrEmpty(code))
                            {
                                ForgotPassword.sendEmail(inputDto.Email, code);
                            }
                        }
                        else
                        {
                            res.Message = "Không thể gửi mã OTP. Vui lòng kiểm tra lại thông tin!";
                            res.Result = AppConstant.RESULT_ERROR;
                        }
                    }
                }
            }
            catch(Exception ex) 
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }

        public string getOTP(SqlParameter username, SqlParameter email, BaseResponse res)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();
                    var status = new SqlParameter("@status", System.Data.SqlDbType.Int)
                    {
                        Direction = System.Data.ParameterDirection.Output,
                    };
                    var rtnValue = new SqlParameter("@rtnValue", System.Data.SqlDbType.VarChar, 10)
                    {
                        Direction = System.Data.ParameterDirection.Output,
                    };

                    using (SqlCommand cmd = new SqlCommand("sp_GetOTP", conn))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add(username);
                        cmd.Parameters.Add(email);
                        cmd.Parameters.Add(rtnValue);
                        cmd.Parameters.Add(status);
                        cmd.ExecuteNonQuery();

                        if ((int)status.Value == 1)
                        {
                            res.Message = "Success!";
                            res.Result = AppConstant.RESULT_SUCCESS;
                            return rtnValue.Value.ToString();
                        }
                        else
                        {
                            res.Message = "Không thể lấy mã OTP!";
                            res.Result = AppConstant.RESULT_ERROR;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }
            return string.Empty;
        }

        public BaseResponse ChangePassword(ChangePasswordInputDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();
                    string password = HashPassword.Encrypt(inputDto.Password);
                    var usernameParam = new SqlParameter("@username", inputDto.Username);
                    var passwordParam = new SqlParameter("@password", password);
                    var status = new SqlParameter("@ReturnStatus", System.Data.SqlDbType.Int)
                    {
                        Direction = System.Data.ParameterDirection.Output,
                    };

                    using (SqlCommand cmd = new SqlCommand("sp_ChangePassword", conn))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add(usernameParam);
                        cmd.Parameters.Add(passwordParam);
                        cmd.Parameters.Add(status);

                        if ((int)status.Value == 1)
                        {
                            res.Message = "Thay đổi mật khẩu thành công!";
                            res.Result = AppConstant.RESULT_SUCCESS;
                        }
                        else
                        {
                            res.Message = "Thay đổi mật khẩu thất bại!";
                            res.Result = AppConstant.RESULT_ERROR;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }

        public BaseResponse VerifyOTP(VerifyOTPInputDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();
                    var usernameParam = new SqlParameter("@username", inputDto.Username);
                    var otpParam = new SqlParameter("@otp", inputDto.OTP);
                    var status = new SqlParameter("@ReturnStatus", System.Data.SqlDbType.Int)
                    {
                        Direction = System.Data.ParameterDirection.Output,
                    };

                    using (SqlCommand cmd = new SqlCommand("sp_VerifyOTP", conn))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add(usernameParam);
                        cmd.Parameters.Add(otpParam);
                        cmd.Parameters.Add(status);

                        cmd.ExecuteNonQuery();
                        if ((int)status.Value == 1)
                        {
                            res.Message = "Success!";
                            res.Result = AppConstant.RESULT_SUCCESS;
                        }
                        else
                        {
                            res.Message = "OTP không hợp lệ!";
                            res.Result = AppConstant.RESULT_ERROR;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }
    }
}

using api.AppUtils;
using api.DTO.Account;
using api.DTO.Login;
using api.DTO.Token;
using api.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Data;

namespace api.Services
{
    public class LoginService : ILogin
    {

        public BaseResponse Login(LoginInputDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();
                    string password = HashPassword.Encrypt(inputDto.Password);

                    var usernameParam = new SqlParameter("@UsernameOrEmail", inputDto.UsernameOrEmail);
                    var passwordParam = new SqlParameter("@PasswordHash", password);
                    var resultParam = new SqlParameter("@ReturnStatus", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };

                    using (SqlCommand cmd = new SqlCommand("sp_LoginUser", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(usernameParam);
                        cmd.Parameters.Add(passwordParam);
                        cmd.Parameters.Add(resultParam);

                        cmd.ExecuteNonQuery();

                        //int status = (int)cmd.Parameters["@Result"].Value;

                        if ((int)resultParam.Value == 1)
                        {
                            res.Message = "Success!";
                            res.Result = AppConstant.RESULT_SUCCESS;
                        }
                        else
                        {
                            res.Message = "Sai thông tin đăng nhập!";
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

        public async Task<BaseResponse> FindUserByFBID(FindUserByFBIDDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                var password = HashPassword.Encrypt(AppConstant.DEFAULT_PASSWORD);

                PayloadFBDto payload = await TokenService.DecodeFBToken(inputDto.Token);

                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_FindUserByFBID", conn))
                {
                    conn.Open();

                    var passwordPrm = new SqlParameter("@PasswordHash", password);
                    var fullnamePrm = new SqlParameter("@FullName", payload.name);
                    var emailPrm = new SqlParameter("@email", payload.email);
                    var userPrm = new SqlParameter("@Username", payload.email);
                    var picturePrm = new SqlParameter("@Avatar", payload.picture);
                    var IDPrm = new SqlParameter("@FBID", payload.ID);
                    var rtnValue = new SqlParameter("@rtnValue", System.Data.SqlDbType.VarChar, 50)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    var status = new SqlParameter("@status", System.Data.SqlDbType.Int)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(passwordPrm);
                    cmd.Parameters.Add(fullnamePrm);
                    cmd.Parameters.Add(emailPrm);
                    cmd.Parameters.Add(userPrm);
                    cmd.Parameters.Add(picturePrm);
                    cmd.Parameters.Add(IDPrm);
                    cmd.Parameters.Add(rtnValue);
                    cmd.Parameters.Add(status);

                    var response = cmd.ExecuteNonQuery();

                    if ((int)status.Value == 1)
                    {
                        res.Message = "Success!";
                        res.Data = rtnValue.Value;
                        res.Result = AppConstant.RESULT_SUCCESS;
                    }
                    else
                    {
                        res.Message = "Đăng ký không thành công!";
                        res.Result = AppConstant.RESULT_ERROR;
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

        public async Task<BaseResponse> FindUserByGGID(FindUserByGGIDDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                var password = HashPassword.Encrypt(AppConstant.DEFAULT_PASSWORD);

                PayloadGGToken payload = await TokenService.DecodeGGToken(inputDto.Token);

                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_FindUserByGGID", conn))
                {
                    conn.Open();

                    var passwordPrm = new SqlParameter("@PasswordHash", password);
                    var fullnamePrm = new SqlParameter("@FullName", payload.name);
                    var emailPrm = new SqlParameter("@email", payload.email);
                    var userPrm = new SqlParameter("@Username", payload.email);
                    var picturePrm = new SqlParameter("@Avatar", payload.picture);
                    var IDPrm = new SqlParameter("@GGID", payload.sub);
                    var rtnValue = new SqlParameter("@rtnValue", System.Data.SqlDbType.VarChar, 50)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    var status = new SqlParameter("@status", System.Data.SqlDbType.Int)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(passwordPrm);
                    cmd.Parameters.Add(fullnamePrm);
                    cmd.Parameters.Add(emailPrm);
                    cmd.Parameters.Add(userPrm);
                    cmd.Parameters.Add(picturePrm);
                    cmd.Parameters.Add(IDPrm);
                    cmd.Parameters.Add(rtnValue);
                    cmd.Parameters.Add(status);

                    var response = cmd.ExecuteNonQuery();

                    if ((int)status.Value == 1)
                    {
                        res.Message = "Success!";
                        res.Data = rtnValue.Value;
                        res.Result = AppConstant.RESULT_SUCCESS;
                    }
                    else
                    {
                        res.Message = rtnValue.Value.ToString();
                        res.Result = AppConstant.RESULT_ERROR;
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

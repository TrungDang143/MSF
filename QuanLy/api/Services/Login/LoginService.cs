using api.AppUtils;
using api.DTO.Login;
using api.Interface;
using api.Interface.Login;
using api.MoHinhDuLieu;
using api.Services.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Data;

namespace api.Services.Login
{
    public class LoginService : ILogin
    {
        private readonly EntryTestQlyContext db;
        

        public LoginService(EntryTestQlyContext context)
        {
            db = context;
        }

        public async Task<BaseResponse> Login(LoginInputDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                string password = HashPassword.Encrypt(inputDto.Password);
                
                var resultParam = new SqlParameter("@Result", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                await db.Database.ExecuteSqlRawAsync("EXEC sp_LoginUser @p0, @p1, @Result OUTPUT",
                    inputDto.UsernameOrEmail, password, resultParam);

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
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }

            return res;
        }    
    }
}

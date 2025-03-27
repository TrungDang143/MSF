using api.AppUtils;
using api.DTO.SignUp;
using api.Interface;
using api.Interface.SignUp;
using api.MoHinhDuLieu;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace api.Services.SignUp
{
    public class SignUpService : ISignUp
    {
        private readonly EntryTestQlyContext db;

        public SignUpService(EntryTestQlyContext context)
        {
            db = context;
        }
        public async Task<BaseResponse> SignUp(SignUpInputDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                string password = HashPassword.Encrypt(inputDto.Password);

                var resultParam = new SqlParameter("@ReturnStatus", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };
                await db.Database.ExecuteSqlRawAsync(
                    "EXEC sp_CreateUser @Username, @PasswordHash, @Email, @FullName, @PhoneNumber, DEFAULT, @DateOfBirth, DEFAULT, @Address, DEFAULT, DEFAULT, DEFAULT, @ReturnStatus OUTPUT",
                    new SqlParameter("@Username", inputDto.Username),
                    new SqlParameter("@PasswordHash", password),
                    new SqlParameter("@Email", inputDto.Email),
                    new SqlParameter("@FullName", inputDto.FullName),
                    new SqlParameter("@PhoneNumber", inputDto.PhoneNumber),
                    new SqlParameter("@DateOfBirth", inputDto.DateOfBirth.Value.ToString("yyyy-MM-dd")),
                    new SqlParameter("@Address", inputDto.Address),
                    resultParam
                );
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
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }

            return res;
        }
    }
}

using api.AppUtils;
using api.DTO.Account;
using api.Interface;
using Microsoft.Data.SqlClient;
using System.Data;

namespace api.Services
{
    public class AccountService : IAccount
    {
        private readonly IConfiguration _config;

        public AccountService(IConfiguration config)
        {
            _config = config;
        }

        public BaseResponse ChangeRoleUser(ChangeRoleUserDto inputDto)
        {
            throw new NotImplementedException();
        }

        public BaseResponse ChangeStatusUser(ChangeStatusUserDto inputDto)
        {
            throw new NotImplementedException();
        }

        public BaseResponse CreateUser(CreateUserDto inputDto)
        {
            throw new NotImplementedException();
        }

        public BaseResponse DeleteUser(DeleteUserDto inputDto)
        {
            throw new NotImplementedException();
        }

        public BaseResponse FindUserByUsernameOrEmail(FindUserByUsernameOrEmailDto inputDto)
        {
            throw new NotImplementedException();
        }

        public BaseResponse GetAllAdminAccounts()
        {
            throw new NotImplementedException();
        }

        public BaseResponse GetAllSubAdminAccounts()
        {
            throw new NotImplementedException();
        }

        public BaseResponse GetAllUserAccounts()
        {
            throw new NotImplementedException();
        }

        public BaseResponse GetUserInfo(GetUserInfoInDto inputDto)
        {
            var res = new BaseResponse();
            GetUserInfoOutDto model = new GetUserInfoOutDto();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetUserByUsernameOrEmail", conn))
                using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                {
                    conn.Open();

                    var usernamePrm = new SqlParameter("@UsernameOrEmail", inputDto.Username);

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(usernamePrm);

                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    model.Avatar = dt.Rows[0]["Avatar"].ToString();
                    model.Address = dt.Rows[0]["Address"].ToString();
                    model.PhoneNumber = dt.Rows[0]["PhoneNumber"].ToString();
                    model.Gender = dt.Rows[0]["Gender"] != DBNull.Value ? (byte)dt.Rows[0]["Gender"] : null;
                    model.DateOfBirth = dt.Rows[0]["DateOfBirth"] != DBNull.Value ? (DateTime)dt.Rows[0]["DateOfBirth"] : null;
                    model.Email = dt.Rows[0]["Email"].ToString();
                    model.Fullname = dt.Rows[0]["FullName"].ToString();
                    model.Username = dt.Rows[0]["Username"].ToString();
                    model.Status = dt.Rows[0]["Status"] != DBNull.Value ? (byte)dt.Rows[0]["Status"] : null;
                    model.IsFB = !string.IsNullOrEmpty(dt.Rows[0]["FacebookID"].ToString());
                    model.IsGG = !string.IsNullOrEmpty(dt.Rows[0]["GoogleID"].ToString());
                    model.RoleID = dt.Rows[0]["roleID"] != DBNull.Value ? (int)dt.Rows[0]["roleID"] : null;

                    res.Data = model;
                    res.Result = AppConstant.RESULT_SUCCESS;
                    res.Message = "Get user info thanh cong";
                }
            }catch(Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }
            return res;
        }

        public BaseResponse UpdateUser(UpdateUserDto inputDto)
        {
            throw new NotImplementedException();
        }
    }
}

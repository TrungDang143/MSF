using api.AppUtils;
using api.DTO.Account;
using api.Interface;
using Microsoft.Data.SqlClient;

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

        public BaseResponse UpdateUser(UpdateUserDto inputDto)
        {
            throw new NotImplementedException();
        }
    }
}

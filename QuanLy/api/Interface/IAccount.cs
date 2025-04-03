using api.DTO.Account;

namespace api.Interface
{
    public interface IAccount
    {
        public BaseResponse FindUserByUsernameOrEmail(FindUserByUsernameOrEmailDto inputDto);
        public BaseResponse GetAllUserAccounts();
        public BaseResponse GetAllAdminAccounts();
        public BaseResponse GetAllSubAdminAccounts();
        public BaseResponse GetUserInfo();

        public BaseResponse UpdateUser(UpdateUserDto inputDto);
        public BaseResponse DeleteUser(DeleteUserDto inputDto);
        public BaseResponse CreateUser(CreateUserDto inputDto);
        public BaseResponse ChangeStatusUser(ChangeStatusUserDto inputDto);
        public BaseResponse ChangeRoleUser(ChangeRoleUserDto inputDto);

    }
}

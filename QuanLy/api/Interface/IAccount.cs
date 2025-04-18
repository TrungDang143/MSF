using api.DTO.Account;

namespace api.Interface
{
    public interface IAccount
    {
        public BaseResponse FindUserByUsernameOrEmail(FindUserByUsernameOrEmailDto inputDto);
        public BaseResponse GetAllUserAccounts();
        public BaseResponse GetUserInfo(GetUserInfoInDto inputDto);
        public BaseResponse GetDetailUserInfo(GetDetailUserInfoInDto inputDto);
        public BaseResponse UpdateUser(UpdateUserDto inputDto);
        public BaseResponse DeleteUser(DeleteUserDto inputDto);
        public BaseResponse CreateUser(CreateUserDto inputDto);
        public BaseResponse ChangeStatusUser(ChangeStatusUserDto inputDto);
        public BaseResponse ChangeRoleUser(ChangeRoleUserDto inputDto);
        public BaseResponse GetAllUserPermission(GetAllUserPermissionDto inputDto);
        public BaseResponse UpdateUserPermission(UpdateUserPermissionDto inputDto);
        public BaseResponse GetAllRole();
        public BaseResponse GetRoleGenderStatus();
    }
}

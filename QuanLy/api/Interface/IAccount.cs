using api.DTO.Account;

namespace api.Interface
{
    public interface IAccount
    {
        public BaseResponse GetAllUserAccounts();
        public BaseResponse GetUserInfo(GetUserInfoInDto inputDto);
        public BaseResponse GetDetailUserInfo(GetDetailUserInfoInDto inputDto);
        public BaseResponse UpdateUser(UpdateUserDto inputDto);
        public BaseResponse DeleteUser(DeleteUserDto inputDto);
        public BaseResponse CreateUser(CreateUserDto inputDto);
        public BaseResponse GetAllUserPermission(GetAllUserPermissionDto inputDto);
        public BaseResponse UpdateUserPermission(UpdateUserPermissionDto inputDto);
        public BaseResponse GetAllRole();
        public BaseResponse GetRoleGenderStatus();
    }
}

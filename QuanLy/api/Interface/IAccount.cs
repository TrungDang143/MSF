using api.DTO.Account;

namespace api.Interface
{
    public interface IAccount
    {
        public BaseResponse GetAllUserAccounts();
        public BaseResponse GetUserInfo(GetUserInfoInDto inputDto);
        public BaseResponse GetDetailUserInfo(GetDetailUserInfoInDto inputDto);
        public BaseResponse UpdateUser(UpdateUserDto inputDto, string? username);
        public BaseResponse DeleteUser(DeleteUserDto inputDto);
        public BaseResponse CreateUser(CreateUserDto inputDto);
        public BaseResponse GetAllUserPermission(GetAllUserPermissionDto inputDto, int roleID);
        public BaseResponse UpdateUserPermission(UpdateUserPermissionDto inputDto);
        public BaseResponse GetAllRole();
        public BaseResponse GetRoleGenderStatus();
        public Task<BaseResponse> GetActivePasswordRule();
    }
}

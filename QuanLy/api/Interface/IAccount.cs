using api.DTO.Account;
using Microsoft.IdentityModel.Tokens;
using System.Drawing.Interop;

namespace api.Interface
{
    public interface IAccount
    {
        public BaseResponse GetAllUserAccounts();
        public BaseResponse GetUserInfo(GetUserInfoInDto inputDto);
        public BaseResponse GetDetailUserInfo(GetDetailUserInfoInDto inputDto);
        public BaseResponse UpdateUser(UpdateUserDto inputDto, string? username);
        public BaseResponse DeleteUser(DeleteUserDto inputDto);
        public BaseResponse CreateUser(CreateUserDto inputDto, int roleID);
        public BaseResponse GetAllUserPermission(GetAllUserPermissionDto inputDto, int roleID);
        public BaseResponse UpdateUserPermission(UpdateUserPermissionDto inputDto, int roleID);
        public BaseResponse GetAllRole();
        public BaseResponse GetRoleGenderStatus();
        public Task<BaseResponse> GetActivePasswordRule();
        public Task<BaseResponse> ChangeUserPassword(ChangeUserPasswordDto inputDto);
        public Task<BaseResponse> ChangeMyPassword(ChangeMyPasswordDto inputDto);
        public BaseResponse LoginUser(LoginUserDto inputDto, string? username);
        public Task<BaseResponse> LogoutUser(LogoutUserDto inputDto, string? username);
    }
}

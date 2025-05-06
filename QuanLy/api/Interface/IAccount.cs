using api.DTO.Account;
using Microsoft.IdentityModel.Tokens;
using System.Drawing.Interop;

namespace api.Interface
{
    public interface IAccount
    {
        public Task<BaseResponse> GetAllUserAccounts();
        public Task<BaseResponse> GetUserInfo(GetUserInfoInDto inputDto);
        public Task<BaseResponse> GetDetailUserInfo(GetDetailUserInfoInDto inputDto);
        public Task<BaseResponse> UpdateUser(UpdateUserDto inputDto, string? username, int? roleID);
        public Task<BaseResponse> DeleteUser(DeleteUserDto inputDto);
        public Task<BaseResponse> CreateUser(CreateUserDto inputDto, int roleID);
        public Task<BaseResponse> GetAllUserPermission(GetAllUserPermissionDto inputDto, int roleID);
        public Task<BaseResponse> GetRole(GetRoleDto inputDto);
        public Task<BaseResponse> GetRoleByPaging(GetRoleDto inputDto);
        public Task<BaseResponse> GetRoleGenderStatus();
        public Task<BaseResponse> GetActivePasswordRule();
        public Task<BaseResponse> ChangeUserPassword(ChangeUserPasswordDto inputDto);
        public Task<BaseResponse> ChangeMyPassword(ChangeMyPasswordDto inputDto);
        public BaseResponse LoginUser(LoginUserDto inputDto, string? username);
        public Task<BaseResponse> LogoutUser(LogoutUserDto inputDto, string? username);
        public Task<BaseResponse> UpdateUserRoles(UpdateUserRolesDto inputDto, int roleID);
    }
}

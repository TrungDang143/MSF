using api.DTO.Account;
using Microsoft.IdentityModel.Tokens;
using System.Drawing.Interop;

namespace api.Interface
{
    public interface IAccount
    {
        public Task<BaseResponse> GetAccounts(GetAccountsDto inputDto);
        public Task<BaseResponse> GetDetailUserInfo(GetDetailUserInfoInDto inputDto);
        public Task<BaseResponse> UpdateUserInfo(UpdateUserDto inputDto, string? username, int? roleID);
        public Task<BaseResponse> DeleteUser(DeleteUserDto inputDto, int userID);
        public Task<BaseResponse> CreateUser(CreateUserDto inputDto, int roleID);
        public Task<BaseResponse> GetRole(GetRoleDto inputDto);
        public Task<BaseResponse> GetGenderStatus();
        public Task<BaseResponse> GetActivePasswordRule();
        public Task<BaseResponse> ChangeUserPassword(ChangeUserPasswordDto inputDto);
        public Task<BaseResponse> ChangeMyPassword(ChangeMyPasswordDto inputDto);
        public BaseResponse LoginUser(LoginUserDto inputDto, string? username);
        public Task<BaseResponse> LogoutUser(LogoutUserDto inputDto, string? username);
        public Task<BaseResponse> UpdateUserRoles(UpdateUserRolesDto inputDto, int userID, int roleID);
    }
}

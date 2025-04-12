

using api.DTO.Account;
using api.DTO.Token;
using Microsoft.AspNetCore.Mvc;

namespace api.Interface
{
    public interface IToken
    {
        public bool ValidateToken(string token);
        public string GenerateToken(string username, string roleName, List<string> permissionNames);
        public Task<string> VerifyRecaptcha(RecaptchaRequest request);
        public string Decode(string token);
        public string GetUserRoleName(string username);
        public int GetUserRoleID(string username);
        public List<string> GetPermissionName(int roleID);
    }
}

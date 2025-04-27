

using api.DTO.Account;
using api.DTO.Token;
using Microsoft.AspNetCore.Mvc;

namespace api.Interface
{
    public interface IToken
    {
        public bool ValidateToken(string token);
        public string GenerateToken(string username, int roleID, List<string> permissionNames);
        //public Task<string> VerifyRecaptcha(RecaptchaRequest request);
        public int GetUserRoleID(string username);
        public List<string> GetPermissionName(int roleID);
        public Task<bool> IsValidUser(string username);
    }
}

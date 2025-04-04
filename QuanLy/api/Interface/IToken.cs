

using api.DTO.Account;
using api.DTO.Token;
using Microsoft.AspNetCore.Mvc;

namespace api.Interface
{
    public interface IToken
    {
        public bool ValidateToken(string token);
        public string GenerateToken(string username, int roleID);
        public Task<string> VerifyRecaptcha(RecaptchaRequest request);
        public string Decode(string token);
        public int GetUserRoleID(string username);


    }
}

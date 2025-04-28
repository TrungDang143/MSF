

using api.DTO.Account;
using api.DTO.Token;
using Microsoft.AspNetCore.Mvc;

namespace api.Interface
{
    public interface IToken
    {
        public bool ValidateToken(string token);
        public string GenerateToken(string username, bool isAdminLogin);
        public Task<bool> IsValidUser(string username, bool isAdminLogin);
    }
}

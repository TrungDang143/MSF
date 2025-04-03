using api.DTO.Token;
using api.Interface;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth;
using System.Text.Json;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : ControllerBase
    {
        private readonly IToken _token;

        public TokenController(IToken token)
        {
            _token = token;
        }

        [HttpGet("validate-token")]
        public IActionResult ValidateToken()
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized(new { message = "Token is required" });
            }

            var isValid = _token.ValidateToken(token);
            if (!isValid)
            {
                return Unauthorized(new { message = "Invalid or expired token" });
            }

            return Ok(new { message = "Token is valid" });
        }

        [HttpPost("verify-recaptcha")]
        public IActionResult VerifyRecaptcha([FromBody] RecaptchaRequest request)
        {
            return Ok(_token.VerifyRecaptcha(request));
        }

    }
}

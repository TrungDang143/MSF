using api.AppUtils;
using api.DTO.Account;
using api.DTO.Login;
using api.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccount _account;
        private readonly IToken _tokenService;
        public AccountController(IAccount account, IToken tokenService)
        {
            _account = account;
            _tokenService = tokenService;
        }

        //[Authorize(Roles = "2")]
        [HttpGet("userInfo")]
        public BaseResponse GetUserInfo([FromQuery] GetUserInfoInDto inputDto)
        {
            return _account.GetUserInfo(inputDto);
        }

        [Authorize(Roles = "1, 3")]
        [HttpGet("GetAllUserAccounts")]
        public BaseResponse GetAllUserAccounts()
        {
            return _account.GetAllUserAccounts();
        }

        [Authorize(Roles = "1, 3")]
        [HttpGet("GetDetailUserInfo")]
        public BaseResponse GetDetailUserInfo([FromQuery] GetDetailUserInfoInDto inputDto)
        {
            return _account.GetDetailUserInfo(inputDto);
        }
    }
}

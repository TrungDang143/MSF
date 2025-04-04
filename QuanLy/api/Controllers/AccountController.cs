﻿using api.AppUtils;
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

        [Authorize(Roles = "1")]
        [HttpGet("userInfo")]
        public BaseResponse GetUserInfo([FromQuery] GetUserInfoInDto inputDto)
        {
            return _account.GetUserInfo(inputDto);
        }
    }
}

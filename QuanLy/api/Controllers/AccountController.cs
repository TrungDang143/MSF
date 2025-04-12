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

        [HttpGet("userInfo")]
        public BaseResponse GetUserInfo([FromQuery] GetUserInfoInDto inputDto)
        {
            return _account.GetUserInfo(inputDto);
        }

        [HasPermission("view_users")]
        [HttpGet("GetAllUserAccounts")]
        public BaseResponse GetAllUserAccounts()
        {
            return _account.GetAllUserAccounts();
        }

        [HasPermission("edit_users")]
        [HttpGet("GetDetailUserInfo")]
        public BaseResponse GetDetailUserInfo([FromQuery] GetDetailUserInfoInDto inputDto)
        {
            return _account.GetDetailUserInfo(inputDto);
        }

        [HasPermission("edit_users")]
        [HttpPost("UpdateUser")]
        public BaseResponse UpdateUser([FromBody] UpdateUserDto inputDto)
        {
            return _account.UpdateUser(inputDto);
        }

        [HasPermission("delete_users")]
        [HttpGet("DeleteUser")]
        public BaseResponse DeleteUser([FromQuery] DeleteUserDto inputDto)
        {
            return _account.DeleteUser(inputDto);
        }
    }
}

using api.AppUtils;
using api.DTO.Account;
using api.DTO.Login;
using api.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Authorize]
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

        [HasPermission("view_users")]
        [HttpGet("GetAllRole")]
        public BaseResponse GetAllRole()
        {
            return _account.GetAllRole();
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
            var username = User.Identity?.Name;
            return _account.UpdateUser(inputDto, username);
        }

        [HasPermission("delete_users")]
        [HttpGet("DeleteUser")]
        public BaseResponse DeleteUser([FromQuery] DeleteUserDto inputDto)
        {
            return _account.DeleteUser(inputDto);
        }

        [HasPermission("view_permissions")]
        [HttpGet("GetAllUserPermission")]
        public BaseResponse GetAllUserPermission([FromQuery] GetAllUserPermissionDto inputDto)
        {
            return _account.GetAllUserPermission(inputDto);
        }

        [HasPermission("assign_permissions")]
        [HttpPost("UpdateUserPermission")]
        public BaseResponse UpdateUserPermission([FromBody] UpdateUserPermissionDto inputDto)
        {
            return _account.UpdateUserPermission(inputDto);
        }

        [HasPermission("create_users")]
        [HttpGet("GetRoleGenderStatus")]
        public BaseResponse GetRoleGenderStatus()
        {
            return _account.GetRoleGenderStatus();
        }

        [HasPermission("create_users")]
        [HttpPost("CreateUser")]
        public BaseResponse CreateUser([FromBody]CreateUserDto inputDto)
        {
            return _account.CreateUser(inputDto);
        }

        
        [HttpGet("GetActivePasswordRule")]
        public async Task<BaseResponse> GetActivePasswordRule()
        {
            return await _account.GetActivePasswordRule();
        }
    }
}

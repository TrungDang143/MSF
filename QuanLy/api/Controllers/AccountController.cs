using api.AppUtils;
using api.DTO.Account;
using api.DTO.Login;
using api.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
            string? username = User.Identity?.Name;
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
            int.TryParse(User.FindFirst(ClaimTypes.Role)?.Value, out int roleID);
            return _account.GetAllUserPermission(inputDto, roleID);
        }

        [HasPermission("assign_user_permissions")]
        [HttpPost("UpdateUserPermission")]
        public BaseResponse UpdateUserPermission([FromBody] UpdateUserPermissionDto inputDto)
        {
            int.TryParse(User.FindFirst(ClaimTypes.Role)?.Value, out int roleID);
            return _account.UpdateUserPermission(inputDto, roleID);
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
            int.TryParse(User.FindFirst(ClaimTypes.Role)?.Value, out int roleID);
            return _account.CreateUser(inputDto, roleID);
        }

        
        [HttpGet("GetActivePasswordRule")]
        public async Task<BaseResponse> GetActivePasswordRule()
        {
            return await _account.GetActivePasswordRule();
        }

        [HasPermission("edit_users")]
        [HttpPost("ChangeUserPassword")]
        public async Task<BaseResponse> ChangeUserPassword([FromBody] ChangeUserPasswordDto inputDto)
        {
            return await _account.ChangeUserPassword(inputDto);
        }

        [HasPermission("edit_users")]
        [HttpPost("ChangeMyPassword")]
        public async Task<BaseResponse> ChangeMyPassword([FromBody] ChangeMyPasswordDto inputDto)
        {
            return await _account.ChangeMyPassword(inputDto);
        }

        [HasPermission("admin.logout_users")]
        [HttpGet("LogoutUser")]
        public async Task<BaseResponse> LogoutUser([FromQuery] LogoutUserDto inputDto)
        {
            string? username = User.Identity?.Name;
            return await _account.LogoutUser(inputDto, username);
        }

        [HasPermission("admin.login_users")]
        [HttpGet("LoginUser")]
        public BaseResponse LoginUser([FromQuery] LoginUserDto inputDto)
        {
            string? username = User.Identity?.Name;
            string token = _tokenService.GenerateToken(inputDto.username, true);

            inputDto.token = token;

            return _account.LoginUser(inputDto, username);
        }
    }
}

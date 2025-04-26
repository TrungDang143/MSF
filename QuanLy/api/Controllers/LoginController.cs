using api.AppUtils;
using api.DTO.Account;
using api.DTO.Login;
using api.Interface;
using api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly ILogin _login;
        private readonly IToken _tokenService;
        public LoginController(ILogin login, IToken tokenService)
        {
            _login = login;
            _tokenService = tokenService;
        }

        [HttpPost]
        public BaseResponse Login([FromBody] LoginInputDto inputDto)
        {
            var res =  _login.Login(inputDto);
            if (res.Result == AppConstant.RESULT_SUCCESS)
            {
                var roleID = _tokenService.GetUserRoleID(inputDto.UsernameOrEmail);
                var rolename = _tokenService.GetUserRoleName(inputDto.UsernameOrEmail);
                var permissions = _tokenService.GetPermissionName(roleID);
                string token = _tokenService.GenerateToken(inputDto.UsernameOrEmail, rolename, permissions);
                res.Data = new
                {
                    token
                };
            }
            return res;
        }

        [HttpPost("login-with-facebook")]
        public BaseResponse FBLogin([FromBody] FindUserByFBIDDto inputDto)
        {
            var res = _login.FindUserByFBID(inputDto);
            if (res.Result == AppConstant.RESULT_SUCCESS)
            {
                string username = res.Data.ToString();
                int roleID = _tokenService.GetUserRoleID(username);
                string rolename = _tokenService.GetUserRoleName(username);
                List<string> permissions = _tokenService.GetPermissionName(roleID);
                string token = _tokenService.GenerateToken(username, rolename, permissions);
                res.Data = new
                {
                    token
                };
            }
            return res;
        }

        [HttpPost("login-with-google")]
        public BaseResponse GGLogin([FromBody] FindUserByGGIDDto inputDto)
        {
            var res = _login.FindUserByGGID(inputDto).Result;
            if (res.Result == AppConstant.RESULT_SUCCESS)
            {
                string username = res.Data.ToString();
                var roleID = _tokenService.GetUserRoleID(username);
                var rolename = _tokenService.GetUserRoleName(username);
                var permissions = _tokenService.GetPermissionName(roleID);
                string token = _tokenService.GenerateToken(username, rolename, permissions);
                res.Data = new
                {
                    token
                };
            }
            return res;
        }
    }
}

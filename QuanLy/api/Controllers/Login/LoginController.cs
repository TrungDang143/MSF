using api.AppUtils;
using api.DTO.Login;
using api.Interface;
using api.Interface.Login;
using api.MoHinhDuLieu;
using api.Services.Auth;
using api.Services.Login;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers.Login
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly ILogin _login;
        private readonly TokenService _tokenService;
        public LoginController(ILogin login, TokenService tokenService)
        {
            _login = login;
            _tokenService = tokenService;
        }

        [HttpPost]
        public async Task<BaseResponse> Login([FromBody] LoginInputDto inputDto)
        {
            var res = await _login.Login(inputDto);
            if (res.Result == AppConstant.RESULT_SUCCESS)
            {
                res.Data = _tokenService.GenerateToken(inputDto.UsernameOrEmail);
            }
            return res;
        }
    }
}

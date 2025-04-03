using api.DTO.Forgot;
using api.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForgotController : ControllerBase
    {
        private readonly IForgot _forgot;

        public ForgotController(IForgot forgot)
        {
            _forgot = forgot;
        }

        [HttpPost("SendOTP")]
       public BaseResponse SendOTP(GetOTPInputDto inputDto)
        {
            return _forgot.SendOTP(inputDto);
        }

        [HttpPost("VerifyOTP")]
        public BaseResponse VerifyOTP(VerifyOTPInputDto inputDto)
        {
            return _forgot.VerifyOTP(inputDto);
        }

        [HttpPost("ChangePassword")]
        public BaseResponse ChangePassword(ChangePasswordInputDto inputDto)
        {
            return _forgot.ChangePassword(inputDto);
        }
    }
}

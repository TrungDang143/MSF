using api.DTO.SignUp;
using api.Interface;
using api.Interface.SignUp;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers.SignUp
{
    [Route("api/[controller]")]
    [ApiController]
    public class SignUpController : ControllerBase
    {
        private readonly ISignUp _signUp;

        public SignUpController(ISignUp signUp)
        {
            _signUp = signUp;
        }

        [HttpPost]
        public Task<BaseResponse> SignUp(SignUpInputDto inputDto)
        {
            return _signUp.SignUp(inputDto);
        }
    }
}

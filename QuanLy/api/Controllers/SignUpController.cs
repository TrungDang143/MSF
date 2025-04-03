using api.DTO.SignUp;
using api.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
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
        public BaseResponse SignUp(SignUpInputDto inputDto)
        {
            return _signUp.SignUp(inputDto);
        }
    }
}

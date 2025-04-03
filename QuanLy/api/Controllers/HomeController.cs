using api.DTO.Home;
using api.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private readonly IHome _home;

        public HomeController(IHome home)
        {
            _home = home;
        }

        [HttpGet("GetFullName")]
        public BaseResponse GetFullName([FromQuery]GetFullNameInputDto inputDto)
        {
            return _home.GetFullName(inputDto);
        }
    }
}

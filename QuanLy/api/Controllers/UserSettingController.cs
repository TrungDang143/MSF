using api.AppUtils;
using api.DTO.UserSetting;
using api.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [HasPermission("manage_settings")]
    [Route("api/[controller]")]
    [ApiController]
    public class UserSettingController : ControllerBase
    {
        private readonly IUserSetting _userSetting;
        public UserSettingController(IUserSetting userSetting)
        {
            _userSetting = userSetting;
        }

        [HttpPost("SetUserPermission")]
        public BaseResponse SetUserPermission([FromQuery]SetUserPermissionDto inputDto)
        {
            return _userSetting.SetUserPermission(inputDto);
        }

        [HttpGet("GetUserPermission")]
        public BaseResponse GetUserPermission([FromQuery] GetUserPermissionDto inputDto)
        {
            return _userSetting.GetUserPermission(inputDto);
        }
    }
}

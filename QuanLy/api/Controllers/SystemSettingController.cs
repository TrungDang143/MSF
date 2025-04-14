using api.AppUtils;
using api.DTO.SystemSetting;
using api.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [HasPermission("manage_settings")]
    [Route("api/[controller]")]
    [ApiController]
    public class SystemSettingController : ControllerBase
    {
        private readonly ISystemSetting _systemSetting;

        public SystemSettingController(ISystemSetting systemSetting)
        {
            _systemSetting = systemSetting;
        }

        [HttpGet("GetPasswordRule")]
        public BaseResponse GetPasswordRule()
        {
            return _systemSetting.GetPasswordRule();
        }

        [HttpPost("UpdatePasswordRule")]
        public BaseResponse UpdatePasswordRule([FromBody]UpdatePasswordRuleDto inputDto)
        {
            return _systemSetting.UpdatePasswordRule(inputDto);
        }
    }
}

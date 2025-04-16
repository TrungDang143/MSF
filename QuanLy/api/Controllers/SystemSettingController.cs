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
        public BaseResponse UpdatePasswordRule([FromBody] UpdatePasswordRuleDto inputDto)
        {
            return _systemSetting.UpdatePasswordRule(inputDto);
        }


        [HasPermission("create_roles")]
        [HttpPost("CreateRole")]
        public BaseResponse CreateRole([FromBody] CreateRoleDto inputDto)
        {
            return _systemSetting.CreateRole(inputDto);
        }

        [HasPermission("delete_roles")]
        [HttpPost("DeleteRole")]
        public BaseResponse DeleteRole([FromBody] DeleteRoleDto inputDto)
        {
            return _systemSetting.DeleteRole(inputDto);
        }

        [HasPermission("edit_roles")]
        [HttpPost("UpdateRolePermission")]
        public BaseResponse UpdateRolePermission([FromBody] UpdateRolePermissionDto inputDto)
        {
            return _systemSetting.UpdateRolePermission(inputDto);
        }
    }
}

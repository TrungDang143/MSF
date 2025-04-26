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
        public async Task<BaseResponse> GetPasswordRule()
        {
            return await _systemSetting.GetPasswordRule();
        }

        [HttpPost("UpdatePasswordRule")]
        public async Task<BaseResponse> UpdatePasswordRule([FromBody] UpdatePasswordRuleDto inputDto)
        {
            return await _systemSetting.UpdatePasswordRule(inputDto);
        }


        [HasPermission("create_roles")]
        [HttpPost("CreateRole")]
        public async Task<BaseResponse> CreateRole([FromBody] CreateRoleDto inputDto)
        {
            return await _systemSetting.CreateRole(inputDto);
        }

        [HasPermission("delete_roles")]
        [HttpPost("DeleteRole")]
        public async Task<BaseResponse> DeleteRole([FromBody] DeleteRoleDto inputDto)
        {
            return await _systemSetting.DeleteRole(inputDto);
        }

        [HasPermission("edit_roles")]
        [HttpPost("UpdateRole")]
        public async Task<BaseResponse> UpdateRole([FromBody] UpdateRoleDto inputDto)
        {
            return await _systemSetting.UpdateRole(inputDto);
        }

        [HasPermission("view_roles")]
        [HttpGet("GetListRole")]
        public async Task<BaseResponse> GetListRole()
        {
            return await _systemSetting.GetListRole();
        }

        [HasPermission("view_roles")]
        [HttpGet("GetRoleDetail")]
        public async Task<BaseResponse> GetRoleDetail([FromQuery]GetRoleDetailInDto inputDto)
        {
            return await _systemSetting.GetRoleDetail(inputDto);
        }
    }
}

using api.AppUtils;
using api.DTO.SystemSetting;
using api.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace api.Controllers
{
    [HasPermission("view_settings")]
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

        [HasPermission("admin.manage_password")]
        [HttpPost("UpdatePasswordRule")]
        public async Task<BaseResponse> UpdatePasswordRule([FromBody] UpdatePasswordRuleDto inputDto)
        {
            return await _systemSetting.UpdatePasswordRule(inputDto);
        }

        [HasPermission("admin.create_roles")]
        [HttpPost("CreateRole")]
        public async Task<BaseResponse> CreateRole([FromBody] CreateRoleDto inputDto)
        {
            int.TryParse(User.FindFirst(ClaimTypes.Role)?.Value, out int roleID);
            return await _systemSetting.CreateRole(inputDto, roleID);
        }

        [HasPermission("admin.delete_roles")]
        [HttpPost("DeleteRole")]
        public async Task<BaseResponse> DeleteRole([FromBody] DeleteRoleDto inputDto)
        {
            return await _systemSetting.DeleteRole(inputDto);
        }

        [HasPermission("admin.edit_roles")]
        [HttpPost("UpdateRole")]
        public async Task<BaseResponse> UpdateRole([FromBody] UpdateRoleDto inputDto)
        {
            int.TryParse(User.FindFirst(ClaimTypes.Role)?.Value, out int roleID);
            return await _systemSetting.UpdateRole(inputDto, roleID);
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

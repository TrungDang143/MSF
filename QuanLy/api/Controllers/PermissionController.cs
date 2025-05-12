using api.AppUtils;
using api.DTO.Perrmission;
using api.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionController : ControllerBase
    {
        private readonly IPermission _permission;

        public PermissionController(IPermission permission)
        {
            _permission = permission;
        }

        [HasPermission("view_permissions")]
        [HttpGet("GetAllPermission")]
        public async Task<BaseResponse> GetAllPermission()
        {
            int.TryParse(User.FindFirst(ClaimTypes.Role)?.Value, out int roleID);
            return await _permission.GetAllPermission(roleID);
        }

        [HasPermission("view_permissions")]
        [HttpPost("GetPermissionByRoleIds")]
        public async Task<BaseResponse> GetPermissionByRoleIds([FromBody]GetPermissionByRoleIDDto inputDto)
        {
            int.TryParse(User.FindFirst(ClaimTypes.Role)?.Value, out int roleID);
            return await _permission.GetPermissionByRoleIds(inputDto, roleID);
        }

        [HasPermission("view_permissions")]
        [HttpGet("GetPermissionForUserbyRoleIds")]
        public async Task<BaseResponse> GetPermissionForUserbyRoleIds([FromQuery] GetPermissionForUserbyRoleIdsInDto inputDto)
        {
            int.TryParse(User.FindFirst(ClaimTypes.Role)?.Value, out int roleID);
            return await _permission.GetPermissionForUserbyRoleIds(inputDto, roleID);
        }
    }
}

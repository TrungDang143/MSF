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
        public BaseResponse GetAllPermission()
        {
            int.TryParse(User.FindFirst(ClaimTypes.Role)?.Value, out int roleID);
            return _permission.GetAllPermission(roleID);
        }

        [HasPermission("view_permissions")]
        [HttpGet("GetPermissionByRoleID")]
        public BaseResponse GetPermissionByRoleID([FromQuery]GetPermissionByRoleIDDto inputDto)
        {
            int.TryParse(User.FindFirst(ClaimTypes.Role)?.Value, out int roleID);
            return _permission.GetPermissionByRoleID(inputDto, roleID);
        }
    }
}

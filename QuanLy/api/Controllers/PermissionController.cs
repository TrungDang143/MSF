using api.AppUtils;
using api.DTO.Perrmission;
using api.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
            return _permission.GetAllPermission();
        }

        [HasPermission("view_permissions")]
        [HttpGet("GetPermissionByRoleID")]
        public BaseResponse GetPermissionByRoleID([FromQuery]GetPermissionByRoleIDDto inputDto)
        {
            return _permission.GetPermissionByRoleID(inputDto);
        }
    }
}

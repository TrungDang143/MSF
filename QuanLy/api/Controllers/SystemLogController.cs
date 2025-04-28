using api.AppUtils;
using api.DTO.SystemLog;
using api.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemLogController : ControllerBase
    {
        private readonly ISystemLogService _systemLogService;

        public SystemLogController(ISystemLogService systemLogService)
        {
            _systemLogService = systemLogService;
        }

        [HasPermission("admin.view_logs")]
        [HttpGet("GetLog")]
        public BaseResponse GetLog()
        {
            return _systemLogService.GetLog();
        }

        [HasPermission("admin.view_logs")]
        [HttpGet("GetSystemLogsByPaging")]
        public BaseResponse GetSystemLogsByPaging([FromQuery]GetSystemLogsByPagingDto inputDto)
        {
            return _systemLogService.GetSystemLogsByPaging(inputDto);
        }

        [HasPermission("admin.view_logs")]
        [HttpPost("DeleteLogs")]
        public BaseResponse DeleteLogs([FromBody] DeleteLogsDto inputDto)
        {
            return _systemLogService.DeleteLogs(inputDto);
        }
    }
}

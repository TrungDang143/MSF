using api.AppUtils;
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

        [HasPermission("view_logs")]
        [HttpGet("GetLog")]
        public BaseResponse GetLog()
        {
            return _systemLogService.GetLog();
        }
    }
}

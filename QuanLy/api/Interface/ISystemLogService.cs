using api.DTO.SystemLog;

namespace api.Interface
{
    public interface ISystemLogService
    {
        Task SaveLogAsync(SystemLogDto logDto);
        BaseResponse GetLog();
        public BaseResponse GetSystemLogsByPaging(GetSystemLogsByPagingDto inputDto);
        public BaseResponse DeleteLogs(DeleteLogsDto inputDto);
    }
}

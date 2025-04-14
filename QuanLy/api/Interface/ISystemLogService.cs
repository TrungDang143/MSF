using api.DTO.SystemLog;

namespace api.Interface
{
    public interface ISystemLogService
    {
        Task SaveLogAsync(SystemLogDto logDto);
        BaseResponse GetLog();
    }
}

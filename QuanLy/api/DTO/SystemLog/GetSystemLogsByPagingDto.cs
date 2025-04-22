using api.Interface;

namespace api.DTO.SystemLog
{
    public class GetSystemLogsByPagingDto:BasePaging
    {
        public string? userName { get; set; }
        public DateTime? from { get; set; }
        public DateTime? to { get; set; }
    }
}

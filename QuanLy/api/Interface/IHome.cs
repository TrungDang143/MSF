using api.DTO.Home;

namespace api.Interface
{
    public interface IHome
    {
        public BaseResponse GetFullName(GetFullNameInputDto inputDto);
    }
}

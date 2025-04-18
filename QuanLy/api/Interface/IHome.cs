using api.DTO.Home;

namespace api.Interface
{
    public interface IHome
    {
        public BaseResponse GetUserInfo(GetFullNameInputDto inputDto);
    }
}

using api.DTO.Account;
using api.DTO.Login;

namespace api.Interface
{
    public interface ILogin
    {
        public BaseResponse Login(LoginInputDto inputDto);
        public Task<BaseResponse> FindUserByFBID(FindUserByFBIDDto inputDto);
        public Task<BaseResponse> FindUserByGGID(FindUserByGGIDDto inputDto);
    }
}

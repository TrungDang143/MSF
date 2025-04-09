using api.DTO.Account;
using api.DTO.Login;

namespace api.Interface
{
    public interface ILogin
    {
        public BaseResponse Login(LoginInputDto inputDto);
        public BaseResponse FindUserByFBID(FindUserByFBIDDto inputDto);
        public Task<BaseResponse> FindUserByGGID(FindUserByGGIDDto inputDto);
    }
}

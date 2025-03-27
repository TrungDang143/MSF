using api.DTO.Login;

namespace api.Interface.Login
{
    public interface ILogin
    {
        public Task<BaseResponse> Login(LoginInputDto inputDto);
    }
}


using api.DTO.SignUp;

namespace api.Interface.SignUp
{
    public interface ISignUp
    {
        public Task<BaseResponse> SignUp(SignUpInputDto inputDto);
    }
}

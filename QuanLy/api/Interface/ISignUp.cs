using api.DTO.SignUp;

namespace api.Interface
{
    public interface ISignUp
    {
        public BaseResponse SignUp(SignUpInputDto inputDto);
    }
}

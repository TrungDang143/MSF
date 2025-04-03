using api.DTO.Forgot;

namespace api.Interface
{
    public interface IForgot
    {
        public BaseResponse SendOTP(GetOTPInputDto input);
        public BaseResponse VerifyOTP(VerifyOTPInputDto inputDto);
        public BaseResponse ChangePassword(ChangePasswordInputDto inputDto);
    }
}

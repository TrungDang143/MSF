using api.DTO.SystemSetting;

namespace api.Interface
{
    public interface ISystemSetting
    {
        public BaseResponse UpdatePasswordRule(UpdatePasswordRuleDto inputDto);
        public BaseResponse GetPasswordRule();
    }
}

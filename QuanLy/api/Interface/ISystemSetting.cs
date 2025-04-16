using api.DTO.SystemSetting;

namespace api.Interface
{
    public interface ISystemSetting
    {
        public BaseResponse UpdatePasswordRule(UpdatePasswordRuleDto inputDto);
        public BaseResponse GetPasswordRule();
        public BaseResponse CreateRole(CreateRoleDto inputDto);
        public BaseResponse UpdateRolePermission(UpdateRolePermissionDto inputDto);
        public BaseResponse DeleteRole(DeleteRoleDto inputDto);
    }
}

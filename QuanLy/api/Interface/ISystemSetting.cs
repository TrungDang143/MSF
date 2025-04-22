using api.DTO.SystemSetting;

namespace api.Interface
{
    public interface ISystemSetting
    {
        public Task<BaseResponse> UpdatePasswordRule(UpdatePasswordRuleDto inputDto);
        public Task<BaseResponse> GetPasswordRule();
        public Task<BaseResponse> CreateRole(CreateRoleDto inputDto);
        public Task<BaseResponse> UpdateRolePermission(UpdateRolePermissionDto inputDto);
        public Task<BaseResponse> DeleteRole(DeleteRoleDto inputDto);
        public Task<BaseResponse> GetListRole();
    }
}

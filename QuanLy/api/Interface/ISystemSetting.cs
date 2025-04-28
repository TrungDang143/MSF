using api.DTO.SystemSetting;

namespace api.Interface
{
    public interface ISystemSetting
    {
        public Task<BaseResponse> UpdatePasswordRule(UpdatePasswordRuleDto inputDto);
        public Task<BaseResponse> GetPasswordRule();
        public Task<BaseResponse> CreateRole(CreateRoleDto inputDto, int roleID);
        public Task<BaseResponse> UpdateRole(UpdateRoleDto inputDto, int roleID);
        public Task<BaseResponse> DeleteRole(DeleteRoleDto inputDto);
        public Task<BaseResponse> GetListRole();
        public Task<BaseResponse> GetRoleDetail(GetRoleDetailInDto inputDto);
    }
}

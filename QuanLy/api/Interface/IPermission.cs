using api.DTO.Perrmission;
using Microsoft.EntityFrameworkCore.Metadata;

namespace api.Interface
{
    public interface IPermission
    {
        public BaseResponse GetAllPermission(int roleID);
        public Task<BaseResponse> GetPermissionByRoleIds(GetPermissionByRoleIDDto inputDto, int roleID);
    }
}

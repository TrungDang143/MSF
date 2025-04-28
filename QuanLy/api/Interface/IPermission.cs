using api.DTO.Perrmission;
using Microsoft.EntityFrameworkCore.Metadata;

namespace api.Interface
{
    public interface IPermission
    {
        public BaseResponse GetAllPermission(int roleID);
        public BaseResponse GetPermissionByRoleID(GetPermissionByRoleIDDto inputDto, int roleID);
    }
}

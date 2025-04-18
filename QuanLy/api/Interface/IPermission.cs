using api.DTO.Perrmission;

namespace api.Interface
{
    public interface IPermission
    {
        public BaseResponse GetAllPermission();
        public BaseResponse GetPermissionByRoleID(GetPermissionByRoleIDDto inputDto);
    }
}

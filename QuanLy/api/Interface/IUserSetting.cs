using api.DTO.UserSetting;

namespace api.Interface
{
    public interface IUserSetting
    {
        public BaseResponse SetUserPermission(SetUserPermissionDto inputDto);
        public BaseResponse GetUserPermission(GetUserPermissionDto inputDto);
    }
}

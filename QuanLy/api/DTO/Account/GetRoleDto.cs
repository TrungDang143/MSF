using api.Interface;

namespace api.DTO.Account
{
    public class GetRoleDto:BasePaging
    {
        public string roleName { get; set; }
    }
}

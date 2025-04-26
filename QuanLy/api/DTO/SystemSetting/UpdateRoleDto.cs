using System.Reflection.Metadata.Ecma335;

namespace api.DTO.SystemSetting
{
    public class UpdateRoleDto
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; }
        public string? Description { get; set; }
        public List<int>? PermissionIDs { get; set; }
    }
}

namespace api.DTO.SystemSetting
{
    public class CreateRoleDto
    {
        public string RoleName { get; set; }
        public string? Description { get; set; }
        public List<int>? PermissionIDs { get; set; }
    }
}

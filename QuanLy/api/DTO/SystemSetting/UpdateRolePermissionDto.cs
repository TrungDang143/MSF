namespace api.DTO.SystemSetting
{
    public class UpdateRolePermissionDto
    {
        public int RoleID { get; set; }
        public List<int> PermissionIDs { get; set; }
    }
}

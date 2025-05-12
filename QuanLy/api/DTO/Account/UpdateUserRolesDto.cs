namespace api.DTO.Account
{
    public class UpdateUserRolesDto
    {
        public int UserID { get; set; }
        public string DeniedRolePermissionIdsJson { get; set; }
    }

    //public class RolePermissionDto
    //{
    //    public int RoleID { get; set; }
    //    public List<int> UnSelectPermissionIds { get; set; } = new();
    //}
}

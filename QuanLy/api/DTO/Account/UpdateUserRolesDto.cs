namespace api.DTO.Account
{
    public class UpdateUserRolesDto
    {
        public int UserID { get; set; }
        public object RolePermissions { get; set; }
    }
}

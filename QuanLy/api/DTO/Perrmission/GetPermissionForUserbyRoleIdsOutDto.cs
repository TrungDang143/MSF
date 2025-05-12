namespace api.DTO.Perrmission
{
    public class GetPermissionForUserbyRoleIdsOutDto
    {
        public int RoleID { get; set; }
        public List<int>? PermissionIds { get; set; }
    }
}

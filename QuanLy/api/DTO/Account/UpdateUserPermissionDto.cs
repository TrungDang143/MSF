namespace api.DTO.Account
{
    public class UpdateUserPermissionDto
    {
        public int UserID { get; set; }
        public List<int> PermissionIds { get; set; }
    }
}

namespace api.DTO.Perrmission
{
    public class GetAllPermissionOutDto
    {
        public List<Permission> Permission_User { get; set; }
        public List<Permission> Permission_Role { get; set; }
        public List<Permission> Permission_Content { get; set; }
        public List<Permission> Permission_Permission { get; set; }
        public List<Permission> Permission_System { get; set; }
    }
}

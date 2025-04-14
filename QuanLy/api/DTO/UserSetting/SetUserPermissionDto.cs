namespace api.DTO.UserSetting
{
    public class SetUserPermissionDto
    {
        public int UserID { get; set; }
        public List<string> PermissionIDs { get; set; }
    }
}

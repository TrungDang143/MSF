using System.Reflection.Metadata.Ecma335;

namespace api.DTO.SystemSetting
{
    public class RoleDetail
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; }
        public string? Description { get; set; }
        public string CreatedAt { get; set; }
        public string UpdatedAt { get; set; }
    }
}

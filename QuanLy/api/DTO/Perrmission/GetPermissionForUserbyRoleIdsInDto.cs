using System.Reflection.Metadata.Ecma335;

namespace api.DTO.Perrmission
{
    public class GetPermissionForUserbyRoleIdsInDto
    {
        public int UserID { get; set; }
        public string? RoleIds { get; set; }
    }
}

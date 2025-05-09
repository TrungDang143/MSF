using api.Interface;

namespace api.DTO.Account
{
    public class GetAccountsDto:BasePaging
    {
        public string? UsernameOrEmail { get; set; }
        public string? Fullname { get; set; }
        public int? RoleID { get; set; }
        public int? PermissionID { get; set; }
    }
}

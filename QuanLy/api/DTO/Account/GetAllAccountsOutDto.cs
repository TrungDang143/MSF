namespace api.DTO.Account
{
    public class GetAllAccountsOutDto
    {
        public List<Account> Admins { get; set; }
        public List<Account> SubAdmins { get; set; }
        public List<Account> Users{ get; set; }
    }
}

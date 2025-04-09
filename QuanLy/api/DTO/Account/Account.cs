namespace api.DTO.Account
{
    public class Account
    {
        public int UserID { get; set; }
        public string? Avatar { get; set; }
        public string? Fullname { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public byte? Status { get; set; }
    }
}

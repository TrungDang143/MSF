namespace api.DTO.Account
{
    public class GetUserInfoOutDto
    {
        public string? Username { get; set; }
        public string? Fullname { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public byte? Gender { get; set; }
        public string? Address { get; set; }
        public byte? Status { get; set; }
        public int? RoleID { get; set; }
        public bool IsGG { get; set; }
        public bool IsFB { get; set; }
    }
}

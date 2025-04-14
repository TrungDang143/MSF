namespace api.DTO.Account
{
    public class GetUserInfoOutDto
    {
        public int UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Avatar { get; set; }
        public string? DateOfBirth { get; set; }
        public byte? Gender { get; set; }
        public string? Address { get; set; }
        public byte? Status { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
        public bool GoogleID { get; set; }
        public bool FacebookID { get; set; }
        public string? Otp { get; set; }
        public int? RoleID { get; set; }
        public string? LockTime { get; set; }
        public byte? RemainTime { get; set; }
        public List<Gender> ListGender { get; set; }
    }
}

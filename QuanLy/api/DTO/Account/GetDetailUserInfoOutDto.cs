namespace api.DTO.Account
{
    public class GetDetailUserInfoOutDto
    {
        public int UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        //public string PasswordHash { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public byte? Gender { get; set; }
        public string? Address { get; set; }
        public byte? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? GoogleID { get; set; }
        public string? FacebookID { get; set; }
        public string? Otp { get; set; }
        public int? RoleID { get; set; }
        public DateTime? LockTime { get; set; }
        public byte? RemainTime { get; set; }
    }
}

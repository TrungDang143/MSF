namespace api.DTO.Account
{
    public class UpdateUserDto
    {
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public byte? Gender { get; set; }
        public string? Address { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? GoogleID { get; set; }
        public string? FacebookID { get; set; }
    }
}

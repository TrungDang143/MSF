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
        public string? DateOfBirth { get; set; }
        public byte? Gender { get; set; }
        public string? Address { get; set; }
        public byte? Status { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
        public string? GoogleID { get; set; }
        public string? FacebookID { get; set; }
        public string? Otp { get; set; }
        public int? RoleID { get; set; }
        public string? LockTime { get; set; }
        public byte? RemainTime { get; set; }
        public bool IsExternalAvatar { get; set; }
        public List<Role> ListRole { get; set; }
        public List<Status> ListStatus { get; set; }
        public List<Gender> ListGender { get; set; }
    }

    public class Role
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; }
        //public string Description { get; set; }
    }
    public class Status
    {
        public int StatusID { get; set; }
        public string StatusName { get; set; }
    }
    public class Gender
    {
        public int GenderID { get; set; }
        public string GenderName { get; set; }
    }
}

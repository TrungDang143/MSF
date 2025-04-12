﻿namespace api.DTO.Account
{
    public class UpdateUserDto
    {
        public int UserID { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? Gender { get; set; }
        public string? Address { get; set; }
        public string? GoogleID { get; set; }
        public string? FacebookID { get; set; }
        public int? statusID { get; set; }
        public int? roleID { get; set; }
    }
}

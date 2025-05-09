using System.ComponentModel.DataAnnotations;

namespace api.DTO.Account
{
    public class UpdateUserDto
    {
        [Required]
        public int UserID { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        [MinLength(5)]
        [MaxLength(100)]
        public string? FullName { get; set; }

        [MinLength(10)]
        [MaxLength(15)]
        public string? PhoneNumber { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? Gender { get; set; }

        [MinLength(10)]
        [MaxLength(100)]
        public string? Address { get; set; }
        public string? GoogleID { get; set; }
        public string? FacebookID { get; set; }
        [Required]
        public int? status { get; set; }
        public int? roleID { get; set; }

        [Required]
        public bool isExternalAvatar { get; set; }
        public List<int>? PermissionIds { get; set; }
    }
}

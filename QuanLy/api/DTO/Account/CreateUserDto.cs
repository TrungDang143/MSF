using System.ComponentModel.DataAnnotations;

namespace api.DTO.Account
{
    public class CreateUserDto
    {
        [Required]
        public string username { get; set; }

        [Required]
        [MinLength(5)]
        [MaxLength(100)]
        public string fullName { get; set; }

        [Required]
        public string email { get; set; }

        [Required]
        public string password { get; set; }

        [MinLength(10)]
        [MaxLength(100)]
        public string? address { get; set; }
        public string? googleId { get; set; }
        public string? facebookId { get; set; }
        public DateTime? dateOfBirth { get; set; }
        public byte? gender { get; set; }
        public string? avatar { get; set; }
        public byte status { get; set; } = 1;
        public string? rolePermissions { get; set; }

        [MinLength(10)]
        [MaxLength(15)]
        public string? phoneNumber { get; set; }
    }
}

namespace api.DTO.Account
{
    public class CreateUserDto
    {
        public string username { get; set; }
        public string fullName { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string? address { get; set; }
        public string? googleId { get; set; }
        public string? facebookId { get; set; }
        public DateTime? dateOfBirth { get; set; }
        public byte? gender { get; set; }
        public string? avatar { get; set; }
        public byte status { get; set; } = 1;
        public int? roleId { get; set; }
        public string? phoneNumber { get; set; }
        public List<int>? permissionIds { get; set; }
    }
}

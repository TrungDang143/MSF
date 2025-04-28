namespace api.DTO.Account
{
    public class ChangeMyPasswordDto
    {
        public string username { get; set; }
        public string oldPassword { get; set; }
        public string newPassword { get; set; }
    }
}

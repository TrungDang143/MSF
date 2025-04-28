using Google.Apis.Http;

namespace api.DTO.Account
{
    public class ChangeUserPasswordDto
    {
        public string username { get; set; }
        public string newPassword { get; set; }
    }
}

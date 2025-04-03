namespace api.DTO.Account
{
    public class CreateUserDto
    {
        public string username { get; set; }
        public string fullname { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string GGID { get; set; }
        public string FBID { get; set; }
        public string picture { get; set; }
    }
}

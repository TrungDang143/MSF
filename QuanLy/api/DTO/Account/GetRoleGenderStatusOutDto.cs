namespace api.DTO.Account
{
    public class GetRoleGenderStatusOutDto
    {
        public List<Role> listRole { get; set; }
        public List<Gender> listGender { get; set; }
        public List<Status> listStatus { get; set; }
    }
}

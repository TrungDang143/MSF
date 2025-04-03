using System.Security.Principal;

namespace api.DTO.Token
{
    public class PayloadFBDto
    {
        public string ID { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string picture { get; set; }
    }
}

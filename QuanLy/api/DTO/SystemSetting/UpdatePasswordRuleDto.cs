namespace api.DTO.SystemSetting
{
    public class UpdatePasswordRuleDto
    {
        public int minLength { get; set; }
        public List<PasswordRule> passwordRules { get; set; }
    }
}

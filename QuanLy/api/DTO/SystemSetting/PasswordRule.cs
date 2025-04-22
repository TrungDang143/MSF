namespace api.DTO.SystemSetting
{
    public class PasswordRule
    {
        public string SettingKey { get; set; }
        public string SettingValue { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }
}

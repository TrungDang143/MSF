namespace api.AppUtils
{
    public class AppConstant
    {
        public static string RESULT_SUCCESS = "1";
        public static string RESULT_ERROR = "0";
        public static string CONNECTION_STRING
        {
            get
            {
                var config = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .Build();

                return config.GetConnectionString("conn");

            }
        }
        public static string DEFAULT_PASSWORD { 
            get{
                var config = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .Build();

                return config.GetSection("Default")["Password"];
            } 
        }
    }
}

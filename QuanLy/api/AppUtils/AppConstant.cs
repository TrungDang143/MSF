﻿using api.Interface;

namespace api.AppUtils
{
    public class AppConstant
    {
        public static string RESULT_SUCCESS = "1";
        public static string RESULT_ERROR = "0";
        public static string RESULT_SYSTEM_ERROR = "2";
        public static int MIN_PASSWORD_LENGTH = 6;
        public static string NO_INFO = "NO_INFO";
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

        public static string DEFAULT_KEYCAPTCHA
        {
            get
            {
                var config = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .Build();

                return config.GetSection("Default")["KeyCaptcha"]!;
            }
        }

        public static string DEFAULT_AVATAR
        {
            get
            {
                var config = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .Build();

                return config.GetSection("Default")["Avatar"]!;
            }
        }

        public static BaseResponse INVALID_MODEL()
        {
            return new BaseResponse()
            {
                Result = AppConstant.RESULT_ERROR,
                Message = "Kiểm tra lại thông tin!"
            };

        }
    }
}

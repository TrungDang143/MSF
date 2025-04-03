using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.NetworkInformation;

namespace QlyBaiGuiXe.Setting
{
    internal class ForgotPassword
    {
        
        public static void sendEmail(string toEmail, string code)
        {
            if (IsInternetAvailable())
            {
                MailMessage mailMessage = new MailMessage();
                SmtpClient smtpClient = new SmtpClient();

                MailAddress fromAddress = new MailAddress("1facebook.sieunhan.thanhly@gmail.com", "Entry test MSF");

                mailMessage.From = fromAddress;
                mailMessage.To.Add(toEmail);
                mailMessage.Subject = "Mã khôi khục mật khẩu - Entry test MSF";
                mailMessage.Body = "Mã khôi phục của bạn là: " + code;

                smtpClient.Host = "smtp.gmail.com";
                smtpClient.Port = 587;
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential("1facebook.sieunhan.thanhly", "soez eqwi wmnw llmx");
                smtpClient.EnableSsl = true;

                try
                {
                    smtpClient.Send(mailMessage);
                }
                catch (Exception)
                {
                    throw new Exception("Có lỗi xảy ra trong quá trình gửi mã khôi phục. Vui lòng thử lại!");
                }       
            }
            else
            {
                throw new Exception("Vui lòng kiểm tra kết nối Internet và thử lại!");
            }
            
        }
        static bool IsInternetAvailable()
        {
            return NetworkInterface.GetIsNetworkAvailable();
        }
    }
}

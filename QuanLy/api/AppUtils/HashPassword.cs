using System.Security.Cryptography;
using System.Text;

namespace api.AppUtils
{
    public class HashPassword
    {
        public static string Encrypt(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = Encoding.UTF8.GetBytes(password);
                byte[] hashBytes = sha256.ComputeHash(bytes);

                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }
        public static bool VerifyPassword(string inputPassword, string storedHash)
        {
            string hashedInput = Encrypt(inputPassword);
            return hashedInput == storedHash;
        }
    }
}

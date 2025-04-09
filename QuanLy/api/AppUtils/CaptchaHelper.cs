using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

public static class CaptchaHelper
{
    // Sinh chuỗi CAPTCHA ngẫu nhiên
    public static string GenerateCaptchaCode(int length = 5)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
          .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    // Tạo ảnh CAPTCHA với hiệu ứng méo chữ, nhiễu và đường cong
    public static string GenerateCaptchaImageBase64(string captchaCode)
    {
        int width = 160, height = 60;
        var rand = new Random();
        using var bmp = new Bitmap(width, height);
        using var gfx = Graphics.FromImage(bmp);

        gfx.SmoothingMode = SmoothingMode.AntiAlias;
        gfx.Clear(Color.White);

        // Vẽ ký tự với hiệu ứng méo
        var font = new Font("Arial", 28, FontStyle.Bold);
        var brush = new SolidBrush(Color.DarkBlue);

        for (int i = 0; i < captchaCode.Length; i++)
        {
            var charBmp = new Bitmap(40, 50);
            using (var charGraphics = Graphics.FromImage(charBmp))
            {
                charGraphics.SmoothingMode = SmoothingMode.AntiAlias;
                charGraphics.Clear(Color.Transparent);
                charGraphics.DrawString(captchaCode[i].ToString(), font, brush, new PointF(0, 0));
            }

            // Vị trí ngẫu nhiên
            int x = 20 + i * 25 + rand.Next(-2, 2);
            int y = rand.Next(0, 10);

            // Bóp ảnh (méo nhẹ)
            PointF[] destPoints = new PointF[]
            {
                new PointF(0 + rand.Next(-2, 2), 0 + rand.Next(-2, 2)),
                new PointF(charBmp.Width + rand.Next(-2, 2), 0 + rand.Next(-2, 2)),
                new PointF(0 + rand.Next(-2, 2), charBmp.Height + rand.Next(-2, 2))
            };

            // Thay vì dùng overload có null, dùng overload đơn giản:
            gfx.DrawImage(charBmp, new Rectangle(x, y, charBmp.Width, charBmp.Height));
        }


        // Thêm nhiễu chấm nhỏ
        for (int i = 0; i < 100; i++)
        {
            int x = rand.Next(width);
            int y = rand.Next(height);
            bmp.SetPixel(x, y, Color.Gray);
        }

        // Vẽ đường cong
        var pen = new Pen(Color.Red, 1);
        for (int i = 0; i < 2; i++)
        {
            Point p1 = new Point(0, rand.Next(height));
            Point p2 = new Point(width, rand.Next(height));
            gfx.DrawBezier(pen, p1, new Point(width / 3, rand.Next(height)),
                                 new Point(2 * width / 3, rand.Next(height)), p2);
        }

        // Chuyển ảnh thành base64
        using var ms = new MemoryStream();
        bmp.Save(ms, ImageFormat.Png);
        return Convert.ToBase64String(ms.ToArray());
    }

    // Tạo token mã hóa cho CAPTCHA
    public static string GenerateCaptchaToken(string code, string secretKey)
    {
        var encoding = new UTF8Encoding();
        byte[] key = encoding.GetBytes(secretKey);
        using var hmac = new HMACSHA256(key);
        byte[] hash = hmac.ComputeHash(encoding.GetBytes(code));
        string hashString = Convert.ToBase64String(hash);
        return $"{Convert.ToBase64String(encoding.GetBytes(code))}:{hashString}";
    }

    // Xác minh token CAPTCHA
    public static bool ValidateCaptchaToken(string inputText, string token, string secretKey)
    {
        try
        {
            var parts = token.Split(':');
            if (parts.Length != 2) return false;

            string code = Encoding.UTF8.GetString(Convert.FromBase64String(parts[0]));
            string expectedHash = parts[1];

            string actualToken = GenerateCaptchaToken(code, secretKey);
            string actualHash = actualToken.Split(':')[1];

            return code.Equals(inputText, StringComparison.OrdinalIgnoreCase) && actualHash == expectedHash;
        }
        catch
        {
            return false;
        }
    }
}

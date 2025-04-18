namespace api.AppUtils
{
    public static class ImageBase64Helper
    {
        public static string GetAvatar(string isExternalAvatar, string avatar)
        {
            if (!string.IsNullOrEmpty(isExternalAvatar) && isExternalAvatar != "True")
            {
                return ConvertAvatarToBase64(avatar);
            }
            return avatar;
        }

        private static string ConvertAvatarToBase64(string filename)
        {
            var wwwRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var imagePath = Path.Combine(wwwRootPath, "uploads", "avatars", filename);

            if (System.IO.File.Exists(imagePath))
            {
                var imageBytes = System.IO.File.ReadAllBytes(imagePath);
                return "data:image/png;base64," + Convert.ToBase64String(imageBytes);
            }

            return string.Empty;
        }

        public static string SaveAvatar(string base64)
        {
            // Chuyển đổi base64 thành bytes
            var base64String = base64.Replace("data:image/png;base64,", "")
                                     .Replace("data:image/jpeg;base64,", "");

            byte[] imageBytes = Convert.FromBase64String(base64String);
            var fileName = Guid.NewGuid().ToString() + ".png";

            var filePath = Path.Combine("wwwroot/uploads/avatars", fileName);

            // Lưu file vào disk
            System.IO.File.WriteAllBytes(filePath, imageBytes);

            return fileName;
        }
    }

}

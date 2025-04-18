using api.AppUtils;
using api.DTO.Token;
using api.Interface;
using Azure.Core;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Data.SqlClient;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace api.Services
{
    public class TokenService: IToken
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        //public async Task<string> VerifyRecaptcha(RecaptchaRequest request)
        //{
        //    var secretKey = "6Le83QQrAAAAANm8amg0o9g2UDAD9em1_hl3wUnO";
        //    var url = $"https://www.google.com/recaptcha/api/siteverify?secret={secretKey}&response={request.Token}";

        //    using var client = new HttpClient();
        //    var response = await client.GetStringAsync(url);

        //    return response;
        //}

        public bool ValidateToken(string token)
        {
            if (string.IsNullOrEmpty(token)) return false;

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSettings = _config.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }
        public string GenerateToken(string username, string roleName, List<string> permissionNames)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, roleName),
            new Claim("permissions", string.Join(",", permissionNames)),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(10),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256
                )
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        //public string Decode(string token)
        //{
        //    string[] parts = token.Split('.');
        //    if (parts.Length < 2)
        //    {
        //        throw new ArgumentException("Token không hợp lệ!");
        //    }

        //    string payload = parts[1];

        //    payload = payload.Replace('_', '/').Replace('-', '+');
        //    switch (payload.Length % 4)
        //    {
        //        case 2: payload += "=="; break;
        //        case 3: payload += "="; break;
        //    }

        //    // Decode Base64
        //    byte[] decodedBytes = Convert.FromBase64String(payload);
        //    var result = System.Text.Encoding.UTF8.GetString(decodedBytes);
        //    return result;
        //}

        //public static async Task<PayloadFBDto> DecodeFBToken(string token)
        //{
        //    PayloadFBDto payload = new PayloadFBDto();

        //    HttpClient client = new HttpClient();

        //    string url = $"https://graph.facebook.com/me?fields=id,name,picture,email&access_token={token}";

        //    try
        //    {
        //        HttpResponseMessage response = await client.GetAsync(url);
        //        response.EnsureSuccessStatusCode(); // Ném lỗi nếu không thành công
        //        string result = await response.Content.ReadAsStringAsync();

        //        JObject json = JObject.Parse(result);

        //        string id = json["id"]?.ToString();
        //        string name = json["name"]?.ToString();
        //        string email = json["email"]?.ToString();
        //        string picture = json["picture"]?["data"]?["url"]?.ToString();

        //        payload.email = email;
        //        payload.name = name;
        //        payload.ID = id;
        //        payload.picture = picture;
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Lỗi khi gọi API Facebook: {ex.Message}");
        //    }

        //    return payload;
        //}

        public static async Task<PayloadGGToken> DecodeGGToken(string token)
        {
            PayloadGGToken res = new PayloadGGToken();
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(token);
                res = new PayloadGGToken()
                {
                    sub = payload.Subject,
                    email = payload.Email,
                    name = payload.Name,
                    picture = payload.Picture,
                };

            }
            catch (Exception ex)
            {
                Console.WriteLine("Invalid GG Token: " + ex.Message);
            }
            return res;

        }

        //public string GetUsernameFormLoginToken(string token)
        //{
        //    var claimsPrincipal = DecodeToken(token);
        //    string username = string.Empty;
        //    if (claimsPrincipal != null)
        //    {
        //        username = claimsPrincipal.FindFirst(ClaimTypes.Name)?.Value;
        //    }

        //    return username;
        //}

        public string GetUserRoleName(string username)
        {
            string rolename = string.Empty;
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();

                    var usernameParam = new SqlParameter("@UsernameOrEmail", username);
                    var resultParam = new SqlParameter("@rtnvalue", SqlDbType.VarChar, 50)
                    {
                        Direction = ParameterDirection.Output
                    };

                    using (SqlCommand cmd = new SqlCommand("sp_GetRoleNameByUsernameOrEmail", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(usernameParam);
                        cmd.Parameters.Add(resultParam);

                        cmd.ExecuteNonQuery();

                        //int status = (int)cmd.Parameters["@Result"].Value;

                        if (!string.IsNullOrEmpty(resultParam.Value.ToString()))
                        {
                            rolename = resultParam.Value.ToString();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return rolename;
        }

        public int GetUserRoleID(string username)
        {
            int roleID = 4;
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();

                    var usernameParam = new SqlParameter("@UsernameOrEmail", username);
                    var resultParam = new SqlParameter("@rtnvalue", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };

                    using (SqlCommand cmd = new SqlCommand("sp_GetRoleIDByUsernameOrEmail", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(usernameParam);
                        cmd.Parameters.Add(resultParam);

                        cmd.ExecuteNonQuery();

                        //int status = (int)cmd.Parameters["@Result"].Value;

                        if ((int)resultParam.Value != null)
                        {
                            roleID = (int)resultParam.Value;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return roleID;
        }

        //public ClaimsPrincipal? DecodeToken(string token)
        //{
        //    var jwtSettings = _config.GetSection("Jwt");
        //    var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

        //    var tokenHandler = new JwtSecurityTokenHandler();
        //    var validationParameters = new TokenValidationParameters
        //    {
        //        ValidateIssuer = true,
        //        ValidateAudience = true,
        //        ValidateLifetime = true,
        //        ValidateIssuerSigningKey = true,
        //        ValidIssuer = jwtSettings["Issuer"],
        //        ValidAudience = jwtSettings["Audience"],
        //        IssuerSigningKey = new SymmetricSecurityKey(key)
        //    };

        //    try
        //    {
        //        var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
        //        return principal;
        //    }
        //    catch
        //    {
        //        return null; // Token không hợp lệ
        //    }
        //}

        public List<string> GetPermissionName(int roleID)
        {
            List<string> listPermission = new List<string>();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();

                    var roleIDParam = new SqlParameter("@RoleID", roleID);

                    using (SqlCommand cmd = new SqlCommand("sp_GetPermissionByRoleID", conn))
                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(roleIDParam);

                        DataTable dt = new DataTable();
                        adapter.Fill(dt);

                        foreach (DataRow dr in dt.Rows)
                        {
                            listPermission.Add(dr[1].ToString());
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return listPermission;
        }
    }
}

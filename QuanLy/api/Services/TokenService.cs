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
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace api.Services
{
    public class TokenService : IToken
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
        public string GenerateToken(string username, bool isAdminLogin)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

            int userID = GetUserIDByUsername(username);
             
            GetUserInfoForToken(userID, out List<string> permissionNames, out int roleID);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, roleID.ToString()),
                new Claim("permissions", string.Join(",", permissionNames)),
                new Claim("isAdminLogin", isAdminLogin.ToString()),
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

        /// <summary>
        /// get all permission name and roleID
        /// </summary>
        /// <param name="userID"></param>
        /// <returns></returns>
        private void GetUserInfoForToken(int userID, out List<string> listPermission, out int roleID)
        {
            listPermission = new List<string>();
            roleID = 0;
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();


                    using (SqlCommand cmd = new SqlCommand("sp_GetAllPermissionsForUser", conn))
                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@UserID", userID);
                        cmd.Parameters.AddWithValue("@isAdmin", true);

                        DataTable dt = new DataTable();
                        adapter.Fill(dt);

                        foreach (DataRow dr in dt.Rows)
                        {
                            listPermission.Add(dr[2].ToString());
                            string role = dr[0].ToString();
                            if (int.Parse(role) == 1)
                            {
                                roleID = 1;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<bool> IsValidUser(string username, bool isAdminLogin = false)
        {
            bool isValid = false;
            if (string.IsNullOrEmpty(username)) return isValid;

            if (isAdminLogin) return true;

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_IsValidUser", conn))
                {
                    await conn.OpenAsync();

                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@username", username);
                    SqlParameter rtnValue = new SqlParameter("@rtnValue", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(rtnValue);

                    await cmd.ExecuteNonQueryAsync();

                    isValid = (bool)rtnValue.Value;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return isValid;
        }

        private int GetUserIDByUsername(string username)
        {
            int userID = 0;
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

                    using (SqlCommand cmd = new SqlCommand("sp_GetUserIDByUsernameOrEmail", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(usernameParam);
                        cmd.Parameters.Add(resultParam);

                        cmd.ExecuteNonQuery();

                        //int status = (int)cmd.Parameters["@Result"].Value;

                        if ((int)resultParam.Value != null)
                        {
                            userID = (int)resultParam.Value;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return userID;
        }
    }
}

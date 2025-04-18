using api.AppUtils;
using api.DTO.Home;
using api.Interface;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace api.Services
{
    public class HomeService:IHome
    {
        public BaseResponse GetUserInfo(GetFullNameInputDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    conn.Open();
                    var rtnValue = new SqlParameter("@ReturnValue", SqlDbType.NVarChar, 100)
                    {
                        Direction = ParameterDirection.Output
                    };
                    var rtnAvatar = new SqlParameter("@rtnAvatar", SqlDbType.VarChar, 255)
                    {
                        Direction = ParameterDirection.Output
                    };
                    var rtnIsExternalAvatar = new SqlParameter("@rtnIsExternalAvatar", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };
                    var username_fullname = new SqlParameter("@UsernameOrEmail", inputDto.UsernameOrEmail);
                    var username_avatar = new SqlParameter("@UsernameOrEmail", inputDto.UsernameOrEmail);

                    using (SqlCommand cmd = new SqlCommand("sp_GetFullName", conn))
                    using (SqlCommand cmd_avatar = new SqlCommand("sp_GetAvatarByUsernameOrEmail", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add(rtnValue);
                        cmd.Parameters.Add(username_fullname);
                        cmd.ExecuteNonQuery();

                        if (!string.IsNullOrEmpty(rtnValue.Value.ToString()))
                        {
                            cmd_avatar.CommandType = CommandType.StoredProcedure;
                            cmd_avatar.Parameters.Add(rtnAvatar);
                            cmd_avatar.Parameters.Add(rtnIsExternalAvatar);
                            cmd_avatar.Parameters.Add(username_avatar);
                            cmd_avatar.ExecuteNonQuery();

                            res.Message = "Success!";
                            string avatar = ImageBase64Helper.GetAvatar(rtnIsExternalAvatar.Value.ToString(), rtnAvatar.Value.ToString());
                            res.Data = new {fullname =  rtnValue.Value, avatar = avatar};
                            res.Result = AppConstant.RESULT_SUCCESS;
                        }
                        else
                        {
                            res.Message = "Tên đăng nhập không tồn tại!";
                            res.Result = AppConstant.RESULT_ERROR;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }

            return res;
        }
    }
}

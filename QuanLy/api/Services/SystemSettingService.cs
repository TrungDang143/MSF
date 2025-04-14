using api.AppUtils;
using api.DTO.SystemSetting;
using api.DTO.UserSetting;
using api.Interface;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Data.SqlClient;
using System.Data;

namespace api.Services
{
    public class SystemSettingService : ISystemSetting
    {
        public BaseResponse GetPasswordRule()
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetPasswordRules", conn))
                using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();
                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    res.Data = dt.ConvertToList<PasswordRule>();
                    res.Message = "Get rule password thanh cong";
                    res.Result = AppConstant.RESULT_SUCCESS;
                }
            }
            catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }

            return res;
        }

        public BaseResponse UpdatePasswordRule(UpdatePasswordRuleDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_UpdateSystemSetting", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();

                    cmd.Parameters.AddWithValue("@SettingKey", inputDto.SettingKey);
                    cmd.Parameters.AddWithValue("@SettingValue", inputDto.SettingValue);
                    cmd.Parameters.AddWithValue("@Description", inputDto.Description);
                    cmd.ExecuteNonQuery();

                    res.Message = "Update Password rule thanh cong!";
                    res.Result = AppConstant.RESULT_SUCCESS;
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

using api.AppUtils;
using api.DTO.UserSetting;
using api.Interface;
using Microsoft.Data.SqlClient;
using System.Data;

namespace api.Services
{
    public class UserSettingService : IUserSetting
    {
        public BaseResponse GetUserPermission(GetUserPermissionDto inputDto)
        {
            var res = new BaseResponse();

            //try
            //{
            //    using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
            //    using (SqlCommand cmd = new SqlCommand("sp_GetAllPermissionsForUser", conn))
            //    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
            //    {
            //        cmd.CommandType = CommandType.StoredProcedure;

            //        // Add parameters
            //        cmd.Parameters.AddWithValue("@UserID", inputDto.UserID);

            //        conn.Open();
            //        DataTable dt = new DataTable();
            //        adapter.Fill(dt);

            //        res.Data = dt.ConvertToList<UserPermisson>();
            //        res.Message = "Get quyen thanh cong";
            //        res.Result = AppConstant.RESULT_SUCCESS;
            //    }
            //}
            //catch (Exception ex)
            //{
            //    res.Message = ex.Message;
            //    res.Result = AppConstant.RESULT_ERROR;
            //}

            return res;
        }

        public BaseResponse SetUserPermission(SetUserPermissionDto inputDto)
        {
            var res = new BaseResponse();

            //try
            //{
            //    using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
            //    {
            //        using (SqlCommand cmd = new SqlCommand("sp_UpdateUserPermissions", conn))
            //        {
            //            cmd.CommandType = CommandType.StoredProcedure;

            //            // Add parameters
            //            cmd.Parameters.AddWithValue("@UserID", inputDto.UserID);
            //            cmd.Parameters.AddWithValue("@PermissionIDs", inputDto.PermissionIDs); // Ex: "1,2,3"

            //            conn.Open();
            //            cmd.ExecuteNonQuery();

            //            res.Message = "Cập nhật quyền cho user thành công!";
            //            res.Result = AppConstant.RESULT_SUCCESS;
            //        }
            //    }
            //}catch(Exception ex)
            //{
            //    res.Message = ex.Message;
            //    res.Result = AppConstant.RESULT_ERROR;
            //}

            return res;
        }
    }
}

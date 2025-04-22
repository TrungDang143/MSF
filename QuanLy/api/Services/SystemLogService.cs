using api.AppUtils;
using api.DTO.SystemLog;
using api.Interface;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Data.SqlClient;
using System.Data;

namespace api.Services
{
    public class SystemLogService : ISystemLogService
    {
        public BaseResponse DeleteLogs(DeleteLogsDto inputDto)
        {
            var res = new BaseResponse();

            try
            {
                using(SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using(SqlCommand cmd = new SqlCommand("sp_DeleteLogsByIds", conn))
                {
                    conn.Open();
                    cmd.CommandType = CommandType.StoredProcedure;

                    var logIds = string.Join(",", inputDto.LogIds);
                    cmd.Parameters.AddWithValue("@logIds", logIds);
                    cmd.ExecuteNonQuery();

                    res.Message = "Xoá log thành công!";
                    res.Result = AppConstant.RESULT_SUCCESS;
                }
            }catch (Exception ex)
            {
                res.Message = ex.Message;
                res.Result = AppConstant.RESULT_ERROR;
            }

            return res;
        }

        public BaseResponse GetLog()
        {
            var res = new BaseResponse();

            List<SystemLogDto> log= new List<SystemLogDto>();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetAllSystemLog", conn))
                using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                {
                    conn.Open();
                    cmd.CommandType = CommandType.StoredProcedure;

                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    log = dt.ConvertToList<SystemLogDto>();
                }

                res.Data = log;
                res.Result = AppConstant.RESULT_SUCCESS;
                res.Message = "Get log thanh cong";
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }

        public BaseResponse GetSystemLogsByPaging(GetSystemLogsByPagingDto inputDto)
        {
            var res = new BaseResponse();

            List<SystemLogDto> logs = new List<SystemLogDto>();
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                using (SqlCommand cmd = new SqlCommand("sp_GetSystemLogsByPaging", conn))
                using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                {
                    conn.Open();
                    cmd.CommandType = CommandType.StoredProcedure;
                    var totalRows = new SqlParameter("@TotalRows", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(totalRows);
                    cmd.Parameters.AddWithValue("@Username", Utils.DbNullIfNull(inputDto.userName));
                    cmd.Parameters.AddWithValue("@From", Utils.DbNullIfNull(inputDto.from));
                    cmd.Parameters.AddWithValue("@To", Utils.DbNullIfNull(inputDto.to));
                    cmd.Parameters.AddWithValue("@PageSize", inputDto.pageSize);
                    cmd.Parameters.AddWithValue("@PageNumber", inputDto.pageNumber);

                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    res.TotalRows = (int)totalRows.Value;
                    if(res.TotalRows > 0)
                    {
                        logs = dt.ConvertToList<SystemLogDto>();
                        res.Data = logs;
                    }
                }

                res.Result = AppConstant.RESULT_SUCCESS;
                res.Message = "Get log thanh cong";
            }
            catch (Exception ex)
            {
                res.Result = AppConstant.RESULT_ERROR;
                res.Message = ex.Message;
            }

            return res;
        }

        public async Task SaveLogAsync(SystemLogDto logDto)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(AppConstant.CONNECTION_STRING))
                {
                    using (SqlCommand cmd = new SqlCommand("sp_AddSystemLog", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@Username", logDto.Username);
                        cmd.Parameters.AddWithValue("@Role", logDto.Role);
                        cmd.Parameters.AddWithValue("@IPAddress", logDto.IPAddress);
                        cmd.Parameters.AddWithValue("@Url", logDto.Url);
                        cmd.Parameters.AddWithValue("@Method", logDto.Method);
                        cmd.Parameters.AddWithValue("@RequestBody", logDto.RequestBody ?? string.Empty);
                        cmd.Parameters.AddWithValue("@ResponseStatusCode", logDto.ResponseStatusCode);
                        cmd.Parameters.AddWithValue("@ExceptionMessage", logDto.ExceptionMessage ?? string.Empty);
                        cmd.Parameters.AddWithValue("@UserAgent", logDto.UserAgent ?? string.Empty);
                        cmd.Parameters.AddWithValue("@CreatedAt", logDto.CreatedAt);

                        conn.Open();
                        cmd.ExecuteNonQuery();
                    }
                }
            }catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}

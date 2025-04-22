using api.DTO.SystemLog;
using api.Interface;
using System.Security.Claims;
using System.Text;

namespace api.AppUtils
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger, IServiceScopeFactory scopeFactory)
        {
            _next = next;
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        public async Task Invoke(HttpContext context)
        {
            var request = context.Request;
            var user = context.User;

            string username = user.Identity?.Name ?? "Anonymous";
            string role = user.FindFirst(ClaimTypes.Role)?.Value ?? "Unknown";
            string ip = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            string userAgent = context.Request.Headers["User-Agent"].ToString();
            string url = $"{request.Scheme}://{request.Host}{request.Path}";
            string method = request.Method;

            // Lấy body
            string body = "";
            if (request.Method.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                body = request.QueryString.HasValue ? request.QueryString.Value : "";
            }
            else
            {
                request.EnableBuffering();
                using (var reader = new StreamReader(request.Body, Encoding.UTF8, true, 1024, true))
                {
                    body = await reader.ReadToEndAsync();
                    request.Body.Position = 0;
                }
            }

            int statusCode = 200;
            string exception = null;

            try
            {      
                await _next(context);
                statusCode = context.Response.StatusCode;
            }
            catch (Exception ex)
            {
                exception = ex.Message;
                statusCode = 500;
                throw;
            }
            finally
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var logService = scope.ServiceProvider.GetRequiredService<ISystemLogService>();

                    await logService.SaveLogAsync(new SystemLogDto
                    {
                        Username = username,
                        Role = role,
                        IPAddress = ip,
                        UserAgent = userAgent,
                        Url = url,
                        Method = method,
                        RequestBody = body,
                        ResponseStatusCode = statusCode,
                        ExceptionMessage = exception
                    });
                }
                
            }
        }
    }

}

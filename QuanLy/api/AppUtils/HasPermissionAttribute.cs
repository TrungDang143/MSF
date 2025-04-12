using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;
using System.Data;
using api.DTO.Account;
using Microsoft.Data.SqlClient;

namespace api.AppUtils
{
    public class HasPermissionAttribute : AuthorizeAttribute, IAuthorizationFilter
    {
        private readonly string _requiredPermissionName;

        public HasPermissionAttribute(string permissionName)
        {
            _requiredPermissionName = permissionName;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (!user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var permissionClaim = user.FindFirst("permissions");
            var permissionList = permissionClaim?.Value.Split(',') ?? Array.Empty<string>();

            if (!permissionList.Contains(_requiredPermissionName))
            {
                context.Result = new ForbidResult(); // không có quyền
            }
        }
    }
}

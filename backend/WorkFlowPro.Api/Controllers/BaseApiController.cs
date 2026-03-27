using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WorkFlowPro.Api.Controllers
{
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        protected int GetTenantId()
        {
            return int.Parse(User.FindFirst("tenantId")!.Value);
        }

        protected int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }

        protected string GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)!.Value;
        }

        protected bool IsAdminOrOwner()
        {
            var role = GetUserRole();
            return role == "Owner" || role == "Admin";
        }
    }
}
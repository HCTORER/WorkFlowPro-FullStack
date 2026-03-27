using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkFlowPro.Api.Interfaces;

namespace WorkFlowPro.Api.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!IsAdminOrOwner())
                return Forbid();

            var tenantId = GetTenantId();
            var users = await _userService.GetAllAsync(tenantId);
            return Ok(users);
        }
    }
}
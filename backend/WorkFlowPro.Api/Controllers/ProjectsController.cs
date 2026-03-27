using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkFlowPro.Api.DTOs;
using WorkFlowPro.Api.Interfaces;

namespace WorkFlowPro.Api.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : BaseApiController
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenantId = GetTenantId();
            var projects = await _projectService.GetAllAsync(tenantId);
            return Ok(projects);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateProjectDto request)
        {
            if (!IsAdminOrOwner())
                return Forbid();

            var tenantId = GetTenantId();
            var project = await _projectService.CreateAsync(tenantId, request);
            return Ok(project);
        }
    }
}
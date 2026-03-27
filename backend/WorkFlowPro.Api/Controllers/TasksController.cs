using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkFlowPro.Api.DTOs;
using WorkFlowPro.Api.Interfaces;

namespace WorkFlowPro.Api.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : BaseApiController
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet("{projectId}")]
        public async Task<IActionResult> GetByProject(int projectId)
        {
            var tenantId = GetTenantId();
            var tasks = await _taskService.GetByProjectAsync(tenantId, projectId);
            return Ok(tasks);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTaskDto request)
        {
            if (!IsAdminOrOwner())
                return Forbid();

            var tenantId = GetTenantId();
            var task = await _taskService.CreateAsync(tenantId, request);
            return Ok(task);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateTaskStatusDto request)
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            var isAdminOrOwner = IsAdminOrOwner();

            var updatedTask = await _taskService.UpdateStatusAsync(
                tenantId,
                userId,
                isAdminOrOwner,
                id,
                request.Status
            );

            return Ok(updatedTask);
        }

        [HttpPatch("{id}/assign")]
        public async Task<IActionResult> AssignUser(int id, AssignTaskDto request)
        {
            if (!IsAdminOrOwner())
                return Forbid();

            var tenantId = GetTenantId();
            var updatedTask = await _taskService.AssignUserAsync(tenantId, id, request.AssignedUserId);
            return Ok(updatedTask);
        }
    }
}
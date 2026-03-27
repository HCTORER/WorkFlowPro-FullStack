using WorkFlowPro.Api.DTOs;
using WorkFlowPro.Api.Enums;

namespace WorkFlowPro.Api.Interfaces
{
    public interface ITaskService
    {
        Task<List<TaskDto>> GetByProjectAsync(int tenantId, int projectId);
        Task<TaskDto> CreateAsync(int tenantId, CreateTaskDto request);
        Task<TaskDto> UpdateStatusAsync(int tenantId, int userId, bool isAdminOrOwner, int taskId, TaskItemStatus status);
        Task<TaskDto> AssignUserAsync(int tenantId, int taskId, int assignedUserId);
    }
}
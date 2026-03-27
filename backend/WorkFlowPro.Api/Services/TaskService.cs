using Microsoft.EntityFrameworkCore;
using WorkFlowPro.Api.Data;
using WorkFlowPro.Api.DTOs;
using WorkFlowPro.Api.Entities;
using WorkFlowPro.Api.Enums;
using WorkFlowPro.Api.Interfaces;

namespace WorkFlowPro.Api.Services
{
    public class TaskService : ITaskService
    {
        private readonly AppDbContext _context;

        public TaskService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TaskDto>> GetByProjectAsync(int tenantId, int projectId)
        {
            return await _context.Tasks
                .Include(t => t.AssignedUser)
                .Where(t => t.TenantId == tenantId && t.ProjectId == projectId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    ProjectId = t.ProjectId,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status.ToString(),
                    Priority = t.Priority.ToString(),
                    AssignedUserId = t.AssignedUserId,
                    AssignedUserFullName = t.AssignedUser != null ? t.AssignedUser.FullName : null,
                    DueDate = t.DueDate,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<TaskDto> CreateAsync(int tenantId, CreateTaskDto request)
        {
            var projectExists = await _context.Projects
                .AnyAsync(p => p.Id == request.ProjectId && p.TenantId == tenantId);

            if (!projectExists)
                throw new Exception("Project not found or unauthorized.");

            if (request.AssignedUserId.HasValue)
            {
                var userExists = await _context.Users
                    .AnyAsync(u => u.Id == request.AssignedUserId.Value && u.TenantId == tenantId);

                if (!userExists)
                    throw new Exception("Assigned user not found or unauthorized.");
            }

            var task = new TaskItem
            {
                TenantId = tenantId,
                ProjectId = request.ProjectId,
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                AssignedUserId = request.AssignedUserId,
                Status = TaskItemStatus.Backlog,
                Priority = TaskPriority.Medium,
                DueDate = request.DueDate
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            task = await _context.Tasks
                .Include(t => t.AssignedUser)
                .FirstAsync(t => t.Id == task.Id);

            return new TaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status.ToString(),
                Priority = task.Priority.ToString(),
                AssignedUserId = task.AssignedUserId,
                AssignedUserFullName = task.AssignedUser != null ? task.AssignedUser.FullName : null,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt
            };
        }

        public async Task<TaskDto> UpdateStatusAsync(int tenantId, int userId, bool isAdminOrOwner, int taskId, TaskItemStatus status)
        {
            var task = await _context.Tasks
                .Include(t => t.AssignedUser)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.TenantId == tenantId);

            if (task == null)
                throw new Exception("Task not found or unauthorized.");

            if (!isAdminOrOwner)
            {
                if (task.AssignedUserId != userId)
                    throw new Exception("You can only update tasks assigned to you.");
            }

            task.Status = status;

            await _context.SaveChangesAsync();

            return new TaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status.ToString(),
                Priority = task.Priority.ToString(),
                AssignedUserId = task.AssignedUserId,
                AssignedUserFullName = task.AssignedUser != null ? task.AssignedUser.FullName : null,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt
            };
        }

        public async Task<TaskDto> AssignUserAsync(int tenantId, int taskId, int assignedUserId)
        {
            var task = await _context.Tasks
                .Include(t => t.AssignedUser)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.TenantId == tenantId);

            if (task == null)
                throw new Exception("Task not found or unauthorized.");

            var userExists = await _context.Users
                .AnyAsync(u => u.Id == assignedUserId && u.TenantId == tenantId);

            if (!userExists)
                throw new Exception("User not found or unauthorized.");

            task.AssignedUserId = assignedUserId;

            await _context.SaveChangesAsync();

            task = await _context.Tasks
                .Include(t => t.AssignedUser)
                .FirstAsync(t => t.Id == taskId);

            return new TaskDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status.ToString(),
                Priority = task.Priority.ToString(),
                AssignedUserId = task.AssignedUserId,
                AssignedUserFullName = task.AssignedUser != null ? task.AssignedUser.FullName : null,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt
            };
        }
    }
}
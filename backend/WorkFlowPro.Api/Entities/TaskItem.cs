using WorkFlowPro.Api.Enums;

namespace WorkFlowPro.Api.Entities
{
    public class TaskItem
    {
        public int Id { get; set; }

        public int TenantId { get; set; }
        public Tenant Tenant { get; set; } = null!;

        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public int? AssignedUserId { get; set; }
        public User? AssignedUser { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public TaskItemStatus Status { get; set; } = TaskItemStatus.Backlog;

        public TaskPriority Priority { get; set; } = TaskPriority.Medium;

        public DateTime? DueDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
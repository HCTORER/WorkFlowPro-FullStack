namespace WorkFlowPro.Api.DTOs
{
    public class CreateTaskDto
    {
        public int ProjectId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int? AssignedUserId { get; set; }

        public DateTime? DueDate { get; set; }
    }
}
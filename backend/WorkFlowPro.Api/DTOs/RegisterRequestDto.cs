namespace WorkFlowPro.Api.DTOs
{
    public class RegisterRequestDto
    {
        public string TenantName { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }
}
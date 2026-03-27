using WorkFlowPro.Api.DTOs;

namespace WorkFlowPro.Api.Interfaces
{
    public interface IProjectService
    {
        Task<List<ProjectDto>> GetAllAsync(int tenantId);
        Task<ProjectDto> CreateAsync(int tenantId, CreateProjectDto request);
    }
}
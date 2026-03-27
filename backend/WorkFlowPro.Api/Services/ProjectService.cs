using Microsoft.EntityFrameworkCore;
using WorkFlowPro.Api.Data;
using WorkFlowPro.Api.DTOs;
using WorkFlowPro.Api.Entities;
using WorkFlowPro.Api.Interfaces;

namespace WorkFlowPro.Api.Services
{
    public class ProjectService : IProjectService
    {
        private readonly AppDbContext _context;

        public ProjectService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProjectDto>> GetAllAsync(int tenantId)
        {
            return await _context.Projects
                .Where(p => p.TenantId == tenantId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<ProjectDto> CreateAsync(int tenantId, CreateProjectDto request)
        {
            var project = new Project
            {
                TenantId = tenantId,
                Name = request.Name.Trim(),
                Description = request.Description.Trim()
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                CreatedAt = project.CreatedAt
            };
        }
    }
}
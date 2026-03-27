using Microsoft.EntityFrameworkCore;
using WorkFlowPro.Api.Data;
using WorkFlowPro.Api.DTOs;
using WorkFlowPro.Api.Interfaces;

namespace WorkFlowPro.Api.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserDto>> GetAllAsync(int tenantId)
        {
            return await _context.Users
                .Where(u => u.TenantId == tenantId)
                .OrderBy(u => u.FullName)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role.ToString()
                })
                .ToListAsync();
        }
    }
}
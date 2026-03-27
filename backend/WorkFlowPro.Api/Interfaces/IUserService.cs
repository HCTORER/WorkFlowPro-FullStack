using WorkFlowPro.Api.DTOs;

namespace WorkFlowPro.Api.Interfaces
{
    public interface IUserService
    {
        Task<List<UserDto>> GetAllAsync(int tenantId);
    }
}
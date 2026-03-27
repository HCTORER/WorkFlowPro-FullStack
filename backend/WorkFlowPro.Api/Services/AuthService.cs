using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WorkFlowPro.Api.Data;
using WorkFlowPro.Api.DTOs;
using WorkFlowPro.Api.Entities;
using WorkFlowPro.Api.Enums;
using WorkFlowPro.Api.Interfaces;

namespace WorkFlowPro.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            var email = request.Email.Trim().ToLower();

            var existingUser = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == email);

            if (existingUser != null)
            {
                throw new Exception("A user with this email already exists.");
            }

            var tenant = new Tenant
            {
                Name = request.TenantName.Trim()
            };

            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();

            var user = new User
            {
                TenantId = tenant.Id,
                FullName = request.FullName.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = UserRole.Owner
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                UserId = user.Id,
                Token = token,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                TenantId = user.TenantId
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var email = request.Email.Trim().ToLower();

            var user = await _context.Users
                .Include(x => x.Tenant)
                .FirstOrDefaultAsync(x => x.Email == email);

            if (user == null)
            {
                throw new Exception("Invalid email or password.");
            }

            var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                throw new Exception("Invalid email or password.");
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                UserId = user.Id,
                Token = token,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                TenantId = user.TenantId
            };
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");

            var key = jwtSettings["Key"]
                ?? throw new Exception("JWT Key is missing.");

            var issuer = jwtSettings["Issuer"]
                ?? throw new Exception("JWT Issuer is missing.");

            var audience = jwtSettings["Audience"]
                ?? throw new Exception("JWT Audience is missing.");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("tenantId", user.TenantId.ToString())
            };

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
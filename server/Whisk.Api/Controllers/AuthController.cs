using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whisk.Api.Extensions;
using Whisk.Application.DTOs;
using Whisk.Application.Interfaces;
using Whisk.Domain.Entities;
using Whisk.Domain.Enums;

namespace Whisk.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IWhiskDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _config;

    public AuthController(IWhiskDbContext db, ITokenService tokenService, IConfiguration config)
    {
        _db = db;
        _tokenService = tokenService;
        _config = config;
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleLogin([FromBody] GoogleAuthRequest request)
    {
        Google.Apis.Auth.GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new Google.Apis.Auth.GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _config["Google:ClientId"] ?? "" }
            };
            payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
        }
        catch
        {
            return Unauthorized(new { error = "Invalid Google token" });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.AuthProvider == AuthProvider.Google && u.AuthProviderUserId == payload.Subject);
        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = payload.Email,
                AuthProvider = AuthProvider.Google,
                AuthProviderUserId = payload.Subject,
                Nickname = payload.Name ?? "",
                IsOnboardingComplete = false
            };
            _db.Users.Add(user);
        }
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.IsOnboardingComplete, user.Role.ToString()));
    }

    [HttpPost("apple")]
    public async Task<ActionResult<AuthResponse>> AppleLogin([FromBody] AppleAuthRequest request)
    {
        string subject;
        try
        {
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(request.IdentityToken);
            subject = jwt.Subject ?? throw new Exception("No subject");
        }
        catch
        {
            return Unauthorized(new { error = "Invalid Apple token" });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.AuthProvider == AuthProvider.Apple && u.AuthProviderUserId == subject);
        if (user == null)
        {
            var emailClaim = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler()
                .ReadJwtToken(request.IdentityToken).Claims
                .FirstOrDefault(c => c.Type == "email")?.Value ?? "";

            user = new User
            {
                Id = Guid.NewGuid(),
                Email = emailClaim,
                AuthProvider = AuthProvider.Apple,
                AuthProviderUserId = subject,
                Nickname = request.FullName ?? "",
                IsOnboardingComplete = false
            };
            _db.Users.Add(user);
        }
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.IsOnboardingComplete, user.Role.ToString()));
    }

    [HttpPost("dev-login")]
    public async Task<ActionResult<AuthResponse>> DevLogin([FromBody] DevLoginRequest request)
    {
        if (!(_config["Environment"] == "Development" || Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"))
            return NotFound();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            var role = Enum.TryParse<UserRole>(request.Role, true, out var r) ? r : UserRole.User;
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                AuthProvider = AuthProvider.Dev,
                AuthProviderUserId = $"dev-{request.Email}",
                Nickname = request.Email.Split('@')[0],
                Country = "Israel",
                Role = role,
                IsOnboardingComplete = true,
                HasAcceptedTerms = true,
                IsOver18 = true,
                IsActive = true
            };
            _db.Users.Add(user);
        }
        else if (!user.IsOnboardingComplete)
        {
            user.IsOnboardingComplete = true;
            user.HasAcceptedTerms = true;
            user.IsOver18 = true;
            user.Country = string.IsNullOrEmpty(user.Country) ? "Israel" : user.Country;
            user.Nickname = string.IsNullOrEmpty(user.Nickname) ? request.Email.Split('@')[0] : user.Nickname;
        }
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.IsOnboardingComplete, user.Role.ToString()));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ProfileDto>> GetMe()
    {
        var userId = User.GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive) return NotFound();

        return Ok(new ProfileDto(user.Id, user.Nickname, user.Email, user.Country, user.Role.ToString(), user.BarrelLevel, user.IsOnboardingComplete, user.CreatedAt));
    }
}

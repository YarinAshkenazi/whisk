using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whisk.Api.Extensions;
using Whisk.Application.DTOs;
using Whisk.Application.Interfaces;

namespace Whisk.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IWhiskDbContext _db;
    private readonly ITokenService _tokenService;

    public ProfileController(IWhiskDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ProfileDto>> GetProfile()
    {
        var userId = User.GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive) return NotFound();

        return Ok(new ProfileDto(user.Id, user.Nickname, user.Email, user.Country, user.Role.ToString(), user.BarrelLevel, user.IsOnboardingComplete, user.CreatedAt));
    }

    [HttpPut("me")]
    public async Task<ActionResult<ProfileDto>> UpdateProfile([FromBody] UpdateProfileRequest request, [FromServices] IValidator<UpdateProfileRequest> validator)
    {
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var userId = User.GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive) return NotFound();

        user.Nickname = request.Nickname;
        user.Country = request.Country;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new ProfileDto(user.Id, user.Nickname, user.Email, user.Country, user.Role.ToString(), user.BarrelLevel, user.IsOnboardingComplete, user.CreatedAt));
    }

    [HttpPut("onboarding")]
    public async Task<ActionResult<AuthResponse>> CompleteOnboarding([FromBody] OnboardingRequest request, [FromServices] IValidator<OnboardingRequest> validator)
    {
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var userId = User.GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive) return NotFound();

        user.Nickname = request.Nickname;
        user.Country = request.Country;
        user.IsOver18 = request.IsOver18;
        user.HasAcceptedTerms = request.AcceptTerms;
        user.IsOnboardingComplete = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, true, user.Role.ToString()));
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = User.GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Account deactivated" });
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Whisk.Api.Extensions;
using Whisk.Application.DTOs;
using Whisk.Application.Interfaces;

namespace Whisk.Api.Controllers;

[ApiController]
[Route("api/recommendations")]
[Authorize]
public class RecommendationsController : ControllerBase
{
    private readonly IRecommendationService _recommendations;

    public RecommendationsController(IRecommendationService recommendations) => _recommendations = recommendations;

    [HttpGet]
    public async Task<ActionResult<List<RecommendationDto>>> GetRecommendations()
    {
        var userId = User.GetUserId();
        var recs = await _recommendations.GetRecommendationsAsync(userId);
        return Ok(recs);
    }

    [HttpGet("status")]
    public async Task<ActionResult<RecommendationStatusDto>> GetStatus()
    {
        var userId = User.GetUserId();
        var status = await _recommendations.GetStatusAsync(userId);
        return Ok(status);
    }
}

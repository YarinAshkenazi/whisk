using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whisk.Api.Extensions;
using Whisk.Application.DTOs;
using Whisk.Application.Interfaces;
using Whisk.Domain.Entities;

namespace Whisk.Api.Controllers;

[ApiController]
[Route("api/whiskey-requests")]
[Authorize]
public class WhiskeyRequestsController : ControllerBase
{
    private readonly IWhiskDbContext _db;

    public WhiskeyRequestsController(IWhiskDbContext db) => _db = db;

    [HttpPost]
    public async Task<ActionResult<WhiskeyRequestDto>> Create([FromBody] CreateWhiskeyRequestDto request, [FromServices] IValidator<CreateWhiskeyRequestDto> validator)
    {
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var userId = User.GetUserId();
        var entity = new WhiskeyRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Brand = request.Brand,
            Details = request.Details
        };

        _db.WhiskeyRequests.Add(entity);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMyRequests), null, new WhiskeyRequestDto(entity.Id, entity.Name, entity.Brand, entity.Details, entity.Status.ToString(), null, null, entity.CreatedAt));
    }

    [HttpGet("me")]
    public async Task<ActionResult<List<WhiskeyRequestDto>>> GetMyRequests()
    {
        var userId = User.GetUserId();
        var items = await _db.WhiskeyRequests
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(items.Select(r => new WhiskeyRequestDto(r.Id, r.Name, r.Brand, r.Details, r.Status.ToString(), r.AdminNotes, r.ApprovedWhiskeyId, r.CreatedAt)).ToList());
    }
}

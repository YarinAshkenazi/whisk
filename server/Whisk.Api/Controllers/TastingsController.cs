using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whisk.Api.Extensions;
using Whisk.Application.DTOs;
using Whisk.Application.Interfaces;
using Whisk.Domain.Entities;
using Whisk.Domain.Services;

namespace Whisk.Api.Controllers;

[ApiController]
[Route("api/tastings")]
[Authorize]
public class TastingsController : ControllerBase
{
    private readonly IWhiskDbContext _db;

    public TastingsController(IWhiskDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<TastingNoteDto>>> GetTastings()
    {
        var userId = User.GetUserId();
        var items = await _db.TastingNotes
            .Include(t => t.Whiskey)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.TastingDate)
            .ToListAsync();

        return Ok(items.Select(t => new TastingNoteDto(
            t.Id, t.WhiskeyId, t.Whiskey.Name, t.Whiskey.ImageUrl, t.TastingDate, t.IsOwned,
            t.Notes, t.BodyDelta, t.SmokeDelta, t.SweetDelta, t.AlcoholDelta,
            t.PersonalFitPercent, t.CreatedAt)).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TastingNoteDto>> GetTasting(Guid id)
    {
        var userId = User.GetUserId();
        var t = await _db.TastingNotes.Include(t => t.Whiskey).FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (t == null) return NotFound();

        return Ok(new TastingNoteDto(t.Id, t.WhiskeyId, t.Whiskey.Name, t.Whiskey.ImageUrl, t.TastingDate, t.IsOwned, t.Notes, t.BodyDelta, t.SmokeDelta, t.SweetDelta, t.AlcoholDelta, t.PersonalFitPercent, t.CreatedAt));
    }

    [HttpPost]
    public async Task<ActionResult<TastingNoteDto>> AddTasting([FromBody] AddTastingRequest request, [FromServices] IValidator<AddTastingRequest> validator)
    {
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var userId = User.GetUserId();
        var whiskey = await _db.Whiskies.FindAsync(request.WhiskeyId);
        if (whiskey == null) return NotFound("Whiskey not found");

        var fit = PersonalFitCalculator.Calculate(request.BodyDelta, request.SmokeDelta, request.SweetDelta, request.AlcoholDelta);

        var tasting = new TastingNote
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            WhiskeyId = request.WhiskeyId,
            TastingDate = request.TastingDate,
            IsOwned = request.IsOwned,
            Notes = request.Notes,
            BodyDelta = request.BodyDelta,
            SmokeDelta = request.SmokeDelta,
            SweetDelta = request.SweetDelta,
            AlcoholDelta = request.AlcoholDelta,
            PersonalFitPercent = fit
        };

        _db.TastingNotes.Add(tasting);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTasting), new { id = tasting.Id }, new TastingNoteDto(
            tasting.Id, tasting.WhiskeyId, whiskey.Name, whiskey.ImageUrl, tasting.TastingDate, tasting.IsOwned,
            tasting.Notes, tasting.BodyDelta, tasting.SmokeDelta, tasting.SweetDelta, tasting.AlcoholDelta,
            tasting.PersonalFitPercent, tasting.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TastingNoteDto>> UpdateTasting(Guid id, [FromBody] UpdateTastingRequest request, [FromServices] IValidator<UpdateTastingRequest> validator)
    {
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var userId = User.GetUserId();
        var tasting = await _db.TastingNotes.Include(t => t.Whiskey).FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (tasting == null) return NotFound();

        tasting.TastingDate = request.TastingDate;
        tasting.IsOwned = request.IsOwned;
        tasting.Notes = request.Notes;
        tasting.BodyDelta = request.BodyDelta;
        tasting.SmokeDelta = request.SmokeDelta;
        tasting.SweetDelta = request.SweetDelta;
        tasting.AlcoholDelta = request.AlcoholDelta;
        tasting.PersonalFitPercent = PersonalFitCalculator.Calculate(request.BodyDelta, request.SmokeDelta, request.SweetDelta, request.AlcoholDelta);
        tasting.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new TastingNoteDto(tasting.Id, tasting.WhiskeyId, tasting.Whiskey.Name, tasting.Whiskey.ImageUrl, tasting.TastingDate, tasting.IsOwned, tasting.Notes, tasting.BodyDelta, tasting.SmokeDelta, tasting.SweetDelta, tasting.AlcoholDelta, tasting.PersonalFitPercent, tasting.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTasting(Guid id)
    {
        var userId = User.GetUserId();
        var tasting = await _db.TastingNotes.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (tasting == null) return NotFound();

        _db.TastingNotes.Remove(tasting);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}

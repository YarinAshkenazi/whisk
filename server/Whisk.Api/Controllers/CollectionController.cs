using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whisk.Api.Extensions;
using Whisk.Application.DTOs;
using Whisk.Application.Interfaces;
using Whisk.Domain.Enums;
using Whisk.Domain.Services;

namespace Whisk.Api.Controllers;

[ApiController]
[Route("api/collection")]
[Authorize]
public class CollectionController : ControllerBase
{
    private readonly IWhiskDbContext _db;

    public CollectionController(IWhiskDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<CollectionItemDto>>> GetCollection()
    {
        var userId = User.GetUserId();
        var items = await _db.CollectionItems
            .Include(c => c.Whiskey).ThenInclude(w => w.Category)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.AddedAt)
            .ToListAsync();

        return Ok(items.Select(c => new CollectionItemDto(
            c.Id, c.WhiskeyId, c.Whiskey.Name, c.Whiskey.ImageUrl, c.Whiskey.Category.Name,
            c.PurchasePriceIls, c.PurchaseDate, c.Status.ToString(), c.Notes,
            c.Status == CollectionStatus.Closed ? (c.Whiskey.MinMarketPriceIls + c.Whiskey.MaxMarketPriceIls) / 2 : null,
            c.AddedAt)).ToList());
    }

    [HttpGet("summary")]
    public async Task<ActionResult<CollectionSummaryDto>> GetSummary()
    {
        var userId = User.GetUserId();
        var items = await _db.CollectionItems
            .Include(c => c.Whiskey)
            .Where(c => c.UserId == userId)
            .ToListAsync();

        var totalBottles = items.Count;
        var closedItems = items.Where(c => c.Status == CollectionStatus.Closed).ToList();
        var closedCount = closedItems.Count;
        var totalPurchase = closedItems.Where(c => c.PurchasePriceIls.HasValue).Sum(c => c.PurchasePriceIls!.Value);
        var totalMarket = closedItems.Sum(c => (c.Whiskey.MinMarketPriceIls + c.Whiskey.MaxMarketPriceIls) / 2);
        var profitLoss = totalMarket - totalPurchase;
        var totalSpent = items.Where(c => c.PurchasePriceIls.HasValue).Sum(c => c.PurchasePriceIls!.Value);
        var barrelLevel = BarrelLevelCalculator.Calculate(totalBottles);

        return Ok(new CollectionSummaryDto(totalBottles, closedCount, totalPurchase, totalMarket, profitLoss, barrelLevel, totalSpent));
    }

    [HttpPost]
    public async Task<ActionResult<CollectionItemDto>> AddItem([FromBody] AddCollectionItemRequest request, [FromServices] IValidator<AddCollectionItemRequest> validator)
    {
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var userId = User.GetUserId();
        var whiskey = await _db.Whiskies.Include(w => w.Category).FirstOrDefaultAsync(w => w.Id == request.WhiskeyId);
        if (whiskey == null) return NotFound("Whiskey not found");

        var status = CollectionStatus.Closed;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<CollectionStatus>(request.Status, true, out var s))
            status = s;

        var item = new Domain.Entities.CollectionItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            WhiskeyId = request.WhiskeyId,
            PurchasePriceIls = request.PurchasePriceIls,
            PurchaseDate = request.PurchaseDate,
            Status = status,
            Notes = request.Notes ?? ""
        };

        _db.CollectionItems.Add(item);
        await _db.SaveChangesAsync();
        await UpdateBarrelLevel(userId);

        return CreatedAtAction(nameof(GetCollection), null, new CollectionItemDto(
            item.Id, item.WhiskeyId, whiskey.Name, whiskey.ImageUrl, whiskey.Category.Name,
            item.PurchasePriceIls, item.PurchaseDate, item.Status.ToString(), item.Notes,
            item.Status == CollectionStatus.Closed ? (whiskey.MinMarketPriceIls + whiskey.MaxMarketPriceIls) / 2 : null,
            item.AddedAt));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CollectionItemDto>> UpdateItem(Guid id, [FromBody] UpdateCollectionItemRequest request)
    {
        var userId = User.GetUserId();
        var item = await _db.CollectionItems.Include(c => c.Whiskey).ThenInclude(w => w.Category).FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (item == null) return NotFound();

        if (request.PurchasePriceIls.HasValue) item.PurchasePriceIls = request.PurchasePriceIls;
        if (request.PurchaseDate.HasValue) item.PurchaseDate = request.PurchaseDate;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<CollectionStatus>(request.Status, true, out var s)) item.Status = s;
        if (request.Notes != null) item.Notes = request.Notes;
        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await UpdateBarrelLevel(userId);

        return Ok(new CollectionItemDto(
            item.Id, item.WhiskeyId, item.Whiskey.Name, item.Whiskey.ImageUrl, item.Whiskey.Category.Name,
            item.PurchasePriceIls, item.PurchaseDate, item.Status.ToString(), item.Notes,
            item.Status == CollectionStatus.Closed ? (item.Whiskey.MinMarketPriceIls + item.Whiskey.MaxMarketPriceIls) / 2 : null,
            item.AddedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        var userId = User.GetUserId();
        var item = await _db.CollectionItems.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (item == null) return NotFound();

        _db.CollectionItems.Remove(item);
        await _db.SaveChangesAsync();
        await UpdateBarrelLevel(userId);

        return NoContent();
    }

    private async Task UpdateBarrelLevel(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return;
        var count = await _db.CollectionItems.CountAsync(c => c.UserId == userId);
        user.BarrelLevel = BarrelLevelCalculator.Calculate(count);
        await _db.SaveChangesAsync();
    }
}

using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Whisk.Api.Extensions;
using Whisk.Application.DTOs;
using Whisk.Application.Interfaces;

namespace Whisk.Api.Controllers;

[ApiController]
[Route("api/whiskies")]
[Authorize]
public class WhiskiesController : ControllerBase
{
    private readonly IWhiskDbContext _db;
    private readonly IRecommendationService _recommendations;

    public WhiskiesController(IWhiskDbContext db, IRecommendationService recommendations)
    {
        _db = db;
        _recommendations = recommendations;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<WhiskeyDto>>> GetWhiskies([FromQuery] WhiskeyListRequest request)
    {
        var userId = User.GetUserId();
        var query = _db.Whiskies.Include(w => w.Category).Where(w => w.IsActive).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(w => w.Name.ToLower().Contains(s) || w.Brand.ToLower().Contains(s) || w.Distillery.ToLower().Contains(s) || w.Country.ToLower().Contains(s) || w.Region.ToLower().Contains(s));
        }
        if (request.CategoryId.HasValue) query = query.Where(w => w.CategoryId == request.CategoryId);
        if (!string.IsNullOrWhiteSpace(request.Country)) query = query.Where(w => w.Country == request.Country);
        if (!string.IsNullOrWhiteSpace(request.Region)) query = query.Where(w => w.Region == request.Region);
        if (request.MinAge.HasValue) query = query.Where(w => w.Age >= request.MinAge);
        if (request.MaxAge.HasValue) query = query.Where(w => w.Age <= request.MaxAge);
        if (request.MinAbv.HasValue) query = query.Where(w => w.AlcoholPercentage >= request.MinAbv);
        if (request.MaxAbv.HasValue) query = query.Where(w => w.AlcoholPercentage <= request.MaxAbv);
        if (request.MinPrice.HasValue) query = query.Where(w => w.MaxMarketPriceIls >= request.MinPrice);
        if (request.MaxPrice.HasValue) query = query.Where(w => w.MinMarketPriceIls <= request.MaxPrice);

        var totalCount = await query.CountAsync();

        query = (request.SortBy?.ToLower()) switch
        {
            "price" => request.SortDesc ? query.OrderByDescending(w => w.MinMarketPriceIls) : query.OrderBy(w => w.MinMarketPriceIls),
            "age" => request.SortDesc ? query.OrderByDescending(w => w.Age) : query.OrderBy(w => w.Age),
            _ => request.SortDesc ? query.OrderByDescending(w => w.Name) : query.OrderBy(w => w.Name),
        };

        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var matchDict = await _recommendations.GetBatchBottleMatchesAsync(
            userId, items.Select(w => w.Id).ToList());

        var dtos = items.Select(w =>
            MapWhiskey(w, matchDict.GetValueOrDefault(w.Id))).ToList();

        if (request.SortBy?.ToLower() == "match")
        {
            dtos = request.SortDesc ? dtos.OrderByDescending(d => d.MatchPercent ?? 0).ToList() : dtos.OrderBy(d => d.MatchPercent ?? 0).ToList();
        }

        return Ok(new PagedResult<WhiskeyDto>(dtos, totalCount, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WhiskeyDto>> GetWhiskey(Guid id)
    {
        var userId = User.GetUserId();
        var w = await _db.Whiskies.Include(w => w.Category).FirstOrDefaultAsync(w => w.Id == id);
        if (w == null) return NotFound();

        var match = await _recommendations.GetBottleMatchAsync(userId, w.Id);
        return Ok(MapWhiskey(w, match));
    }

    [HttpGet("{id}/match")]
    public async Task<ActionResult> GetMatch(Guid id)
    {
        var userId = User.GetUserId();
        var match = await _recommendations.GetBottleMatchAsync(userId, id);
        return Ok(new { whiskeyId = id, matchPercent = match });
    }

    [HttpGet("~/api/categories")]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        var cats = await _db.WhiskeyCategories.Where(c => c.IsActive).OrderBy(c => c.Name).ToListAsync();
        return Ok(cats.Select(c => new CategoryDto(c.Id, c.Name, c.IsActive)).ToList());
    }

    [HttpPost("gift-recommendation")]
    public async Task<ActionResult<GiftRecommendationResponse>> GetGiftRecommendation(
        [FromBody] GiftRecommendationRequest request,
        [FromServices] IGeminiPrefillService gemini,
        [FromServices] ILogger<WhiskiesController> logger)
    {
        if (string.IsNullOrWhiteSpace(request.Description))
            return BadRequest(new { error = "Description is required" });
        if (request.MaxPrice < request.MinPrice)
            return BadRequest(new { error = "Max price must be greater than or equal to min price" });

        var bottles = await _db.Whiskies
            .Include(w => w.Category)
            .Where(w => w.IsActive)
            .ToListAsync();

        if (bottles.Count == 0)
            return Ok(new { error = "No bottles available" });

        var inBudget = bottles
            .Where(w => w.MinMarketPriceIls <= request.MaxPrice && w.MaxMarketPriceIls >= request.MinPrice)
            .ToList();

        var candidates = inBudget.Count > 0 ? inBudget : bottles;

        var catalog = candidates.Take(80).Select(w => new
        {
            id = w.Id.ToString(),
            name = w.Name,
            brand = w.Brand,
            age = w.Age,
            category = w.Category?.Name,
            country = w.Country,
            region = w.Region,
            priceMin = w.MinMarketPriceIls,
            priceMax = w.MaxMarketPriceIls,
            body = w.BodyProfile,
            smokiness = w.SmokinessProfile,
            sweetness = w.SweetnessProfile,
            description = w.Description?.Length > 100 ? w.Description[..100] : w.Description
        });

        var catalogJson = JsonSerializer.Serialize(catalog);
        var result = await gemini.RecommendGiftAsync(
            request.Description, request.MinPrice, request.MaxPrice, catalogJson);

        if (result == null)
            return StatusCode(502, new { error = "AI could not generate a recommendation. Please try again." });

        var matched = bottles.FirstOrDefault(w =>
            w.Id.ToString().Equals(result.BottleId, StringComparison.OrdinalIgnoreCase));

        if (matched == null)
        {
            matched = bottles
                .OrderBy(w => Math.Abs((double)((w.MinMarketPriceIls + w.MaxMarketPriceIls) / 2) - (double)((request.MinPrice + request.MaxPrice) / 2)))
                .First();
            result = new GeminiGiftResult
            {
                BottleId = matched.Id.ToString(),
                Explanation = "Here's a great whisky option based on your description."
            };
        }

        var avgPrice = (matched.MinMarketPriceIls + matched.MaxMarketPriceIls) / 2;
        bool outsideBudget = avgPrice < request.MinPrice || avgPrice > request.MaxPrice;

        return Ok(new GiftRecommendationResponse(
            matched.Id, matched.Name, matched.Brand, avgPrice,
            matched.ImageUrl, result.Explanation, outsideBudget));
    }

    private static WhiskeyDto MapWhiskey(Domain.Entities.Whiskey w, int? match)
    {
        var avg = (w.MinMarketPriceIls + w.MaxMarketPriceIls) / 2;
        return new WhiskeyDto(w.Id, w.Name, w.Brand, w.Age, w.Country, w.Region, w.Distillery, w.CategoryId, w.Category.Name, w.VolumeML, w.AlcoholPercentage, w.ImageUrl, w.Description, w.BodyProfile, w.SmokinessProfile, w.SweetnessProfile, w.AlcoholProfile, w.MinMarketPriceIls, w.MaxMarketPriceIls, avg, match, w.IsActive, w.CreatedAt);
    }
}

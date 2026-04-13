using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whisk.Application.DTOs;
using Whisk.Application.Interfaces;
using Whisk.Domain.Entities;
using Whisk.Domain.Enums;

namespace Whisk.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly IWhiskDbContext _db;
    private readonly IWebHostEnvironment _env;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const long MaxImageSize = 10 * 1024 * 1024; // 10 MB

    public AdminController(IWhiskDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardDto>> GetDashboard()
    {
        return Ok(new AdminDashboardDto(
            await _db.Users.CountAsync(),
            await _db.Users.CountAsync(u => u.IsActive),
            await _db.Whiskies.CountAsync(w => w.IsActive),
            await _db.TastingNotes.CountAsync(),
            await _db.CollectionItems.CountAsync(),
            await _db.WhiskeyRequests.CountAsync(r => r.Status == WhiskeyRequestStatus.Pending)));
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<AdminUserDto>>> GetUsers()
    {
        var users = await _db.Users.ToListAsync();
        var result = new List<AdminUserDto>();
        foreach (var u in users)
        {
            var tastings = await _db.TastingNotes.CountAsync(t => t.UserId == u.Id);
            var collection = await _db.CollectionItems.CountAsync(c => c.UserId == u.Id);
            result.Add(new AdminUserDto(u.Id, u.Nickname, u.Email, u.Country, u.Role.ToString(), u.BarrelLevel, u.IsActive, u.CreatedAt, u.LastLoginAt, tastings, collection));
        }
        return Ok(result);
    }

    [HttpPut("users/{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UpdateUserStatusRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"User {(request.IsActive ? "activated" : "deactivated")}" });
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role)) return BadRequest("Invalid role");
        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"User role updated to {role}" });
    }

    [HttpGet("whiskies")]
    public async Task<ActionResult<List<AdminWhiskeyDto>>> GetWhiskies()
    {
        var items = await _db.Whiskies.Include(w => w.Category).OrderBy(w => w.Name).ToListAsync();
        return Ok(items.Select(w => new AdminWhiskeyDto(w.Id, w.Name, w.Brand, w.Age, w.Country, w.Region, w.Distillery, w.CategoryId, w.Category.Name, w.VolumeML, w.AlcoholPercentage, w.ImageUrl, w.Description, w.BodyProfile, w.SmokinessProfile, w.SweetnessProfile, w.AlcoholProfile, w.MinMarketPriceIls, w.MaxMarketPriceIls, w.IsActive, w.CreatedAt, w.UpdatedAt)).ToList());
    }

    [HttpPost("whiskies")]
    public async Task<ActionResult<AdminWhiskeyDto>> CreateWhiskey([FromBody] CreateWhiskeyRequest request, [FromServices] IValidator<CreateWhiskeyRequest> validator, [FromServices] IPushNotificationService pushService)
    {
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var cat = await _db.WhiskeyCategories.FindAsync(request.CategoryId);
        if (cat == null) return BadRequest("Invalid category");

        var whiskey = new Whiskey
        {
            Id = Guid.NewGuid(), Name = request.Name, Brand = request.Brand, Age = request.Age,
            Country = request.Country, Region = request.Region, Distillery = request.Distillery,
            CategoryId = request.CategoryId, VolumeML = request.VolumeML, AlcoholPercentage = request.AlcoholPercentage,
            ImageUrl = request.ImageUrl, Description = request.Description, BodyProfile = request.BodyProfile,
            SmokinessProfile = request.SmokinessProfile, SweetnessProfile = request.SweetnessProfile,
            AlcoholProfile = request.AlcoholProfile, MinMarketPriceIls = request.MinMarketPriceIls, MaxMarketPriceIls = request.MaxMarketPriceIls
        };

        _db.Whiskies.Add(whiskey);

        if (request.RequestId.HasValue)
        {
            var whiskeyRequest = await _db.WhiskeyRequests
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == request.RequestId.Value);

            if (whiskeyRequest != null)
            {
                whiskeyRequest.ApprovedWhiskeyId = whiskey.Id;
                whiskeyRequest.Status = WhiskeyRequestStatus.Approved;
                whiskeyRequest.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();

            if (whiskeyRequest?.User != null
                && !string.IsNullOrEmpty(whiskeyRequest.User.ExpoPushToken)
                && whiskeyRequest.NotificationSentAt == null)
            {
                var sent = await pushService.SendAsync(
                    whiskeyRequest.User.ExpoPushToken,
                    "Your whiskey request was approved!",
                    $"{whiskey.Name} by {whiskey.Brand} is now available in Whisk.",
                    new { type = "request_approved", whiskeyId = whiskey.Id.ToString(), requestId = whiskeyRequest.Id.ToString() });

                if (sent)
                {
                    whiskeyRequest.NotificationSentAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }
            }
        }
        else
        {
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetWhiskies), null, new AdminWhiskeyDto(whiskey.Id, whiskey.Name, whiskey.Brand, whiskey.Age, whiskey.Country, whiskey.Region, whiskey.Distillery, whiskey.CategoryId, cat.Name, whiskey.VolumeML, whiskey.AlcoholPercentage, whiskey.ImageUrl, whiskey.Description, whiskey.BodyProfile, whiskey.SmokinessProfile, whiskey.SweetnessProfile, whiskey.AlcoholProfile, whiskey.MinMarketPriceIls, whiskey.MaxMarketPriceIls, whiskey.IsActive, whiskey.CreatedAt, whiskey.UpdatedAt));
    }

    [HttpPut("whiskies/{id}")]
    public async Task<ActionResult<AdminWhiskeyDto>> UpdateWhiskey(Guid id, [FromBody] UpdateWhiskeyRequest request, [FromServices] IValidator<UpdateWhiskeyRequest> validator)
    {
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var whiskey = await _db.Whiskies.Include(w => w.Category).FirstOrDefaultAsync(w => w.Id == id);
        if (whiskey == null) return NotFound();

        whiskey.Name = request.Name; whiskey.Brand = request.Brand; whiskey.Age = request.Age;
        whiskey.Country = request.Country; whiskey.Region = request.Region; whiskey.Distillery = request.Distillery;
        whiskey.CategoryId = request.CategoryId; whiskey.VolumeML = request.VolumeML; whiskey.AlcoholPercentage = request.AlcoholPercentage;
        whiskey.ImageUrl = request.ImageUrl; whiskey.Description = request.Description; whiskey.BodyProfile = request.BodyProfile;
        whiskey.SmokinessProfile = request.SmokinessProfile; whiskey.SweetnessProfile = request.SweetnessProfile;
        whiskey.AlcoholProfile = request.AlcoholProfile; whiskey.MinMarketPriceIls = request.MinMarketPriceIls;
        whiskey.MaxMarketPriceIls = request.MaxMarketPriceIls; whiskey.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var cat = await _db.WhiskeyCategories.FindAsync(whiskey.CategoryId);
        return Ok(new AdminWhiskeyDto(whiskey.Id, whiskey.Name, whiskey.Brand, whiskey.Age, whiskey.Country, whiskey.Region, whiskey.Distillery, whiskey.CategoryId, cat!.Name, whiskey.VolumeML, whiskey.AlcoholPercentage, whiskey.ImageUrl, whiskey.Description, whiskey.BodyProfile, whiskey.SmokinessProfile, whiskey.SweetnessProfile, whiskey.AlcoholProfile, whiskey.MinMarketPriceIls, whiskey.MaxMarketPriceIls, whiskey.IsActive, whiskey.CreatedAt, whiskey.UpdatedAt));
    }

    [HttpPut("whiskies/{id}/status")]
    public async Task<IActionResult> UpdateWhiskeyStatus(Guid id, [FromBody] UpdateWhiskeyStatusRequest request)
    {
        var whiskey = await _db.Whiskies.FindAsync(id);
        if (whiskey == null) return NotFound();
        whiskey.IsActive = request.IsActive;
        whiskey.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Whiskey {(request.IsActive ? "activated" : "deactivated")}" });
    }

    [HttpDelete("whiskies/{id}")]
    public async Task<IActionResult> DeleteWhiskey(Guid id)
    {
        var whiskey = await _db.Whiskies.FindAsync(id);
        if (whiskey == null) return NotFound();

        var hasTastings = await _db.TastingNotes.AnyAsync(t => t.WhiskeyId == id);
        var hasCollection = await _db.CollectionItems.AnyAsync(c => c.WhiskeyId == id);
        if (hasTastings || hasCollection)
            return BadRequest(new { error = "Cannot delete: this whiskey has tastings or collection entries. Deactivate it instead." });

        _db.Whiskies.Remove(whiskey);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Whiskey permanently deleted" });
    }

    [HttpPost("whiskies/upload-image")]
    [RequestSizeLimit(MaxImageSize)]
    public async Task<ActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file provided" });

        if (file.Length > MaxImageSize)
            return BadRequest(new { error = "File exceeds 10 MB limit" });

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
            return BadRequest(new { error = "Only image files are allowed (.jpg, .jpeg, .png, .webp, .gif)" });

        var fileName = $"{Guid.NewGuid()}{ext.ToLowerInvariant()}";
        var folder = Path.Combine(_env.ContentRootPath, "WhiskImages");
        Directory.CreateDirectory(folder);

        var filePath = Path.Combine(folder, fileName);
        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return Ok(new { fileName });
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        var items = await _db.WhiskeyCategories.OrderBy(c => c.Name).ToListAsync();
        return Ok(items.Select(c => new CategoryDto(c.Id, c.Name, c.IsActive)).ToList());
    }

    [HttpPost("categories")]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryRequest request, [FromServices] IValidator<CreateCategoryRequest> validator)
    {
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var nextId = (await _db.WhiskeyCategories.MaxAsync(c => (int?)c.Id) ?? 0) + 1;
        var cat = new WhiskeyCategory { Id = nextId, Name = request.Name };
        _db.WhiskeyCategories.Add(cat);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategories), null, new CategoryDto(cat.Id, cat.Name, cat.IsActive));
    }

    [HttpPut("categories/{id}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
    {
        var cat = await _db.WhiskeyCategories.FindAsync(id);
        if (cat == null) return NotFound();
        cat.Name = request.Name;
        await _db.SaveChangesAsync();
        return Ok(new CategoryDto(cat.Id, cat.Name, cat.IsActive));
    }

    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var cat = await _db.WhiskeyCategories.FindAsync(id);
        if (cat == null) return NotFound();
        cat.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Category deactivated" });
    }

    [HttpGet("whiskey-requests")]
    public async Task<ActionResult<List<AdminWhiskeyRequestDto>>> GetRequests()
    {
        var items = await _db.WhiskeyRequests.Include(r => r.User).OrderByDescending(r => r.CreatedAt).ToListAsync();
        return Ok(items.Select(r => new AdminWhiskeyRequestDto(r.Id, r.UserId, r.User.Nickname, r.Name, r.Brand, r.Details, r.Status.ToString(), r.AdminNotes, r.ApprovedWhiskeyId, r.CreatedAt)).ToList());
    }

    [HttpPut("whiskey-requests/{id}/approve")]
    public async Task<IActionResult> ApproveRequest(Guid id)
    {
        var req = await _db.WhiskeyRequests.FindAsync(id);
        if (req == null) return NotFound();
        req.Status = WhiskeyRequestStatus.Approved;
        req.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Request approved" });
    }

    [HttpPut("whiskey-requests/{id}/reject")]
    public async Task<IActionResult> RejectRequest(Guid id)
    {
        var req = await _db.WhiskeyRequests.FindAsync(id);
        if (req == null) return NotFound();
        req.Status = WhiskeyRequestStatus.Rejected;
        req.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Request rejected" });
    }

    [HttpPut("whiskies/{id}/market-prices")]
    public async Task<IActionResult> UpdateMarketPrices(Guid id, [FromBody] UpdateMarketPricesRequest request, [FromServices] IValidator<UpdateMarketPricesRequest> validator)
    {
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var whiskey = await _db.Whiskies.FindAsync(id);
        if (whiskey == null) return NotFound();
        whiskey.MinMarketPriceIls = request.MinMarketPriceIls;
        whiskey.MaxMarketPriceIls = request.MaxMarketPriceIls;
        whiskey.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Market prices updated" });
    }
}

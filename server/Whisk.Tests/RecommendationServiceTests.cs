using Microsoft.EntityFrameworkCore;
using Whisk.Domain.Entities;
using Whisk.Domain.Enums;
using Whisk.Domain.Services;
using Whisk.Infrastructure.Persistence;
using Whisk.Infrastructure.Services;

namespace Whisk.Tests;

public class RecommendationServiceTests
{
    private WhiskDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<WhiskDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new WhiskDbContext(options);
    }

    [Fact]
    public async Task GetStatus_NoTastings_ReturnsLocked()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        db.Users.Add(new User { Id = userId, Email = "test@test.com", AuthProvider = AuthProvider.Dev, AuthProviderUserId = "test" });
        await db.SaveChangesAsync();

        var service = new RecommendationService(db);
        var status = await service.GetStatusAsync(userId);

        Assert.False(status.IsUnlocked);
        Assert.Equal(0, status.TastingCount);
        Assert.Equal(3, status.RequiredTastings);
    }

    [Fact]
    public async Task GetStatus_ThreeTastings_ReturnsUnlocked()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var cat = new WhiskeyCategory { Id = 1, Name = "Test" };
        db.WhiskeyCategories.Add(cat);
        db.Users.Add(new User { Id = userId, Email = "t@t.com", AuthProvider = AuthProvider.Dev, AuthProviderUserId = "t" });
        await db.SaveChangesAsync();

        for (int i = 0; i < 3; i++)
        {
            var w = new Whiskey { Id = Guid.NewGuid(), Name = $"W{i}", Brand = "B", Country = "C", Region = "R", Distillery = "D", CategoryId = 1, VolumeML = 700, AlcoholPercentage = 40, BodyProfile = 5, SmokinessProfile = 5, SweetnessProfile = 5, MinMarketPriceIls = 100, MaxMarketPriceIls = 200, ImageUrl = "" };
            db.Whiskies.Add(w);
            await db.SaveChangesAsync();

            db.TastingNotes.Add(new TastingNote { Id = Guid.NewGuid(), UserId = userId, WhiskeyId = w.Id, TastingDate = DateTime.UtcNow, BodyDelta = 0, SmokeDelta = 0, SweetDelta = 0, AlcoholDelta = 0, PersonalFitPercent = 100 });
        }
        await db.SaveChangesAsync();

        var service = new RecommendationService(db);
        var status = await service.GetStatusAsync(userId);

        Assert.True(status.IsUnlocked);
        Assert.Equal(3, status.TastingCount);
    }

    [Fact]
    public async Task GetBottleMatch_WithTasting_ReturnsFitPercent()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        var whiskeyId = Guid.NewGuid();
        var cat = new WhiskeyCategory { Id = 1, Name = "Test" };
        db.WhiskeyCategories.Add(cat);
        db.Users.Add(new User { Id = userId, Email = "t@t.com", AuthProvider = AuthProvider.Dev, AuthProviderUserId = "t" });
        db.Whiskies.Add(new Whiskey { Id = whiskeyId, Name = "W", Brand = "B", Country = "C", Region = "R", Distillery = "D", CategoryId = 1, VolumeML = 700, AlcoholPercentage = 40, BodyProfile = 5, SmokinessProfile = 5, SweetnessProfile = 5, MinMarketPriceIls = 100, MaxMarketPriceIls = 200, ImageUrl = "" });
        db.TastingNotes.Add(new TastingNote { Id = Guid.NewGuid(), UserId = userId, WhiskeyId = whiskeyId, TastingDate = DateTime.UtcNow, BodyDelta = 1, SmokeDelta = -1, SweetDelta = 0, AlcoholDelta = 2, PersonalFitPercent = PersonalFitCalculator.Calculate(1, -1, 0, 2) });
        await db.SaveChangesAsync();

        var service = new RecommendationService(db);
        var match = await service.GetBottleMatchAsync(userId, whiskeyId);

        Assert.NotNull(match);
        Assert.Equal(PersonalFitCalculator.Calculate(1, -1, 0, 2), match.Value);
    }

    [Fact]
    public async Task GetRecommendations_NotUnlocked_ReturnsEmpty()
    {
        using var db = CreateDb();
        var userId = Guid.NewGuid();
        db.Users.Add(new User { Id = userId, Email = "t@t.com", AuthProvider = AuthProvider.Dev, AuthProviderUserId = "t" });
        await db.SaveChangesAsync();

        var service = new RecommendationService(db);
        var recs = await service.GetRecommendationsAsync(userId);

        Assert.Empty(recs);
    }
}

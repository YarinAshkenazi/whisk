using Microsoft.EntityFrameworkCore;
using Whisk.Domain.Entities;
using Whisk.Domain.Enums;

namespace Whisk.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task SeedAsync(WhiskDbContext context)
    {
        if (await context.WhiskeyCategories.AnyAsync()) return;

        var categories = new List<WhiskeyCategory>
        {
            new() { Id = 1, Name = "Single Malt Scotch" },
            new() { Id = 2, Name = "Blended Scotch" },
            new() { Id = 3, Name = "Japanese" },
            new() { Id = 4, Name = "Irish" },
            new() { Id = 5, Name = "Indian" },
            new() { Id = 6, Name = "Israeli" }
        };
        context.WhiskeyCategories.AddRange(categories);
        await context.SaveChangesAsync();

        var whiskies = new List<Whiskey>();

        // -- Single Malt Scotch --
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Glenfiddich 12 Year Old", Brand = "Glenfiddich", Age = 12, Country = "Scotland", Region = "Speyside", Distillery = "Glenfiddich", CategoryId = 1, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400", Description = "A beautifully crafted single malt. Fresh and fruity with a hint of pear.", BodyProfile = 4, SmokinessProfile = 1, SweetnessProfile = 6, AlcoholProfile = 3, MinMarketPriceIls = 150, MaxMarketPriceIls = 220 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "The Macallan 12 Double Cask", Brand = "The Macallan", Age = 12, Country = "Scotland", Region = "Speyside", Distillery = "The Macallan", CategoryId = 1, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400", Description = "Rich and balanced with notes of dried fruits, sherry, and warm spice.", BodyProfile = 6, SmokinessProfile = 1, SweetnessProfile = 7, AlcoholProfile = 4, MinMarketPriceIls = 280, MaxMarketPriceIls = 380 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Laphroaig 10 Year Old", Brand = "Laphroaig", Age = 10, Country = "Scotland", Region = "Islay", Distillery = "Laphroaig", CategoryId = 1, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1602081115068-1b1049788852?w=400", Description = "Boldly peated with seaweed, iodine, and a hint of sweetness.", BodyProfile = 7, SmokinessProfile = 9, SweetnessProfile = 2, AlcoholProfile = 4, MinMarketPriceIls = 180, MaxMarketPriceIls = 260 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Lagavulin 16 Year Old", Brand = "Lagavulin", Age = 16, Country = "Scotland", Region = "Islay", Distillery = "Lagavulin", CategoryId = 1, VolumeML = 700, AlcoholPercentage = 43.0, ImageUrl = "https://images.unsplash.com/photo-1574783541427-d6ab90fc7669?w=400", Description = "Intense and smoky with rich dried fruit and a long peppery finish.", BodyProfile = 8, SmokinessProfile = 9, SweetnessProfile = 4, AlcoholProfile = 5, MinMarketPriceIls = 350, MaxMarketPriceIls = 480 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "The Glenlivet 15 French Oak", Brand = "The Glenlivet", Age = 15, Country = "Scotland", Region = "Speyside", Distillery = "The Glenlivet", CategoryId = 1, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400", Description = "Smooth and rich with a creamy French oak influence and notes of cinnamon.", BodyProfile = 5, SmokinessProfile = 1, SweetnessProfile = 7, AlcoholProfile = 3, MinMarketPriceIls = 220, MaxMarketPriceIls = 310 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Talisker 10 Year Old", Brand = "Talisker", Age = 10, Country = "Scotland", Region = "Island", Distillery = "Talisker", CategoryId = 1, VolumeML = 700, AlcoholPercentage = 45.8, ImageUrl = "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400", Description = "Maritime smoke, black pepper, and dried fruit. Powerful and warming.", BodyProfile = 7, SmokinessProfile = 7, SweetnessProfile = 3, AlcoholProfile = 6, MinMarketPriceIls = 190, MaxMarketPriceIls = 270 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Ardbeg 10 Year Old", Brand = "Ardbeg", Age = 10, Country = "Scotland", Region = "Islay", Distillery = "Ardbeg", CategoryId = 1, VolumeML = 700, AlcoholPercentage = 46.0, ImageUrl = "https://images.unsplash.com/photo-1602081115068-1b1049788852?w=400", Description = "Heavily peated with citrus, chocolate, and smoky bacon notes.", BodyProfile = 7, SmokinessProfile = 10, SweetnessProfile = 3, AlcoholProfile = 6, MinMarketPriceIls = 200, MaxMarketPriceIls = 290 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Oban 14 Year Old", Brand = "Oban", Age = 14, Country = "Scotland", Region = "Highland", Distillery = "Oban", CategoryId = 1, VolumeML = 700, AlcoholPercentage = 43.0, ImageUrl = "https://images.unsplash.com/photo-1574783541427-d6ab90fc7669?w=400", Description = "Perfectly balanced between rich and smoky. Sea salt, honey, and citrus.", BodyProfile = 6, SmokinessProfile = 4, SweetnessProfile = 5, AlcoholProfile = 5, MinMarketPriceIls = 300, MaxMarketPriceIls = 420 });

        // -- Blended Scotch --
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Johnnie Walker Black Label", Brand = "Johnnie Walker", Age = 12, Country = "Scotland", Region = "Blended", Distillery = "Various", CategoryId = 2, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400", Description = "A deep complex blend with smoky malt, rich fruit, and vanilla.", BodyProfile = 5, SmokinessProfile = 5, SweetnessProfile = 5, AlcoholProfile = 4, MinMarketPriceIls = 120, MaxMarketPriceIls = 170 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Chivas Regal 12 Year Old", Brand = "Chivas Regal", Age = 12, Country = "Scotland", Region = "Blended", Distillery = "Strathisla", CategoryId = 2, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400", Description = "Generous and rounded with honey, vanilla, and ripe apple notes.", BodyProfile = 4, SmokinessProfile = 2, SweetnessProfile = 6, AlcoholProfile = 3, MinMarketPriceIls = 110, MaxMarketPriceIls = 160 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Monkey Shoulder", Brand = "Monkey Shoulder", Age = null, Country = "Scotland", Region = "Speyside", Distillery = "William Grant", CategoryId = 2, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1602081115068-1b1049788852?w=400", Description = "Smooth and malty with vanilla, spiced oak, and a touch of berry sweetness.", BodyProfile = 4, SmokinessProfile = 1, SweetnessProfile = 6, AlcoholProfile = 3, MinMarketPriceIls = 100, MaxMarketPriceIls = 150 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Dewar's 12 Year Old", Brand = "Dewar's", Age = 12, Country = "Scotland", Region = "Blended", Distillery = "Aberfeldy", CategoryId = 2, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1574783541427-d6ab90fc7669?w=400", Description = "Honey and floral notes with a smooth creamy finish.", BodyProfile = 4, SmokinessProfile = 2, SweetnessProfile = 6, AlcoholProfile = 3, MinMarketPriceIls = 90, MaxMarketPriceIls = 140 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Compass Box Great King Street Artist's Blend", Brand = "Compass Box", Age = null, Country = "Scotland", Region = "Blended", Distillery = "Compass Box", CategoryId = 2, VolumeML = 700, AlcoholPercentage = 43.0, ImageUrl = "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400", Description = "Fruity, sweet, balanced with biscuit malt, vanilla, and a touch of smoke.", BodyProfile = 5, SmokinessProfile = 3, SweetnessProfile = 6, AlcoholProfile = 4, MinMarketPriceIls = 140, MaxMarketPriceIls = 200 });

        // -- Japanese --
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Hibiki Harmony", Brand = "Hibiki", Age = null, Country = "Japan", Region = "Osaka", Distillery = "Suntory", CategoryId = 3, VolumeML = 700, AlcoholPercentage = 43.0, ImageUrl = "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400", Description = "A delicate harmony of malt and grain whiskies. Honey, orange peel, and white chocolate.", BodyProfile = 5, SmokinessProfile = 1, SweetnessProfile = 7, AlcoholProfile = 4, MinMarketPriceIls = 400, MaxMarketPriceIls = 550 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Yamazaki 12 Year Old", Brand = "Yamazaki", Age = 12, Country = "Japan", Region = "Osaka", Distillery = "Yamazaki", CategoryId = 3, VolumeML = 700, AlcoholPercentage = 43.0, ImageUrl = "https://images.unsplash.com/photo-1602081115068-1b1049788852?w=400", Description = "Elegant and complex with tropical fruit, cinnamon, and Mizunara oak.", BodyProfile = 6, SmokinessProfile = 1, SweetnessProfile = 7, AlcoholProfile = 4, MinMarketPriceIls = 600, MaxMarketPriceIls = 900 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Nikka From The Barrel", Brand = "Nikka", Age = null, Country = "Japan", Region = "Sendai", Distillery = "Miyagikyo", CategoryId = 3, VolumeML = 500, AlcoholPercentage = 51.4, ImageUrl = "https://images.unsplash.com/photo-1574783541427-d6ab90fc7669?w=400", Description = "Powerful and complex. Rich fruit, spice, and a long warming finish.", BodyProfile = 7, SmokinessProfile = 3, SweetnessProfile = 5, AlcoholProfile = 7, MinMarketPriceIls = 180, MaxMarketPriceIls = 260 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Hakushu 12 Year Old", Brand = "Hakushu", Age = 12, Country = "Japan", Region = "Yamanashi", Distillery = "Hakushu", CategoryId = 3, VolumeML = 700, AlcoholPercentage = 43.0, ImageUrl = "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400", Description = "Fresh, green, and herbal with gentle smoke and mint.", BodyProfile = 4, SmokinessProfile = 4, SweetnessProfile = 4, AlcoholProfile = 4, MinMarketPriceIls = 500, MaxMarketPriceIls = 750 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Suntory Toki", Brand = "Suntory", Age = null, Country = "Japan", Region = "Osaka", Distillery = "Suntory", CategoryId = 3, VolumeML = 700, AlcoholPercentage = 43.0, ImageUrl = "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400", Description = "Light and silky with green apple, honey, and a hint of white pepper.", BodyProfile = 3, SmokinessProfile = 1, SweetnessProfile = 5, AlcoholProfile = 3, MinMarketPriceIls = 110, MaxMarketPriceIls = 170 });

        // -- Irish --
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Jameson Irish Whiskey", Brand = "Jameson", Age = null, Country = "Ireland", Region = "Cork", Distillery = "Midleton", CategoryId = 4, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1602081115068-1b1049788852?w=400", Description = "Smooth and versatile triple-distilled whiskey with vanilla and toasted wood.", BodyProfile = 3, SmokinessProfile = 1, SweetnessProfile = 5, AlcoholProfile = 3, MinMarketPriceIls = 80, MaxMarketPriceIls = 130 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Redbreast 12 Year Old", Brand = "Redbreast", Age = 12, Country = "Ireland", Region = "Cork", Distillery = "Midleton", CategoryId = 4, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1574783541427-d6ab90fc7669?w=400", Description = "Full-bodied pot still whiskey with sherry, fruit cake, and toasted oak.", BodyProfile = 7, SmokinessProfile = 1, SweetnessProfile = 7, AlcoholProfile = 4, MinMarketPriceIls = 250, MaxMarketPriceIls = 350 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Green Spot", Brand = "Green Spot", Age = null, Country = "Ireland", Region = "Cork", Distillery = "Midleton", CategoryId = 4, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400", Description = "Pot still character with green apple, toasted oak, and a hint of clove.", BodyProfile = 5, SmokinessProfile = 1, SweetnessProfile = 6, AlcoholProfile = 3, MinMarketPriceIls = 200, MaxMarketPriceIls = 290 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Connemara Peated", Brand = "Connemara", Age = null, Country = "Ireland", Region = "Louth", Distillery = "Cooley", CategoryId = 4, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400", Description = "Ireland's peated single malt. Honey, malt, and distinctive turf smoke.", BodyProfile = 5, SmokinessProfile = 7, SweetnessProfile = 4, AlcoholProfile = 4, MinMarketPriceIls = 140, MaxMarketPriceIls = 210 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Tullamore D.E.W.", Brand = "Tullamore D.E.W.", Age = null, Country = "Ireland", Region = "Offaly", Distillery = "Tullamore", CategoryId = 4, VolumeML = 700, AlcoholPercentage = 40.0, ImageUrl = "https://images.unsplash.com/photo-1602081115068-1b1049788852?w=400", Description = "Triple-blended smooth Irish whiskey. Gentle grain, malt, and citrus.", BodyProfile = 3, SmokinessProfile = 1, SweetnessProfile = 5, AlcoholProfile = 3, MinMarketPriceIls = 75, MaxMarketPriceIls = 120 });

        // -- Indian --
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Amrut Fusion", Brand = "Amrut", Age = null, Country = "India", Region = "Bangalore", Distillery = "Amrut", CategoryId = 5, VolumeML = 700, AlcoholPercentage = 50.0, ImageUrl = "https://images.unsplash.com/photo-1574783541427-d6ab90fc7669?w=400", Description = "A fusion of Indian and Scottish barley. Rich, complex with dark chocolate.", BodyProfile = 7, SmokinessProfile = 4, SweetnessProfile = 5, AlcoholProfile = 7, MinMarketPriceIls = 250, MaxMarketPriceIls = 350 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Paul John Brilliance", Brand = "Paul John", Age = null, Country = "India", Region = "Goa", Distillery = "Paul John", CategoryId = 5, VolumeML = 700, AlcoholPercentage = 46.0, ImageUrl = "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400", Description = "Tropical fruit, honey, and a creamy vanilla sweetness. Warming finish.", BodyProfile = 5, SmokinessProfile = 1, SweetnessProfile = 7, AlcoholProfile = 5, MinMarketPriceIls = 200, MaxMarketPriceIls = 280 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Rampur Indian Single Malt", Brand = "Rampur", Age = null, Country = "India", Region = "Uttar Pradesh", Distillery = "Rampur", CategoryId = 5, VolumeML = 700, AlcoholPercentage = 43.0, ImageUrl = "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400", Description = "Warm tropical climate maturation. Apricot, vanilla, and cinnamon spice.", BodyProfile = 5, SmokinessProfile = 1, SweetnessProfile = 6, AlcoholProfile = 4, MinMarketPriceIls = 220, MaxMarketPriceIls = 320 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Indri Trini", Brand = "Indri", Age = null, Country = "India", Region = "Haryana", Distillery = "Piccadily", CategoryId = 5, VolumeML = 700, AlcoholPercentage = 46.0, ImageUrl = "https://images.unsplash.com/photo-1602081115068-1b1049788852?w=400", Description = "Triple wood maturation. Cherry, chocolate, and oak spice.", BodyProfile = 6, SmokinessProfile = 2, SweetnessProfile = 6, AlcoholProfile = 5, MinMarketPriceIls = 180, MaxMarketPriceIls = 260 });

        // -- Israeli --
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Milk & Honey Classic", Brand = "Milk & Honey", Age = null, Country = "Israel", Region = "Tel Aviv", Distillery = "M&H", CategoryId = 6, VolumeML = 700, AlcoholPercentage = 46.0, ImageUrl = "https://images.unsplash.com/photo-1574783541427-d6ab90fc7669?w=400", Description = "Israel's first whisky distillery. Citrus, caramel, and young oak.", BodyProfile = 5, SmokinessProfile = 2, SweetnessProfile = 5, AlcoholProfile = 5, MinMarketPriceIls = 200, MaxMarketPriceIls = 280 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "M&H Elements Sherry Cask", Brand = "Milk & Honey", Age = null, Country = "Israel", Region = "Tel Aviv", Distillery = "M&H", CategoryId = 6, VolumeML = 700, AlcoholPercentage = 46.0, ImageUrl = "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400", Description = "Matured in Sherry casks. Dried fruits, plum, and warm baking spice.", BodyProfile = 6, SmokinessProfile = 1, SweetnessProfile = 7, AlcoholProfile = 5, MinMarketPriceIls = 230, MaxMarketPriceIls = 310 });
        whiskies.Add(new Whiskey { Id = Guid.NewGuid(), Name = "Golan Heights Whisky", Brand = "Golan Heights", Age = null, Country = "Israel", Region = "Golan Heights", Distillery = "Golan Heights", CategoryId = 6, VolumeML = 700, AlcoholPercentage = 46.0, ImageUrl = "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400", Description = "Northern Israel terroir. Herbal, floral with a mineral finish.", BodyProfile = 4, SmokinessProfile = 2, SweetnessProfile = 4, AlcoholProfile = 5, MinMarketPriceIls = 180, MaxMarketPriceIls = 250 });

        context.Whiskies.AddRange(whiskies);
        await context.SaveChangesAsync();

        // Seed admin user (upsert: fix existing dev-login-created records)
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@whisk.dev");
        if (adminUser == null)
        {
            adminUser = new User
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Email = "admin@whisk.dev",
                AuthProvider = AuthProvider.Dev,
                AuthProviderUserId = "dev-admin",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
        }
        adminUser.Nickname = string.IsNullOrEmpty(adminUser.Nickname) || adminUser.Nickname == "admin" ? "Admin" : adminUser.Nickname;
        adminUser.Country = string.IsNullOrEmpty(adminUser.Country) ? "Israel" : adminUser.Country;
        adminUser.Role = UserRole.Admin;
        adminUser.BarrelLevel = 0;
        adminUser.HasAcceptedTerms = true;
        adminUser.IsOver18 = true;
        adminUser.IsActive = true;
        adminUser.IsOnboardingComplete = true;
        adminUser.LastLoginAt = DateTime.UtcNow;

        var testUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "user@whisk.dev");
        if (testUser == null)
        {
            testUser = new User
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Email = "user@whisk.dev",
                AuthProvider = AuthProvider.Dev,
                AuthProviderUserId = "dev-user",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(testUser);
        }
        testUser.Nickname = string.IsNullOrEmpty(testUser.Nickname) || testUser.Nickname == "user" ? "WhiskyLover" : testUser.Nickname;
        testUser.Country = string.IsNullOrEmpty(testUser.Country) ? "Israel" : testUser.Country;
        testUser.Role = UserRole.User;
        testUser.BarrelLevel = 0;
        testUser.HasAcceptedTerms = true;
        testUser.IsOver18 = true;
        testUser.IsActive = true;
        testUser.IsOnboardingComplete = true;
        testUser.LastLoginAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        // Seed collection items for test user
        var firstFiveWhiskies = whiskies.Take(5).ToList();
        foreach (var w in firstFiveWhiskies)
        {
            context.CollectionItems.Add(new CollectionItem
            {
                Id = Guid.NewGuid(),
                UserId = testUser.Id,
                WhiskeyId = w.Id,
                PurchasePriceIls = w.MinMarketPriceIls + 20,
                PurchaseDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(10, 90)),
                Status = CollectionStatus.Closed,
                Notes = "Great bottle"
            });
        }
        await context.SaveChangesAsync();

        // Seed tastings for the test user (so recommendations unlock)
        var rand = new Random(42);
        for (int i = 0; i < 4; i++)
        {
            var w = whiskies[i];
            int bodyD = rand.Next(-3, 4);
            int smokeD = rand.Next(-3, 4);
            int sweetD = rand.Next(-3, 4);
            int alcD = rand.Next(-3, 4);
            context.TastingNotes.Add(new TastingNote
            {
                Id = Guid.NewGuid(),
                UserId = testUser.Id,
                WhiskeyId = w.Id,
                TastingDate = DateTime.UtcNow.AddDays(-rand.Next(5, 60)),
                IsOwned = true,
                Notes = "Seed tasting note",
                BodyDelta = bodyD,
                SmokeDelta = smokeD,
                SweetDelta = sweetD,
                AlcoholDelta = alcD,
                PersonalFitPercent = Whisk.Domain.Services.PersonalFitCalculator.Calculate(bodyD, smokeD, sweetD, alcD)
            });
        }
        await context.SaveChangesAsync();

        // Update barrel level for test user
        var bottleCount = await context.CollectionItems.CountAsync(c => c.UserId == testUser.Id);
        testUser.BarrelLevel = Whisk.Domain.Services.BarrelLevelCalculator.Calculate(bottleCount);
        await context.SaveChangesAsync();

        // Seed bottle requests
        context.WhiskeyRequests.Add(new WhiskeyRequest
        {
            Id = Guid.NewGuid(),
            UserId = testUser.Id,
            Name = "Springbank 15",
            Brand = "Springbank",
            Details = "Would love to see this added to the catalog!",
            Status = WhiskeyRequestStatus.Pending
        });
        context.WhiskeyRequests.Add(new WhiskeyRequest
        {
            Id = Guid.NewGuid(),
            UserId = testUser.Id,
            Name = "Kavalan Solist",
            Brand = "Kavalan",
            Details = "Taiwanese single malt, great whisky",
            Status = WhiskeyRequestStatus.Pending
        });
        await context.SaveChangesAsync();
    }
}

using Whisk.Domain.Enums;

namespace Whisk.Application.DTOs;

// Auth
public record GoogleAuthRequest(string IdToken);
public record AppleAuthRequest(string IdentityToken, string? FullName);
public record DevLoginRequest(string Email, string Role);
public record EmailPasswordLoginRequest(string Email, string Password);
public record EmailRegisterRequest(string Email, string Password);
public record AuthResponse(string Token, bool IsOnboardingComplete, string Role);

// Profile
public record ProfileDto(Guid Id, string Nickname, string Email, string Country, string Role, int BarrelLevel, bool IsOnboardingComplete, DateTime CreatedAt);
public record UpdateProfileRequest(string Nickname, string Country);
public record OnboardingRequest(string Nickname, string Country, bool IsOver18, bool AcceptTerms);

// Whiskey
public record WhiskeyDto(Guid Id, string Name, string Brand, int? Age, string Country, string Region, string Distillery, int CategoryId, string CategoryName, int VolumeML, double AlcoholPercentage, string ImageUrl, string Description, double BodyProfile, double SmokinessProfile, double SweetnessProfile, double? AlcoholProfile, decimal MinMarketPriceIls, decimal MaxMarketPriceIls, decimal AvgMarketPriceIls, int? MatchPercent, bool IsActive, DateTime CreatedAt);
public record WhiskeyListRequest(string? Search, int? CategoryId, string? Country, string? Region, int? MinAge, int? MaxAge, double? MinAbv, double? MaxAbv, decimal? MinPrice, decimal? MaxPrice, string? SortBy, bool SortDesc, int Page, int PageSize);
public record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);
public record CategoryDto(int Id, string Name, bool IsActive);

// Collection
public record CollectionItemDto(Guid Id, Guid WhiskeyId, string WhiskeyName, string WhiskeyImageUrl, string CategoryName, decimal? PurchasePriceIls, DateTime? PurchaseDate, string Status, string Notes, decimal? CurrentMarketValue, DateTime AddedAt);
public record CollectionSummaryDto(int TotalBottles, int ClosedBottles, decimal TotalPurchaseCost, decimal TotalMarketValue, decimal ProfitLoss, int BarrelLevel);
public record AddCollectionItemRequest(Guid WhiskeyId, decimal? PurchasePriceIls, DateTime? PurchaseDate, string? Status, string? Notes);
public record UpdateCollectionItemRequest(decimal? PurchasePriceIls, DateTime? PurchaseDate, string? Status, string? Notes);

// Tastings
public record TastingNoteDto(Guid Id, Guid WhiskeyId, string WhiskeyName, string WhiskeyImageUrl, DateTime TastingDate, bool IsOwned, string? Notes, int BodyDelta, int SmokeDelta, int SweetDelta, int AlcoholDelta, int PersonalFitPercent, DateTime CreatedAt);
public record AddTastingRequest(Guid WhiskeyId, DateTime TastingDate, bool IsOwned, string? Notes, int BodyDelta, int SmokeDelta, int SweetDelta, int AlcoholDelta);
public record UpdateTastingRequest(DateTime TastingDate, bool IsOwned, string? Notes, int BodyDelta, int SmokeDelta, int SweetDelta, int AlcoholDelta);

// Recommendations
public record RecommendationDto(Guid WhiskeyId, string WhiskeyName, string WhiskeyImageUrl, string CategoryName, int MatchPercent, string Reason);
public record RecommendationStatusDto(bool IsUnlocked, int TastingCount, int RequiredTastings);

// Whiskey Requests
public record WhiskeyRequestDto(Guid Id, string Name, string Brand, string? Details, string Status, string? AdminNotes, Guid? ApprovedWhiskeyId, DateTime CreatedAt);
public record CreateWhiskeyRequestDto(string Name, string Brand, string? Details);

// Admin
public record AdminDashboardDto(int TotalUsers, int ActiveUsers, int TotalWhiskies, int TotalTastings, int TotalCollectionItems, int PendingRequests);
public record AdminUserDto(Guid Id, string Nickname, string Email, string Country, string Role, int BarrelLevel, bool IsActive, DateTime CreatedAt, DateTime? LastLoginAt, int TastingCount, int CollectionCount);
public record AdminWhiskeyDto(Guid Id, string Name, string Brand, int? Age, string Country, string Region, string Distillery, int CategoryId, string CategoryName, int VolumeML, double AlcoholPercentage, string ImageUrl, string Description, double BodyProfile, double SmokinessProfile, double SweetnessProfile, double? AlcoholProfile, decimal MinMarketPriceIls, decimal MaxMarketPriceIls, bool IsActive, DateTime CreatedAt, DateTime UpdatedAt);
public record CreateWhiskeyRequest(string Name, string Brand, int? Age, string Country, string Region, string Distillery, int CategoryId, int VolumeML, double AlcoholPercentage, string ImageUrl, string Description, double BodyProfile, double SmokinessProfile, double SweetnessProfile, double? AlcoholProfile, decimal MinMarketPriceIls, decimal MaxMarketPriceIls, Guid? RequestId = null);
public record UpdateWhiskeyRequest(string Name, string Brand, int? Age, string Country, string Region, string Distillery, int CategoryId, int VolumeML, double AlcoholPercentage, string ImageUrl, string Description, double BodyProfile, double SmokinessProfile, double SweetnessProfile, double? AlcoholProfile, decimal MinMarketPriceIls, decimal MaxMarketPriceIls);
public record UpdateMarketPricesRequest(decimal MinMarketPriceIls, decimal MaxMarketPriceIls);
public record AdminWhiskeyRequestDto(Guid Id, Guid UserId, string UserNickname, string Name, string Brand, string? Details, string Status, string? AdminNotes, Guid? ApprovedWhiskeyId, DateTime CreatedAt);
public record CreateCategoryRequest(string Name);
public record UpdateCategoryRequest(string Name);
public record UpdateUserStatusRequest(bool IsActive);
public record UpdateUserRoleRequest(string Role);
public record UpdateWhiskeyStatusRequest(bool IsActive);
public record RegisterPushTokenRequest(string Token);

// AI Prefill
public record AiPrefillRequest(string BottleName, string? Brand);
public record AiPrefillResponse(string Name, string Brand, int? Age, string Country, string Region, string Distillery, int CategoryId, int VolumeML, double AlcoholPercentage, string Description, double BodyProfile, double SmokinessProfile, double SweetnessProfile, double? AlcoholProfile, decimal MinMarketPriceIls, decimal MaxMarketPriceIls);

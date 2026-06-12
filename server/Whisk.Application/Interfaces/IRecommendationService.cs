namespace Whisk.Application.Interfaces;

public interface IRecommendationService
{
    Task<List<DTOs.RecommendationDto>> GetRecommendationsAsync(Guid userId, CancellationToken ct = default);
    Task<int?> GetBottleMatchAsync(Guid userId, Guid whiskeyId, CancellationToken ct = default);
    Task<Dictionary<Guid, int?>> GetBatchBottleMatchesAsync(Guid userId, List<Guid> whiskeyIds, CancellationToken ct = default);
    Task<DTOs.RecommendationStatusDto> GetStatusAsync(Guid userId, CancellationToken ct = default);
}

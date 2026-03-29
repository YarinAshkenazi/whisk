using Microsoft.EntityFrameworkCore;
using Whisk.Application.DTOs;
using Whisk.Application.Interfaces;
using Whisk.Domain.Services;

namespace Whisk.Infrastructure.Services;

public class RecommendationService : IRecommendationService
{
    private readonly IWhiskDbContext _db;
    private const int MinTastingsRequired = 3;
    private const int MaxRecommendations = 20;

    public RecommendationService(IWhiskDbContext db)
    {
        _db = db;
    }

    public async Task<RecommendationStatusDto> GetStatusAsync(Guid userId, CancellationToken ct = default)
    {
        var count = await _db.TastingNotes.CountAsync(t => t.UserId == userId, ct);
        return new RecommendationStatusDto(count >= MinTastingsRequired, count, MinTastingsRequired);
    }

    public async Task<int?> GetBottleMatchAsync(Guid userId, Guid whiskeyId, CancellationToken ct = default)
    {
        var latestTasting = await _db.TastingNotes
            .Where(t => t.UserId == userId && t.WhiskeyId == whiskeyId)
            .OrderByDescending(t => t.TastingDate)
            .FirstOrDefaultAsync(ct);

        if (latestTasting != null)
            return latestTasting.PersonalFitPercent;

        var tastingCount = await _db.TastingNotes.CountAsync(t => t.UserId == userId, ct);
        if (tastingCount < MinTastingsRequired)
            return null;

        return await ComputePredictedMatchAsync(userId, whiskeyId, ct);
    }

    public async Task<List<RecommendationDto>> GetRecommendationsAsync(Guid userId, CancellationToken ct = default)
    {
        var status = await GetStatusAsync(userId, ct);
        if (!status.IsUnlocked) return new List<RecommendationDto>();

        var userTastings = await _db.TastingNotes
            .Where(t => t.UserId == userId)
            .GroupBy(t => t.WhiskeyId)
            .Select(g => g.OrderByDescending(t => t.TastingDate).First())
            .ToListAsync(ct);

        var userTastedIds = userTastings.Select(t => t.WhiskeyId).ToHashSet();

        // Step 1: Find taste neighbors (collaborative filtering)
        var overlappingUserIds = await _db.TastingNotes
            .Where(t => t.UserId != userId && userTastedIds.Contains(t.WhiskeyId))
            .Select(t => t.UserId)
            .Distinct()
            .ToListAsync(ct);

        var neighborScores = new Dictionary<Guid, double>();
        foreach (var neighborId in overlappingUserIds)
        {
            var neighborTastings = await _db.TastingNotes
                .Where(t => t.UserId == neighborId)
                .GroupBy(t => t.WhiskeyId)
                .Select(g => g.OrderByDescending(t => t.TastingDate).First())
                .ToListAsync(ct);

            double similarity = ComputeUserSimilarity(userTastings, neighborTastings);
            if (similarity > 0.3)
                neighborScores[neighborId] = similarity;
        }

        // Step 2: Gather candidate bottles from similar users
        var candidateScores = new Dictionary<Guid, (double score, string reason)>();

        foreach (var (neighborId, similarity) in neighborScores.OrderByDescending(n => n.Value).Take(10))
        {
            var neighborHighFit = await _db.TastingNotes
                .Where(t => t.UserId == neighborId && t.PersonalFitPercent >= 60)
                .GroupBy(t => t.WhiskeyId)
                .Select(g => g.OrderByDescending(t => t.TastingDate).First())
                .ToListAsync(ct);

            foreach (var tasting in neighborHighFit)
            {
                var collabScore = similarity * (tasting.PersonalFitPercent / 100.0);
                if (!candidateScores.ContainsKey(tasting.WhiskeyId) || candidateScores[tasting.WhiskeyId].score < collabScore)
                    candidateScores[tasting.WhiskeyId] = (collabScore, "Users with similar taste enjoyed this");
            }
        }

        // Step 3: Content-based fallback for remaining slots
        if (candidateScores.Count < MaxRecommendations)
        {
            var userAvgProfile = ComputeUserPreferenceProfile(userTastings);
            var allWhiskies = await _db.Whiskies.Where(w => w.IsActive).ToListAsync(ct);

            foreach (var whiskey in allWhiskies)
            {
                if (candidateScores.ContainsKey(whiskey.Id)) continue;

                double contentScore = ComputeContentSimilarity(userAvgProfile, whiskey);
                if (contentScore > 0.4)
                    candidateScores[whiskey.Id] = (contentScore, "Matches your flavor preferences");
            }
        }

        // Build final result
        var topCandidates = candidateScores
            .OrderByDescending(c => c.Value.score)
            .Take(MaxRecommendations)
            .Select(c => c.Key)
            .ToList();

        var whiskeyDetails = await _db.Whiskies
            .Include(w => w.Category)
            .Where(w => topCandidates.Contains(w.Id) && w.IsActive)
            .ToListAsync(ct);

        return whiskeyDetails.Select(w =>
        {
            var (score, reason) = candidateScores[w.Id];
            return new RecommendationDto(
                w.Id, w.Name, w.ImageUrl, w.Category.Name,
                (int)Math.Round(score * 100), reason);
        })
        .OrderByDescending(r => r.MatchPercent)
        .ToList();
    }

    private async Task<int?> ComputePredictedMatchAsync(Guid userId, Guid whiskeyId, CancellationToken ct)
    {
        var whiskey = await _db.Whiskies.FindAsync(new object[] { whiskeyId }, ct);
        if (whiskey == null) return null;

        var userTastings = await _db.TastingNotes
            .Where(t => t.UserId == userId)
            .GroupBy(t => t.WhiskeyId)
            .Select(g => g.OrderByDescending(t => t.TastingDate).First())
            .ToListAsync(ct);

        var profile = ComputeUserPreferenceProfile(userTastings);
        double contentScore = ComputeContentSimilarity(profile, whiskey);
        return (int)Math.Round(contentScore * 100);
    }

    private static double ComputeUserSimilarity(
        List<Domain.Entities.TastingNote> userA,
        List<Domain.Entities.TastingNote> userB)
    {
        var commonWhiskeyIds = userA.Select(t => t.WhiskeyId)
            .Intersect(userB.Select(t => t.WhiskeyId))
            .ToList();

        if (commonWhiskeyIds.Count == 0) return 0;

        double totalSimilarity = 0;
        foreach (var wid in commonWhiskeyIds)
        {
            var a = userA.First(t => t.WhiskeyId == wid);
            var b = userB.First(t => t.WhiskeyId == wid);

            double dist = Math.Sqrt(
                Math.Pow(a.BodyDelta - b.BodyDelta, 2) +
                Math.Pow(a.SmokeDelta - b.SmokeDelta, 2) +
                Math.Pow(a.SweetDelta - b.SweetDelta, 2) +
                Math.Pow(a.AlcoholDelta - b.AlcoholDelta, 2));

            double maxDist = Math.Sqrt(4 * Math.Pow(10, 2));
            totalSimilarity += 1.0 - (dist / maxDist);
        }

        return totalSimilarity / commonWhiskeyIds.Count;
    }

    private static (double body, double smoke, double sweet, double alcohol) ComputeUserPreferenceProfile(
        List<Domain.Entities.TastingNote> tastings)
    {
        if (tastings.Count == 0) return (5, 5, 5, 5);

        double avgBody = tastings.Average(t => -t.BodyDelta);
        double avgSmoke = tastings.Average(t => -t.SmokeDelta);
        double avgSweet = tastings.Average(t => -t.SweetDelta);
        double avgAlcohol = tastings.Average(t => -t.AlcoholDelta);

        return (
            Math.Clamp(5 + avgBody, 0, 10),
            Math.Clamp(5 + avgSmoke, 0, 10),
            Math.Clamp(5 + avgSweet, 0, 10),
            Math.Clamp(5 + avgAlcohol, 0, 10));
    }

    private static double ComputeContentSimilarity(
        (double body, double smoke, double sweet, double alcohol) preference,
        Domain.Entities.Whiskey whiskey)
    {
        double alcProfile = whiskey.AlcoholProfile ?? Math.Clamp(whiskey.AlcoholPercentage / 10.0, 0, 10);

        double bodyDiff = Math.Abs(preference.body - whiskey.BodyProfile) / 10.0;
        double smokeDiff = Math.Abs(preference.smoke - whiskey.SmokinessProfile) / 10.0;
        double sweetDiff = Math.Abs(preference.sweet - whiskey.SweetnessProfile) / 10.0;
        double alcDiff = Math.Abs(preference.alcohol - alcProfile) / 10.0;

        double weightedDiff = (smokeDiff * 0.35) + (sweetDiff * 0.30) + (bodyDiff * 0.20) + (alcDiff * 0.15);
        return 1.0 - weightedDiff;
    }
}

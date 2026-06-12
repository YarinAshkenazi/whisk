using Microsoft.EntityFrameworkCore;
using Whisk.Application.DTOs;
using Whisk.Application.Interfaces;
using Whisk.Domain.Entities;

namespace Whisk.Infrastructure.Services;

public class RecommendationService : IRecommendationService
{
    private readonly IWhiskDbContext _db;
    private const int MinTastingsRequired = 3;
    private const int MaxRecommendations = 20;
    private const double ContentWeight = 0.70;
    private const double CollabWeight = 0.30;
    private const double MinSimilarityThreshold = 0.3;
    private const int MaxNeighbors = 10;

    private const double SmokeWeight = 0.35;
    private const double SweetWeight = 0.30;
    private const double BodyWeight = 0.20;
    private const double AlcoholWeight = 0.15;

    public RecommendationService(IWhiskDbContext db) => _db = db;

    public async Task<RecommendationStatusDto> GetStatusAsync(Guid userId, CancellationToken ct = default)
    {
        var count = await _db.TastingNotes.CountAsync(t => t.UserId == userId, ct);
        return new RecommendationStatusDto(count >= MinTastingsRequired, count, MinTastingsRequired);
    }

    public async Task<int?> GetBottleMatchAsync(Guid userId, Guid whiskeyId, CancellationToken ct = default)
    {
        var matches = await GetBatchBottleMatchesAsync(userId, new List<Guid> { whiskeyId }, ct);
        return matches.GetValueOrDefault(whiskeyId);
    }

    public async Task<Dictionary<Guid, int?>> GetBatchBottleMatchesAsync(
        Guid userId, List<Guid> whiskeyIds, CancellationToken ct = default)
    {
        var result = new Dictionary<Guid, int?>();
        if (whiskeyIds.Count == 0) return result;

        var allUserTastings = await _db.TastingNotes
            .Include(t => t.Whiskey)
            .Where(t => t.UserId == userId)
            .ToListAsync(ct);

        var latestTastings = allUserTastings
            .GroupBy(t => t.WhiskeyId)
            .Select(g => g.OrderByDescending(t => t.TastingDate).First())
            .ToList();

        var tastingCount = latestTastings.Count;
        var tastedLookup = latestTastings.ToDictionary(t => t.WhiskeyId);

        foreach (var wid in whiskeyIds)
        {
            if (tastedLookup.TryGetValue(wid, out var tasting))
                result[wid] = tasting.PersonalFitPercent;
        }

        var untastedIds = whiskeyIds.Where(id => !tastedLookup.ContainsKey(id)).ToList();
        if (untastedIds.Count == 0) return result;

        if (tastingCount < MinTastingsRequired)
        {
            foreach (var id in untastedIds)
                result[id] = null;
            return result;
        }

        var userProfile = ComputeUserPreferenceProfile(latestTastings);

        var untastedWhiskies = await _db.Whiskies
            .Where(w => untastedIds.Contains(w.Id))
            .ToListAsync(ct);

        var contentScores = new Dictionary<Guid, double>();
        foreach (var w in untastedWhiskies)
            contentScores[w.Id] = ComputeContentSimilarity(userProfile, w);

        var collabScores = await ComputeCollaborativeScoresAsync(
            userId, latestTastings, untastedIds, ct);

        foreach (var wid in untastedIds)
        {
            if (!contentScores.ContainsKey(wid))
            {
                result[wid] = null;
                continue;
            }

            var cScore = contentScores[wid];
            double finalScore;

            if (collabScores.TryGetValue(wid, out var collab) && collab >= 0)
                finalScore = (ContentWeight * cScore) + (CollabWeight * collab);
            else
                finalScore = cScore;

            result[wid] = (int)Math.Round(Math.Clamp(finalScore * 100, 0, 100));
        }

        return result;
    }

    public async Task<List<RecommendationDto>> GetRecommendationsAsync(
        Guid userId, CancellationToken ct = default)
    {
        var status = await GetStatusAsync(userId, ct);
        if (!status.IsUnlocked) return new List<RecommendationDto>();

        var allUserTastings = await _db.TastingNotes
            .Include(t => t.Whiskey)
            .Where(t => t.UserId == userId)
            .ToListAsync(ct);

        var userTastings = allUserTastings
            .GroupBy(t => t.WhiskeyId)
            .Select(g => g.OrderByDescending(t => t.TastingDate).First())
            .ToList();

        var userTastedIds = userTastings.Select(t => t.WhiskeyId).ToHashSet();
        var userProfile = ComputeUserPreferenceProfile(userTastings);

        var candidateScores = new Dictionary<Guid, (double score, string reason)>();

        var neighbors = await FindSimilarUsersAsync(userId, userTastings, ct);
        foreach (var (_, similarity, neighborTastings) in neighbors)
        {
            foreach (var nt in neighborTastings.Where(t => t.PersonalFitPercent >= 60))
            {
                if (userTastedIds.Contains(nt.WhiskeyId)) continue;

                var collabScore = similarity * (nt.PersonalFitPercent / 100.0);
                if (!candidateScores.ContainsKey(nt.WhiskeyId) ||
                    candidateScores[nt.WhiskeyId].score < collabScore)
                    candidateScores[nt.WhiskeyId] =
                        (collabScore, "Users with similar taste enjoyed this");
            }
        }

        if (candidateScores.Count < MaxRecommendations)
        {
            var allWhiskies = await _db.Whiskies.Where(w => w.IsActive).ToListAsync(ct);
            foreach (var whiskey in allWhiskies)
            {
                if (userTastedIds.Contains(whiskey.Id) ||
                    candidateScores.ContainsKey(whiskey.Id)) continue;

                double contentScore = ComputeContentSimilarity(userProfile, whiskey);
                if (contentScore > 0.4)
                    candidateScores[whiskey.Id] =
                        (contentScore, "Matches your flavor preferences");
            }
        }

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
                (int)Math.Round(Math.Clamp(score * 100, 0, 100)), reason);
        })
        .OrderByDescending(r => r.MatchPercent)
        .ToList();
    }

    /// <summary>
    /// Compute user's ideal taste profile using actual bottle values.
    /// UserIdeal[param] = avg(BottleProfile[param] - UserDelta[param])
    /// </summary>
    private static (double body, double smoke, double sweet, double alcohol)
        ComputeUserPreferenceProfile(List<TastingNote> tastings)
    {
        var withWhiskey = tastings.Where(t => t.Whiskey != null).ToList();
        if (withWhiskey.Count == 0) return (5, 5, 5, 5);

        double avgBody = withWhiskey.Average(t => t.Whiskey.BodyProfile - t.BodyDelta);
        double avgSmoke = withWhiskey.Average(t => t.Whiskey.SmokinessProfile - t.SmokeDelta);
        double avgSweet = withWhiskey.Average(t => t.Whiskey.SweetnessProfile - t.SweetDelta);
        double avgAlcohol = withWhiskey.Average(t =>
            (t.Whiskey.AlcoholProfile ??
             Math.Clamp(t.Whiskey.AlcoholPercentage / 10.0, 0, 10)) - t.AlcoholDelta);

        return (
            Math.Clamp(avgBody, 0, 10),
            Math.Clamp(avgSmoke, 0, 10),
            Math.Clamp(avgSweet, 0, 10),
            Math.Clamp(avgAlcohol, 0, 10));
    }

    private static double ComputeContentSimilarity(
        (double body, double smoke, double sweet, double alcohol) pref,
        Whiskey whiskey)
    {
        double alc = whiskey.AlcoholProfile ??
                     Math.Clamp(whiskey.AlcoholPercentage / 10.0, 0, 10);

        double weightedDiff =
            (Math.Abs(pref.smoke - whiskey.SmokinessProfile) / 10.0 * SmokeWeight) +
            (Math.Abs(pref.sweet - whiskey.SweetnessProfile) / 10.0 * SweetWeight) +
            (Math.Abs(pref.body - whiskey.BodyProfile) / 10.0 * BodyWeight) +
            (Math.Abs(pref.alcohol - alc) / 10.0 * AlcoholWeight);

        return 1.0 - weightedDiff;
    }

    private static double ComputeUserSimilarity(
        List<TastingNote> userA, List<TastingNote> userB)
    {
        var commonIds = userA.Select(t => t.WhiskeyId)
            .Intersect(userB.Select(t => t.WhiskeyId))
            .ToList();

        if (commonIds.Count == 0) return 0;

        double maxDist = Math.Sqrt(4 * Math.Pow(10, 2));
        double totalSim = 0;

        foreach (var wid in commonIds)
        {
            var a = userA.First(t => t.WhiskeyId == wid);
            var b = userB.First(t => t.WhiskeyId == wid);

            double dist = Math.Sqrt(
                Math.Pow(a.BodyDelta - b.BodyDelta, 2) +
                Math.Pow(a.SmokeDelta - b.SmokeDelta, 2) +
                Math.Pow(a.SweetDelta - b.SweetDelta, 2) +
                Math.Pow(a.AlcoholDelta - b.AlcoholDelta, 2));

            totalSim += 1.0 - (dist / maxDist);
        }

        return totalSim / commonIds.Count;
    }

    private async Task<List<(Guid userId, double similarity, List<TastingNote> tastings)>>
        FindSimilarUsersAsync(Guid userId, List<TastingNote> userTastings, CancellationToken ct)
    {
        var userTastedIds = userTastings.Select(t => t.WhiskeyId).ToHashSet();

        var overlappingUserIds = await _db.TastingNotes
            .Where(t => t.UserId != userId && userTastedIds.Contains(t.WhiskeyId))
            .Select(t => t.UserId)
            .Distinct()
            .ToListAsync(ct);

        if (overlappingUserIds.Count == 0) return new();

        var allNeighborTastings = await _db.TastingNotes
            .Where(t => overlappingUserIds.Contains(t.UserId))
            .ToListAsync(ct);

        var byUser = allNeighborTastings
            .GroupBy(t => t.UserId)
            .ToDictionary(
                g => g.Key,
                g => g.GroupBy(t => t.WhiskeyId)
                      .Select(wg => wg.OrderByDescending(t => t.TastingDate).First())
                      .ToList());

        var neighbors = new List<(Guid, double, List<TastingNote>)>();
        foreach (var (nid, nTastings) in byUser)
        {
            double sim = ComputeUserSimilarity(userTastings, nTastings);
            if (sim > MinSimilarityThreshold)
                neighbors.Add((nid, sim, nTastings));
        }

        return neighbors
            .OrderByDescending(n => n.Item2)
            .Take(MaxNeighbors)
            .ToList();
    }

    private async Task<Dictionary<Guid, double>> ComputeCollaborativeScoresAsync(
        Guid userId, List<TastingNote> userTastings,
        List<Guid> targetWhiskeyIds, CancellationToken ct)
    {
        var result = new Dictionary<Guid, double>();
        var targetSet = targetWhiskeyIds.ToHashSet();

        var neighbors = await FindSimilarUsersAsync(userId, userTastings, ct);
        if (neighbors.Count == 0) return result;

        var numerator = new Dictionary<Guid, double>();
        var denominator = new Dictionary<Guid, double>();

        foreach (var (_, similarity, neighborTastings) in neighbors)
        {
            foreach (var nt in neighborTastings)
            {
                if (!targetSet.Contains(nt.WhiskeyId)) continue;

                double fit = nt.PersonalFitPercent / 100.0;
                numerator[nt.WhiskeyId] =
                    numerator.GetValueOrDefault(nt.WhiskeyId) + similarity * fit;
                denominator[nt.WhiskeyId] =
                    denominator.GetValueOrDefault(nt.WhiskeyId) + similarity;
            }
        }

        foreach (var (wid, num) in numerator)
        {
            if (denominator.TryGetValue(wid, out var den) && den > 0)
                result[wid] = num / den;
        }

        return result;
    }
}

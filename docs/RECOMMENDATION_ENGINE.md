# Whisk Recommendation Engine - V1

## Overview
The recommendation engine uses a hybrid approach combining collaborative filtering with content-based fallback. It runs entirely on the backend with no external AI services required.

## Unlock Rule
Users must have at least **3 tastings** before recommendations are generated.

## Algorithm

### Step 1: User Taste Vector
For each whisky the user has tasted, we store their latest tasting deltas (body, smoke, sweet, alcohol) on a -5 to +5 scale where 0 = perfect match.

### Step 2: Collaborative Filtering
1. Find other users who have tasted the same whiskies
2. Compute similarity between users based on how similarly they rated shared whiskies
3. Similarity uses Euclidean distance across all 4 delta axes
4. Users with similarity > 0.3 are considered "taste neighbors"
5. Collect high-fit bottles (>= 60% PersonalFitPercent) from taste neighbors
6. Weight these by the neighbor's similarity score

### Step 3: Content-Based Fallback
If collaborative data is insufficient (< 20 candidates):
1. Compute the user's preference profile from their tasting history
2. For each delta axis, if user consistently says "too strong" → they prefer lower levels
3. Compare preference profile against each whisky's flavor profile
4. Use the same weights: Smoke 35%, Sweet 30%, Body 20%, Alcohol 15%

### Step 4: Scoring & Ranking
- Collaborative score = similarity × (neighbor's fit / 100)
- Content score = 1 - weighted_difference
- Both produce 0-100 match percentage
- Top 20 recommendations returned, sorted by score

## Personal Fit Percent
Computed per tasting using closeness-to-zero formula:

```
For each axis: score = 1 - (|delta| / 5)
Weighted: smoke×0.35 + sweet×0.30 + body×0.20 + alcohol×0.15
Result: round(weighted × 100)
```

Direction of deltas matters for recommendations but only magnitude matters for PersonalFitPercent.

## Bottle Match
- If user has tasted the bottle → return latest tasting's PersonalFitPercent
- If user has 3+ tastings but not this bottle → compute predicted match via content similarity
- Otherwise → null (not available)

## V1.5 Future Improvements
- Cache recommendation results with periodic refresh
- Add more sophisticated similarity metrics (cosine similarity)
- Consider tasting recency weighting
- Add "because you liked X" explanations
- A/B test recommendation quality

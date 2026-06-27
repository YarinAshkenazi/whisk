# רכיבים חכמים ואלגוריתמים באפליקציית Whisk

## מבוא קצר

מסמך זה מתאר את כל הרכיבים החכמים, האלגוריתמיים ו-AI באפליקציית Whisk — אפליקציית ויסקי שמאפשרת למשתמשים לגלות, לטעום ולאסוף בקבוקי ויסקי.

הרכיבים החכמים כוללים:
1. **AI Fill** — מילוי אוטומטי של פרטי בקבוק ויסקי באמצעות AI
2. **AI Gift Recommendation** — המלצה חכמה על בקבוק כמתנה
3. **F1 Score** — הערכת איכות אלגוריתם ההמלצות
4. **Hybrid Recommendation Model** — מודל היברידי להתאמת בקבוקים אישית למשתמש

כל הרכיבים הללו נחשבים "חכמים" כי הם משתמשים בבינה מלאכותית (Gemini AI), מודלים סטטיסטיים (Content-Based Filtering, Collaborative Filtering) או מדדים מתמטיים (F1 Score) לשיפור חווית המשתמש.

---

## 1. AI Fill

### מטרה

AI Fill מאפשר לאדמין לייצר אוטומטית את כל הפרטים של בקבוק ויסקי (שם מלא, מותג, גיל, ארץ, אזור, מזקקה, נפח, אחוז אלכוהול, תיאור, פרופיל טעם ומחיר) על ידי הזנת שם הבקבוק בלבד. המערכת שולחת את השם ל-Gemini AI ומקבלת בחזרה JSON מובנה עם כל הנתונים.

### איפה הקוד נמצא

| קובץ | תפקיד |
|-------|--------|
| `mobile/src/screens/admin/AdminEditWhiskeyScreen.js` | כפתור AI Fill ומילוי הטופס |
| `mobile/src/api/admin.js` | קריאת API לשרת |
| `server/Whisk.Api/Controllers/AdminController.cs` | Endpoint שמקבל את הבקשה |
| `server/Whisk.Infrastructure/Services/GeminiWhiskyPrefillService.cs` | שירות ה-AI שבונה prompt ומתקשר ל-Gemini |
| `server/Whisk.Application/Interfaces/IGeminiPrefillService.cs` | Interface וה-DTOs של התוצאה |
| `server/Whisk.Application/DTOs/Dtos.cs` | `AiPrefillRequest`, `AiPrefillResponse` |

### זרימת הפעולה

1. האדמין נכנס למסך Create Whiskey או Edit Whiskey
2. האדמין מזין שם בקבוק (ואופציונלית מותג)
3. האדמין לוחץ על כפתור "AI Fill"
4. הצד הלקוח שולח POST request ל-`/api/admin/whiskies/ai-prefill`
5. השרת מקבל את הבקשה, טוען את רשימת הקטגוריות מ-DB
6. השרת בונה prompt מפורט ושולח ל-Gemini API
7. Gemini מחזיר JSON מובנה עם פרטי הבקבוק
8. השרת מוודא תקינות (Clamp לערכי פרופיל, תיקון מחירים)
9. התוצאה חוזרת ללקוח
10. הלקוח ממלא את שדות הטופס — **ללא שמירה אוטומטית**
11. האדמין בודק, מתקן במידת הצורך ושומר ידנית

### קוד רלוונטי

#### כפתור ו-handler בצד הלקוח (AdminEditWhiskeyScreen.js)

```javascript
const handleAiFill = async () => {
  if (!form.name.trim()) return Alert.alert('Name required', 'Enter a bottle name before using AI Fill.');
  setAiFilling(true);
  try {
    const res = await adminApi.aiPrefill({ bottleName: form.name.trim(), brand: form.brand.trim() || null }, { timeout: 45000 });
    const ai = res.data;
    setForm(prev => ({
      ...prev,
      name: ai.name || prev.name,
      brand: ai.brand || prev.brand,
      age: ai.age != null ? String(ai.age) : '',
      country: ai.country || prev.country,
      region: ai.region || prev.region,
      distillery: ai.distillery || prev.distillery,
      categoryId: ai.categoryId || prev.categoryId,
      volumeML: ai.volumeML ? String(ai.volumeML) : prev.volumeML,
      alcoholPercentage: ai.alcoholPercentage ? String(ai.alcoholPercentage) : prev.alcoholPercentage,
      description: ai.description || prev.description,
      bodyProfile: ai.bodyProfile != null ? String(ai.bodyProfile) : prev.bodyProfile,
      smokinessProfile: ai.smokinessProfile != null ? String(ai.smokinessProfile) : prev.smokinessProfile,
      sweetnessProfile: ai.sweetnessProfile != null ? String(ai.sweetnessProfile) : prev.sweetnessProfile,
      alcoholProfile: ai.alcoholProfile != null ? String(ai.alcoholProfile) : prev.alcoholProfile,
      minMarketPriceIls: ai.minMarketPriceIls ? String(ai.minMarketPriceIls) : prev.minMarketPriceIls,
      maxMarketPriceIls: ai.maxMarketPriceIls ? String(ai.maxMarketPriceIls) : prev.maxMarketPriceIls,
    }));
    playSuccess();
  } catch (e) {
    playError();
    const msg = e.response?.data?.error || e.response?.data?.title || e.message || 'Could not generate details. Please fill the form manually.';
    Alert.alert('AI Fill Failed', msg);
  } finally {
    setAiFilling(false);
  }
};
```

הסבר: הפונקציה בודקת שיש שם בקבוק, שולחת בקשה לשרת עם timeout של 45 שניות, ואם הצליח — ממלאת את כל שדות הטופס עם הנתונים שחזרו מה-AI. בכישלון — מציגה הודעת שגיאה ספציפית.

#### קריאת API (admin.js)

```javascript
aiPrefill: (data, config) => apiClient.post('/admin/whiskies/ai-prefill', data, { timeout: 45000, ...config }),
```

הסבר: שליחת POST request לשרת עם timeout מוגדל של 45 שניות כי Gemini עלול לקחת זמן.

#### שירות AI בשרת (GeminiWhiskyPrefillService.cs)

```csharp
public async Task<GeminiWhiskyResult?> PrefillWhiskyAsync(string bottleName, string? brand, List<string> categoryNames)
{
    var apiKey = _configuration["GEMINI_API_KEY"];
    if (string.IsNullOrWhiteSpace(apiKey))
        throw new InvalidOperationException("GEMINI_API_KEY is not configured");

    var categories = string.Join(", ", categoryNames);
    var brandHint = string.IsNullOrWhiteSpace(brand) ? "unknown" : brand;

    var prompt = $$"""
        You are helping fill a whisky catalog form for a mobile whisky app.
        Return only valid JSON that matches the schema below.
        All text fields must be in English.
        Price fields must be numeric and in Israeli Shekels (NIS).
        ...
        The whisky bottle to look up: {{bottleName}}
        Brand (if known): {{brandHint}}
        Available categories (use the exact name): {{categories}}
        ...
        """;

    var result = await CallGeminiAsync(prompt, apiKey);
    if (result != null) return result;

    _logger.LogWarning("First Gemini attempt returned invalid response, retrying once");
    return await CallGeminiAsync(prompt, apiKey);
}
```

הסבר: השירות בונה prompt מפורט שמכיל את שם הבקבוק, מותג, ורשימת קטגוריות זמינות. ה-prompt מורה ל-Gemini להחזיר JSON מובנה בלבד (ללא markdown). אם הניסיון הראשון נכשל — מנסה פעם נוספת.

#### מודל ה-Gemini API

```
gemini-2.5-flash
```

ה-API נקרא דרך:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

### הסבר הקוד בעברית

1. **הלקוח** שולח את שם הבקבוק והמותג לשרת
2. **השרת** טוען את כל הקטגוריות הקיימות מהדאטאבייס
3. **השרת** בונה prompt שמכיל הנחיות ברורות + schema מדויק של ה-JSON הנדרש
4. **Gemini** מחזיר JSON מלא עם כל פרטי הבקבוק
5. **השרת** מבצע validation: clamp על ערכי פרופיל (0-10), תיקון מחירים שליליים
6. **הלקוח** מקבל את התוצאה ומעדכן את הטופס — בלי לשמור אוטומטית

### מגבלות

- ה-AI עלול להחזיר נתונים לא מדויקים (למשל מחירים ישנים)
- האדמין **חייב** לבדוק ולאשר לפני שמירה
- ה-AI לא שומר ישירות לדאטאבייס
- ה-API דורש מפתח GEMINI_API_KEY תקף וחיוב פעיל
- Timeout של 30 שניות בצד השרת, 45 שניות בצד הלקוח
- במקרה של כישלון — האדמין ממלא ידנית

---

## 2. AI Gift Recommendation / Gift for a Friend

### מטרה

פיצ'ר "Gift for a Friend" עוזר למשתמש למצוא בקבוק ויסקי מושלם כמתנה. המשתמש מזין טווח תקציב ותיאור חופשי, וה-AI בוחר בדיוק בקבוק אחד מתוך הבקבוקים הקיימים בשוק (Market) של האפליקציה.

### איפה הקוד נמצא

| קובץ | תפקיד |
|-------|--------|
| `mobile/src/screens/market/GiftForFriendScreen.js` | מסך המתנה — טופס + תוצאה |
| `mobile/src/api/whiskies.js` | קריאת API — `giftRecommendation` |
| `server/Whisk.Api/Controllers/WhiskiesController.cs` | Endpoint — `POST /api/whiskies/gift-recommendation` |
| `server/Whisk.Infrastructure/Services/GeminiWhiskyPrefillService.cs` | `RecommendGiftAsync` — שליחה ל-Gemini |
| `server/Whisk.Application/Interfaces/IGeminiPrefillService.cs` | `GeminiGiftResult` |
| `server/Whisk.Application/DTOs/Dtos.cs` | `GiftRecommendationRequest`, `GiftRecommendationResponse` |

### זרימת הפעולה

1. המשתמש לוחץ על אייקון המתנה (🎁) במסך Market
2. נפתח מסך "Gift for a Friend"
3. המשתמש מזין: מחיר מינימלי, מחיר מקסימלי, תיאור חופשי
4. לוחץ "Find Gift"
5. הלקוח שולח POST ל-`/api/whiskies/gift-recommendation`
6. השרת טוען את כל בקבוקי ה-Market מה-DB
7. השרת מסנן לפי טווח מחירים (אם יש התאמות)
8. השרת בונה JSON מקוצר של הבקבוקים (עד 80 בקבוקים)
9. השרת שולח prompt ל-Gemini עם הקטלוג + תיאור המשתמש
10. Gemini מחזיר `bottleId` ו-`explanation`
11. השרת **מוודא** שה-bottleId קיים ב-DB
12. אם ה-ID לא נמצא — בוחר את הבקבוק הקרוב ביותר למחיר הממוצע
13. מחזיר DTO עם: שם, מותג, מחיר, הסבר, האם מחוץ לתקציב
14. הלקוח מציג כרטיס תוצאה עם כפתור "View Bottle"

### קוד רלוונטי

#### Endpoint בשרת (WhiskiesController.cs)

```csharp
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
    }

    var avgPrice = (matched.MinMarketPriceIls + matched.MaxMarketPriceIls) / 2;
    bool outsideBudget = avgPrice < request.MinPrice || avgPrice > request.MaxPrice;

    return Ok(new GiftRecommendationResponse(
        matched.Id, matched.Name, matched.Brand, avgPrice,
        matched.ImageUrl, result.Explanation, outsideBudget));
}
```

הסבר: ה-Endpoint מבצע validation, טוען את כל הבקבוקים הפעילים, מסנן לפי תקציב, בונה קטלוג JSON מינימלי, שולח ל-Gemini, מוודא שהבקבוק שנבחר קיים בדאטאבייס, ומחזיר תוצאה נקייה.

#### Prompt ל-Gemini (GeminiWhiskyPrefillService.cs)

```csharp
var prompt = $$"""
    You are a whisky gift advisor for a mobile whisky app.
    A user wants to buy a whisky bottle as a gift.

    User request: {{description}}
    Budget: {{minPrice}} - {{maxPrice}} NIS (Israeli Shekels)

    Available bottles (JSON array):
    {{catalogJson}}

    Choose exactly ONE bottle from the list above that best matches the user's request.
    Consider: mentioned brands, flavor preferences (smoky, sweet, smooth, peated, sherry, etc.),
    occasion, price range, and overall suitability as a gift.

    If no bottle fits perfectly in the budget, choose the closest suitable one.

    Return only valid JSON with exactly these fields:
    {
      "bottleId": "the id field of the chosen bottle",
      "explanation": "2-3 sentences explaining why this bottle is a great gift choice"
    }
    """;
```

הסבר: ה-Prompt נותן ל-Gemini את כל הקונטקסט: תיאור המשתמש, תקציב, ורשימת בקבוקים זמינים. Gemini חייב לבחור **בדיוק בקבוק אחד** מהרשימה ולהסביר למה.

#### DTOs

```csharp
public record GiftRecommendationRequest(decimal MinPrice, decimal MaxPrice, string Description);
public record GiftRecommendationResponse(Guid WhiskeyId, string Name, string Brand, decimal Price, string? ImageUrl, string Explanation, bool IsOutsideBudget);
```

### הסבר הקוד בעברית

- השרת **לא ממציא** בקבוקים — רק בוחר מתוך מה שקיים ב-DB
- אם אין בקבוקים בטווח המחיר — שולח את כל הבקבוקים ל-AI
- אם Gemini מחזיר ID שלא קיים — השרת בוחר fallback (הבקבוק הקרוב ביותר למחיר הממוצע)
- השדה `IsOutsideBudget` מודיע ללקוח אם הבקבוק חורג מהתקציב

### מגבלות

- ה-AI חייב לבחור רק מבקבוקים קיימים — לא יכול להמציא בקבוק
- מוגבל ל-80 בקבוקים בקטלוג שנשלח (ביצועים)
- אם אין בקבוקים כלל — מחזיר הודעת שגיאה ידידותית
- Timeout של 30 שניות בצד השרת
- AI עלול לבחור בקבוק שלא מתאים 100% לתיאור

---

## 3. F1 Score Evaluation

### מטרה

F1 Score מודד את **איכות אלגוריתם ההמלצות**. הוא בודק: האם כשהאלגוריתם חזה שמשתמש יאהב בקבוק — המשתמש באמת אהב אותו? וכשחזה שלא יאהב — באמת לא אהב?

### איפה הקוד נמצא

| קובץ | תפקיד |
|-------|--------|
| `server/Whisk.Api/Controllers/AdminController.cs` | `ComputeF1MetricsAsync` — חישוב |
| `server/Whisk.Application/DTOs/Dtos.cs` | `F1MetricsDto` — DTO |
| `mobile/src/screens/admin/AdminDashboardScreen.js` | כרטיס F1 + מודל פרטים |

### איך המדד מחושב

#### הגדרות

| מונח | משמעות באפליקציה |
|------|-------------------|
| **True Positive (TP)** | האלגוריתם חזה התאמה (≥65%) **וגם** המשתמש באמת אהב (PersonalFitPercent ≥65%) |
| **False Positive (FP)** | האלגוריתם חזה התאמה (≥65%) **אבל** המשתמש לא אהב (<65%) |
| **False Negative (FN)** | האלגוריתם **לא** חזה התאמה (<65%) **אבל** המשתמש אהב (≥65%) |
| **True Negative (TN)** | האלגוריתם **לא** חזה התאמה (<65%) **וגם** המשתמש לא אהב (<65%) |

#### נוסחאות

```
Precision = TP / (TP + FP)
Recall = TP / (TP + FN)
F1 = 2 × Precision × Recall / (Precision + Recall)
```

- **Precision** (דיוק) = מתוך כל הפעמים שהאלגוריתם חזה "יאהב" — כמה באמת אהבו
- **Recall** (כיסוי) = מתוך כל המשתמשים שבאמת אהבו — כמה האלגוריתם הצליח לזהות
- **F1** = הממוצע ההרמוני של Precision ו-Recall

### מה נחשב sample

כל sample הוא **זוג (משתמש, בקבוק)** שבו:
1. למשתמש יש לפחות 4 טעימות ייחודיות
2. המערכת "מחביאה" את הטעימה האחרונה
3. האלגוריתם מנסה לחזות את ה-match score לבקבוק הזה על בסיס 3+ הטעימות הנותרות
4. המערכת משווה את החיזוי ל-PersonalFitPercent האמיתי

שיטה זו נקראת **Leave-One-Out Cross-Validation**.

### קוד רלוונטי

#### חישוב F1 (AdminController.cs)

```csharp
private const int MatchPositiveThreshold = 65;
private const int FeedbackPositiveThreshold = 65;
private const int MinF1Samples = 30;

private async Task<F1MetricsDto> ComputeF1MetricsAsync(IRecommendationService recs)
{
    var usersWithEnoughTastings = await _db.TastingNotes
        .GroupBy(t => t.UserId)
        .Where(g => g.Count() >= 3)
        .Select(g => g.Key)
        .ToListAsync();

    int tp = 0, fp = 0, fn = 0, tn = 0;
    int totalSamples = 0;

    foreach (var userId in usersWithEnoughTastings.Take(50))
    {
        var tastings = await _db.TastingNotes
            .Include(t => t.Whiskey)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.TastingDate)
            .ToListAsync();

        var latestByWhiskey = tastings
            .GroupBy(t => t.WhiskeyId)
            .Select(g => g.First())
            .ToList();

        if (latestByWhiskey.Count < 4) continue;

        var testTasting = latestByWhiskey.First();
        if (latestByWhiskey.Skip(1).Count() < 3) continue;

        var predicted = await recs.GetBottleMatchAsync(userId, testTasting.WhiskeyId);
        if (predicted == null) continue;

        bool predictedPositive = predicted >= MatchPositiveThreshold;
        bool actualPositive = testTasting.PersonalFitPercent >= FeedbackPositiveThreshold;

        if (predictedPositive && actualPositive) tp++;
        else if (predictedPositive && !actualPositive) fp++;
        else if (!predictedPositive && actualPositive) fn++;
        else tn++;

        totalSamples++;
    }

    bool hasEnoughData = totalSamples >= MinF1Samples;

    double? precision = hasEnoughData && (tp + fp > 0) ? Math.Round((double)tp / (tp + fp), 3) : null;
    double? recall = hasEnoughData && (tp + fn > 0) ? Math.Round((double)tp / (tp + fn), 3) : null;
    double? f1 = (precision != null && recall != null && precision + recall > 0)
        ? Math.Round(2.0 * precision.Value * recall.Value / (precision.Value + recall.Value), 3)
        : null;

    return new F1MetricsDto(
        f1, precision, recall,
        tp, fp, fn, tn,
        totalSamples, MinF1Samples,
        MatchPositiveThreshold, FeedbackPositiveThreshold,
        totalSamples > 0 ? DateTime.UtcNow : null);
}
```

הסבר: הקוד עובר על עד 50 משתמשים שיש להם לפחות 3 טעימות. לכל משתמש — הוא "מחביא" את הטעימה האחרונה ושואל את אלגוריתם ההמלצות לחזות match score. אחר כך משווה את החיזוי למציאות. הסף הוא 65% — גם לחיזוי וגם לפידבק אמיתי.

#### DTO

```csharp
public record F1MetricsDto(
    double? F1Score,
    double? Precision,
    double? Recall,
    int TruePositives,
    int FalsePositives,
    int FalseNegatives,
    int TrueNegatives,
    int EvaluatedSamples,
    int MinimumSamplesRequired,
    int PositivePredictionThreshold,
    int PositiveFeedbackThreshold,
    DateTime? LastUpdated);
```

#### קבועים

| קבוע | ערך | משמעות |
|-------|-----|--------|
| `MatchPositiveThreshold` | 65 | סף שמעליו חיזוי נחשב "חיובי" |
| `FeedbackPositiveThreshold` | 65 | סף שמעליו PersonalFitPercent נחשב "אהב" |
| `MinF1Samples` | 30 | מספר דגימות מינימלי לדיווח F1 |

### הסבר הקוד בעברית

- אם יש פחות מ-30 דגימות — הדאשבורד מציג "N/A"
- החישוב מתבצע בזמן אמת בכל טעינת הדאשבורד
- מוגבל ל-50 משתמשים מקסימום לביצועים
- F1 Score של 1.0 (100%) = אלגוריתם מושלם
- F1 Score של 0 = אלגוריתם גרוע לחלוטין

### מגבלות

- F1 אינו אמין עם פחות מ-30 דגימות
- המדד מוגבל ל-50 משתמשים (ביצועים)
- חישוב Leave-One-Out לא מתחשב בכל הנתונים בו-זמנית
- הסף של 65% הוא קבוע ולא מותאם אוטומטית
- תלוי באיכות הנתונים — משתמשים שנותנים פידבק לא מדויק ישפיעו

---

## 4. Hybrid Recommendation Model

### מטרה

מודל ההמלצות ההיברידי מחשב **אחוז התאמה (Match %)** לכל בקבוק בשוק עבור כל משתמש. הוא משלב שתי גישות:
1. **Content-Based Filtering** — התאמה לפי פרופיל הטעם האישי
2. **Collaborative Filtering** — התאמה לפי משתמשים עם טעם דומה

### איפה הקוד נמצא

| קובץ | תפקיד |
|-------|--------|
| `server/Whisk.Infrastructure/Services/RecommendationService.cs` | כל הלוגיקה של המודל |
| `server/Whisk.Application/Interfaces/IRecommendationService.cs` | Interface |
| `server/Whisk.Api/Controllers/WhiskiesController.cs` | שימוש ב-`GetBatchBottleMatchesAsync` |
| `server/Whisk.Api/Controllers/RecommendationsController.cs` | API המלצות |
| `server/Whisk.Domain/Services/PersonalFitCalculator.cs` | חישוב PersonalFitPercent לטעימות |

### איך האלגוריתם עובד

#### שלב 1: בדיקת תנאי מינימום

המשתמש צריך **לפחות 3 טעימות ייחודיות** (3 בקבוקים שונים) כדי לקבל המלצות. מתחת לכך — מוחזר `null` (אין מספיק נתונים).

#### שלב 2: בקבוקים שנטעמו

אם המשתמש כבר טעם בקבוק — מוחזר `PersonalFitPercent` שחושב בזמן הטעימה (לא חיזוי — מדידה אמיתית).

#### שלב 3: חישוב פרופיל טעם אישי (Content-Based)

```csharp
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
```

הסבר: הנוסחה למציאת הטעם האידיאלי של המשתמש:

```
UserIdeal[param] = ממוצע(BottleProfile[param] - UserDelta[param])
```

כלומר: אם בקבוק עם Body=8 והמשתמש נתן BodyDelta=+2 (אומר שזה יותר מדי), אז האידיאל שלו הוא 8-2=6. הממוצע על פני כל הטעימות נותן את הפרופיל האידיאלי.

#### שלב 4: חישוב Content Similarity

```csharp
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
```

הסבר: מחשב את המרחק המשוקלל בין פרופיל הטעם האידיאלי של המשתמש לבין פרופיל הבקבוק. ככל שהמרחק קטן יותר — ההתאמה גבוהה יותר (קרוב ל-1.0).

#### משקולות הפרמטרים

| פרמטר | משקל | הסבר |
|--------|------|------|
| Smokiness (עשניות) | 0.35 (35%) | המשקל הגבוה ביותר — עשניות היא המאפיין הכי מבדל |
| Sweetness (מתיקות) | 0.30 (30%) | מתיקות היא המאפיין השני בחשיבות |
| Body (גוף) | 0.20 (20%) | גוף/משקל הוא פחות מבדל |
| Alcohol (אלכוהול) | 0.15 (15%) | תחושת האלכוהול היא הכי פחות מבדלת |

#### שלב 5: Collaborative Filtering — מציאת משתמשים דומים

```csharp
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
```

הסבר: הדמיון בין שני משתמשים נמדד באמצעות **Euclidean Distance** על ה-Deltas שלהם בבקבוקים משותפים. אם שני משתמשים הרגישו אותו דבר באותם בקבוקים — הם "דומים". סף מינימום לדמיון: 0.3.

#### שלב 6: Collaborative Score

```csharp
private async Task<Dictionary<Guid, double>> ComputeCollaborativeScoresAsync(
    Guid userId, List<TastingNote> userTastings,
    List<Guid> targetWhiskeyIds, CancellationToken ct)
{
    var neighbors = await FindSimilarUsersAsync(userId, userTastings, ct);
    if (neighbors.Count == 0) return result;

    foreach (var (_, similarity, neighborTastings) in neighbors)
    {
        foreach (var nt in neighborTastings)
        {
            if (!targetSet.Contains(nt.WhiskeyId)) continue;

            double fit = nt.PersonalFitPercent / 100.0;
            numerator[nt.WhiskeyId] += similarity * fit;
            denominator[nt.WhiskeyId] += similarity;
        }
    }

    // result[wid] = weighted average of neighbors' PersonalFitPercent
}
```

הסבר: עבור כל בקבוק שהמשתמש לא טעם — המערכת בודקת אם "שכנים" (משתמשים דומים) טעמו אותו. אם כן — מחשבת ממוצע משוקלל של ה-PersonalFitPercent שלהם (משוקלל לפי כמה הם דומים).

#### שלב 7: שילוב הציונים (Hybrid)

```csharp
var cScore = contentScores[wid];
double finalScore;

if (collabScores.TryGetValue(wid, out var collab) && collab >= 0)
    finalScore = (ContentWeight * cScore) + (CollabWeight * collab);
else
    finalScore = cScore;

result[wid] = (int)Math.Round(Math.Clamp(finalScore * 100, 0, 100));
```

**משקולות השילוב:**

| רכיב | משקל |
|------|------|
| Content-Based | 70% |
| Collaborative | 30% |

אם אין נתוני collaborative (אין שכנים שטעמו את הבקבוק) — המערכת משתמשת ב-100% content-based.

#### קבועים

```csharp
private const int MinTastingsRequired = 3;      // מינימום טעימות להפעלת המודל
private const int MaxRecommendations = 20;       // מקסימום המלצות
private const double ContentWeight = 0.70;       // משקל Content-Based
private const double CollabWeight = 0.30;        // משקל Collaborative
private const double MinSimilarityThreshold = 0.3; // סף מינימלי לדמיון
private const int MaxNeighbors = 10;             // מקסימום שכנים
```

### הסבר הקוד בעברית

1. **עבור בקבוקים שנטעמו** — מוחזר הציון האמיתי (PersonalFitPercent)
2. **עבור בקבוקים שלא נטעמו** (עם 3+ טעימות):
   - מחושב פרופיל טעם אישי (BottleProfile - Delta ממוצע)
   - מחושבת קרבה לכל בקבוק (Content Similarity)
   - נמצאים משתמשים דומים (Euclidean Distance על deltas משותפים)
   - מחושב ציון collaborative (ממוצע משוקלל של הדירוגים שלהם)
   - שני הציונים משולבים: 70% content + 30% collaborative
   - התוצאה מומרת לאחוז 0-100%

### מגבלות

- **בעיית Cold Start**: צריך לפחות 3 טעימות — משתמש חדש לא מקבל המלצות
- **Cold Start ב-Collaborative**: אם למשתמש אין בקבוקים משותפים עם אחרים — אין collaborative
- **משקולות קבועות**: 70/30 לא מותאם אוטומטית (יכול להיות שלמשתמשים מסוימים collaborative מדויק יותר)
- **מוגבל ל-10 שכנים**: אם יש 100 משתמשים דומים — רק 10 הדומים ביותר משפיעים
- **איכות הנתונים**: פידבק לא מדויק של משתמשים ישפיע על כל המודל
- **ביצועים**: `GetBatchBottleMatchesAsync` טוען את כל הטעימות בפעם אחת (Batch) כדי למנוע N+1 queries

---

## סיכום

הרכיבים החכמים באפליקציית Whisk עובדים יחד:

1. **AI Fill** — עוזר לאדמינים ליצור נתוני בקבוקים במהירות, ובכך מגדיל את הקטלוג
2. **AI Gift Recommendation** — עוזר למשתמשים לבחור מתנה מתוך הבקבוקים הקיימים
3. **Hybrid Recommendation** — נותן לכל משתמש אחוז התאמה אישי לכל בקבוק בשוק
4. **F1 Score** — מאפשר לאדמין לראות כמה המלצות האלגוריתם מדויקות

כל הרכיבים מבוססי AI משתמשים באותו שירות (`GeminiWhiskyPrefillService`) ובאותו מודל (`gemini-2.5-flash`). מודל ההמלצות ו-F1 Score הם **דטרמיניסטיים** ולא משתמשים ב-AI — הם מבוססים על חישובים מתמטיים בלבד.

---

## קבצי מקור שנסרקו

### שרת (Backend - .NET)
- `server/Whisk.Infrastructure/Services/GeminiWhiskyPrefillService.cs`
- `server/Whisk.Infrastructure/Services/RecommendationService.cs`
- `server/Whisk.Application/Interfaces/IGeminiPrefillService.cs`
- `server/Whisk.Application/Interfaces/IRecommendationService.cs`
- `server/Whisk.Application/DTOs/Dtos.cs`
- `server/Whisk.Api/Controllers/AdminController.cs`
- `server/Whisk.Api/Controllers/WhiskiesController.cs`
- `server/Whisk.Api/Controllers/RecommendationsController.cs`
- `server/Whisk.Domain/Services/PersonalFitCalculator.cs`
- `server/Whisk.Infrastructure/DependencyInjection.cs`

### לקוח (Mobile - React Native/Expo)
- `mobile/src/screens/admin/AdminEditWhiskeyScreen.js`
- `mobile/src/screens/admin/AdminDashboardScreen.js`
- `mobile/src/screens/market/GiftForFriendScreen.js`
- `mobile/src/screens/market/MarketScreen.js`
- `mobile/src/api/admin.js`
- `mobile/src/api/whiskies.js`
- `mobile/src/hooks/useApi.js`

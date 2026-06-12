using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Whisk.Application.Interfaces;

namespace Whisk.Infrastructure.Services;

public class GeminiWhiskyPrefillService : IGeminiPrefillService
{
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(30) };
    private readonly IConfiguration _configuration;
    private readonly ILogger<GeminiWhiskyPrefillService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        NumberHandling = JsonNumberHandling.AllowReadingFromString,
    };

    public GeminiWhiskyPrefillService(IConfiguration configuration, ILogger<GeminiWhiskyPrefillService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<GeminiWhiskyResult?> PrefillWhiskyAsync(string bottleName, string? brand, List<string> categoryNames)
    {
        var apiKey = _configuration["GEMINI_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogError("GEMINI_API_KEY is not found in configuration");
            throw new InvalidOperationException("GEMINI_API_KEY is not configured");
        }

        var categories = string.Join(", ", categoryNames);
        var brandHint = string.IsNullOrWhiteSpace(brand) ? "unknown" : brand;

        var prompt = $$"""
            You are helping fill a whisky catalog form for a mobile whisky app.
            Return only valid JSON that matches the schema below.
            All text fields must be in English.
            Price fields must be numeric and in Israeli Shekels (NIS).
            Do not include markdown, code fences, or explanations outside the JSON.
            If you are uncertain about a field, use null.
            Do not invent fake data — use known whisky catalog information.

            The whisky bottle to look up: {{bottleName}}
            Brand (if known): {{brandHint}}

            Available categories (use the exact name): {{categories}}

            Return a JSON object with exactly these fields:
            {
              "name": "string - full official bottle name",
              "brand": "string - brand or producer name",
              "age": number or null - age statement in years (null if NAS / no age statement),
              "country": "string - country of origin (e.g. Scotland, Japan, Ireland, USA)",
              "region": "string - whisky region (e.g. Speyside, Islay, Highland, Lowland, Campbeltown)",
              "distillery": "string - distillery name",
              "categoryName": "string - must be one of: {{categories}}",
              "volumeML": number - standard bottle volume in milliliters (usually 700),
              "alcoholPercentage": number - ABV as a percentage (e.g. 40.0, 46.0),
              "description": "string - 2-3 sentence English description of the whisky character, nose, palate and finish",
              "bodyProfile": number 0-10 - body/weight (0=very light, 10=very full-bodied),
              "smokinessProfile": number 0-10 - smokiness/peat level (0=no smoke, 10=heavily peated),
              "sweetnessProfile": number 0-10 - sweetness level (0=very dry, 10=very sweet),
              "alcoholProfile": number 0-10 or null - perceived alcohol heat (null to auto-calculate from ABV),
              "minMarketPriceIls": number - minimum market price in Israeli Shekels,
              "maxMarketPriceIls": number - maximum market price in Israeli Shekels
            }
            """;

        var result = await CallGeminiAsync(prompt, apiKey);
        if (result != null) return result;

        _logger.LogWarning("First Gemini attempt returned invalid response, retrying once");
        return await CallGeminiAsync(prompt, apiKey);
    }

    private async Task<GeminiWhiskyResult?> CallGeminiAsync(string prompt, string apiKey)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                responseMimeType = "application/json"
            }
        };

        try
        {
            var response = await Http.PostAsJsonAsync(url, requestBody);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Gemini API returned {Status}: {Body}", response.StatusCode, errorBody);
                throw new InvalidOperationException($"Gemini API error ({response.StatusCode}): {errorBody}");
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var text = json
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(text))
            {
                _logger.LogWarning("Gemini returned empty text");
                return null;
            }

            var cleaned = text.Trim();
            if (cleaned.StartsWith("```"))
            {
                var firstNewline = cleaned.IndexOf('\n');
                var lastFence = cleaned.LastIndexOf("```");
                if (firstNewline > 0 && lastFence > firstNewline)
                    cleaned = cleaned[(firstNewline + 1)..lastFence].Trim();
            }

            var result = JsonSerializer.Deserialize<GeminiWhiskyResult>(cleaned, JsonOptions);
            if (result == null || string.IsNullOrWhiteSpace(result.Name))
            {
                _logger.LogWarning("Gemini response deserialized to null or missing Name");
                return null;
            }

            result.BodyProfile = Math.Clamp(result.BodyProfile, 0, 10);
            result.SmokinessProfile = Math.Clamp(result.SmokinessProfile, 0, 10);
            result.SweetnessProfile = Math.Clamp(result.SweetnessProfile, 0, 10);
            if (result.AlcoholProfile.HasValue)
                result.AlcoholProfile = Math.Clamp(result.AlcoholProfile.Value, 0, 10);
            if (result.MinMarketPriceIls < 0) result.MinMarketPriceIls = 0;
            if (result.MaxMarketPriceIls < result.MinMarketPriceIls)
                result.MaxMarketPriceIls = result.MinMarketPriceIls;

            return result;
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse Gemini JSON response");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini API call failed");
            return null;
        }
    }
}

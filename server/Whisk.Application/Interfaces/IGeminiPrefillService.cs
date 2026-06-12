namespace Whisk.Application.Interfaces;

public interface IGeminiPrefillService
{
    Task<GeminiWhiskyResult?> PrefillWhiskyAsync(string bottleName, string? brand, List<string> categoryNames);
}

public class GeminiWhiskyResult
{
    public string Name { get; set; } = "";
    public string Brand { get; set; } = "";
    public int? Age { get; set; }
    public string Country { get; set; } = "";
    public string Region { get; set; } = "";
    public string Distillery { get; set; } = "";
    public string CategoryName { get; set; } = "";
    public int VolumeML { get; set; } = 700;
    public double AlcoholPercentage { get; set; }
    public string Description { get; set; } = "";
    public double BodyProfile { get; set; }
    public double SmokinessProfile { get; set; }
    public double SweetnessProfile { get; set; }
    public double? AlcoholProfile { get; set; }
    public decimal MinMarketPriceIls { get; set; }
    public decimal MaxMarketPriceIls { get; set; }
}

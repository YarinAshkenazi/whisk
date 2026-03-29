namespace Whisk.Domain.Entities;

public class Whiskey
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public int? Age { get; set; }
    public string Country { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string Distillery { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int VolumeML { get; set; }
    public double AlcoholPercentage { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double BodyProfile { get; set; }
    public double SmokinessProfile { get; set; }
    public double SweetnessProfile { get; set; }
    public double? AlcoholProfile { get; set; }
    public decimal MinMarketPriceIls { get; set; }
    public decimal MaxMarketPriceIls { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public WhiskeyCategory Category { get; set; } = null!;
    public ICollection<CollectionItem> CollectionItems { get; set; } = new List<CollectionItem>();
    public ICollection<TastingNote> TastingNotes { get; set; } = new List<TastingNote>();
}

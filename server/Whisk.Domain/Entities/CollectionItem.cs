namespace Whisk.Domain.Entities;

public class CollectionItem
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid WhiskeyId { get; set; }
    public decimal? PurchasePriceIls { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public Enums.CollectionStatus Status { get; set; } = Enums.CollectionStatus.Closed;
    public string Notes { get; set; } = string.Empty;
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Whiskey Whiskey { get; set; } = null!;
}

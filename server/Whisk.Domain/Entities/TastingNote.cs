namespace Whisk.Domain.Entities;

public class TastingNote
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid WhiskeyId { get; set; }
    public DateTime TastingDate { get; set; }
    public bool IsOwned { get; set; }
    public string? Notes { get; set; }
    public int BodyDelta { get; set; }
    public int SmokeDelta { get; set; }
    public int SweetDelta { get; set; }
    public int AlcoholDelta { get; set; }
    public int PersonalFitPercent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Whiskey Whiskey { get; set; } = null!;
}

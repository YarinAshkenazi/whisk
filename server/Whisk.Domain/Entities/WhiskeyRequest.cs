namespace Whisk.Domain.Entities;

public class WhiskeyRequest
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string? Details { get; set; }
    public Enums.WhiskeyRequestStatus Status { get; set; } = Enums.WhiskeyRequestStatus.Pending;
    public string? AdminNotes { get; set; }
    public Guid? ApprovedWhiskeyId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Whiskey? ApprovedWhiskey { get; set; }
}

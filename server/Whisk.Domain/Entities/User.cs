namespace Whisk.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Nickname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string Country { get; set; } = string.Empty;
    public Enums.AuthProvider AuthProvider { get; set; }
    public string AuthProviderUserId { get; set; } = string.Empty;
    public Enums.UserRole Role { get; set; } = Enums.UserRole.User;
    public int BarrelLevel { get; set; }
    public bool HasAcceptedTerms { get; set; }
    public bool IsOver18 { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsOnboardingComplete { get; set; }
    public string? ExpoPushToken { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    public ICollection<CollectionItem> CollectionItems { get; set; } = new List<CollectionItem>();
    public ICollection<TastingNote> TastingNotes { get; set; } = new List<TastingNote>();
    public ICollection<WhiskeyRequest> WhiskeyRequests { get; set; } = new List<WhiskeyRequest>();
}

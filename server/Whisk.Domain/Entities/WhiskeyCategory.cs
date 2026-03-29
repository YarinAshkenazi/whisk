namespace Whisk.Domain.Entities;

public class WhiskeyCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Whiskey> Whiskies { get; set; } = new List<Whiskey>();
}

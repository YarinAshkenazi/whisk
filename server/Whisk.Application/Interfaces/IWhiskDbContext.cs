using Microsoft.EntityFrameworkCore;
using Whisk.Domain.Entities;

namespace Whisk.Application.Interfaces;

public interface IWhiskDbContext
{
    DbSet<User> Users { get; }
    DbSet<Whiskey> Whiskies { get; }
    DbSet<WhiskeyCategory> WhiskeyCategories { get; }
    DbSet<CollectionItem> CollectionItems { get; }
    DbSet<TastingNote> TastingNotes { get; }
    DbSet<WhiskeyRequest> WhiskeyRequests { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

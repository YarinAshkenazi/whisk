using Microsoft.EntityFrameworkCore;
using Whisk.Application.Interfaces;
using Whisk.Domain.Entities;
using Whisk.Domain.Enums;

namespace Whisk.Infrastructure.Persistence;

public class WhiskDbContext : DbContext, IWhiskDbContext
{
    public WhiskDbContext(DbContextOptions<WhiskDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Whiskey> Whiskies => Set<Whiskey>();
    public DbSet<WhiskeyCategory> WhiskeyCategories => Set<WhiskeyCategory>();
    public DbSet<CollectionItem> CollectionItems => Set<CollectionItem>();
    public DbSet<TastingNote> TastingNotes => Set<TastingNote>();
    public DbSet<WhiskeyRequest> WhiskeyRequests => Set<WhiskeyRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => new { u.AuthProvider, u.AuthProviderUserId }).IsUnique();
            e.Property(u => u.Nickname).HasMaxLength(50);
            e.Property(u => u.Email).HasMaxLength(256);
            e.Property(u => u.Country).HasMaxLength(100);
            e.Property(u => u.AuthProviderUserId).HasMaxLength(256);
            e.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
            e.Property(u => u.AuthProvider).HasConversion<string>().HasMaxLength(20);
        });

        // WhiskeyCategory
        modelBuilder.Entity<WhiskeyCategory>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).ValueGeneratedNever();
            e.Property(c => c.Name).HasMaxLength(100);
            e.HasIndex(c => c.Name).IsUnique();
        });

        // Whiskey
        modelBuilder.Entity<Whiskey>(e =>
        {
            e.HasKey(w => w.Id);
            e.Property(w => w.Name).HasMaxLength(200);
            e.Property(w => w.Brand).HasMaxLength(200);
            e.Property(w => w.Country).HasMaxLength(100);
            e.Property(w => w.Region).HasMaxLength(100);
            e.Property(w => w.Distillery).HasMaxLength(200);
            e.Property(w => w.ImageUrl).HasMaxLength(500);
            e.Property(w => w.Description).HasMaxLength(2000);
            e.Property(w => w.MinMarketPriceIls).HasColumnType("decimal(10,2)");
            e.Property(w => w.MaxMarketPriceIls).HasColumnType("decimal(10,2)");
            e.HasIndex(w => w.Name);
            e.HasIndex(w => w.Brand);
            e.HasIndex(w => w.Country);
            e.HasIndex(w => w.CategoryId);
            e.HasOne(w => w.Category).WithMany(c => c.Whiskies).HasForeignKey(w => w.CategoryId);
        });

        // CollectionItem
        modelBuilder.Entity<CollectionItem>(e =>
        {
            e.HasKey(ci => ci.Id);
            e.Property(ci => ci.PurchasePriceIls).HasColumnType("decimal(10,2)");
            e.Property(ci => ci.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(ci => ci.Notes).HasMaxLength(1000);
            e.HasIndex(ci => ci.UserId);
            e.HasIndex(ci => new { ci.UserId, ci.WhiskeyId });
            e.HasOne(ci => ci.User).WithMany(u => u.CollectionItems).HasForeignKey(ci => ci.UserId);
            e.HasOne(ci => ci.Whiskey).WithMany(w => w.CollectionItems).HasForeignKey(ci => ci.WhiskeyId);
        });

        // TastingNote
        modelBuilder.Entity<TastingNote>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Notes).HasMaxLength(2000);
            e.HasIndex(t => t.UserId);
            e.HasIndex(t => new { t.UserId, t.WhiskeyId });
            e.HasOne(t => t.User).WithMany(u => u.TastingNotes).HasForeignKey(t => t.UserId);
            e.HasOne(t => t.Whiskey).WithMany(w => w.TastingNotes).HasForeignKey(t => t.WhiskeyId);
        });

        // WhiskeyRequest
        modelBuilder.Entity<WhiskeyRequest>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Name).HasMaxLength(200);
            e.Property(r => r.Brand).HasMaxLength(200);
            e.Property(r => r.Details).HasMaxLength(1000);
            e.Property(r => r.AdminNotes).HasMaxLength(1000);
            e.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(r => r.UserId);
            e.HasOne(r => r.User).WithMany(u => u.WhiskeyRequests).HasForeignKey(r => r.UserId);
            e.HasOne(r => r.ApprovedWhiskey).WithMany().HasForeignKey(r => r.ApprovedWhiskeyId).IsRequired(false);
        });
    }
}

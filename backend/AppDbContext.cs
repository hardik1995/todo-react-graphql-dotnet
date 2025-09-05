using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend;

/// <summary>
/// Application's database context. Handles persistence of tasks.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    /// <summary>
    /// Tasks table
    /// </summary>
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    /// <summary>
    /// Override SaveChangesAsync to update timestamps
    /// </summary>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<TaskItem>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
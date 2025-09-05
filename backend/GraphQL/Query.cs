using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.GraphQL;

/// <summary>
/// GraphQL root query definitions
/// </summary>
public class Query
{
    /// <summary>
    /// Fetch all tasks from the database.
    /// </summary>
    public async Task<List<TaskItem>> GetAllTasks([Service] AppDbContext db)
    {
        return await db.Tasks
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }
}
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

/// <summary>
/// Entity representing a single task.
/// </summary>
public class TaskItem
{
    /// <summary>
    /// Primary key identifier
    /// </summary>
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Title of the task
    /// </summary>
    [Required, MaxLength(200)]
    public string Title { get; set; } = default!;

    /// <summary>
    /// Optional description for the task
    /// </summary>
    [MaxLength(2000)]
    public string? Description { get; set; }

    /// <summary>
    /// Current status of the task
    /// </summary>
    public TaskStatus Status { get; set; } = TaskStatus.Pending;

    /// <summary>
    /// Timestamp when the task was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the task was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
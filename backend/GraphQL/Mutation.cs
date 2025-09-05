using Backend.Models;
using HotChocolate;
using HotChocolate.Subscriptions;
using Microsoft.EntityFrameworkCore;
using TaskStatus = Backend.Models.TaskStatus;

namespace Backend.GraphQL;

/// <summary>
/// Input type for creating a new task
/// </summary>
public record CreateTaskInput(string Title, string? Description);

/// <summary>
/// Input type for updating a task's status
/// </summary>
public record UpdateTaskStatusInput(Guid Id, TaskStatus Status);

/// <summary>
/// Input type for deleting a task
/// </summary>
public record DeleteTaskInput(Guid Id);

/// <summary>
/// GraphQL root mutation definitions
/// </summary>
public class Mutation
{
    /// <summary>
    /// Create a new task and broadcast via subscription
    /// </summary>
    public async Task<TaskItem> CreateTask(
        CreateTaskInput input,
        [Service] AppDbContext db,
        [Service] ITopicEventSender sender,
        CancellationToken cancellationToken)
    {
        var task = new TaskItem
        {
            Title = input.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(input.Description) ? null : input.Description,
            Status = TaskStatus.Pending
        };

        db.Tasks.Add(task);
        await db.SaveChangesAsync(cancellationToken);

        // notify subscribers
        await sender.SendAsync(nameof(Subscription.OnTaskAdded), task, cancellationToken);
        return task;
    }

    /// <summary>
    /// Update the status of a task and broadcast via subscription
    /// </summary>
    public async Task<TaskItem> UpdateTaskStatus(
        UpdateTaskStatusInput input,
        [Service] AppDbContext db,
        [Service] ITopicEventSender sender,
        CancellationToken cancellationToken)
    {
        var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == input.Id, cancellationToken);
        if (task is null)
        {
            throw new GraphQLException(ErrorBuilder.New()
                .SetMessage("Task not found.")
                .SetCode("TASK_NOT_FOUND")
                .Build());
        }

        task.Status = input.Status;
        await db.SaveChangesAsync(cancellationToken);

        // notify subscribers
        await sender.SendAsync(nameof(Subscription.OnTaskUpdated), task, cancellationToken);
        return task;
    }

    /// <summary>
    /// Delete a task and broadcast via subscription
    /// </summary>
    public async Task<bool> DeleteTask(
        DeleteTaskInput input,
        [Service] AppDbContext db,
        [Service] ITopicEventSender sender,
        CancellationToken cancellationToken)
    {
        var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == input.Id, cancellationToken);
        if (task is null)
        {
            throw new GraphQLException(ErrorBuilder.New()
                .SetMessage("Task not found.")
                .SetCode("TASK_NOT_FOUND")
                .Build());
        }

        db.Tasks.Remove(task);
        await db.SaveChangesAsync(cancellationToken);

        // notify subscribers
        await sender.SendAsync(nameof(Subscription.OnTaskDeleted), task, cancellationToken);
        return true;
    }
}
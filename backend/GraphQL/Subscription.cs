
using Backend.Models;
using HotChocolate;
using HotChocolate.Types;

namespace Backend.GraphQL;

/// <summary>
/// GraphQL subscription definitions for realtime updates
/// </summary>
public class Subscription
{
    /// <summary>
    /// Subscription triggered when a new task is added
    /// </summary>
    [Subscribe]
    [Topic]
    public TaskItem OnTaskAdded([EventMessage] TaskItem task) => task;

    /// <summary>
    /// Subscription triggered when a task is updated
    /// </summary>
    [Subscribe]
    [Topic]
    public TaskItem OnTaskUpdated([EventMessage] TaskItem task) => task;

    /// <summary>
    /// Subscription triggered when a task is deleted
    /// </summary>
    [Subscribe]
    [Topic]
    public TaskItem OnTaskDeleted([EventMessage] TaskItem task) => task;
}
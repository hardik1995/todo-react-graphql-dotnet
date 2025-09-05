using Backend;
using Backend.GraphQL;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure database context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// Configure GraphQL services
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddSubscriptionType<Subscription>()
    .AddInMemorySubscriptions()
    .ModifyRequestOptions(opts => opts.IncludeExceptionDetails = true);

// Allow any origin for development purposes
builder.Services.AddCors(policy =>
    policy.AddDefaultPolicy(p => p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()));

var app = builder.Build();

// Enable WebSockets for subscriptions
app.UseWebSockets();
app.UseCors();

// Map the GraphQL endpoint
app.MapGraphQL("/graphql");

// Redirect root to GraphQL IDE
app.MapGet("/", () => Results.Redirect("/graphql"));

// Ensure database exists
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.Run();
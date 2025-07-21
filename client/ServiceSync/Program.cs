using Microsoft.Data.Sqlite;
using ServiceSync;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<SyncService>();

// Add services to the container.

var app = builder.Build();

var syncService = app.Services.GetRequiredService<SyncService>();
syncService.Start();

// Configure the HTTP request pipeline.

app.MapGet("/", async (HttpContext context) =>
{
    return Results.Ok(new
    {
        status = "ok"
    });
});

app.MapPost("/updateserver", async (HttpContext context) =>
{
    var body = await JsonSerializer.DeserializeAsync<Dictionary<string, string>>(context.Request.Body);
    if (body == null || !body.TryGetValue("server_ip", out var serverIp))
        return Results.BadRequest("server_ip required");

    body.TryGetValue("client_mac", out var clientMac);

    syncService.UpdateSysParam("server_ip", serverIp);
    syncService.UpdateSysParam("client_mac", clientMac ?? "");

    syncService.Log($"Update sys_param server_ip ke {serverIp}, dengan mac {clientMac}");
    return Results.Ok(new { success = true });
});


app.Run("http://0.0.0.0:5771");
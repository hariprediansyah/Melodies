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
    try
    {
        using var reader = new StreamReader(context.Request.Body);
        var rawBody = await reader.ReadToEndAsync();
        syncService.Log($"Raw request body: {rawBody}");

        var body = JsonSerializer.Deserialize<Dictionary<string, string>>(rawBody);

        if (body == null || !body.TryGetValue("server_ip", out var serverIp))
            return Results.BadRequest("server_ip required");

        body.TryGetValue("client_mac", out var clientMac);
        body.TryGetValue("client_room_name", out var clientRoomName);
        body.TryGetValue("client_room_id", out var clientRoomId);

        syncService.UpdateSysParam("server_ip", serverIp);
        syncService.UpdateSysParam("client_mac", clientMac ?? "");
        syncService.UpdateSysParam("client_room_name", clientRoomName ?? "");
        syncService.UpdateSysParam("client_room_id", clientRoomId ?? "");

        syncService.Log($"Update sys_param server_ip ke {serverIp}, dengan mac {clientMac}");
        return Results.Ok(new { success = true });
    }
    catch (Exception ex)
    {
        syncService.Log($"Error updating server: {ex.Message}");
        return Results.Problem("Internal Server Error", statusCode: 500);
    }
});


app.Run("http://0.0.0.0:5771");
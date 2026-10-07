using FactoryFPT.Application;
using FactoryFPT.Domain;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FactoryFPT.Infrastructure;

public sealed class SampleProcessingWorker(
    IServiceScopeFactory scopes,
    ISampleQueue queue,
    IHubContext<SensorHub> hub,
    ILogger<SampleProcessingWorker> log) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var queued in queue.ReadAllAsync(stoppingToken))
        {
            try
            {
                using var scope = scopes.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var sessionId = queued.SessionId;
                var batch = queued.Samples;

                if (sessionId == Guid.Empty || batch.Count == 0)
                    continue;

                var entities = batch.Select(x => new SensorSample
                {
                    SessionId = sessionId,
                    SensorId = x.SensorId,
                    TimestampUtc = x.TimestampUtc,
                    ForceN = x.ForceN,
                    AngleDeg = x.AngleDeg,
                    PositionX = x.PositionX,
                    PositionY = x.PositionY,
                    PositionZ = x.PositionZ
                }).ToList();

                await db.SensorSamples.AddRangeAsync(entities, stoppingToken);
                await db.SaveChangesAsync(stoppingToken);

                await hub.Clients
                    .Group($"session:{sessionId}")
                    .SendAsync("sensorBatch", batch, stoppingToken);

                var maxForce = batch.Max(x => x.ForceN);
                if (maxForce > 500)
                {
                    var alertMessage = $"Force {maxForce:F2} N exceeded 500 N.";

                    db.Alerts.Add(new Alert
                    {
                        SessionId = sessionId,
                        Code = "FORCE_HIGH",
                        Message = alertMessage
                    });

                    await db.SaveChangesAsync(stoppingToken);

                    await hub.Clients
                        .Group($"session:{sessionId}")
                        .SendAsync("alert", new
                        {
                            Code = "FORCE_HIGH",
                            Message = alertMessage
                        }, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Sensor batch processing failed for session: {SessionId}", queued.SessionId);
            }
        }
    }
}
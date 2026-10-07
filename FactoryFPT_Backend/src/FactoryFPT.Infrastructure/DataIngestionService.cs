using FactoryFPT.Application;
using FactoryFPT.Domain;
using Microsoft.EntityFrameworkCore;

namespace FactoryFPT.Infrastructure;

public sealed class DataIngestionService(AppDbContext db, ISampleQueue queue) : IDataIngestionService
{
    public async Task<SessionDto> CreateSessionAsync(CreateSessionRequest request, CancellationToken ct)
    {
        var device = await db.Devices
            .SingleOrDefaultAsync(x => x.DeviceCode == request.DeviceCode && x.IsActive, ct)
            ?? throw new KeyNotFoundException($"Device '{request.DeviceCode}' not found.");

        var entity = new Session
        {
            Id = Guid.NewGuid(),
            SessionCode = $"S-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            DeviceId = device.Id,
            OperatorCode = request.OperatorCode,
            StartTimeUtc = DateTime.UtcNow,
            Status = SessionStatus.Recording
        };

        db.Sessions.Add(entity);
        await db.SaveChangesAsync(ct);

        return ToDto(entity, device.DeviceCode);
    }

    public async Task IngestBatchAsync(SensorBatchRequest request, CancellationToken ct)
    {
        var exists = await db.Sessions
            .AnyAsync(x => x.Id == request.SessionId && x.Status == SessionStatus.Recording, ct);

        if (!exists)
            throw new KeyNotFoundException("Recording session not found.");

        await queue.EnqueueAsync(new QueuedSampleBatch(request.SessionId, request.Samples), ct);
    }

    public async Task<SessionDto?> CompleteSessionAsync(Guid sessionId, SessionResult result, CancellationToken ct)
    {
        var s = await db.Sessions
            .Include(x => x.Device)
            .SingleOrDefaultAsync(x => x.Id == sessionId, ct);

        if (s is null) return null;

        s.EndTimeUtc = DateTime.UtcNow;
        s.Status = SessionStatus.Completed;
        s.Result = result;

        await db.SaveChangesAsync(ct);

        return ToDto(s, s.Device!.DeviceCode);
    }

    public async Task<IReadOnlyList<SensorSampleDto>> GetSamplesAsync(
        Guid sessionId,
        DateTime? from,
        DateTime? to,
        CancellationToken ct)
    {
        var q = db.SensorSamples.AsNoTracking().Where(x => x.SessionId == sessionId);

        if (from.HasValue)
            q = q.Where(x => x.TimestampUtc >= from.Value);

        if (to.HasValue)
            q = q.Where(x => x.TimestampUtc <= to.Value);

        return await q
            .OrderBy(x => x.TimestampUtc)
            .Select(x => new SensorSampleDto(
                x.Id,
                x.SessionId,
                x.SensorId,
                x.TimestampUtc,
                x.ForceN,
                x.AngleDeg,
                x.PositionX,
                x.PositionY,
                x.PositionZ))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<SessionDto>> GetSessionsAsync(
        int page,
        int pageSize,
        CancellationToken ct)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await db.Sessions.AsNoTracking()
            .Include(x => x.Device)
            .OrderByDescending(x => x.StartTimeUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new SessionDto(
                x.Id,
                x.SessionCode,
                x.Device!.DeviceCode,
                x.OperatorCode,
                x.StartTimeUtc,
                x.EndTimeUtc,
                x.Status,
                x.Result))
            .ToListAsync(ct);
    }

    private static SessionDto ToDto(Session x, string deviceCode) => new(
        x.Id,
        x.SessionCode,
        deviceCode,
        x.OperatorCode,
        x.StartTimeUtc,
        x.EndTimeUtc,
        x.Status,
        x.Result
    );
}
using FactoryFPT.Domain;

namespace FactoryFPT.Application;

public record CreateDeviceRequest(
    string DeviceCode,
    string Name
);

public record CreateSessionRequest(
    string DeviceCode,
    string? OperatorCode
);

public record SensorSampleRequest(
    string SensorId,
    DateTime TimestampUtc,
    double ForceN,
    double AngleDeg,
    double PositionX,
    double PositionY,
    double PositionZ
);

public record SensorBatchRequest(
    Guid SessionId,
    IReadOnlyList<SensorSampleRequest> Samples
);

public record SessionDto(
    Guid Id,
    string SessionCode,
    string DeviceCode,
    string? OperatorCode,
    DateTime StartTimeUtc,
    DateTime? EndTimeUtc,
    SessionStatus Status,
    SessionResult Result
);

public record SensorSampleDto(
    long Id,
    Guid SessionId,
    string SensorId,
    DateTime TimestampUtc,
    double ForceN,
    double AngleDeg,
    double PositionX,
    double PositionY,
    double PositionZ
);

public record AlertDto(
    long Id,
    Guid SessionId,
    string Code,
    string Message,
    DateTime CreatedAtUtc
);

public record QueuedSampleBatch(
    Guid SessionId,
    IReadOnlyList<SensorSampleRequest> Samples
);
public interface IDataIngestionService
{
    Task<SessionDto> CreateSessionAsync(CreateSessionRequest request, CancellationToken ct);
    Task IngestBatchAsync(SensorBatchRequest request, CancellationToken ct);
    Task<SessionDto?> CompleteSessionAsync(Guid sessionId, SessionResult result, CancellationToken ct);
    Task<IReadOnlyList<SensorSampleDto>> GetSamplesAsync(Guid sessionId, DateTime? from, DateTime? to, CancellationToken ct);
    Task<IReadOnlyList<SessionDto>> GetSessionsAsync(int page, int pageSize, CancellationToken ct);
}

public interface ISampleQueue
{
    ValueTask EnqueueAsync(QueuedSampleBatch batch, CancellationToken ct);
    IAsyncEnumerable<QueuedSampleBatch> ReadAllAsync(CancellationToken ct);
}
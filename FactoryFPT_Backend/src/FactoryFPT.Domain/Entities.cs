namespace FactoryFPT.Domain;

public enum SessionStatus { Recording, Processing, Completed, Failed }
public enum SessionResult { Unknown, Pass, Fail }

public sealed class Device
{
    public Guid Id { get; set; }
    public string DeviceCode { get; set; } = "";
    public string Name { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}

public sealed class Session
{
    public Guid Id { get; set; }
    public string SessionCode { get; set; } = "";
    public Guid DeviceId { get; set; }
    public Device? Device { get; set; }
    public string? OperatorCode { get; set; }
    public DateTime StartTimeUtc { get; set; }
    public DateTime? EndTimeUtc { get; set; }
    public SessionStatus Status { get; set; } = SessionStatus.Recording;
    public SessionResult Result { get; set; } = SessionResult.Unknown;
    public ICollection<SensorSample> Samples { get; set; } = new List<SensorSample>();
}

public sealed class SensorSample
{
    public long Id { get; set; }
    public Guid SessionId { get; set; }
    public Session? Session { get; set; }
    public string SensorId { get; set; } = "";
    public DateTime TimestampUtc { get; set; }
    public double ForceN { get; set; }
    public double AngleDeg { get; set; }
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public double PositionZ { get; set; }
}

public sealed class Alert
{
    public long Id { get; set; }
    public Guid SessionId { get; set; }
    public string Code { get; set; } = "";
    public string Message { get; set; } = "";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

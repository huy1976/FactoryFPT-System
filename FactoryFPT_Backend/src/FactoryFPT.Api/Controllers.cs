using FactoryFPT.Application;
using FactoryFPT.Domain;
using FactoryFPT.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FactoryFPT.Api.Controllers;

[ApiController]
[Route("api/v1/devices")]
public sealed class DevicesController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDeviceRequest r, CancellationToken ct)
    {
        if (await db.Devices.AnyAsync(x => x.DeviceCode == r.DeviceCode, ct))
            return Conflict(new { message = "DeviceCode already exists." });

        var d = new Device
        {
            Id = Guid.NewGuid(),
            DeviceCode = r.DeviceCode,
            Name = r.Name,
            IsActive = true
        };

        db.Devices.Add(d);
        await db.SaveChangesAsync(ct);
        return Ok(d);
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
        => Ok(await db.Devices.AsNoTracking().OrderBy(x => x.DeviceCode).ToListAsync(ct));
}

[ApiController]
[Route("api/v1/sessions")]
public sealed class SessionsController(IDataIngestionService service) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSessionRequest r, CancellationToken ct)
    {
        try
        {
            var session = await service.CreateSessionAsync(r, ct);
            return Ok(session);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, [FromBody] SessionResult result, CancellationToken ct)
    {
        var x = await service.CompleteSessionAsync(id, result, ct);
        return x is null ? NotFound() : Ok(x);
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken ct = default)
        => Ok(await service.GetSessionsAsync(page, pageSize, ct));

    [HttpGet("{id:guid}/samples")]
    public async Task<IActionResult> Samples(Guid id, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
        => Ok(await service.GetSamplesAsync(id, from, to, ct));
}

[ApiController]
[Route("api/v1/ingestion")]
public sealed class IngestionController(IDataIngestionService service) : ControllerBase
{
    [HttpPost("batch")]
    public async Task<IActionResult> Batch([FromBody] SensorBatchRequest r, CancellationToken ct)
    {
        await service.IngestBatchAsync(r, ct);
        return Accepted(new { message = "Batch queued", count = r.Samples.Count });
    }
}

[ApiController]
[Route("api/v1/datasets")]
public sealed class DatasetsController(AppDbContext db) : ControllerBase
{
    [HttpGet("{sessionId:guid}")]
    public async Task<IActionResult> Get(Guid sessionId, CancellationToken ct)
    {
        var s = await db.Sessions.AsNoTracking()
            .Include(x => x.Device)
            .SingleOrDefaultAsync(x => x.Id == sessionId, ct);

        if (s is null) return NotFound();

        var samples = await db.SensorSamples.AsNoTracking()
            .Where(x => x.SessionId == sessionId)
            .OrderBy(x => x.TimestampUtc)
            .ToListAsync(ct);

        return Ok(new
        {
            session = new
            {
                sessionId = s.Id,
                sessionCode = s.SessionCode,
                device = s.Device!.DeviceCode,
                result = s.Result
            },
            samples
        });
    }
}
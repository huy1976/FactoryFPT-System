using FactoryFPT.Domain;
using Microsoft.EntityFrameworkCore;

namespace FactoryFPT.Infrastructure;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<SensorSample> SensorSamples => Set<SensorSample>();
    public DbSet<Alert> Alerts => Set<Alert>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Device>().HasKey(x => x.Id);
        b.Entity<Device>().HasIndex(x => x.DeviceCode).IsUnique();
        b.Entity<Session>().HasKey(x => x.Id);
        b.Entity<Session>().HasIndex(x => x.SessionCode).IsUnique();
        b.Entity<Session>().HasIndex(x => new { x.DeviceId, x.StartTimeUtc });
        b.Entity<SensorSample>().HasKey(x => x.Id);
        b.Entity<SensorSample>().HasIndex(x => new { x.SessionId, x.TimestampUtc });
        b.Entity<SensorSample>().HasIndex(x => new { x.SensorId, x.TimestampUtc });
        b.Entity<Session>().HasOne(x => x.Device).WithMany(x => x.Sessions).HasForeignKey(x => x.DeviceId);
        b.Entity<SensorSample>().HasOne(x => x.Session).WithMany(x => x.Samples).HasForeignKey(x => x.SessionId);
        b.Entity<Alert>().HasIndex(x => new { x.SessionId, x.CreatedAtUtc });
    }
}

using System.Threading.Channels;
using FactoryFPT.Application;

namespace FactoryFPT.Infrastructure;

public sealed class InMemorySampleQueue : ISampleQueue
{
    private readonly Channel<QueuedSampleBatch> _channel = Channel.CreateBounded<QueuedSampleBatch>(
        new BoundedChannelOptions(100)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = false,
            SingleWriter = false
        });

    public ValueTask EnqueueAsync(QueuedSampleBatch batch, CancellationToken ct)
        => _channel.Writer.WriteAsync(batch, ct);

    public IAsyncEnumerable<QueuedSampleBatch> ReadAllAsync(CancellationToken ct)
        => _channel.Reader.ReadAllAsync(ct);
}
using Microsoft.AspNetCore.SignalR;

namespace FactoryFPT.Infrastructure;
public sealed class SensorHub : Hub
{
    public Task JoinSession(Guid sessionId) => Groups.AddToGroupAsync(Context.ConnectionId, $"session:{sessionId}");
    public Task LeaveSession(Guid sessionId) => Groups.RemoveFromGroupAsync(Context.ConnectionId, $"session:{sessionId}");
}

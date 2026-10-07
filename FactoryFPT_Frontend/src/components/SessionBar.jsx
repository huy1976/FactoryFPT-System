export default function SessionBar({
  sessions,
  selectedSessionId,
  onSessionChange,
  devices,
  selectedDeviceCode,
  onDeviceChange,
  onExportSession
}) {
  return (
    <section className="toolbar">
      <label>
        <span>Session</span>
        <select
          value={selectedSessionId}
          onChange={(e) => onSessionChange(e.target.value)}
        >
          {sessions.length === 0 && <option value="">No sessions</option>}
          {sessions.map((session) => {
            const id = session.id || session.sessionId;
            return (
              <option key={id} value={id}>
                {session.name || session.sessionName || id}
              </option>
            );
          })}
        </select>
      </label>

      <label>
        <span>Sensor</span>
        <select
          value={selectedDeviceCode}
          onChange={(e) => onDeviceChange(e.target.value)}
        >
          {devices.map((device) => (
            <option key={device.code} value={device.code}>
              {device.code} — {device.name}
            </option>
          ))}
        </select>
      </label>

      <button className="primary-button" onClick={onExportSession}>
        Export Session CSV
      </button>
    </section>
  );
}
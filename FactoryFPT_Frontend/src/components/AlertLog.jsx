import { formatTime } from "../utils/telemetry";

export default function AlertLog({ alerts, onClear }) {
  return (
    <section className="alert-console">
      <div className="section-heading compact">
        <div>
          <div className="eyebrow">SYSTEM</div>
          <h3>Global Alert Log</h3>
        </div>
        <button className="ghost-button" onClick={onClear}>
          Clear
        </button>
      </div>

      <div className="alert-list">
        {alerts.length === 0 && (
          <div className="no-alert">No active alerts.</div>
        )}

        {alerts.map((alert) => (
          <div className="alert-row" key={alert.id}>
            <span className={`severity ${alert.severity.toLowerCase()}`}>
              {alert.severity}
            </span>
            <b>{alert.deviceCode}</b>
            <b>{formatTime(alert.timestampUtc)}</b>
            <span>{alert.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
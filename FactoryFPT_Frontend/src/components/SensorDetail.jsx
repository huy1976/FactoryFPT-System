import { formatTime } from "../utils/telemetry";
import TelemetryChart from "./TelemetryChart";
import ExportCsvButton from "./ExportCsvButton";

export default function SensorDetail({
  sensor,
  sensorSeries,
  alerts,
  onExportDevice
}) {
  if (!sensor) {
    return <section className="empty-state">Select a sensor to view details.</section>;
  }

  const sensorAlerts = alerts.filter(
    (alert) => alert.deviceCode === sensor.code
  );

  return (
    <section className="detail-section">
      <div className="detail-header">
        <div>
          <div className="eyebrow">SENSOR DETAIL</div>
          <h2>
            {sensor.code} <span>— {sensor.name}</span>
          </h2>
        </div>
        <ExportCsvButton
          label={`Export ${sensor.code} CSV`}
          onClick={() => onExportDevice(sensor.code)}
        />
      </div>

      <div className="detail-kpis">
        <div className="detail-kpi">
          <small>STATUS</small>
          <strong>{sensor.connected ? "ONLINE" : "OFFLINE"}</strong>
        </div>
        <div className="detail-kpi">
          <small>LAST FORCE</small>
          <strong>{Number(sensor.lastForce || 0).toFixed(2)} N</strong>
        </div>
        <div className="detail-kpi">
          <small>LAST ANGLE</small>
          <strong>{Number(sensor.lastAngle || 0).toFixed(2)}°</strong>
        </div>
        <div className="detail-kpi">
          <small>LAST UPDATE</small>
          <strong>{formatTime(sensor.lastTimestamp)}</strong>
        </div>
      </div>

      <div className="chart-grid">
        <TelemetryChart
          title="Force vs Time"
          unit="N"
          dataPoints={sensorSeries?.force || []}
          color={sensor.color || "#3b82f6"}
        />
        <TelemetryChart
          title="Angle vs Time"
          unit="°"
          dataPoints={sensorSeries?.angle || []}
          color={sensor.color || "#3b82f6"}
        />
      </div>

      <div className="detail-alerts">
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">ALERTS</div>
            <h3>{sensor.code} Alert Log</h3>
          </div>
          <span className="count-pill">{sensorAlerts.length}</span>
        </div>

        {sensorAlerts.length === 0 ? (
          <div className="no-alert">No alerts for this sensor.</div>
        ) : (
          sensorAlerts.slice(0, 20).map((alert) => (
            <div className="alert-row" key={alert.id}>
              <span className={`severity ${alert.severity.toLowerCase()}`}>
                {alert.severity}
              </span>
              <b>{formatTime(alert.timestampUtc)}</b>
              <span>{alert.message}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
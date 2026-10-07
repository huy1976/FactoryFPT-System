import { formatTime } from "../utils/telemetry";

export default function SensorOverview({
  devices,
  deviceState,
  selectedDeviceCode,
  onSelect
}) {
  return (
    <section>
      <div className="section-heading">
        <div>
          <div className="eyebrow">OVERVIEW</div>
          <h2>All Sensors</h2>
        </div>
        <span className="count-pill">{devices.length} sensors</span>
      </div>

      <div className="sensor-grid">
        {devices.map((device) => {
          const state = deviceState[device.code] || device;
          const selected = selectedDeviceCode === device.code;

          return (
            <button
              key={device.code}
              className={`sensor-card ${selected ? "selected" : ""}`}
              onClick={() => onSelect(device.code)}
            >
              <div className="sensor-card-top">
                <div>
                  <strong>{device.code}</strong>
                  <span>{device.name}</span>
                </div>
                <span className={state.connected ? "online-tag" : "offline-tag"}>
                  {state.connected ? "ONLINE" : "OFFLINE"}
                </span>
              </div>

              <div className="mini-kpis">
                <div>
                  <small>Force</small>
                  <b>{Number(state.lastForce || 0).toFixed(1)} N</b>
                </div>
                <div>
                  <small>Angle</small>
                  <b>{Number(state.lastAngle || 0).toFixed(1)}°</b>
                </div>
              </div>

              <div className="sensor-card-footer">
                <span>{state.sampleCount || 0} samples</span>
                <span>{formatTime(state.lastTimestamp)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
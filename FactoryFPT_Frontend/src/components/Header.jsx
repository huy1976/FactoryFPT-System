export default function Header({ connectionState }) {
  const live =
    connectionState === "Connected" ||
    connectionState === "connected" ||
    connectionState === "mock" ||
    connectionState === "Mock";

  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">FACTORYFPT</div>
        <h1>Industrial Sensor Monitoring</h1>
      </div>
      <div className={`connection-badge ${live ? "online" : ""}`}>
        <span className="status-dot" />
        {connectionState || "unknown"}
      </div>
    </header>
  );
}
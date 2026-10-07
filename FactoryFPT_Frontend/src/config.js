const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export const CONFIG = {
  apiBaseUrl,
  signalRHubUrl:
    import.meta.env.VITE_SIGNALR_HUB_URL || `${apiBaseUrl}/hubs/sensor`,
  mockMode:
    String(import.meta.env.VITE_MOCK_MODE || "true").toLowerCase() === "true",
  maxPoints: 300,
  trimPoints: 100,
  defaultDevices: [
    { code: "D001", name: "Pressing Station 01", color: "#3b82f6" },
    { code: "D002", name: "Pressing Station 02", color: "#10b981" },
    { code: "D003", name: "Pressing Station 03", color: "#f59e0b" }
  ]
};
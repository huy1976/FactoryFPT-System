import { CONFIG } from "../config";

async function request(path, options = {}) {
  const response = await fetch(`${CONFIG.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${body}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const getSessions = () => request("/api/v1/sessions");
export const getDevices = () => request("/api/v1/devices");

export const getSessionSamples = (sessionId) =>
  request(`/api/v1/sessions/${encodeURIComponent(sessionId)}/samples`);

export const getDeviceSamples = (sessionId, deviceCode) =>
  request(
    `/api/v1/sessions/${encodeURIComponent(sessionId)}/devices/${encodeURIComponent(deviceCode)}/samples`
  );

export function getSessionExportUrl(sessionId, deviceCode = null) {
  const base = `${CONFIG.apiBaseUrl}/api/v1/sessions/${encodeURIComponent(
    sessionId
  )}`;
  return deviceCode
    ? `${base}/devices/${encodeURIComponent(deviceCode)}/export.csv`
    : `${base}/export.csv`;
}
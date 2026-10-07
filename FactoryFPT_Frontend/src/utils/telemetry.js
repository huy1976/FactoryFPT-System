import { CONFIG } from "../config";

export function normalizeSample(s = {}) {
  return {
    timestampUtc:
      s.timestampUtc ||
      s.TimestampUtc ||
      s.timestamp ||
      s.Timestamp ||
      new Date().toISOString(),
    deviceCode:
      s.deviceCode ||
      s.DeviceCode ||
      s.deviceId ||
      s.DeviceId ||
      "UNKNOWN",
    forceN: Number(s.forceN ?? s.ForceN ?? s.force ?? s.Force ?? 0),
    angleDeg: Number(
      s.angleDeg ?? s.AngleDeg ?? s.angle ?? s.Angle ?? 0
    )
  };
}

export function normalizeBatch(payload) {
  if (Array.isArray(payload)) return payload.map(normalizeSample);

  const samples = payload?.samples || payload?.Samples || [];
  return samples.map((sample) =>
    normalizeSample({
      ...sample,
      deviceCode:
        sample.deviceCode ||
        sample.DeviceCode ||
        payload.deviceCode ||
        payload.DeviceCode
    })
  );
}

export function trimSeries(series) {
  if (series.length <= CONFIG.maxPoints) return series;
  return series.slice(-CONFIG.maxPoints + CONFIG.trimPoints);
}

export function createDeviceState(device) {
  return {
    code: device.code,
    name: device.name || device.code,
    color: device.color,
    connected: false,
    lastForce: 0,
    lastAngle: 0,
    lastTimestamp: null,
    sampleCount: 0
  };
}

export function formatTime(timestamp) {
  if (!timestamp) return "--:--:--";
  return new Date(timestamp).toLocaleTimeString("vi-VN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export function normalizeDevice(d, index = 0) {
  return {
    code: d.code || d.deviceCode || d.DeviceCode || d.id || d.Id,
    name:
      d.name ||
      d.deviceName ||
      d.Name ||
      d.DeviceName ||
      d.code ||
      d.deviceCode ||
      `Sensor ${index + 1}`,
    color: d.color || CONFIG.defaultDevices[index % CONFIG.defaultDevices.length]?.color
  };
}
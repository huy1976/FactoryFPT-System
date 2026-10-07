import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONFIG } from "../config";
import { getDevices, getSessions } from "../services/api";
import { createSensorConnection } from "../services/signalr";
import {
  createDeviceState,
  normalizeBatch,
  normalizeDevice,
  trimSeries
} from "../utils/telemetry";

function buildMockDevices() {
  return CONFIG.defaultDevices.map(normalizeDevice);
}

export function useTelemetry() {
  const [devices, setDevices] = useState([]);
  const [deviceState, setDeviceState] = useState({});
  const [series, setSeries] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedDeviceCode, setSelectedDeviceCode] = useState("");
  const [connectionState, setConnectionState] = useState(
    CONFIG.mockMode ? "mock" : "connecting"
  );
  const [connectionError, setConnectionError] = useState("");

  const connectionRef = useRef(null);
  const mockTimerRef = useRef(null);

  const installDevices = useCallback((rawDevices) => {
    const normalized = rawDevices
      .map((d, i) => normalizeDevice(d, i))
      .filter((d) => d.code);

    setDevices(normalized);
    setDeviceState(
      Object.fromEntries(normalized.map((d) => [d.code, createDeviceState(d)]))
    );
    setSeries(
      Object.fromEntries(
        normalized.map((d) => [
          d.code,
          { force: [], angle: [] }
        ])
      )
    );
    setSelectedDeviceCode((current) =>
      current && normalized.some((d) => d.code === current)
        ? current
        : normalized[0]?.code || ""
    );
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const [sessionResult, deviceResult] = await Promise.all([
        getSessions(),
        getDevices()
      ]);

      const sessionList = Array.isArray(sessionResult)
        ? sessionResult
        : sessionResult?.items || sessionResult?.data || [];

      const deviceList = Array.isArray(deviceResult)
        ? deviceResult
        : deviceResult?.items || deviceResult?.data || [];

      setSessions(sessionList);
      setSelectedSessionId((current) => current || sessionList[0]?.id || sessionList[0]?.sessionId || "");
      installDevices(deviceList);
    } catch (error) {
      if (!CONFIG.mockMode) {
        setConnectionError(error.message);
        return;
      }

      const mockDevices = buildMockDevices();
      installDevices(mockDevices);
      setSessions([{ id: "DEMO-001", name: "Demo Session" }]);
      setSelectedSessionId("DEMO-001");
    }
  }, [installDevices]);

  const addBatch = useCallback((payload) => {
    const samples = normalizeBatch(payload);
    if (!samples.length) return;

    setDeviceState((previous) => {
      const next = { ...previous };

      for (const sample of samples) {
        const existing = next[sample.deviceCode] || {
          code: sample.deviceCode,
          name: sample.deviceCode,
          color: CONFIG.defaultDevices[
            Object.keys(next).length % CONFIG.defaultDevices.length
          ]?.color,
          connected: true,
          lastForce: 0,
          lastAngle: 0,
          lastTimestamp: null,
          sampleCount: 0
        };

        next[sample.deviceCode] = {
          ...existing,
          connected: true,
          lastForce: sample.forceN,
          lastAngle: sample.angleDeg,
          lastTimestamp: sample.timestampUtc,
          sampleCount: existing.sampleCount + 1
        };
      }

      return next;
    });

    setSeries((previous) => {
      const next = { ...previous };

      for (const sample of samples) {
        const current = next[sample.deviceCode] || { force: [], angle: [] };

        next[sample.deviceCode] = {
          force: trimSeries([
            ...current.force,
            { x: sample.timestampUtc, y: sample.forceN }
          ]),
          angle: trimSeries([
            ...current.angle,
            { x: sample.timestampUtc, y: sample.angleDeg }
          ])
        };
      }

      return next;
    });
  }, []);

  const addAlert = useCallback((payload) => {
    const alert = {
      id: crypto.randomUUID(),
      timestampUtc: payload?.timestampUtc || new Date().toISOString(),
      deviceCode:
        payload?.deviceCode || payload?.DeviceCode || "SYSTEM",
      severity: payload?.severity || payload?.Severity || "WARNING",
      message:
        payload?.message ||
        payload?.Message ||
        "Sensor threshold alert"
    };

    setAlerts((previous) => [alert, ...previous].slice(0, 100));
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (CONFIG.mockMode || !selectedSessionId) return;

    let cancelled = false;
    const connection = createSensorConnection();
    connectionRef.current = connection;

    const updateState = () => {
      if (!cancelled) setConnectionState(connection.state);
    };

    connection.on("sensorBatch", addBatch);
    connection.on("SensorBatch", addBatch);
    connection.on("alert", addAlert);
    connection.on("Alert", addAlert);
    connection.onreconnecting(() => setConnectionState("reconnecting"));
    connection.onreconnected(async () => {
      setConnectionState("connected");
      try {
        await connection.invoke("JoinSession", selectedSessionId);
      } catch (e) {
        setConnectionError(e.message);
      }
    });
    connection.onclose(() => setConnectionState("disconnected"));

    connection
      .start()
      .then(async () => {
        updateState();
        await connection.invoke("JoinSession", selectedSessionId);
      })
      .catch((error) => {
        setConnectionError(error.message);
        setConnectionState("disconnected");
      });

    return () => {
      cancelled = true;
      connection.off("sensorBatch", addBatch);
      connection.off("SensorBatch", addBatch);
      connection.off("alert", addAlert);
      connection.off("Alert", addAlert);
      connection.stop();
      connectionRef.current = null;
    };
  }, [selectedSessionId, addBatch, addAlert]);

  useEffect(() => {
    if (!CONFIG.mockMode || !devices.length) return;

    let tick = 0;
    mockTimerRef.current = setInterval(() => {
      tick += 1;
      const samples = devices.map((device, index) => ({
        timestampUtc: new Date().toISOString(),
        deviceCode: device.code,
        forceN:
          30 +
          index * 5 +
          Math.sin(tick / 8 + index) * 8 +
          Math.random() * 2,
        angleDeg:
          (tick * (2 + index * 0.4)) % 360
      }));

      addBatch(samples);

      if (tick % 80 === 0) {
        addAlert({
          deviceCode: devices[tick % devices.length].code,
          severity: "WARNING",
          message: "Force approached configured threshold"
        });
      }
    }, 200);

    setConnectionState("mock");

    return () => clearInterval(mockTimerRef.current);
  }, [devices, addBatch, addAlert]);

  const selectedDevice = useMemo(
    () => deviceState[selectedDeviceCode] || devices.find((d) => d.code === selectedDeviceCode),
    [deviceState, devices, selectedDeviceCode]
  );

  const selectedSeries = series[selectedDeviceCode] || {
    force: [],
    angle: []
  };

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return {
    devices,
    deviceState,
    series,
    selectedDevice,
    selectedSeries,
    alerts,
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    selectedDeviceCode,
    setSelectedDeviceCode,
    connectionState,
    connectionError,
    clearAlerts
  };
}
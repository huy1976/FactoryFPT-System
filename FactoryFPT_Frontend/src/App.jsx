import { useMemo } from "react";
import Header from "./components/Header";
import SessionBar from "./components/SessionBar";
import SensorOverview from "./components/SensorOverview";
import SensorDetail from "./components/SensorDetail";
import AlertLog from "./components/AlertLog";
import ExportCsvButton from "./components/ExportCsvButton";
import { useTelemetry } from "./hooks/useTelemetry";
import { getSessionExportUrl, getDeviceSamples } from "./services/api";
import { buildTelemetryCsv, downloadCsv } from "./utils/csv";
import { CONFIG } from "./config";

export default function App() {
  const telemetry = useTelemetry();

  const selectedDevice = telemetry.selectedDevice;
  const selectedSeries = telemetry.selectedSeries;

  const handleBackendExport = (deviceCode = null) => {
    if (!telemetry.selectedSessionId) return;

    const url = getSessionExportUrl(
      telemetry.selectedSessionId,
      deviceCode
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.click();
  };

  const handleLocalExport = (deviceCode) => {
    const series = telemetry.series[deviceCode];
    if (!series) return;

    const count = Math.max(series.force.length, series.angle.length);
    const samples = Array.from({ length: count }, (_, index) => ({
      timestampUtc:
        series.force[index]?.x ||
        series.angle[index]?.x ||
        new Date().toISOString(),
      deviceCode,
      forceN: series.force[index]?.y ?? "",
      angleDeg: series.angle[index]?.y ?? ""
    }));

    downloadCsv(
      `FactoryFPT_${deviceCode}_${new Date()
        .toISOString()
        .replaceAll(":", "-")}.csv`,
      buildTelemetryCsv(samples)
    );
  };

  const handleExportDevice = async (deviceCode) => {
    if (CONFIG.mockMode) {
      handleLocalExport(deviceCode);
      return;
    }

    try {
      handleBackendExport(deviceCode);
    } catch {
      handleLocalExport(deviceCode);
    }
  };

  const handleExportSession = () => {
    if (CONFIG.mockMode) {
      const allSamples = [];

      for (const device of telemetry.devices) {
        const current = telemetry.series[device.code];
        const count = Math.max(
          current?.force?.length || 0,
          current?.angle?.length || 0
        );

        for (let i = 0; i < count; i++) {
          allSamples.push({
            timestampUtc:
              current?.force?.[i]?.x ||
              current?.angle?.[i]?.x ||
              new Date().toISOString(),
            deviceCode: device.code,
            forceN: current?.force?.[i]?.y ?? "",
            angleDeg: current?.angle?.[i]?.y ?? ""
          });
        }
      }

      downloadCsv(
        `FactoryFPT_Session_${telemetry.selectedSessionId || "export"}.csv`,
        buildTelemetryCsv(allSamples)
      );
      return;
    }

    handleBackendExport();
  };

  const summary = useMemo(() => {
    const online = telemetry.devices.filter(
      (device) => telemetry.deviceState[device.code]?.connected
    ).length;

    return {
      total: telemetry.devices.length,
      online
    };
  }, [telemetry.devices, telemetry.deviceState]);

  return (
    <main className="app-shell">
      <Header connectionState={telemetry.connectionState} />

      <SessionBar
        sessions={telemetry.sessions}
        selectedSessionId={telemetry.selectedSessionId}
        onSessionChange={telemetry.setSelectedSessionId}
        devices={telemetry.devices}
        selectedDeviceCode={telemetry.selectedDeviceCode}
        onDeviceChange={telemetry.setSelectedDeviceCode}
        onExportSession={handleExportSession}
      />

      {telemetry.connectionError && (
        <div className="error-banner">{telemetry.connectionError}</div>
      )}

      <section className="summary-strip">
        <div>
          <span>Total Sensors</span>
          <b>{summary.total}</b>
        </div>
        <div>
          <span>Online</span>
          <b>{summary.online}</b>
        </div>
        <div>
          <span>Offline</span>
          <b>{Math.max(0, summary.total - summary.online)}</b>
        </div>
        <div className="summary-action">
          {selectedDevice && (
            <ExportCsvButton
              label={`Export ${selectedDevice.code}`}
              onClick={() => handleExportDevice(selectedDevice.code)}
            />
          )}
        </div>
      </section>

      <SensorOverview
        devices={telemetry.devices}
        deviceState={telemetry.deviceState}
        selectedDeviceCode={telemetry.selectedDeviceCode}
        onSelect={telemetry.setSelectedDeviceCode}
      />

      <SensorDetail
        sensor={selectedDevice}
        sensorSeries={selectedSeries}
        alerts={telemetry.alerts}
        onExportDevice={handleExportDevice}
      />

      <AlertLog
        alerts={telemetry.alerts}
        onClear={telemetry.clearAlerts}
      />
    </main>
  );
}
function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function buildTelemetryCsv(samples) {
  const header = ["TimestampUtc", "DeviceCode", "ForceN", "AngleDeg"];

  const rows = samples.map((sample) => [
    sample.timestampUtc,
    sample.deviceCode,
    sample.forceN,
    sample.angleDeg
  ]);

  return [header, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob(["\uFEFF" + csvText], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
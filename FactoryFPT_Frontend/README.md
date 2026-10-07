# FactoryFPT Frontend v2

React + Vite dashboard for scalable industrial sensor monitoring.

## Main changes

- Dynamic sensor registry: frontend no longer assumes only D001-D003.
- Sensor Overview: all sensors with status, latest force/angle and sample count.
- Sensor Detail: one sensor per detail page with independent Force and Angle charts.
- Export CSV:
  - Current visible sensor data
  - Full session export through backend endpoint when available
- SignalR real-time ingestion.
- Mock mode for development without backend.
- Sliding chart window: 300 points per sensor/metric.
- Chart animation disabled for real-time performance.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Environment

Copy `.env.example` to `.env`.

### Expected backend API

```http
GET /api/v1/sessions
GET /api/v1/devices
GET /api/v1/sessions/{sessionId}/samples
GET /api/v1/sessions/{sessionId}/devices/{deviceCode}/samples
GET /api/v1/sessions/{sessionId}/export.csv
GET /api/v1/sessions/{sessionId}/devices/{deviceCode}/export.csv
```

SignalR:

```text
/hubs/sensor
```

Hub method:

```text
JoinSession(sessionId)
```

Events:

```text
sensorBatch
alert
```

Sample:

```json
{
  "timestampUtc": "2026-10-06T15:00:00.000Z",
  "deviceCode": "D001",
  "forceN": 35.6,
  "angleDeg": 125.4
}
```

## Scaling model

The frontend uses:

```text
Device Registry
      ↓
Sensor Overview
      ↓
Selected Sensor
      ↓
Sensor Detail
      ├── Force chart
      ├── Angle chart
      ├── KPI
      ├── Alert log
      └── Export CSV
```

Do not hard-code new sensors in the UI. The backend should return the device registry.

For very large datasets, prefer backend-generated CSV exports instead of downloading all raw rows into the browser.

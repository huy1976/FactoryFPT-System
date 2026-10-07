import {
  CategoryScale,
  Chart as ChartJS,
  Decimation,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Decimation
);

export default function TelemetryChart({
  title,
  unit,
  dataPoints,
  color
}) {
  // Chart.js TimeScale works most reliably with numeric timestamps when
  // parsing is disabled. Keep ISO timestamps in application state, but
  // convert them only at the chart boundary.
  const chartPoints = dataPoints
    .map((point) => ({
      x: typeof point.x === "number" ? point.x : Date.parse(point.x),
      y: Number(point.y)
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  const data = {
    datasets: [
      {
        label: title,
        data: chartPoints,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.15
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    normalized: true,
    parsing: false,
    scales: {
      x: {
        type: "time",
        time: { displayFormats: { second: "HH:mm:ss" } },
        ticks: { color: "#8290a6", maxTicksLimit: 8 },
        grid: { color: "rgba(148,163,184,.08)" }
      },
      y: {
        ticks: {
          color: "#8290a6",
          callback: (value) => `${value} ${unit}`
        },
        grid: { color: "rgba(148,163,184,.08)" }
      }
    },
    plugins: {
      legend: { display: false },
      decimation: { enabled: true, algorithm: "lttb", samples: 300 }
    }
  };

  return (
    <div className="chart-panel">
      <div className="chart-title">
        <span>{title}</span>
        <small>{unit}</small>
      </div>
      <div className="chart-area">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
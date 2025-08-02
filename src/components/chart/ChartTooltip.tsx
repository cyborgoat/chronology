import type { MetricType } from "../../types";

export interface ChartTooltipProps {
  point: any;
  selectedProject: any;
  chartViewMode: "metric-wise" | "model-wise";
  selectedMetrics: MetricType[];
  selectedMetricForComparison: MetricType | null;
  getMetricLabel: (metric: MetricType) => string;
}

export function ChartTooltip({
  point,
  selectedProject,
  chartViewMode,
  selectedMetrics,
  selectedMetricForComparison,
  getMetricLabel,
}: ChartTooltipProps) {
  const metricType =
    chartViewMode === "metric-wise"
      ? selectedMetrics.find((m) => getMetricLabel(m) === point.seriesId)
      : selectedMetricForComparison;

  const modelName =
    chartViewMode === "metric-wise"
      ? selectedProject.metrics.find(
          (m: any) =>
            m.timestamp === point.data.x &&
            m[metricType as MetricType] === point.data.y
        )?.modelName
      : point.seriesId;

  const timestamp = selectedProject.metrics.find(
    (m: any) =>
      m.timestamp === point.data.x &&
      (chartViewMode === "metric-wise"
        ? m[metricType as MetricType] === point.data.y
        : m.modelName === modelName &&
          m[metricType as MetricType] === point.data.y)
  )?.timestamp;

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-64">
      <div className="font-semibold text-gray-800 mb-3 text-center border-b pb-2">
        Data Point Information
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">
            <strong>Date:</strong>
          </span>
          <span className="font-medium">
            {timestamp
              ? new Date(timestamp).toLocaleDateString()
              : point.data.x}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">
            <strong>Model:</strong>
          </span>
          <span className="font-medium">{modelName || "Unknown"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">
            <strong>Metric Type:</strong>
          </span>
          <span className="font-medium">
            {metricType ? getMetricLabel(metricType) : "Unknown"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">
            <strong>Value:</strong>
          </span>
          <span className="font-bold text-blue-600">
            {typeof point.data.y === "number"
              ? point.data.y.toFixed(3)
              : point.data.y}
          </span>
        </div>
        <hr className="my-2 border-gray-200" />
        <div className="text-xs text-gray-500 space-y-0.5">
          <div>
            <strong>X-Axis:</strong> Time Period
          </div>
          <div>
            <strong>Y-Axis:</strong> Metric Value
          </div>
          <div>
            <strong>Series:</strong> {point.seriesId}
          </div>
        </div>
      </div>
    </div>
  );
}

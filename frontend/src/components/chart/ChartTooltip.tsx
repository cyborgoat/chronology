import type { MetricType, ChartPoint, NivoChartPoint } from "../../types";

export interface ChartTooltipProps {
  point: ChartPoint | NivoChartPoint;
  chartViewMode: "metric-wise" | "model-wise";
  selectedMetrics: MetricType[];
  selectedMetricForComparison: MetricType | null;
  getMetricLabel: (metric: MetricType) => string;
  currentModelName?: string;
}

export function ChartTooltip({
  point,
  chartViewMode,
  selectedMetrics,
  selectedMetricForComparison,
  getMetricLabel,
  currentModelName,
}: ChartTooltipProps) {
  const formatDate = (dateValue: string | Date | unknown): string => {
    if (!dateValue) return "Unknown";
    if (typeof dateValue === 'string') return new Date(dateValue).toLocaleDateString();
    if (dateValue instanceof Date) return dateValue.toLocaleDateString();
    return String(dateValue);
  };

  const metricType = chartViewMode === "metric-wise"
    ? selectedMetrics.find((m) => getMetricLabel(m) === point.seriesId)
    : selectedMetricForComparison;

  // For metric-wise view, use the currentModelName parameter
  // For model-wise view, the seriesId is the model name
  const modelName = chartViewMode === "metric-wise"
    ? currentModelName
    : point.seriesId;

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-64">
      <div className="font-semibold text-gray-800 mb-3 text-center border-b pb-2">
        Data Point Information
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600"><strong>Date:</strong></span>
          <span className="font-medium">{formatDate(point.data.x)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600"><strong>Model:</strong></span>
          <span className="font-medium">{modelName || "Unknown"}</span>
        </div>
        {point.modelVersion && (
          <div className="flex justify-between">
            <span className="text-gray-600"><strong>Version:</strong></span>
            <span className="font-medium">{point.modelVersion}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600"><strong>Metric:</strong></span>
          <span className="font-medium">{metricType ? getMetricLabel(metricType) : "Unknown"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600"><strong>Value:</strong></span>
          <span className="font-bold text-blue-600">
            {typeof point.data.y === "number" ? point.data.y.toFixed(3) : point.data.y}
          </span>
        </div>
      </div>
    </div>
  );
}

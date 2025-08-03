import type { MetricType, ChartViewMode } from "../../types";

interface EmptyStateProps {
  enabledMetrics: MetricType[];
  chartViewMode: ChartViewMode;
}

export function EmptyState({
  enabledMetrics,
  chartViewMode,
}: EmptyStateProps) {
  const getMessage = () => {
    if (enabledMetrics.length === 0) {
      return "No metrics are enabled. Please enable metrics in the Metrics Configuration.";
    }
    return chartViewMode === "metric-wise"
      ? "No data available for selected metrics and models"
      : "No data available for selected models and metric";
  };

  return (
    <div className="flex items-center justify-center h-96">
      <p className="text-muted-foreground text-lg">{getMessage()}</p>
    </div>
  );
} 
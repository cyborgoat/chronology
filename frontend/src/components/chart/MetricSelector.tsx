import type { MetricType, ChartViewMode } from "../../types";

interface MetricSelectorProps {
  enabledMetrics: MetricType[];
  selectedMetrics: MetricType[];
  selectedMetricForComparison: MetricType | null;
  chartViewMode: ChartViewMode;
  getMetricLabel: (metric: MetricType) => string;
  getMetricColor: (metric: MetricType) => string;
  onMetricToggle: (metric: MetricType) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function MetricSelector({
  enabledMetrics,
  selectedMetrics,
  selectedMetricForComparison,
  chartViewMode,
  getMetricLabel,
  getMetricColor,
  onMetricToggle,
  onSelectAll,
  onClearAll,
}: MetricSelectorProps) {
  const isMetricSelected = (metric: MetricType) =>
    chartViewMode === "metric-wise"
      ? selectedMetrics.includes(metric)
      : selectedMetricForComparison === metric;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">
          {chartViewMode === "metric-wise" ? "Metrics:" : "Compare Metric:"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {enabledMetrics.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No metrics are enabled. Please enable metrics in the Metrics
            Configuration.
          </p>
        ) : (
          <>
            {chartViewMode === "metric-wise" && (
              <button
                onClick={
                  selectedMetrics.length === enabledMetrics.length
                    ? onClearAll
                    : onSelectAll
                }
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedMetrics.length === enabledMetrics.length
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {selectedMetrics.length === enabledMetrics.length
                  ? "Clear All"
                  : "All Metrics"}
              </button>
            )}
            {enabledMetrics.map((metric) => (
              <button
                key={metric}
                onClick={() => onMetricToggle(metric)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isMetricSelected(metric)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getMetricColor(metric) }}
                />
                {getMetricLabel(metric)}
              </button>
            ))}
          </>
        )}
      </div>
      {chartViewMode === "metric-wise" && selectedMetrics.length === 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {enabledMetrics.length === 0
            ? "No metrics are enabled. Please enable metrics in the Metrics Configuration."
            : "Select metrics to display in the timeline"}
        </p>
      )}
    </div>
  );
} 
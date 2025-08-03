import type { ChartViewMode } from "../../types";

interface ViewModeToggleProps {
  chartViewMode: ChartViewMode;
  onViewModeChange: (mode: ChartViewMode) => void;
}

export function ViewModeToggle({
  chartViewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <span className="text-sm font-medium">View Mode:</span>
      <div className="flex gap-2">
        <button
          onClick={() => onViewModeChange("metric-wise")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            chartViewMode === "metric-wise"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Metric-wise
        </button>
        <button
          onClick={() => onViewModeChange("model-wise")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            chartViewMode === "model-wise"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Model-wise
        </button>
      </div>
    </div>
  );
} 
import type { ChartViewMode } from "../../types";
import { modelColors } from "../../data/sampleData";

interface ModelSelectorProps {
  availableModels: string[];
  selectedModels: string[];
  chartViewMode: ChartViewMode;
  onModelToggle: (model: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function ModelSelector({
  availableModels,
  selectedModels,
  chartViewMode,
  onModelToggle,
  onSelectAll,
  onClearAll,
}: ModelSelectorProps) {
  const isModelSelected = (modelName: string, index: number) => {
    if (chartViewMode === "metric-wise") {
      // In metric-wise view, only the first selected model is used for chart
      return selectedModels.length > 0
        ? selectedModels[0] === modelName
        : index === 0; // fallback for initial state
    }
    return selectedModels.includes(modelName);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">
          {chartViewMode === "metric-wise"
            ? "Filter by Models (optional):"
            : "Models to Compare:"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {chartViewMode === "model-wise" && (
          <button
            onClick={
              selectedModels.length === availableModels.length
                ? onClearAll
                : onSelectAll
            }
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedModels.length === availableModels.length
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {selectedModels.length === availableModels.length
              ? "Clear All"
              : "All Models"}
          </button>
        )}
        {availableModels.map((modelName, idx) => (
          <button
            key={modelName}
            onClick={() => onModelToggle(modelName)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isModelSelected(modelName, idx)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  modelColors[modelName] || modelColors["default-1"],
              }}
            />
            {modelName}
          </button>
        ))}
      </div>
      {chartViewMode === "model-wise" && selectedModels.length === 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Select models to compare
        </p>
      )}
    </div>
  );
} 
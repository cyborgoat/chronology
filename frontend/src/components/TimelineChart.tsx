import { useEffect, useMemo } from "react";
import { useProjects } from "../contexts/useProjectContext";
import { modelColors } from "../data/sampleData";
import type {
  ChartData,
  MetricType,
  ChartViewMode,
  ProjectMetric,
  Project,
} from "../types";
import { generateChartData, NivoLineChart } from "./chart";
import { getMetricValue, hasMetricValue, getMetricLabel, getMetricColor, getEnabledMetrics } from "../utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// No props interface needed

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Hook for managing metric and model selections based on view mode
 */
function useChartSelections() {
  const {
    selectedProject,
    selectedMetrics,
    setSelectedMetrics,
    selectedModels,
    setSelectedModels,
    chartViewMode,
    setChartViewMode,
    selectedMetricForComparison,
    setSelectedMetricForComparison,
    getAvailableModels,
  } = useProjects();

  // Get enabled metrics from project's metrics configuration
  const enabledMetrics: MetricType[] = useMemo(
    () => getEnabledMetrics(selectedProject),
    [selectedProject]
  );

  const availableModels = selectedProject
    ? getAvailableModels(selectedProject.id)
    : [];

  // Filter out disabled metrics from selections when enabled metrics change
  useEffect(() => {
    if (enabledMetrics.length > 0) {
      // Filter selectedMetrics to only include enabled metrics
      const filteredSelectedMetrics = selectedMetrics.filter((metric) =>
        enabledMetrics.includes(metric)
      );
      if (filteredSelectedMetrics.length !== selectedMetrics.length) {
        setSelectedMetrics(filteredSelectedMetrics);
      }

      // Check if selectedMetricForComparison is still enabled
      if (
        selectedMetricForComparison &&
        !enabledMetrics.includes(selectedMetricForComparison)
      ) {
        setSelectedMetricForComparison(enabledMetrics[0] || null);
      }
    }
  }, [
    enabledMetrics,
    selectedMetrics,
    selectedMetricForComparison,
    setSelectedMetrics,
    setSelectedMetricForComparison,
  ]);

  return {
    selectedProject,
    selectedMetrics,
    setSelectedMetrics,
    selectedModels,
    setSelectedModels,
    chartViewMode,
    setChartViewMode,
    selectedMetricForComparison,
    setSelectedMetricForComparison,
    enabledMetrics,
    availableModels,
  };
}

/**
 * Hook for managing metric and model display functions
 */
function useMetricDisplay(selectedProject: Project | null) {
  // Helper function to get metric label (from config or fallback to default)
  const getMetricLabelLocal = (metricId: MetricType): string => {
    return getMetricLabel(metricId, selectedProject);
  };

  // Helper function to get metric color (from config or fallback to default)
  const getMetricColorLocal = (metricId: MetricType): string => {
    return getMetricColor(metricId, selectedProject);
  };

  return { getMetricLabel: getMetricLabelLocal, getMetricColor: getMetricColorLocal };
}

/**
 * Hook for managing chart data validation and generation
 */
function useChartData(
  selectedProject: Project | null,
  chartViewMode: ChartViewMode,
  selectedMetrics: MetricType[],
  selectedModels: string[],
  selectedMetricForComparison: MetricType | null,
  availableModels: string[],
  getMetricLabel: (metric: MetricType) => string,
  getMetricColor: (metric: MetricType) => string
) {
  // Check if chart has valid data to display
  const hasValidData = () => {
    if (!selectedProject) return false;

    if (chartViewMode === "metric-wise") {
      return (
        selectedMetrics.length > 0 &&
        selectedProject.records.some(
          (m: ProjectMetric) =>
            selectedMetrics.some((metric) => hasMetricValue(m, metric)) &&
            (selectedModels.length === 0 ||
              selectedModels.includes(m.modelName))
        )
      );
    } else {
      return (
        selectedModels.length > 0 &&
        selectedMetricForComparison &&
        selectedProject.records.some(
          (m: ProjectMetric) =>
            selectedModels.includes(m.modelName) &&
            hasMetricValue(m, selectedMetricForComparison)
        )
      );
    }
  };

  // Generate chart data based on view mode
  const chartData: ChartData[] = selectedProject
    ? generateChartData({
        selectedProject,
        chartViewMode,
        selectedMetrics,
        selectedModels,
        selectedMetricForComparison,
        availableModels,
        getMetricLabel,
        getMetricColor,
        modelColors,
      })
    : [];

  return { hasValidData, chartData };
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handles metric selection based on current view mode
 */
function handleMetricToggle(
  metric: MetricType,
  chartViewMode: ChartViewMode,
  selectedMetrics: MetricType[],
  setSelectedMetrics: (metrics: MetricType[]) => void,
  setSelectedMetricForComparison: (metric: MetricType | null) => void
) {
  if (chartViewMode === "metric-wise") {
    // In metric-wise mode, we can select multiple metrics
    const newMetrics = selectedMetrics.includes(metric)
      ? selectedMetrics.filter((m: MetricType) => m !== metric)
      : [...selectedMetrics, metric];
    setSelectedMetrics(newMetrics);
  } else {
    // In model-wise mode, only one metric can be selected for comparison
    setSelectedMetricForComparison(metric);
  }
}

/**
 * Handles model selection based on current view mode
 */
function handleModelToggle(
  modelName: string,
  chartViewMode: ChartViewMode,
  selectedModels: string[],
  setSelectedModels: (models: string[]) => void
) {
  if (chartViewMode === "model-wise") {
    // In model-wise mode, we can select multiple models
    const newModels = selectedModels.includes(modelName)
      ? selectedModels.filter((m) => m !== modelName)
      : [...selectedModels, modelName];
    setSelectedModels(newModels);
  } else {
    // In metric-wise mode, only one model can be selected
    setSelectedModels([modelName]);
  }
}

/**
 * Handles view mode changes and adjusts selections accordingly
 */
function handleViewModeChange(
  mode: ChartViewMode,
  setChartViewMode: (mode: ChartViewMode) => void,
  selectedModels: string[],
  setSelectedModels: (models: string[]) => void,
  selectedMetricForComparison: MetricType | null,
  setSelectedMetricForComparison: (metric: MetricType | null) => void,
  selectedMetrics: MetricType[],
  setSelectedMetrics: (metrics: MetricType[]) => void,
  availableModels: string[],
  enabledMetrics: MetricType[]
) {
  setChartViewMode(mode);

  if (mode === "model-wise") {
    // When switching to model-wise: ensure only one metric and multiple models
    if (selectedModels.length === 0 && availableModels.length > 0) {
      setSelectedModels([availableModels[0]]);
    }
    if (!selectedMetricForComparison && enabledMetrics.length > 0) {
      setSelectedMetricForComparison(enabledMetrics[0]);
    }
  } else {
    // When switching to metric-wise: ensure one model and multiple metrics
    if (selectedModels.length === 0 && availableModels.length > 0) {
      setSelectedModels([availableModels[0]]);
    } else if (selectedModels.length > 1) {
      // If multiple models selected, keep only the first one
      setSelectedModels([selectedModels[0]]);
    }
    if (selectedMetrics.length === 0 && enabledMetrics.length > 0) {
      setSelectedMetrics(enabledMetrics.slice(0, 2)); // Select first two enabled metrics
    }
  }
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

/**
 * View mode toggle buttons
 */
function ViewModeToggle({
  chartViewMode,
  onViewModeChange,
}: {
  chartViewMode: ChartViewMode;
  onViewModeChange: (mode: ChartViewMode) => void;
}) {
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

/**
 * Metric selection buttons
 */
function MetricSelector({
  enabledMetrics,
  selectedMetrics,
  selectedMetricForComparison,
  chartViewMode,
  getMetricLabel,
  getMetricColor,
  onMetricToggle,
  onSelectAll,
  onClearAll,
}: {
  enabledMetrics: MetricType[];
  selectedMetrics: MetricType[];
  selectedMetricForComparison: MetricType | null;
  chartViewMode: ChartViewMode;
  getMetricLabel: (metric: MetricType) => string;
  getMetricColor: (metric: MetricType) => string;
  onMetricToggle: (metric: MetricType) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
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

/**
 * Model selection buttons
 */
function ModelSelector({
  availableModels,
  selectedModels,
  chartViewMode,
  onModelToggle,
  onSelectAll,
  onClearAll,
}: {
  availableModels: string[];
  selectedModels: string[];
  chartViewMode: ChartViewMode;
  onModelToggle: (model: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
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

/**
 * Empty state component
 */
function EmptyState({
  enabledMetrics,
  chartViewMode,
}: {
  enabledMetrics: MetricType[];
  chartViewMode: ChartViewMode;
}) {
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TimelineChart() {
  // Use custom hooks to manage state and logic
  const {
    selectedProject,
    selectedMetrics,
    setSelectedMetrics,
    selectedModels,
    setSelectedModels,
    chartViewMode,
    setChartViewMode,
    selectedMetricForComparison,
    setSelectedMetricForComparison,
    enabledMetrics,
    availableModels,
  } = useChartSelections();

  const { getMetricLabel, getMetricColor } = useMetricDisplay(selectedProject);

  const { hasValidData, chartData } = useChartData(
    selectedProject,
    chartViewMode,
    selectedMetrics,
    selectedModels,
    selectedMetricForComparison,
    availableModels,
    getMetricLabel,
    getMetricColor
  );

  // Event handlers
  const handleMetricToggleWrapper = (metric: MetricType) => {
    handleMetricToggle(
      metric,
      chartViewMode,
      selectedMetrics,
      setSelectedMetrics,
      setSelectedMetricForComparison
    );
  };

  const handleModelToggleWrapper = (modelName: string) => {
    handleModelToggle(
      modelName,
      chartViewMode,
      selectedModels,
      setSelectedModels
    );
  };

  const handleViewModeChangeWrapper = (mode: ChartViewMode) => {
    handleViewModeChange(
      mode,
      setChartViewMode,
      selectedModels,
      setSelectedModels,
      selectedMetricForComparison,
      setSelectedMetricForComparison,
      selectedMetrics,
      setSelectedMetrics,
      availableModels,
      enabledMetrics
    );
  };

  // Check if we should show empty state
  const shouldShowEmptyState = () => {
    if (enabledMetrics.length === 0) return true;

    if (chartViewMode === "metric-wise") {
      return selectedMetrics.length > 0 && !hasValidData();
    } else {
      return (
        selectedModels.length > 0 &&
        selectedMetricForComparison &&
        !hasValidData()
      );
    }
  };



  // Get chart title
  const getTitle = () => {
    if (!selectedProject) return "";
    if (chartViewMode === "metric-wise") {
      return `${selectedProject.name} - Performance Timeline`;
    } else {
      return `${selectedProject.name} - Model Comparison (${getMetricLabel(
        selectedMetricForComparison!
      )})`;
    }
  };

  // Early return if no project selected
  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-muted-foreground text-lg">
            Select a project to view its timeline
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{getTitle()}</CardTitle>
            <CardDescription>
              {chartViewMode === "metric-wise"
                ? "Track your AI model metrics over time"
                : "Compare different AI models performance"}
            </CardDescription>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 pt-4 border-t">
          <ViewModeToggle
            chartViewMode={chartViewMode}
            onViewModeChange={handleViewModeChangeWrapper}
          />

          <div className="space-y-4">
            <MetricSelector
              enabledMetrics={enabledMetrics}
              selectedMetrics={selectedMetrics}
              selectedMetricForComparison={selectedMetricForComparison}
              chartViewMode={chartViewMode}
              getMetricLabel={getMetricLabel}
              getMetricColor={getMetricColor}
              onMetricToggle={handleMetricToggleWrapper}
              onSelectAll={() => setSelectedMetrics(enabledMetrics)}
              onClearAll={() => setSelectedMetrics([])}
            />

            <ModelSelector
              availableModels={availableModels}
              selectedModels={selectedModels}
              chartViewMode={chartViewMode}
              onModelToggle={handleModelToggleWrapper}
              onSelectAll={() => setSelectedModels(availableModels)}
              onClearAll={() => setSelectedModels([])}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {shouldShowEmptyState() ? (
          <EmptyState
            enabledMetrics={enabledMetrics}
            chartViewMode={chartViewMode}
          />
        ) : (
          <div className="h-96">
            <NivoLineChart
              chartData={chartData}
              selectedProject={selectedProject}
              chartViewMode={chartViewMode}
              selectedMetrics={selectedMetrics}
              selectedMetricForComparison={selectedMetricForComparison}
              getMetricLabel={getMetricLabel}
              currentModelName={
                chartViewMode === "metric-wise" && selectedModels.length > 0
                  ? selectedModels[0]
                  : undefined
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

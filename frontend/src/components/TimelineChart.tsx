import { } from "react";
import type {
  ChartData,
  MetricType,
  ChartViewMode,
  ProjectMetric,
  Project,
} from "../types";
import { generateChartData, NivoLineChart } from "./chart";
import { ViewModeToggle, MetricSelector, ModelSelector, EmptyState } from "./chart";
import { useChartControls } from "../hooks/useChartControls";
import { hasMetricValue, getMetricLabel, getMetricColor } from "../utils/metricUtils";
import { modelColors } from "../data/sampleData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

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
// MAIN COMPONENT
// ============================================================================

export function TimelineChart() {
  // Use custom hooks to manage state and logic
  const {
    selectedProject,
    selectedMetrics,
    selectedModels,
    chartViewMode,
    selectedMetricForComparison,
    enabledMetrics,
    availableModels,
    handleMetricToggle,
    handleModelToggle,
    handleViewModeChange,
    handleSelectAllMetrics,
    handleClearAllMetrics,
    handleSelectAllModels,
    handleClearAllModels,
  } = useChartControls();

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
        <div className="mt-6 pt-6 border-t border-gray-200">
          <ViewModeToggle
            chartViewMode={chartViewMode}
            onViewModeChange={handleViewModeChange}
          />

          <div className="space-y-6">
            <MetricSelector
              enabledMetrics={enabledMetrics}
              selectedMetrics={selectedMetrics}
              selectedMetricForComparison={selectedMetricForComparison}
              chartViewMode={chartViewMode}
              getMetricLabel={getMetricLabel}
              getMetricColor={getMetricColor}
              onMetricToggle={handleMetricToggle}
              onSelectAll={handleSelectAllMetrics}
              onClearAll={handleClearAllMetrics}
            />

            <ModelSelector
              availableModels={availableModels}
              selectedModels={selectedModels}
              chartViewMode={chartViewMode}
              onModelToggle={handleModelToggle}
              onSelectAll={handleSelectAllModels}
              onClearAll={handleClearAllModels}
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

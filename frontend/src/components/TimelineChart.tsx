import { useRef } from "react";
import { toPng, toSvg } from "html-to-image";
import download from "downloadjs";
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
import { Button } from "@/components/ui/button";
import { Download, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const chartRef = useRef<HTMLDivElement>(null);

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

  // Export chart as image
  const exportChart = async (format: 'svg' | 'png') => {
    if (!chartRef.current) return;

    try {
      const filename = `${selectedProject?.name || 'chart'}-timeline.${format}`;
      
      if (format === 'svg') {
        const dataUrl = await toSvg(chartRef.current);
        download(dataUrl, filename);
      } else {
        const dataUrl = await toPng(chartRef.current);
        download(dataUrl, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

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

  // Debug logging
  console.log('TimelineChart render:', {
    selectedProject: selectedProject?.name,
    chartDataLength: chartData.length,
    chartData: chartData,
    hasValidData: hasValidData(),
    shouldShowEmptyState: shouldShowEmptyState()
  });

  // Early return if no project selected
  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-96">
          <p className="text-lg text-muted-foreground">
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
                ? "Track metrics over time"
                : "Compare different AI models performance"}
            </CardDescription>
          </div>
          
          {/* Export dropdown menu */}
          {!shouldShowEmptyState() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-2 items-center">
                  <Download className="w-4 h-4" />
                  Export Chart
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={async () => await exportChart('svg')}>
                  <Download className="mr-2 w-4 h-4" />
                  Export as SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => await exportChart('png')}>
                  <Download className="mr-2 w-4 h-4" />
                  Export as PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Chart View Mode Section */}
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Chart View Mode</h3>
          </div>
          <ViewModeToggle
            chartViewMode={chartViewMode}
            onViewModeChange={handleViewModeChange}
          />
        </div>

        {/* Metrics Selection Section */}
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Metrics Selection</h3>
          </div>
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
        </div>

        {/* Models Selection Section */}
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Models Selection</h3>
          </div>
          <ModelSelector
            availableModels={availableModels}
            selectedModels={selectedModels}
            chartViewMode={chartViewMode}
            onModelToggle={handleModelToggle}
            onSelectAll={handleSelectAllModels}
            onClearAll={handleClearAllModels}
          />
        </div>

        {/* Chart Display Section */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          {shouldShowEmptyState() ? (
            <EmptyState
              enabledMetrics={enabledMetrics}
              chartViewMode={chartViewMode}
            />
          ) : (
            <div className="w-full h-96">
              <div ref={chartRef} className="w-full h-full" style={{ minHeight: '384px' }}>
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

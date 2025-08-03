import { useEffect, useMemo } from "react";
import { useProjects } from "../contexts/useProjectContext";
import { metricColors, metricLabels, modelColors } from "../data/sampleData";
import type { ChartData, MetricType, ChartViewMode, ChartPoint, MetricLabels, MetricColors, ProjectMetric } from "../types";
import { generateChartData, NivoLineChart } from "./chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TimelineChartProps {
  onPointClick?: (point: ChartPoint) => void;
}

// Helper function to get metric value from record, handling both direct properties and additionalMetrics
function getMetricValue(record: ProjectMetric, metricId: MetricType): number | undefined {
  // First check if it's a direct property
  const directValue = record[metricId as keyof ProjectMetric];
  if (typeof directValue === 'number') {
    return directValue;
  }
  
  // Then check in additionalMetrics
  if (record.additionalMetrics && typeof record.additionalMetrics === 'object') {
    const additionalValue = record.additionalMetrics[metricId];
    if (typeof additionalValue === 'number') {
      return additionalValue;
    }
  }
  
  return undefined;
}

// Helper function to check if a metric has a value in a record
function hasMetricValue(record: ProjectMetric, metricId: MetricType): boolean {
  return getMetricValue(record, metricId) !== undefined;
}

export function TimelineChart({ onPointClick }: TimelineChartProps) {
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

  // Debug logging
  console.log('TimelineChart Debug:', {
    selectedProject: selectedProject?.id,
    selectedProjectName: selectedProject?.name,
    recordsCount: selectedProject?.records?.length,
    firstRecord: selectedProject?.records?.[0],
    selectedMetrics,
    selectedModels,
    chartViewMode,
    selectedMetricForComparison,
  });

  // Helper function to get metric label (from config or fallback to default)
  const getMetricLabel = (metricId: MetricType): string => {
    if (selectedProject?.metricsConfig) {
      const metricConfig = selectedProject.metricsConfig.find(m => m.id === metricId);
      if (metricConfig?.name) return metricConfig.name;
    }
    return (metricLabels as MetricLabels)[metricId] || metricId;
  };

  // Helper function to get metric color (from config or fallback to default)
  const getMetricColor = (metricId: MetricType): string => {
    if (selectedProject?.metricsConfig) {
      const metricConfig = selectedProject.metricsConfig.find(m => m.id === metricId);
      if (metricConfig?.color) return metricConfig.color;
    }
    return (metricColors as MetricColors)[metricId] || 'hsl(200, 70%, 50%)'; // default color for unknown metrics
  };

  // Get enabled metrics from project's metrics configuration
  const enabledMetrics: MetricType[] = useMemo(() => 
    selectedProject?.metricsConfig
      ? selectedProject.metricsConfig
          .filter(metric => metric.enabled)
          .map(metric => metric.id as MetricType)
      : [], [selectedProject?.metricsConfig]
  );

  const availableModels = selectedProject
    ? getAvailableModels(selectedProject.id)
    : [];

  console.log('TimelineChart computed values:', {
    enabledMetrics,
    availableModels,
  });

  // Filter out disabled metrics from selections when enabled metrics change
  useEffect(() => {
    if (enabledMetrics.length > 0) {
      // Filter selectedMetrics to only include enabled metrics
      const filteredSelectedMetrics = selectedMetrics.filter(metric => enabledMetrics.includes(metric));
      if (filteredSelectedMetrics.length !== selectedMetrics.length) {
        setSelectedMetrics(filteredSelectedMetrics);
      }

      // Check if selectedMetricForComparison is still enabled
      if (selectedMetricForComparison && !enabledMetrics.includes(selectedMetricForComparison)) {
        setSelectedMetricForComparison(enabledMetrics[0] || null);
      }
    }
  }, [enabledMetrics, selectedMetrics, selectedMetricForComparison, setSelectedMetrics, setSelectedMetricForComparison]);

  const handleMetricToggle = (metric: MetricType) => {
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
  };

  const handleModelToggle = (modelName: string) => {
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
  };

  const handleViewModeChange = (mode: ChartViewMode) => {
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
  };

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

  // Only show empty states after user has made selections but chart has no data
  const hasValidData = () => {
    if (chartViewMode === "metric-wise") {
      return (
        selectedMetrics.length > 0 &&
        selectedProject.records.some(
          (m) =>
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
          (m) =>
            selectedModels.includes(m.modelName) &&
            hasMetricValue(m, selectedMetricForComparison)
        )
      );
    }
  };

  // Generate chart data based on view mode
  const chartData: ChartData[] = generateChartData({
    selectedProject,
    chartViewMode,
    selectedMetrics,
    selectedModels,
    selectedMetricForComparison,
    availableModels,
    getMetricLabel,
    getMetricColor,
    modelColors,
  });

  // Check if we should show empty state after selections are made
  const shouldShowEmptyState = () => {
    // If no metrics are enabled, always show empty state
    if (enabledMetrics.length === 0) {
      return true;
    }
    
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

  const handlePointClick = (point: ChartPoint) => {
    if (onPointClick) {
      let metricType: MetricType;
      let timestamp: string | undefined;
      let modelName: string | undefined;

      if (chartViewMode === "metric-wise") {
        metricType = selectedMetrics.find(
          (m) => getMetricLabel(m) === point.seriesId
        ) as MetricType;
        // Find the metric entry that matches this point
        const matchingRecord = selectedProject.records.find(
          (m) =>
            m.timestamp === point.data.x && getMetricValue(m, metricType) === point.data.y
        );
        timestamp = matchingRecord?.timestamp;
        modelName = matchingRecord?.modelName as string;
      } else {
        metricType = selectedMetricForComparison!;
        modelName = point.seriesId;
        const matchingRecord = selectedProject.records.find(
          (m) =>
            m.modelName === modelName &&
            m.timestamp === point.data.x &&
            getMetricValue(m, metricType) === point.data.y
        );
        timestamp = matchingRecord?.timestamp;
      }

      onPointClick({
        ...point,
        metricType,
        timestamp,
        modelName,
        projectId: selectedProject.id,
      });
    }
  };

  const getTitle = () => {
    if (chartViewMode === "metric-wise") {
      return `${selectedProject.name} - Performance Timeline`;
    } else {
      return `${selectedProject.name} - Model Comparison (${
        getMetricLabel(selectedMetricForComparison!)
      })`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{getTitle()}</CardTitle>
            <CardDescription>
              {chartViewMode === "metric-wise"
                ? "Track your AI model metrics over time"
                : "Compare different AI models performance"}
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Click on data points to edit values
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">View Mode:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleViewModeChange("metric-wise")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  chartViewMode === "metric-wise"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Metric-wise
              </button>
              <button
                onClick={() => handleViewModeChange("model-wise")}
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

          {chartViewMode === "metric-wise" ? (
            /* Metric-wise View: Select metrics and optionally filter by models */
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Metrics:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {enabledMetrics.length > 0 && (
                    <button
                      onClick={() =>
                        selectedMetrics.length === enabledMetrics.length
                          ? setSelectedMetrics([])
                          : setSelectedMetrics(enabledMetrics)
                      }
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        selectedMetrics.length === enabledMetrics.length
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {selectedMetrics.length === enabledMetrics.length ? "Clear All" : "All Metrics"}
                    </button>
                  )}
                  {enabledMetrics.map((metric) => (
                    <button
                      key={metric}
                      onClick={() => handleMetricToggle(metric)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        selectedMetrics.includes(metric)
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
                </div>
                {selectedMetrics.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {enabledMetrics.length === 0 
                      ? "No metrics are enabled. Please enable metrics in the Metrics Configuration." 
                      : "Select metrics to display in the timeline"}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    Filter by Models (optional):
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableModels.map((modelName, idx) => {
                    // In metric-wise view, only the first selected model is used for chart, so highlight only that one
                    const isActive = chartViewMode === "metric-wise"
                      ? selectedModels.length > 0
                        ? selectedModels[0] === modelName
                        : idx === 0 // fallback for initial state
                      : selectedModels.includes(modelName);
                    return (
                      <button
                        key={modelName}
                        onClick={() => handleModelToggle(modelName)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          isActive
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
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Model-wise View: Select one metric and multiple models to compare */
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Compare Metric:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {enabledMetrics.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No metrics are enabled. Please enable metrics in the Metrics Configuration.
                    </p>
                  ) : (
                    enabledMetrics.map((metric) => (
                      <button
                        key={metric}
                        onClick={() => handleMetricToggle(metric)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          selectedMetricForComparison === metric
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
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    Models to Compare:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      selectedModels.length === availableModels.length
                        ? setSelectedModels([])
                        : setSelectedModels(availableModels)
                    }
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedModels.length === availableModels.length
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {selectedModels.length === availableModels.length ? "Clear All" : "All Models"}
                  </button>
                  {availableModels.map((modelName) => (
                    <button
                      key={modelName}
                      onClick={() => handleModelToggle(modelName)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        selectedModels.includes(modelName)
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
                {selectedModels.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Select models to compare
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {shouldShowEmptyState() ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground text-lg">
              {enabledMetrics.length === 0
                ? "No metrics are enabled. Please enable metrics in the Metrics Configuration."
                : chartViewMode === "metric-wise"
                ? "No data available for selected metrics and models"
                : "No data available for selected models and metric"}
            </p>
          </div>
        ) : (
          <div className="h-96">
            <NivoLineChart
              chartData={chartData}
              selectedProject={selectedProject}
              chartViewMode={chartViewMode}
              selectedMetrics={selectedMetrics}
              selectedMetricForComparison={selectedMetricForComparison}
              getMetricLabel={getMetricLabel}
              onPointClick={handlePointClick}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

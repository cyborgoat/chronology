import type { ChartData, MetricType, Project, ProjectMetric } from "../../types";
import { isValidTimestamp, formatTimestampForChart } from "./ChartConfig";
import { getMetricValue, hasMetricValue } from "../../lib";

export interface ChartDataGeneratorProps {
  selectedProject: Project | null;
  chartViewMode: "metric-wise" | "model-wise";
  selectedMetrics: MetricType[];
  selectedModels: string[];
  selectedMetricForComparison: MetricType | null;
  availableModels: string[];
  getMetricLabel: (metric: MetricType) => string;
  getMetricColor: (metric: MetricType) => string;
  modelColors: Record<string, string>;
}

export function generateChartData({
  selectedProject,
  chartViewMode,
  selectedMetrics,
  selectedModels,
  selectedMetricForComparison,
  availableModels,
  getMetricLabel,
  getMetricColor,
  modelColors,
}: ChartDataGeneratorProps): ChartData[] {
  let chartData: ChartData[] = [];

  // Early return if no project is selected
  if (!selectedProject) {
    console.log('ChartDataGenerator: No project selected');
    return chartData;
  }

  // Debug logging
  console.log('ChartDataGenerator Debug:', {
    chartViewMode,
    selectedMetrics,
    selectedModels,
    selectedMetricForComparison,
    availableModels,
    recordsCount: selectedProject.records.length,
    firstRecord: selectedProject.records[0],
    lastRecord: selectedProject.records[selectedProject.records.length - 1],
  });

  if (chartViewMode === "metric-wise") {
    // Show multiple metrics for the selected project, but only for the first selected model (or first available model)
    const modelToShow =
      selectedModels.length > 0
        ? selectedModels[0]
        : availableModels.length > 0
        ? availableModels[0]
        : undefined;

    console.log('Metric-wise mode, model to show:', modelToShow);

    chartData = selectedMetrics.map((metric) => {
      const filteredRecords = selectedProject.records.filter(
        (m) =>
          hasMetricValue(m, metric) &&
          m.modelName === modelToShow &&
          isValidTimestamp(m.timestamp)
      );

      console.log(`Metric ${metric} filtered records:`, filteredRecords.length);
      if (filteredRecords.length > 0) {
        console.log(`First filtered record for ${metric}:`, filteredRecords[0]);
        console.log(`Last filtered record for ${metric}:`, filteredRecords[filteredRecords.length - 1]);
      }

      const data = filteredRecords.map((m) => ({
        x: formatTimestampForChart(m.timestamp),
        y: getMetricValue(m, metric) as number,
      }));

      console.log(`Generated data points for ${metric}:`, data.length);
      if (data.length > 0) {
        console.log(`First data point for ${metric}:`, data[0]);
        console.log(`Last data point for ${metric}:`, data[data.length - 1]);
      }

      return {
        id: getMetricLabel(metric),
        color: getMetricColor(metric),
        data,
      };
    });
  } else if (chartViewMode === "model-wise" && selectedMetricForComparison) {
    // Show one metric across multiple models within the same project
    console.log('Model-wise mode, metric for comparison:', selectedMetricForComparison);

    chartData = selectedModels.map((modelName) => {
      const modelColor = modelColors[modelName] || modelColors["default-1"];
      
      const filteredRecords = selectedProject.records.filter(
        (m) =>
          m.modelName === modelName &&
          hasMetricValue(m, selectedMetricForComparison) &&
          isValidTimestamp(m.timestamp)
      );

      console.log(`Model ${modelName} filtered records:`, filteredRecords.length);
      if (filteredRecords.length > 0) {
        console.log(`First filtered record for ${modelName}:`, filteredRecords[0]);
        console.log(`Last filtered record for ${modelName}:`, filteredRecords[filteredRecords.length - 1]);
      }

      const data = filteredRecords.map((m) => ({
        x: formatTimestampForChart(m.timestamp),
        y: getMetricValue(m, selectedMetricForComparison) as number,
      }));

      console.log(`Generated data points for ${modelName}:`, data.length);
      if (data.length > 0) {
        console.log(`First data point for ${modelName}:`, data[0]);
        console.log(`Last data point for ${modelName}:`, data[data.length - 1]);
      }

      return {
        id: modelName,
        color: modelColor,
        data,
      };
    });
  }

  console.log('Final generated chart data:', chartData);
  console.log('Chart data summary:', chartData.map(series => ({
    id: series.id,
    dataPoints: series.data.length,
    dateRange: series.data.length > 0 ? {
      start: series.data[0]?.x,
      end: series.data[series.data.length - 1]?.x
    } : null
  })));

  return chartData;
}

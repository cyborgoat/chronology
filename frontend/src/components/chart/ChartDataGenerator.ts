import type { ChartData, MetricType, Project } from "../../types";
import { isValidTimestamp, formatTimestampForChart } from "./ChartConfig";
import { getMetricValue, hasMetricValue } from "../../utils/metricUtils";

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



  if (chartViewMode === "metric-wise") {
    // Show multiple metrics for the selected project, but only for the first selected model (or first available model)
    const modelToShow =
      selectedModels.length > 0
        ? selectedModels[0]
        : availableModels.length > 0
        ? availableModels[0]
        : undefined;

    chartData = selectedMetrics.map((metric) => {
      const filteredRecords = selectedProject.records.filter(
        (m) =>
          hasMetricValue(m, metric) &&
          m.modelName === modelToShow &&
          isValidTimestamp(m.timestamp)
      );

      const data = filteredRecords.map((m) => ({
        x: formatTimestampForChart(m.timestamp),
        y: getMetricValue(m, metric) as number,
        modelVersion: m.modelVersion || undefined,
      }));

      return {
        id: getMetricLabel(metric),
        color: getMetricColor(metric),
        data,
      };
    });
  } else if (chartViewMode === "model-wise" && selectedMetricForComparison) {
    // Show one metric across multiple models within the same project
    chartData = selectedModels.map((modelName) => {
      const modelColor = modelColors[modelName] || modelColors["default-1"];
      
      const filteredRecords = selectedProject.records.filter(
        (m) =>
          m.modelName === modelName &&
          hasMetricValue(m, selectedMetricForComparison) &&
          isValidTimestamp(m.timestamp)
      );

      const data = filteredRecords.map((m) => ({
        x: formatTimestampForChart(m.timestamp),
        y: getMetricValue(m, selectedMetricForComparison) as number,
        modelVersion: m.modelVersion || undefined,
      }));

      return {
        id: modelName,
        color: modelColor,
        data,
      };
    });
  }

  return chartData;
}

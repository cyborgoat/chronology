import type { ChartData, MetricType } from "../../types";
import { isValidTimestamp, formatTimestampForChart } from "./ChartConfig";

export interface ChartDataGeneratorProps {
  selectedProject: any;
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

  if (chartViewMode === "metric-wise") {
    // Show multiple metrics for the selected project, but only for the first selected model (or first available model)
    const modelToShow =
      selectedModels.length > 0
        ? selectedModels[0]
        : availableModels.length > 0
        ? availableModels[0]
        : undefined;

    chartData = selectedMetrics.map((metric) => ({
      id: getMetricLabel(metric),
      color: getMetricColor(metric),
      data: selectedProject.records
        .filter(
          (m: any) =>
            m[metric] !== undefined &&
            m.modelName === modelToShow &&
            isValidTimestamp(m.timestamp)
        )
        .map((m: any) => ({
          x: formatTimestampForChart(m.timestamp),
          y: m[metric] as number,
        })),
    }));
  } else if (chartViewMode === "model-wise" && selectedMetricForComparison) {
    // Show one metric across multiple models within the same project
    chartData = selectedModels.map((modelName) => {
      const modelColor = modelColors[modelName] || modelColors["default-1"];
      return {
        id: modelName,
        color: modelColor,
        data: selectedProject.records
          .filter(
            (m: any) =>
              m.modelName === modelName &&
              m[selectedMetricForComparison] !== undefined &&
              isValidTimestamp(m.timestamp)
          )
          .map((m: any) => ({
            x: formatTimestampForChart(m.timestamp),
            y: m[selectedMetricForComparison] as number,
          })),
      };
    });
  }

  return chartData;
}

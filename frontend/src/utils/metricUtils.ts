import type { ProjectMetric, MetricType, Project } from "../types";
import { metricColors, metricLabels } from "../data/sampleData";
import type { MetricLabels, MetricColors } from "../types";

/**
 * Safely formats a metric value, handling undefined, null, and non-numeric values
 */
export function formatMetricValue(value: unknown): string {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'number') return value.toFixed(3);
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toFixed(3);
  }
  return String(value);
}

/**
 * Safely extracts a numeric value from additional metrics
 */
export function getAdditionalMetricValue(additionalMetrics: Record<string, unknown> | undefined, key: string): number | undefined {
  if (!additionalMetrics || !(key in additionalMetrics)) return undefined;
  
  const value = additionalMetrics[key];
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

/**
 * Gets metric value from a record, handling both direct properties and additionalMetrics
 */
export function getMetricValue(
  record: ProjectMetric,
  metricId: MetricType
): number | undefined {
  // First check if it's a direct property
  const directValue = record[metricId as keyof ProjectMetric];
  if (typeof directValue === "number") {
    return directValue;
  }

  // Then check in additionalMetrics using the dedicated utility function
  return getAdditionalMetricValue(record.additionalMetrics, metricId);
}

/**
 * Checks if a metric has a value in a record
 */
export function hasMetricValue(record: ProjectMetric, metricId: MetricType): boolean {
  return getMetricValue(record, metricId) !== undefined;
}

/**
 * Gets metric label from project config or falls back to default
 */
export function getMetricLabel(metricId: MetricType, selectedProject: Project | null): string {
  if (selectedProject?.metricsConfig) {
    const metricConfig = selectedProject.metricsConfig.find(
      (m) => m.id === metricId
    );
    if (metricConfig?.name) return metricConfig.name;
  }
  return (metricLabels as MetricLabels)[metricId] || metricId;
}

/**
 * Gets metric color from project config or falls back to default
 */
export function getMetricColor(metricId: MetricType, selectedProject: Project | null): string {
  if (selectedProject?.metricsConfig) {
    const metricConfig = selectedProject.metricsConfig.find(
      (m) => m.id === metricId
    );
    if (metricConfig?.color) return metricConfig.color;
  }
  return (metricColors as MetricColors)[metricId] || "hsl(200, 70%, 50%)";
}

/**
 * Gets enabled metrics from project's metrics configuration
 */
export function getEnabledMetrics(selectedProject: Project | null): MetricType[] {
  return selectedProject?.metricsConfig
    ? selectedProject.metricsConfig
        .filter((metric) => metric.enabled)
        .map((metric) => metric.id as MetricType)
    : [];
}

/**
 * Checks if a metric is a default metric
 */
export function isDefaultMetric(metricId: string): boolean {
  return ['accuracy', 'loss', 'precision', 'recall', 'f1Score'].includes(metricId);
} 
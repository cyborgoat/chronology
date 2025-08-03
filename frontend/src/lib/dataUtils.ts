import type { ProjectMetric } from "../types";

/**
 * Gets the latest value for a metric from sorted records
 */
export function getLatestValue(sortedMetrics: ProjectMetric[], metricKey: string): number | undefined {
  const latest = sortedMetrics[sortedMetrics.length - 1];
  return latest[metricKey] as number | undefined;
}

/**
 * Calculates improvement between latest and previous values
 */
export function getImprovement(sortedMetrics: ProjectMetric[], metricKey: string) {
  if (sortedMetrics.length < 2) return null;
  
  const latest = sortedMetrics[sortedMetrics.length - 1][metricKey] as number | undefined;
  const previous = sortedMetrics[sortedMetrics.length - 2][metricKey] as number | undefined;
  
  if (latest === undefined || previous === undefined) return null;
  
  const improvement = latest - previous;
  const percentChange = (improvement / previous) * 100;
  
  return {
    absolute: improvement,
    percent: percentChange,
    isPositive: improvement > 0
  };
}

/**
 * Formats percentage values with sign
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Sorts project records by timestamp
 */
export function sortRecordsByTimestamp(records: ProjectMetric[]): ProjectMetric[] {
  return [...records].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
} 
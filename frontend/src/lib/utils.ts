import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

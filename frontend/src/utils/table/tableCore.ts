import type { ProjectMetric, MetricType } from "../../types";

/**
 * Sorting configuration for table columns
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Handles sorting of metric records based on configuration
 */
export function sortMetrics(
  metrics: ProjectMetric[], 
  sortConfig: SortConfig | null,
  enabledDefaultMetrics: MetricType[],
  enabledCustomMetrics: string[]
): ProjectMetric[] {
  const sortedMetrics = [...metrics];
  
  if (!sortConfig) {
    // Default sorting: by model name, then by date
    return sortedMetrics.sort((a, b) => {
      const modelComparison = (a.modelName || "").localeCompare(b.modelName || "");
      if (modelComparison !== 0) return modelComparison;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }

  const { key, direction } = sortConfig;
  
  return sortedMetrics.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (key === 'timestamp') {
      aValue = new Date(a.timestamp).getTime();
      bValue = new Date(b.timestamp).getTime();
    } else if (key === 'modelName') {
      aValue = a.modelName || '';
      bValue = b.modelName || '';
    } else if (enabledDefaultMetrics.includes(key as MetricType)) {
      aValue = a[key as keyof ProjectMetric] || 0;
      bValue = b[key as keyof ProjectMetric] || 0;
    } else if (enabledCustomMetrics.includes(key)) {
      aValue = a.additionalMetrics?.[key] || 0;
      bValue = b.additionalMetrics?.[key] || 0;
    } else {
      aValue = 0;
      bValue = 0;
    }

    if (typeof aValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return direction === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }
  });
}

/**
 * Gets available metrics from project configuration
 */
export function getAvailableMetrics(
  metricsConfig: any[] | undefined,
  metricKeys: MetricType[]
) {
  if (!metricsConfig) return { defaultMetrics: [], customMetrics: [] };
  
  const enabledMetrics = metricsConfig.filter(metric => metric.enabled);
  const defaultMetrics = enabledMetrics
    .filter(metric => metricKeys.includes(metric.id as MetricType))
    .map(metric => metric.id as MetricType);
  const customMetrics = enabledMetrics
    .filter(metric => !metricKeys.includes(metric.id as MetricType))
    .map(metric => metric.id);
  
  return { defaultMetrics, customMetrics };
}

/**
 * Separates default and custom metrics from a record
 */
export function separateMetrics(
  values: Partial<ProjectMetric> & Record<string, any>,
  enabledCustomMetrics: string[]
) {
  const defaultMetricUpdates: Partial<ProjectMetric> = {
    timestamp: values.timestamp,
    modelName: values.modelName,
    modelVersion: values.modelVersion,
    accuracy: values.accuracy,
    loss: values.loss,
    precision: values.precision,
    recall: values.recall,
    f1Score: values.f1Score,
  };

  const customMetricsData: Record<string, any> = {};
  enabledCustomMetrics.forEach(customId => {
    const value = values[customId];
    if (value !== undefined && value !== null && value !== '') {
      customMetricsData[customId] = value;
    }
  });

  if (Object.keys(customMetricsData).length > 0) {
    defaultMetricUpdates.additionalMetrics = customMetricsData;
  }

  return defaultMetricUpdates;
}

/**
 * Creates initial edit values from a metric record
 */
export function createEditValues(metric: ProjectMetric): Partial<ProjectMetric> & Record<string, any> {
  const editVals: Partial<ProjectMetric> & Record<string, any> = {
    ...metric
  };
  
  if (metric.additionalMetrics) {
    Object.entries(metric.additionalMetrics).forEach(([key, value]) => {
      editVals[key] = value;
    });
  }
  
  return editVals;
}

/**
 * Creates initial record template
 */
export function createInitialRecord(): Partial<ProjectMetric> {
  return {
    timestamp: new Date().toISOString().split("T")[0],
    modelName: "",
  };
}

/**
 * Table style utilities for consistent theming
 */
export const tableStyles = {
  // Primary action buttons (save, add)
  primaryButton: "bg-slate-600 hover:bg-slate-700 text-white transition-colors duration-200",
  
  // Secondary action buttons (cancel, edit)
  secondaryButton: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors duration-200",
  
  // Destructive actions (delete)
  destructiveButton: "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors duration-200",
  
  // Edit mode toggle
  editModeActive: "bg-sky-100 text-sky-800 border-sky-300 transition-all duration-200",
  editModeInactive: "bg-slate-100 text-slate-700 border-slate-300 transition-all duration-200",
  
  // Row states
  editingRow: "bg-sky-50 border-sky-200 shadow-sm",
  bulkEditRow: "bg-sky-50 border-sky-200 shadow-sm",
  markedForDeletion: "opacity-50 bg-red-50 border-red-200",
  firstModelRow: "border-t-2 border-t-slate-200 bg-slate-50/30",
  
  // Form rows
  addFormRow: "bg-emerald-50 border-emerald-200",
  globalAddRow: "bg-sky-50 border-sky-200 border-2 border-dashed",
  
  // Status indicators
  statusBanner: "bg-sky-50 border border-sky-200 text-sky-800",
  pendingChanges: "bg-sky-50 border border-sky-200",
  
  // Hover states
  tableRowHover: "hover:bg-slate-50 transition-colors duration-150",
  tableRowHoverEdit: "hover:bg-sky-50/30 transition-colors duration-150",
  
  // Headers
  sortableHeader: "cursor-pointer hover:bg-slate-100 transition-colors select-none",
}; 
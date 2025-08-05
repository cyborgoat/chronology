export interface ProjectMetric {
  id: string;
  timestamp: string;
  modelName: string; // Added model dimension
  modelVersion?: string; // Optional version info
  accuracy?: number;
  loss?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  additionalMetrics?: Record<string, unknown>; // Additional custom metrics
  [key: string]: string | number | unknown | undefined;
}

export type MetricValueType = 'int' | 'float' | 'percentage' | 'string';

export interface MetricSettings {
  id: string;
  name: string;
  type: MetricValueType;
  color: string;
  unit: string;
  enabled: boolean;
  min?: number;
  max?: number;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  records: ProjectMetric[]; // Renamed from 'metrics' to 'records' to clarify meaning
  color: string;
  metricsConfig: MetricSettings[];
}

export interface ChartData {
  id: string;
  color: string;
  data: Array<{
    x: string;
    y: number;
    modelVersion?: string;
  }>;
}

export type MetricType = 'accuracy' | 'loss' | 'precision' | 'recall' | 'f1Score' | string;

export type ViewMode = 'chart' | 'table' | 'metrics';

export type ChartViewMode = 'metric-wise' | 'model-wise';

// New types to replace 'any' usage
export interface ChartPoint {
  id: string;
  x: string | Date;
  y: number;
  serieId: string;
  serieColor: string;
  seriesId: string; // Nivo uses both serieId and seriesId
  data: {
    x: string | Date;
    y: number;
    modelVersion?: string;
  };
  metricType?: MetricType;
  timestamp?: string;
  modelName?: string;
  modelVersion?: string;
  projectId?: string;
}

// Type for Nivo chart point
export interface NivoChartPoint {
  id: string;
  x: string | Date;
  y: number;
  serieId: string;
  serieColor: string;
  seriesId: string;
  data: {
    x: string | Date;
    y: number;
    modelVersion?: string;
  };
}

export interface ChartPointClickHandler {
  (point: ChartPoint): void;
}

export interface MetricLabels {
  [key: string]: string;
}

export interface MetricColors {
  [key: string]: string;
}

export interface ModelColors {
  [key: string]: string;
}

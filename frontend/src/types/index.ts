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
  [key: string]: string | number | undefined;
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
  }>;
}

export type MetricType = 'accuracy' | 'loss' | 'precision' | 'recall' | 'f1Score' | string;

export type ViewMode = 'chart' | 'table' | 'metrics';

export type ChartViewMode = 'metric-wise' | 'model-wise';

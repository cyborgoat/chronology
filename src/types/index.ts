export interface ProjectMetric {
  id: string;
  timestamp: string;
  accuracy?: number;
  loss?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  [key: string]: string | number | undefined;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  metrics: ProjectMetric[];
  color: string;
}

export interface ChartData {
  id: string;
  color: string;
  data: Array<{
    x: string;
    y: number;
  }>;
}

export type MetricType = 'accuracy' | 'loss' | 'precision' | 'recall' | 'f1Score';

export type ViewMode = 'chart' | 'table';

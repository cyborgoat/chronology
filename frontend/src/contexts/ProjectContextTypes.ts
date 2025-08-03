import type { Project, ProjectMetric, MetricType, ChartViewMode, MetricSettings } from '../types';

export interface ProjectContextType {
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  selectedProjectIds: string[]; // For project comparison (keeping for future use)
  selectedProjects: Project[]; // For project comparison (keeping for future use)
  selectedMetrics: MetricType[];
  selectedModels: string[]; // For model-wise comparison within a project
  chartViewMode: ChartViewMode;
  selectedMetricForComparison: MetricType | null; // For model-wise comparison
  
  // Loading states
  loading: boolean;
  projectsLoading: boolean;
  projectLoading: boolean;
  metricsLoading: boolean;
  
  // Actions
  loadProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string | null) => void;
  setSelectedProjectIds: (ids: string[]) => void;
  setSelectedModels: (models: string[]) => void;
  addMetricRecord: (projectId: string, metric: Omit<ProjectMetric, 'id'>) => Promise<void>;
  updateMetricRecord: (projectId: string, metricId: string, updates: Partial<ProjectMetric>) => Promise<void>;
  deleteMetricRecord: (projectId: string, metricId: string) => Promise<void>;
  setSelectedMetrics: (metrics: MetricType[]) => void;
  setChartViewMode: (mode: ChartViewMode) => void;
  setSelectedMetricForComparison: (metric: MetricType | null) => void;
  getAvailableModels: (projectId?: string) => string[];
  updateProjectMetricsConfig: (projectId: string, metricsConfig: MetricSettings[]) => Promise<void>;
} 
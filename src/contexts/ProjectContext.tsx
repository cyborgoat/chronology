import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Project, ProjectMetric, MetricType, ChartViewMode, CustomMetric } from '../types';
import { sampleProjects } from '../data/sampleData';

interface ProjectContextType {
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  selectedProjectIds: string[]; // For project comparison (keeping for future use)
  selectedProjects: Project[]; // For project comparison (keeping for future use)
  selectedMetrics: MetricType[];
  selectedModels: string[]; // For model-wise comparison within a project
  chartViewMode: ChartViewMode;
  selectedMetricForComparison: MetricType | null; // For model-wise comparison
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  setSelectedProjectIds: (ids: string[]) => void;
  setSelectedModels: (models: string[]) => void;
  addMetric: (projectId: string, metric: Omit<ProjectMetric, 'id'>) => void;
  updateMetric: (projectId: string, metricId: string, updates: Partial<ProjectMetric>) => void;
  deleteMetric: (projectId: string, metricId: string) => void;
  setSelectedMetrics: (metrics: MetricType[]) => void;
  setChartViewMode: (mode: ChartViewMode) => void;
  setSelectedMetricForComparison: (metric: MetricType | null) => void;
  getAvailableModels: (projectId?: string) => string[];
  updateProjectMetricsConfig: (projectId: string, customMetrics: CustomMetric[], enabledDefaultMetrics: string[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(sampleProjects[0]?.id || null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['accuracy', 'loss']);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('metric-wise');
  const [selectedMetricForComparison, setSelectedMetricForComparison] = useState<MetricType | null>('accuracy');

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;
  const selectedProjects = projects.filter(p => selectedProjectIds.includes(p.id));

  const getAvailableModels = (projectId?: string): string[] => {
    const targetProject = projectId ? projects.find(p => p.id === projectId) : selectedProject;
    if (!targetProject) return [];
    
    const modelNames = [...new Set(targetProject.metrics.map(m => m.modelName))];
    return modelNames;
  };

  const addProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    ));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  }, [selectedProjectId]);

  const selectProject = useCallback((id: string | null) => {
    setSelectedProjectId(id);
  }, []);

  const addMetric = useCallback((projectId: string, metricData: Omit<ProjectMetric, 'id'>) => {
    const newMetric: ProjectMetric = {
      id: `${projectId}-${Date.now()}`,
      ...metricData,
    };
    
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            metrics: [...project.metrics, newMetric].sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ),
            updatedAt: new Date().toISOString()
          }
        : project
    ));
  }, []);

  const updateMetric = useCallback((projectId: string, metricId: string, updates: Partial<ProjectMetric>) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            metrics: project.metrics.map(metric =>
              metric.id === metricId ? { ...metric, ...updates } : metric
            ),
            updatedAt: new Date().toISOString()
          }
        : project
    ));
  }, []);

  const deleteMetric = useCallback((projectId: string, metricId: string) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            metrics: project.metrics.filter(metric => metric.id !== metricId),
            updatedAt: new Date().toISOString()
          }
        : project
    ));
  }, []);

  const updateProjectMetricsConfig = useCallback((projectId: string, customMetrics: CustomMetric[], enabledDefaultMetrics: string[]) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? {
            ...project,
            customMetrics,
            enabledDefaultMetrics,
            updatedAt: new Date().toISOString()
          }
        : project
    ));
  }, []);

  const contextValue: ProjectContextType = {
    projects,
    selectedProjectId,
    selectedProject,
    selectedProjectIds,
    selectedProjects,
    selectedMetrics,
    selectedModels,
    chartViewMode,
    selectedMetricForComparison,
    addProject,
    updateProject,
    deleteProject,
    selectProject,
    setSelectedProjectIds,
    setSelectedModels,
    addMetric,
    updateMetric,
    deleteMetric,
    setSelectedMetrics,
    setChartViewMode,
    setSelectedMetricForComparison,
    getAvailableModels,
    updateProjectMetricsConfig,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

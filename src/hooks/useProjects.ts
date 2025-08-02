import { useState, useEffect, useCallback } from 'react';
import { ProjectsApi, MetricsApi, getDefaultMetricsConfig } from '../services/api';
import type { Project, ProjectMetric, MetricSettings, MetricType, ChartViewMode } from '../types';

interface UseProjectsReturn {
  // State
  projects: Project[];
  selectedProject: Project | null;
  selectedProjectId: string | null;
  selectedProjectIds: string[];
  selectedProjects: Project[];
  selectedMetrics: MetricType[];
  selectedModels: string[];
  chartViewMode: ChartViewMode;
  selectedMetricForComparison: MetricType | null;
  
  // Loading states
  loading: boolean;
  projectsLoading: boolean;
  projectLoading: boolean;
  metricsLoading: boolean;
  
  // Actions
  loadProjects: () => Promise<void>;
  selectProject: (id: string | null) => void;
  setSelectedProjectIds: (ids: string[]) => void;
  setSelectedModels: (models: string[]) => void;
  setSelectedMetrics: (metrics: MetricType[]) => void;
  setChartViewMode: (mode: ChartViewMode) => void;
  setSelectedMetricForComparison: (metric: MetricType | null) => void;
  
  // Project operations
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectMetricsConfig: (projectId: string, metricsConfig: MetricSettings[]) => Promise<void>;
  
  // Metric operations
  addMetric: (projectId: string, metric: Omit<ProjectMetric, 'id'>) => Promise<void>;
  updateMetric: (projectId: string, metricId: string, updates: Partial<ProjectMetric>) => Promise<void>;
  deleteMetric: (projectId: string, metricId: string) => Promise<void>;
  
  // Utilities
  getAvailableModels: (projectId?: string) => string[];
}

export function useProjects(): UseProjectsReturn {
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['accuracy', 'loss']);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('metric-wise');
  const [selectedMetricForComparison, setSelectedMetricForComparison] = useState<MetricType | null>('accuracy');
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Computed values
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;
  const selectedProjects = projects.filter(p => selectedProjectIds.includes(p.id));

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Auto-select first project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      setLoading(true);
      const projectsData = await ProjectsApi.getProjects();
      
      // Ensure all projects have metrics config
      const projectsWithConfig = projectsData.map(project => ({
        ...project,
        metricsConfig: project.metricsConfig?.length > 0 
          ? project.metricsConfig 
          : getDefaultMetricsConfig()
      }));
      
      setProjects(projectsWithConfig);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setProjectsLoading(false);
      setLoading(false);
    }
  }, []);

  // Project selection
  const selectProject = useCallback((id: string | null) => {
    setSelectedProjectId(id);
  }, []);

  // Project operations
  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setProjectLoading(true);
      const projectWithConfig = {
        ...projectData,
        metricsConfig: projectData.metricsConfig?.length > 0 
          ? projectData.metricsConfig 
          : getDefaultMetricsConfig()
      };
      const newProject = await ProjectsApi.createProject(projectWithConfig);
      setProjects(prev => [...prev, newProject]);
    } catch (error) {
      console.error('Failed to add project:', error);
    } finally {
      setProjectLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      setProjectLoading(true);
      const updatedProject = await ProjectsApi.updateProject(id, updates);
      if (updatedProject) {
        setProjects(prev => prev.map(project => 
          project.id === id ? updatedProject : project
        ));
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setProjectLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      setProjectLoading(true);
      const success = await ProjectsApi.deleteProject(id);
      if (success) {
        setProjects(prev => prev.filter(project => project.id !== id));
        if (selectedProjectId === id) {
          setSelectedProjectId(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setProjectLoading(false);
    }
  }, [selectedProjectId]);

  const updateProjectMetricsConfig = useCallback(async (projectId: string, metricsConfig: MetricSettings[]) => {
    try {
      const updatedProject = await ProjectsApi.updateProjectMetricsConfig(projectId, metricsConfig);
      if (updatedProject) {
        setProjects(prev => prev.map(project => 
          project.id === projectId ? updatedProject : project
        ));
      }
    } catch (error) {
      console.error('Failed to update project metrics config:', error);
    }
  }, []);

  // Metric operations
  const addMetric = useCallback(async (projectId: string, metricData: Omit<ProjectMetric, 'id'>) => {
    try {
      setMetricsLoading(true);
      const newMetric = await MetricsApi.addMetric(projectId, metricData);
      if (newMetric) {
        // Reload the specific project to get updated metrics
        const updatedProject = await ProjectsApi.getProject(projectId);
        if (updatedProject) {
          setProjects(prev => prev.map(project => 
            project.id === projectId ? updatedProject : project
          ));
        }
      }
    } catch (error) {
      console.error('Failed to add metric:', error);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const updateMetric = useCallback(async (projectId: string, metricId: string, updates: Partial<ProjectMetric>) => {
    try {
      setMetricsLoading(true);
      const updatedMetric = await MetricsApi.updateMetric(projectId, metricId, updates);
      if (updatedMetric) {
        // Reload the specific project to get updated metrics
        const updatedProject = await ProjectsApi.getProject(projectId);
        if (updatedProject) {
          setProjects(prev => prev.map(project => 
            project.id === projectId ? updatedProject : project
          ));
        }
      }
    } catch (error) {
      console.error('Failed to update metric:', error);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const deleteMetric = useCallback(async (projectId: string, metricId: string) => {
    try {
      setMetricsLoading(true);
      const success = await MetricsApi.deleteMetric(projectId, metricId);
      if (success) {
        // Reload the specific project to get updated metrics
        const updatedProject = await ProjectsApi.getProject(projectId);
        if (updatedProject) {
          setProjects(prev => prev.map(project => 
            project.id === projectId ? updatedProject : project
          ));
        }
      }
    } catch (error) {
      console.error('Failed to delete metric:', error);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // Utilities
  const getAvailableModels = useCallback((projectId?: string): string[] => {
    const targetProject = projectId ? projects.find(p => p.id === projectId) : selectedProject;
    if (!targetProject) return [];
    
    const modelNames = [...new Set(targetProject.metrics.map(m => m.modelName))];
    return modelNames;
  }, [projects, selectedProject]);

  return {
    // State
    projects,
    selectedProject,
    selectedProjectId,
    selectedProjectIds,
    selectedProjects,
    selectedMetrics,
    selectedModels,
    chartViewMode,
    selectedMetricForComparison,
    
    // Loading states
    loading,
    projectsLoading,
    projectLoading,
    metricsLoading,
    
    // Actions
    loadProjects,
    selectProject,
    setSelectedProjectIds,
    setSelectedModels,
    setSelectedMetrics,
    setChartViewMode,
    setSelectedMetricForComparison,
    
    // Project operations
    addProject,
    updateProject,
    deleteProject,
    updateProjectMetricsConfig,
    
    // Metric operations
    addMetric,
    updateMetric,
    deleteMetric,
    
    // Utilities
    getAvailableModels,
  };
}

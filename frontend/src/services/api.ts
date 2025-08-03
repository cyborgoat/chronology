import type { Project, ProjectMetric, MetricSettings } from '../types';
import { API_BASE_URL, API_ENDPOINTS, HTTP_METHODS, DEFAULT_HEADERS } from '../config/api';
import { ApiErrorHandler } from '../utils/errorHandling';

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export class ProjectService {
  // Get all projects
  static async getProjects(): Promise<Project[]> {
    console.log('Fetching projects from:', `${API_BASE_URL}${API_ENDPOINTS.projects}`);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.projects}`);
      console.log('Projects response status:', response.status);
      const data = await handleResponse<Project[]>(response);
      console.log('Projects data received:', data.length, 'projects');
      return data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get a single project by ID
  static async getProject(id: string): Promise<Project | null> {
    console.log('Fetching project:', id);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.project(id)}`);
      console.log('Project response status:', response.status);
      return handleResponse<Project>(response);
    } catch (error) {
      if (ApiErrorHandler.isNotFoundError(error)) {
        return null;
      }
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Create a new project
  static async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    console.log('Creating project:', projectData.name);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.projects}`, {
        method: HTTP_METHODS.POST,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(projectData),
      });
      console.log('Create project response status:', response.status);
      return handleResponse<Project>(response);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update an existing project
  static async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    console.log('Updating project:', id);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.project(id)}`, {
        method: HTTP_METHODS.PUT,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(updates),
      });
      console.log('Update project response status:', response.status);
      return handleResponse<Project>(response);
    } catch (error) {
      if (ApiErrorHandler.isNotFoundError(error)) {
        return null;
      }
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete a project
  static async deleteProject(id: string): Promise<boolean> {
    console.log('Deleting project:', id);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.project(id)}`, {
        method: HTTP_METHODS.DELETE,
      });
      console.log('Delete project response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // Get available models for a project
  static async getAvailableModels(projectId: string): Promise<string[]> {
    console.log('Getting available models for project:', projectId);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.projectModels(projectId)}`);
      console.log('Get models response status:', response.status);
      const data = await handleResponse<{ models: string[] }>(response);
      console.log('Available models:', data.models);
      return data.models;
    } catch (error) {
      console.error('Error getting available models:', error);
      return [];
    }
  }
}

export class MetricRecordService {
  // Get all metric records for a project
  static async getProjectMetricRecords(projectId: string): Promise<ProjectMetric[]> {
    console.log('Fetching metric records for project:', projectId);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.projectMetrics(projectId)}`);
      console.log('Metric records response status:', response.status);
      const data = await handleResponse<ProjectMetric[]>(response);
      console.log('Metric records data received:', data.length, 'records');
      return data;
    } catch (error) {
      console.error('Error fetching metric records:', error);
      throw error;
    }
  }

  // Create a new metric record
  static async createMetricRecord(projectId: string, metricData: Omit<ProjectMetric, 'id'>): Promise<ProjectMetric | null> {
    console.log('Creating metric record for project:', projectId);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.projectMetrics(projectId)}`, {
        method: HTTP_METHODS.POST,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(metricData),
      });
      console.log('Create metric record response status:', response.status);
      return handleResponse<ProjectMetric>(response);
    } catch (error) {
      console.error('Error creating metric record:', error);
      return null;
    }
  }

  // Update a metric record
  static async updateMetricRecord(projectId: string, metricId: string, updates: Partial<ProjectMetric>): Promise<ProjectMetric | null> {
    console.log('Updating metric record:', metricId);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.metricRecord(projectId, metricId)}`, {
        method: HTTP_METHODS.PUT,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(updates),
      });
      console.log('Update metric record response status:', response.status);
      return handleResponse<ProjectMetric>(response);
    } catch (error) {
      console.error('Error updating metric record:', error);
      return null;
    }
  }

  // Delete a metric record
  static async deleteMetricRecord(projectId: string, metricId: string): Promise<boolean> {
    console.log('Deleting metric record:', metricId);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.metricRecord(projectId, metricId)}`, {
        method: HTTP_METHODS.DELETE,
      });
      console.log('Delete metric record response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Error deleting metric record:', error);
      return false;
    }
  }
}

export class MetricSettingsService {
  // Update project metrics configuration
  static async updateProjectMetricsConfig(projectId: string, metricsConfig: MetricSettings[]): Promise<boolean> {
    console.log('Updating metrics config for project:', projectId);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.projectMetricsConfig(projectId)}`, {
        method: HTTP_METHODS.PUT,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(metricsConfig),
      });
      
      console.log('Update metrics config response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Error updating metrics config:', error);
      return false;
    }
  }

  // Create a new metric definition
  static async createMetricDefinition(projectId: string, metricDefinition: MetricSettings): Promise<boolean> {
    console.log('Creating metric definition for project:', projectId);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.projectMetricsDefinitions(projectId)}`, {
        method: HTTP_METHODS.POST,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(metricDefinition),
      });
      
      console.log('Create metric definition response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Error creating metric definition:', error);
      return false;
    }
  }

  // Delete metric definition
  static async deleteMetricDefinition(projectId: string, metricId: string): Promise<boolean> {
    console.log('Deleting metric definition:', metricId);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.metricDefinition(projectId, metricId)}`, {
        method: HTTP_METHODS.DELETE,
      });
      
      console.log('Delete metric definition response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Error deleting metric definition:', error);
      return false;
    }
  }
}

// Default metrics configuration generator
export const getDefaultMetricsConfig = (): MetricSettings[] => [
  {
    id: 'accuracy',
    name: 'Accuracy',
    type: 'percentage' as const,
    color: 'hsl(200, 100%, 50%)',
    unit: '%',
    enabled: true,
    min: 0,
    max: 1,
    description: 'Model prediction accuracy'
  },
  {
    id: 'loss',
    name: 'Loss',
    type: 'float' as const,
    color: 'hsl(0, 100%, 50%)',
    unit: '',
    enabled: true,
    min: 0,
    description: 'Training loss value'
  },
  {
    id: 'precision',
    name: 'Precision',
    type: 'percentage' as const,
    color: 'hsl(120, 100%, 40%)',
    unit: '%',
    enabled: true,
    min: 0,
    max: 1,
    description: 'Model precision score'
  },
  {
    id: 'recall',
    name: 'Recall',
    type: 'percentage' as const,
    color: 'hsl(60, 100%, 50%)',
    unit: '%',
    enabled: true,
    min: 0,
    max: 1,
    description: 'Model recall score'
  },
  {
    id: 'f1Score',
    name: 'F1 Score',
    type: 'percentage' as const,
    color: 'hsl(280, 100%, 50%)',
    unit: '%',
    enabled: true,
    min: 0,
    max: 1,
    description: 'F1 score metric'
  }
];

// Legacy aliases for backward compatibility
export const ProjectsApi = ProjectService;
export const MetricsApi = MetricRecordService;

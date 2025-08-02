import type { Project, ProjectMetric, MetricSettings } from '../types';

// API base URL - adjust this based on your backend URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export class ProjectsApi {
  // Get all projects
  static async getProjects(): Promise<Project[]> {
    console.log('Fetching projects from:', `${API_BASE_URL}/projects`);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`);
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
      const response = await fetch(`${API_BASE_URL}/projects/${id}`);
      console.log('Project response status:', response.status);
      return handleResponse<Project>(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
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
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      console.log('Update project response status:', response.status);
      return handleResponse<Project>(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
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
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
      });
      console.log('Delete project response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // Update project metrics configuration
  static async updateProjectMetricsConfig(projectId: string, metricsConfig: MetricSettings[]): Promise<Project | null> {
    console.log('Updating metrics config for project:', projectId);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/metrics-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricsConfig),
      });
      
      console.log('Update metrics config response status:', response.status);
      
      if (response.ok) {
        // Return the updated project
        return this.getProject(projectId);
      }
      return null;
    } catch (error) {
      console.error('Error updating metrics config:', error);
      return null;
    }
  }
}

export class MetricsApi {
  // Add a metric to a project
  static async addMetric(projectId: string, metricData: Omit<ProjectMetric, 'id'>): Promise<ProjectMetric | null> {
    console.log('Adding metric to project:', projectId);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricData),
      });
      console.log('Add metric response status:', response.status);
      return handleResponse<ProjectMetric>(response);
    } catch (error) {
      console.error('Error adding metric:', error);
      return null;
    }
  }

  // Update a metric
  static async updateMetric(projectId: string, metricId: string, updates: Partial<ProjectMetric>): Promise<ProjectMetric | null> {
    console.log('Updating metric:', metricId);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/metrics/${metricId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      console.log('Update metric response status:', response.status);
      return handleResponse<ProjectMetric>(response);
    } catch (error) {
      console.error('Error updating metric:', error);
      return null;
    }
  }

  // Delete a metric
  static async deleteMetric(projectId: string, metricId: string): Promise<boolean> {
    console.log('Deleting metric:', metricId);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/metrics/${metricId}`, {
        method: 'DELETE',
      });
      console.log('Delete metric response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Error deleting metric:', error);
      return false;
    }
  }

  // Get available models for a project
  static async getAvailableModels(projectId: string): Promise<string[]> {
    console.log('Getting available models for project:', projectId);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/models`);
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

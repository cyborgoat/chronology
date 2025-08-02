import type { Project, ProjectMetric, MetricSettings } from '../types';
import { sampleProjects } from '../data/sampleData';

// Mock API delay to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database storage (in real app, this would be replaced with actual API calls)
let projectsDatabase: Project[] = [...sampleProjects];

export class ProjectsApi {
  // Get all projects
  static async getProjects(): Promise<Project[]> {
    await delay(300);
    return [...projectsDatabase];
  }

  // Get a single project by ID
  static async getProject(id: string): Promise<Project | null> {
    await delay(200);
    const project = projectsDatabase.find(p => p.id === id);
    return project ? { ...project } : null;
  }

  // Create a new project
  static async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    await delay(400);
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projectsDatabase.push(newProject);
    return { ...newProject };
  }

  // Update an existing project
  static async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    await delay(300);
    const projectIndex = projectsDatabase.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;
    
    const updatedProject = {
      ...projectsDatabase[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    projectsDatabase[projectIndex] = updatedProject;
    return { ...updatedProject };
  }

  // Delete a project
  static async deleteProject(id: string): Promise<boolean> {
    await delay(300);
    const initialLength = projectsDatabase.length;
    projectsDatabase = projectsDatabase.filter(p => p.id !== id);
    return projectsDatabase.length < initialLength;
  }

  // Update project metrics configuration
  static async updateProjectMetricsConfig(projectId: string, metricsConfig: MetricSettings[]): Promise<Project | null> {
    await delay(300);
    const projectIndex = projectsDatabase.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return null;
    
    const updatedProject = {
      ...projectsDatabase[projectIndex],
      metricsConfig,
      updatedAt: new Date().toISOString(),
    };
    projectsDatabase[projectIndex] = updatedProject;
    return { ...updatedProject };
  }
}

export class MetricsApi {
  // Add a metric to a project
  static async addMetric(projectId: string, metricData: Omit<ProjectMetric, 'id'>): Promise<ProjectMetric | null> {
    await delay(300);
    const projectIndex = projectsDatabase.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return null;

    const newMetric: ProjectMetric = {
      id: `${projectId}-${Date.now()}`,
      timestamp: metricData.timestamp as string,
      modelName: metricData.modelName as string,
      ...metricData,
    };

    const updatedProject = {
      ...projectsDatabase[projectIndex],
      records: [...projectsDatabase[projectIndex].records, newMetric].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
      updatedAt: new Date().toISOString(),
    };
    
    projectsDatabase[projectIndex] = updatedProject;
    return { ...newMetric };
  }

  // Update a metric
  static async updateMetric(projectId: string, metricId: string, updates: Partial<ProjectMetric>): Promise<ProjectMetric | null> {
    await delay(300);
    const projectIndex = projectsDatabase.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return null;

    const metricIndex = projectsDatabase[projectIndex].records.findIndex(m => m.id === metricId);
    if (metricIndex === -1) return null;

    const updatedMetric = {
      ...projectsDatabase[projectIndex].records[metricIndex],
      ...updates,
    };
    
    const updatedProject = {
      ...projectsDatabase[projectIndex],
      records: projectsDatabase[projectIndex].records.map((metric, index) =>
        index === metricIndex ? updatedMetric : metric
      ),
      updatedAt: new Date().toISOString(),
    };
    
    projectsDatabase[projectIndex] = updatedProject;
    return { ...updatedMetric };
  }

  // Delete a metric
  static async deleteMetric(projectId: string, metricId: string): Promise<boolean> {
    await delay(300);
    const projectIndex = projectsDatabase.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return false;

    const initialLength = projectsDatabase[projectIndex].records.length;
    const updatedProject = {
      ...projectsDatabase[projectIndex],
      records: projectsDatabase[projectIndex].records.filter(m => m.id !== metricId),
      updatedAt: new Date().toISOString(),
    };
    
    projectsDatabase[projectIndex] = updatedProject;
    return projectsDatabase[projectIndex].records.length < initialLength;
  }

  // Get available models for a project
  static async getAvailableModels(projectId: string): Promise<string[]> {
    await delay(100);
    const project = projectsDatabase.find(p => p.id === projectId);
    if (!project) return [];
    
    const modelNames = [...new Set((project.records ?? []).map((m: ProjectMetric) => m.modelName))] as string[];
    return modelNames;
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

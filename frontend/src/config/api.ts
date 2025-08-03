/**
 * API Configuration for the Chronology frontend
 */

// API base URL - adjust this based on your backend URL
export const API_BASE_URL = 'http://localhost:8000/api/v1';

// API endpoints
export const API_ENDPOINTS = {
  // Project endpoints
  projects: '/projects',
  project: (id: string) => `/projects/${id}`,
  
  // Metric record endpoints
  projectMetrics: (projectId: string) => `/projects/${projectId}/metrics`,
  metricRecord: (projectId: string, metricId: string) => `/projects/${projectId}/metrics/${metricId}`,
  
  // Metric settings endpoints
  projectMetricsConfig: (projectId: string) => `/projects/${projectId}/metrics-config`,
  projectMetricsDefinitions: (projectId: string) => `/projects/${projectId}/metrics-definitions`,
  metricDefinition: (projectId: string, metricId: string) => `/projects/${projectId}/metrics-definitions/${metricId}`,
  
  // Utility endpoints
  projectModels: (projectId: string) => `/projects/${projectId}/models`,
} as const;

// HTTP methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

// Default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const; 
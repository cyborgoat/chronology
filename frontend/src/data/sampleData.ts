import type { Project, MetricSettings } from '../types';

// Default metrics configuration
const getDefaultMetrics = (): MetricSettings[] => [
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

// Sample projects data
export const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Image Classification Model',
    description: 'CNN model for image classification using ResNet architecture',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-30',
    color: 'hsl(200, 100%, 50%)',
    metricsConfig: getDefaultMetrics(),
    records: [
      // ResNet-50 model
      { id: '1-1', projectId: '1', timestamp: '2024-01-01', modelName: 'ResNet-50', accuracy: 0.75, loss: 0.65, precision: 0.73, recall: 0.72, f1Score: 0.725 },
      { id: '1-2', projectId: '1', timestamp: '2024-02-01', modelName: 'ResNet-50', accuracy: 0.82, loss: 0.48, precision: 0.80, recall: 0.79, f1Score: 0.795 },
      { id: '1-3', projectId: '1', timestamp: '2024-03-01', modelName: 'ResNet-50', accuracy: 0.87, loss: 0.35, precision: 0.85, recall: 0.84, f1Score: 0.845 },
      
      // EfficientNet-B0 model
      { id: '1-4', projectId: '1', timestamp: '2024-01-15', modelName: 'EfficientNet-B0', accuracy: 0.78, loss: 0.58, precision: 0.76, recall: 0.75, f1Score: 0.755 },
      { id: '1-5', projectId: '1', timestamp: '2024-02-15', modelName: 'EfficientNet-B0', accuracy: 0.85, loss: 0.42, precision: 0.83, recall: 0.82, f1Score: 0.825 },
      { id: '1-6', projectId: '1', timestamp: '2024-03-15', modelName: 'EfficientNet-B0', accuracy: 0.90, loss: 0.32, precision: 0.88, recall: 0.87, f1Score: 0.875 },
      
      // Vision Transformer model
      { id: '1-7', projectId: '1', timestamp: '2024-02-01', modelName: 'Vision Transformer', accuracy: 0.80, loss: 0.52, precision: 0.78, recall: 0.77, f1Score: 0.775 },
      { id: '1-8', projectId: '1', timestamp: '2024-03-01', modelName: 'Vision Transformer', accuracy: 0.88, loss: 0.38, precision: 0.86, recall: 0.85, f1Score: 0.855 },
      { id: '1-9', projectId: '1', timestamp: '2024-04-01', modelName: 'Vision Transformer', accuracy: 0.93, loss: 0.25, precision: 0.91, recall: 0.90, f1Score: 0.905 },
    ]
  },
  {
    id: '2',
    name: 'NLP Sentiment Analysis',
    description: 'Transformer-based models for sentiment analysis on social media data',
    createdAt: '2024-02-15',
    updatedAt: '2024-06-30',
    color: 'hsl(120, 100%, 40%)',
    metricsConfig: getDefaultMetrics(),
    records: [
      // BERT model
      { id: '2-1', projectId: '2', timestamp: '2024-02-15', modelName: 'BERT-base', accuracy: 0.68, loss: 0.78, precision: 0.65, recall: 0.67, f1Score: 0.66 },
      { id: '2-2', projectId: '2', timestamp: '2024-03-15', modelName: 'BERT-base', accuracy: 0.76, loss: 0.58, precision: 0.74, recall: 0.75, f1Score: 0.745 },
      { id: '2-3', projectId: '2', timestamp: '2024-04-15', modelName: 'BERT-base', accuracy: 0.83, loss: 0.42, precision: 0.81, recall: 0.82, f1Score: 0.815 },
      
      // RoBERTa model
      { id: '2-4', projectId: '2', timestamp: '2024-03-01', modelName: 'RoBERTa-base', accuracy: 0.72, loss: 0.65, precision: 0.70, recall: 0.71, f1Score: 0.705 },
      { id: '2-5', projectId: '2', timestamp: '2024-04-01', modelName: 'RoBERTa-base', accuracy: 0.79, loss: 0.48, precision: 0.77, recall: 0.78, f1Score: 0.775 },
      { id: '2-6', projectId: '2', timestamp: '2024-05-01', modelName: 'RoBERTa-base', accuracy: 0.86, loss: 0.35, precision: 0.84, recall: 0.85, f1Score: 0.845 },
      
      // DistilBERT model
      { id: '2-7', projectId: '2', timestamp: '2024-03-15', modelName: 'DistilBERT', accuracy: 0.70, loss: 0.68, precision: 0.68, recall: 0.69, f1Score: 0.685 },
      { id: '2-8', projectId: '2', timestamp: '2024-04-15', modelName: 'DistilBERT', accuracy: 0.77, loss: 0.52, precision: 0.75, recall: 0.76, f1Score: 0.755 },
      { id: '2-9', projectId: '2', timestamp: '2024-05-15', modelName: 'DistilBERT', accuracy: 0.84, loss: 0.38, precision: 0.82, recall: 0.83, f1Score: 0.825 },
    ]
  },
  {
    id: '3',
    name: 'Time Series Forecasting',
    description: 'Various models for stock price prediction',
    createdAt: '2024-03-01',
    updatedAt: '2024-06-30',
    color: 'hsl(300, 100%, 50%)',
    metricsConfig: getDefaultMetrics(),
    records: [
      // LSTM model
      { id: '3-1', projectId: '3', timestamp: '2024-03-01', modelName: 'LSTM', accuracy: 0.62, loss: 0.85, precision: 0.60, recall: 0.63, f1Score: 0.615 },
      { id: '3-2', projectId: '3', timestamp: '2024-04-01', modelName: 'LSTM', accuracy: 0.71, loss: 0.68, precision: 0.69, recall: 0.72, f1Score: 0.705 },
      { id: '3-3', projectId: '3', timestamp: '2024-05-01', modelName: 'LSTM', accuracy: 0.78, loss: 0.52, precision: 0.76, recall: 0.79, f1Score: 0.775 },
      
      // GRU model
      { id: '3-4', projectId: '3', timestamp: '2024-03-15', modelName: 'GRU', accuracy: 0.65, loss: 0.78, precision: 0.63, recall: 0.66, f1Score: 0.645 },
      { id: '3-5', projectId: '3', timestamp: '2024-04-15', modelName: 'GRU', accuracy: 0.73, loss: 0.62, precision: 0.71, recall: 0.74, f1Score: 0.725 },
      { id: '3-6', projectId: '3', timestamp: '2024-05-15', modelName: 'GRU', accuracy: 0.80, loss: 0.48, precision: 0.78, recall: 0.81, f1Score: 0.795 },
      
      // Transformer model
      { id: '3-7', projectId: '3', timestamp: '2024-04-01', modelName: 'Transformer', accuracy: 0.69, loss: 0.72, precision: 0.67, recall: 0.70, f1Score: 0.685 },
      { id: '3-8', projectId: '3', timestamp: '2024-05-01', modelName: 'Transformer', accuracy: 0.76, loss: 0.55, precision: 0.74, recall: 0.77, f1Score: 0.755 },
      { id: '3-9', projectId: '3', timestamp: '2024-06-01', modelName: 'Transformer', accuracy: 0.83, loss: 0.42, precision: 0.81, recall: 0.84, f1Score: 0.825 },
    ]
  }
];

export const metricColors = {
  accuracy: 'hsl(200, 100%, 50%)',
  loss: 'hsl(0, 100%, 50%)',
  precision: 'hsl(120, 100%, 40%)',
  recall: 'hsl(60, 100%, 50%)',
  f1Score: 'hsl(300, 100%, 50%)'
};

export const metricLabels = {
  accuracy: 'Accuracy',
  loss: 'Loss',
  precision: 'Precision',
  recall: 'Recall',
  f1Score: 'F1 Score'
};

// Model colors for consistent visualization
export const modelColors: { [key: string]: string } = {
  // Image Classification Models
  'ResNet-50': 'hsl(200, 80%, 60%)',
  'EfficientNet-B0': 'hsl(140, 80%, 60%)',
  'Vision Transformer': 'hsl(280, 80%, 60%)',
  
  // NLP Models
  'BERT-base': 'hsl(30, 80%, 60%)',
  'RoBERTa-base': 'hsl(60, 80%, 60%)',
  'DistilBERT': 'hsl(90, 80%, 60%)',
  
  // Time Series Models
  'LSTM': 'hsl(320, 80%, 60%)',
  'GRU': 'hsl(350, 80%, 60%)',
  'Transformer': 'hsl(20, 80%, 60%)',
  
  // Fallback colors for new models
  'default-1': 'hsl(180, 70%, 50%)',
  'default-2': 'hsl(240, 70%, 50%)',
  'default-3': 'hsl(300, 70%, 50%)',
  'default-4': 'hsl(120, 70%, 50%)',
  'default-5': 'hsl(60, 70%, 50%)',
};

import type { Project } from '../types';

// Sample projects data
export const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Image Classification Model',
    description: 'CNN model for image classification using ResNet architecture',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-30',
    color: 'hsl(200, 100%, 50%)',
    metrics: [
      { id: '1-1', timestamp: '2024-01-01', accuracy: 0.75, loss: 0.65, precision: 0.73, recall: 0.72, f1Score: 0.725 },
      { id: '1-2', timestamp: '2024-02-01', accuracy: 0.82, loss: 0.48, precision: 0.80, recall: 0.79, f1Score: 0.795 },
      { id: '1-3', timestamp: '2024-03-01', accuracy: 0.87, loss: 0.35, precision: 0.85, recall: 0.84, f1Score: 0.845 },
      { id: '1-4', timestamp: '2024-04-01', accuracy: 0.91, loss: 0.28, precision: 0.89, recall: 0.88, f1Score: 0.885 },
      { id: '1-5', timestamp: '2024-05-01', accuracy: 0.93, loss: 0.22, precision: 0.92, recall: 0.91, f1Score: 0.915 },
      { id: '1-6', timestamp: '2024-06-01', accuracy: 0.95, loss: 0.18, precision: 0.94, recall: 0.93, f1Score: 0.935 },
    ]
  },
  {
    id: '2',
    name: 'NLP Sentiment Analysis',
    description: 'BERT-based model for sentiment analysis on social media data',
    createdAt: '2024-02-15',
    updatedAt: '2024-06-30',
    color: 'hsl(120, 100%, 40%)',
    metrics: [
      { id: '2-1', timestamp: '2024-02-15', accuracy: 0.68, loss: 0.78, precision: 0.65, recall: 0.67, f1Score: 0.66 },
      { id: '2-2', timestamp: '2024-03-15', accuracy: 0.76, loss: 0.58, precision: 0.74, recall: 0.75, f1Score: 0.745 },
      { id: '2-3', timestamp: '2024-04-15', accuracy: 0.83, loss: 0.42, precision: 0.81, recall: 0.82, f1Score: 0.815 },
      { id: '2-4', timestamp: '2024-05-15', accuracy: 0.88, loss: 0.32, precision: 0.86, recall: 0.87, f1Score: 0.865 },
      { id: '2-5', timestamp: '2024-06-15', accuracy: 0.91, loss: 0.25, precision: 0.89, recall: 0.90, f1Score: 0.895 },
    ]
  },
  {
    id: '3',
    name: 'Time Series Forecasting',
    description: 'LSTM model for stock price prediction',
    createdAt: '2024-03-01',
    updatedAt: '2024-06-30',
    color: 'hsl(300, 100%, 50%)',
    metrics: [
      { id: '3-1', timestamp: '2024-03-01', accuracy: 0.62, loss: 0.85, precision: 0.60, recall: 0.63, f1Score: 0.615 },
      { id: '3-2', timestamp: '2024-04-01', accuracy: 0.71, loss: 0.68, precision: 0.69, recall: 0.72, f1Score: 0.705 },
      { id: '3-3', timestamp: '2024-05-01', accuracy: 0.78, loss: 0.52, precision: 0.76, recall: 0.79, f1Score: 0.775 },
      { id: '3-4', timestamp: '2024-06-01', accuracy: 0.84, loss: 0.38, precision: 0.82, recall: 0.85, f1Score: 0.835 },
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

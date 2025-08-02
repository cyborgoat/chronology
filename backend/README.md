# Chronology Backend

A FastAPI-based backend service for Chronology, a timeline visualization app for AI projects.

## Features

- **Project Management**: Create, read, update, and delete AI projects
- **Metrics Tracking**: Store and manage performance metrics for different models
- **Metric Configuration**: Configure which metrics to track and how to display them
- **SQLite Database**: Lightweight database for data persistence
- **RESTful API**: Clean REST API for frontend integration

## Setup

### Prerequisites

- Python 3.9+
- uv package manager

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
uv sync
```

3. Run the development server:
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start on `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Interactive API docs**: `http://localhost:8000/docs`
- **ReDoc documentation**: `http://localhost:8000/redoc`

## API Endpoints

### Projects

#### Get All Projects
```
GET /api/v1/projects
```

#### Get Project by ID
```
GET /api/v1/projects/{project_id}
```

#### Create Project
```
POST /api/v1/projects
Content-Type: application/json

{
  "name": "Project Name",
  "description": "Project description",
  "color": "hsl(200, 100%, 50%)",
  "metricsConfig": [...]
}
```

#### Update Project
```
PUT /api/v1/projects/{project_id}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "color": "hsl(120, 100%, 40%)",
  "metricsConfig": [...]
}
```

#### Delete Project
```
DELETE /api/v1/projects/{project_id}
```

### Metrics

#### Get Project Metrics
```
GET /api/v1/projects/{project_id}/metrics
```

#### Add Metric to Project
```
POST /api/v1/projects/{project_id}/metrics
Content-Type: application/json

{
  "timestamp": "2024-01-01T00:00:00",
  "modelName": "ResNet-50",
  "modelVersion": "v1.0",
  "accuracy": 0.85,
  "loss": 0.42,
  "precision": 0.83,
  "recall": 0.82,
  "f1Score": 0.825
}
```

#### Update Metric
```
PUT /api/v1/projects/{project_id}/metrics/{metric_id}
Content-Type: application/json

{
  "accuracy": 0.87,
  "loss": 0.38
}
```

#### Delete Metric
```
DELETE /api/v1/projects/{project_id}/metrics/{metric_id}
```

### Metric Configuration

#### Update Project Metric Configuration
```
PUT /api/v1/projects/{project_id}/metrics-config
Content-Type: application/json

[
  {
    "id": "accuracy",
    "name": "Accuracy",
    "type": "percentage",
    "color": "hsl(200, 100%, 50%)",
    "unit": "%",
    "enabled": true,
    "min": 0,
    "max": 1,
    "description": "Model prediction accuracy"
  }
]
```

### Utility Endpoints

#### Health Check
```
GET /health
```

#### Get Available Models for Project
```
GET /api/v1/projects/{project_id}/models
```

#### Seed Database
```
POST /seed
```

## Data Models

### Project
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)",
  "color": "string",
  "records": [ProjectMetric],
  "metricsConfig": [MetricSettings]
}
```

### ProjectMetric
```json
{
  "id": "string",
  "projectId": "string",
  "timestamp": "string (ISO date)",
  "modelName": "string",
  "modelVersion": "string (optional)",
  "accuracy": "number (optional)",
  "loss": "number (optional)",
  "precision": "number (optional)",
  "recall": "number (optional)",
  "f1Score": "number (optional)",
  "additionalMetrics": "object (optional)"
}
```

### MetricSettings
```json
{
  "id": "string",
  "name": "string",
  "type": "string (int|float|percentage|string)",
  "color": "string",
  "unit": "string",
  "enabled": "boolean",
  "min": "number (optional)",
  "max": "number (optional)",
  "description": "string (optional)"
}
```

## Database

The application uses SQLite as the database. The database file (`chronology.db`) is created automatically in the backend directory when the application starts.

### Database Schema

- **projects**: Stores project information
- **project_metrics**: Stores metric data points
- **metric_settings**: Stores metric configuration for each project

## Development

### Running Tests
```bash
uv run pytest
```

### Database Reset
To reset the database and reseed with sample data:
1. Delete the `chronology.db` file
2. Restart the server
3. Or call the `/seed` endpoint

### Sample Data

The application comes with sample data for three projects:
1. **Image Classification Model**: ResNet-50, EfficientNet-B0, Vision Transformer
2. **NLP Sentiment Analysis**: BERT-base, RoBERTa-base, DistilBERT
3. **Time Series Forecasting**: LSTM, GRU, Transformer

Each project includes sample metrics for accuracy, loss, precision, recall, and F1 score.

## CORS

The backend is configured to allow CORS for local frontend development. In production, you should configure the `allow_origins` setting appropriately. 
"""
API routes for the Chronology application.

This module contains all the FastAPI route handlers for:
- Project management (CRUD operations)
- Metric record management (CRUD operations)
- Metric settings management
- Utility endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
import json

from .models import (
    Project, ProjectMetric, MetricSettings,
    CreateProjectRequest, UpdateProjectRequest,
    CreateMetricRecordRequest, CreateMetricRequest, UpdateMetricRequest
)
from .storage import (
    create_project, get_all_projects, get_project_by_id, update_project, delete_project,
    create_metric, get_project_metrics, get_metric_by_id, update_metric, delete_metric,
    update_project_metric_settings, db_project_to_pydantic, pydantic_setting_to_db
)
from .database import get_db

router = APIRouter(prefix="/api/v1")

# Project routes
@router.get("/projects", response_model=List[Project])
def list_projects(db: Session = Depends(get_db)):
    """Get all projects"""
    db_projects = get_all_projects(db)
    return [db_project_to_pydantic(project) for project in db_projects]

@router.get("/projects/{project_id}", response_model=Project)
def get_project_route(project_id: str, db: Session = Depends(get_db)):
    """Get a specific project by ID"""
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project_to_pydantic(db_project)

@router.post("/projects", response_model=Project)
def create_project_route(project_data: CreateProjectRequest, db: Session = Depends(get_db)):
    """Create a new project"""
    project_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    # Convert to database format
    db_project_data = {
        'id': project_id,
        'name': project_data.name,
        'description': project_data.description,
        'color': project_data.color,
        'created_at': now,
        'updated_at': now
    }
    
    db_project = create_project(db, db_project_data)
    
    # Create metric settings if provided
    if project_data.metricsConfig:
        for setting in project_data.metricsConfig:
            setting_data = pydantic_setting_to_db(setting, project_id)
            from .storage import create_metric_settings
            create_metric_settings(db, setting_data)
    
    return db_project_to_pydantic(db_project)

@router.put("/projects/{project_id}", response_model=Project)
def update_project_route(project_id: str, project_data: UpdateProjectRequest, db: Session = Depends(get_db)):
    """Update an existing project"""
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Prepare update data
    update_data = {}
    if project_data.name is not None:
        update_data['name'] = project_data.name
    if project_data.description is not None:
        update_data['description'] = project_data.description
    if project_data.color is not None:
        update_data['color'] = project_data.color
    
    updated_project = update_project(db, project_id, update_data)
    
    # Update metric settings if provided
    if project_data.metricsConfig is not None:
        settings_data = [pydantic_setting_to_db(setting, project_id) for setting in project_data.metricsConfig]
        update_project_metric_settings(db, project_id, settings_data)
    
    return db_project_to_pydantic(updated_project)

@router.delete("/projects/{project_id}")
def delete_project_route(project_id: str, db: Session = Depends(get_db)):
    """Delete a project"""
    success = delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

# Metric routes
@router.get("/projects/{project_id}/metrics", response_model=List[ProjectMetric])
def get_project_metrics_route(project_id: str, db: Session = Depends(get_db)):
    """Get all metrics for a project"""
    # Verify project exists
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_metrics = get_project_metrics(db, project_id)
    metrics = []
    for db_metric in db_metrics:
        metric_dict = {
            'id': db_metric.id,
            'projectId': db_metric.project_id,
            'timestamp': db_metric.timestamp.isoformat(),
            'modelName': db_metric.model_name,
            'modelVersion': db_metric.model_version,
            'accuracy': db_metric.accuracy,
            'loss': db_metric.loss,
            'precision': db_metric.precision,
            'recall': db_metric.recall,
            'f1Score': db_metric.f1_score,
            'additionalMetrics': json.loads(db_metric.additional_metrics) if db_metric.additional_metrics else None
        }
        metrics.append(ProjectMetric(**metric_dict))
    
    return metrics

@router.post("/projects/{project_id}/metrics", response_model=ProjectMetric)
def create_metric_route(project_id: str, metric_data: CreateMetricRecordRequest, db: Session = Depends(get_db)):
    """Add a new metric record to a project"""
    # Verify project exists
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate additional metrics if provided
    if metric_data.additionalMetrics is not None:
        try:
            # Validate that additional metrics can be serialized to JSON
            json.dumps(metric_data.additionalMetrics)
        except (TypeError, ValueError) as e:
            raise HTTPException(status_code=400, detail=f"Invalid additional metrics format: {str(e)}")
    
    metric_id = f"{project_id}-{uuid.uuid4()}"
    
    # Convert to database format
    db_metric_data = {
        'id': metric_id,
        'project_id': project_id,
        'timestamp': datetime.fromisoformat(metric_data.timestamp),
        'model_name': metric_data.modelName,
        'model_version': metric_data.modelVersion,
        'accuracy': metric_data.accuracy,
        'loss': metric_data.loss,
        'precision': metric_data.precision,
        'recall': metric_data.recall,
        'f1_score': metric_data.f1Score,
        'additional_metrics': json.dumps(metric_data.additionalMetrics) if metric_data.additionalMetrics else None
    }
    
    db_metric = create_metric(db, db_metric_data)
    
    # Convert back to Pydantic model
    metric_dict = {
        'id': db_metric.id,
        'projectId': db_metric.project_id,
        'timestamp': db_metric.timestamp.isoformat(),
        'modelName': db_metric.model_name,
        'modelVersion': db_metric.model_version,
        'accuracy': db_metric.accuracy,
        'loss': db_metric.loss,
        'precision': db_metric.precision,
        'recall': db_metric.recall,
        'f1Score': db_metric.f1_score,
        'additionalMetrics': json.loads(db_metric.additional_metrics) if db_metric.additional_metrics else None
    }
    
    return ProjectMetric(**metric_dict)

@router.put("/projects/{project_id}/metrics/{metric_id}", response_model=ProjectMetric)
def update_metric_route(project_id: str, metric_id: str, metric_data: UpdateMetricRequest, db: Session = Depends(get_db)):
    """Update a metric record"""
    # Verify project exists
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify metric exists and belongs to project
    db_metric = get_metric_by_id(db, metric_id)
    if not db_metric or db_metric.project_id != project_id:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    # Validate additional metrics if provided
    if metric_data.additionalMetrics is not None:
        try:
            # Validate that additional metrics can be serialized to JSON
            json.dumps(metric_data.additionalMetrics)
        except (TypeError, ValueError) as e:
            raise HTTPException(status_code=400, detail=f"Invalid additional metrics format: {str(e)}")
    
    # Prepare update data
    update_data = {}
    if metric_data.timestamp is not None:
        update_data['timestamp'] = datetime.fromisoformat(metric_data.timestamp)
    if metric_data.modelName is not None:
        update_data['model_name'] = metric_data.modelName
    if metric_data.modelVersion is not None:
        update_data['model_version'] = metric_data.modelVersion
    if metric_data.accuracy is not None:
        update_data['accuracy'] = metric_data.accuracy
    if metric_data.loss is not None:
        update_data['loss'] = metric_data.loss
    if metric_data.precision is not None:
        update_data['precision'] = metric_data.precision
    if metric_data.recall is not None:
        update_data['recall'] = metric_data.recall
    if metric_data.f1Score is not None:
        update_data['f1_score'] = metric_data.f1Score
    if metric_data.additionalMetrics is not None:
        update_data['additional_metrics'] = json.dumps(metric_data.additionalMetrics)
    
    updated_metric = update_metric(db, metric_id, update_data)
    
    # Convert back to Pydantic model
    metric_dict = {
        'id': updated_metric.id,
        'projectId': updated_metric.project_id,
        'timestamp': updated_metric.timestamp.isoformat(),
        'modelName': updated_metric.model_name,
        'modelVersion': updated_metric.model_version,
        'accuracy': updated_metric.accuracy,
        'loss': updated_metric.loss,
        'precision': updated_metric.precision,
        'recall': updated_metric.recall,
        'f1Score': updated_metric.f1_score,
        'additionalMetrics': json.loads(updated_metric.additional_metrics) if updated_metric.additional_metrics else None
    }
    
    return ProjectMetric(**metric_dict)

@router.delete("/projects/{project_id}/metrics/{metric_id}")
def delete_metric_route(project_id: str, metric_id: str, db: Session = Depends(get_db)):
    """Delete a metric"""
    # Verify project exists
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify metric exists and belongs to project
    db_metric = get_metric_by_id(db, metric_id)
    if not db_metric or db_metric.project_id != project_id:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    success = delete_metric(db, metric_id)
    if not success:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    return {"message": "Metric deleted successfully"}

# Metric settings routes
@router.put("/projects/{project_id}/metrics-config")
def update_project_metrics_config(project_id: str, metrics_config: List[MetricSettings], db: Session = Depends(get_db)):
    """Update metric configuration for a project"""
    # Verify project exists
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Convert settings to database format
    settings_data = [pydantic_setting_to_db(setting, project_id) for setting in metrics_config]
    
    # Update settings
    update_project_metric_settings(db, project_id, settings_data)
    
    return {"message": "Metric configuration updated successfully"}

@router.post("/projects/{project_id}/metrics-definitions")
def create_metric_definition(project_id: str, metric_data: CreateMetricRequest, db: Session = Depends(get_db)):
    """Create a new metric definition for a project"""
    # Verify project exists
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Convert to database format
    setting_data = {
        'project_id': project_id,
        'metric_id': metric_data.metricId,
        'name': metric_data.name,
        'type': metric_data.type,
        'color': metric_data.color,
        'unit': metric_data.unit,
        'enabled': metric_data.enabled,
        'min_value': metric_data.min,
        'max_value': metric_data.max,
        'description': metric_data.description
    }
    
    # Create the metric setting
    from .storage import create_metric_settings
    create_metric_settings(db, setting_data)
    return {"message": "Metric definition created successfully", "metricId": metric_data.metricId}

@router.delete("/projects/{project_id}/metrics-definitions/{metric_id}")
def delete_metric_definition(project_id: str, metric_id: str, db: Session = Depends(get_db)):
    """Delete a metric definition from a project"""
    # Verify project exists
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete the metric setting
    from .storage import delete_metric_setting
    success = delete_metric_setting(db, project_id, metric_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Metric definition not found")
    
    return {"message": "Metric definition deleted successfully"}

# Utility routes
@router.get("/projects/{project_id}/models")
def get_available_models(project_id: str, db: Session = Depends(get_db)):
    """Get available models for a project"""
    # Verify project exists
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get unique model names from metrics
    db_metrics = get_project_metrics(db, project_id)
    model_names = list(set(metric.model_name for metric in db_metrics if metric.model_name))
    
    return {"models": model_names}

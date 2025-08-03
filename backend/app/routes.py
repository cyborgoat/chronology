"""
API routes for the Chronology application.

This module contains all the FastAPI route handlers for:
- Project management (CRUD operations)
- Metric record management (CRUD operations)
- Metric settings management
- Utility endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .models import (
    Project, ProjectMetric, MetricSettings,
    CreateProjectRequest, UpdateProjectRequest,
    CreateMetricRecordRequest, CreateMetricRequest, UpdateMetricRequest
)
from .services import ProjectService, MetricRecordService
from .storage import (
    update_project_metric_settings, create_metric_settings, delete_metric_setting,
    pydantic_setting_to_db
)
from .database import get_db
from .exceptions import project_not_found, metric_not_found, bad_request_error

router = APIRouter(prefix="/api/v1")

# Project routes
@router.get("/projects", response_model=List[Project])
def list_projects(db: Session = Depends(get_db)):
    """Get all projects"""
    return ProjectService.get_all_projects(db)

@router.get("/projects/{project_id}", response_model=Project)
def get_project_route(project_id: str, db: Session = Depends(get_db)):
    """Get a specific project by ID"""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise project_not_found(project_id)
    return project

@router.post("/projects", response_model=Project)
def create_project_route(project_data: CreateProjectRequest, db: Session = Depends(get_db)):
    """Create a new project"""
    return ProjectService.create_project(db, project_data)

@router.put("/projects/{project_id}", response_model=Project)
def update_project_route(project_id: str, project_data: UpdateProjectRequest, db: Session = Depends(get_db)):
    """Update an existing project"""
    project = ProjectService.update_project(db, project_id, project_data)
    if not project:
        raise project_not_found(project_id)
    return project

@router.delete("/projects/{project_id}")
def delete_project_route(project_id: str, db: Session = Depends(get_db)):
    """Delete a project"""
    success = ProjectService.delete_project(db, project_id)
    if not success:
        raise project_not_found(project_id)
    return {"message": "Project deleted successfully"}

# Metric record routes
@router.get("/projects/{project_id}/metrics", response_model=List[ProjectMetric])
def get_project_metrics_route(project_id: str, db: Session = Depends(get_db)):
    """Get all metric records for a project"""
    # Verify project exists
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise project_not_found(project_id)
    
    return MetricRecordService.get_project_metric_records(db, project_id)

@router.post("/projects/{project_id}/metrics", response_model=ProjectMetric)
def create_metric_route(project_id: str, metric_data: CreateMetricRecordRequest, db: Session = Depends(get_db)):
    """Add a new metric record to a project"""
    # Verify project exists
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise project_not_found(project_id)
    
    # Validate additional metrics if provided
    if metric_data.additionalMetrics is not None:
        try:
            import json
            # Validate that additional metrics can be serialized to JSON
            json.dumps(metric_data.additionalMetrics)
        except (TypeError, ValueError) as e:
            raise bad_request_error(f"Invalid additional metrics format: {str(e)}")
    
    return MetricRecordService.create_metric_record(db, project_id, metric_data)

@router.put("/projects/{project_id}/metrics/{metric_id}", response_model=ProjectMetric)
def update_metric_route(project_id: str, metric_id: str, metric_data: UpdateMetricRequest, db: Session = Depends(get_db)):
    """Update a metric record"""
    # Verify project exists
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise project_not_found(project_id)
    
    # Verify metric exists and belongs to project
    from .storage import get_metric_by_id
    db_metric = get_metric_by_id(db, metric_id)
    if not db_metric or db_metric.project_id != project_id:
        raise metric_not_found(metric_id)
    
    # Validate additional metrics if provided
    if metric_data.additionalMetrics is not None:
        try:
            import json
            # Validate that additional metrics can be serialized to JSON
            json.dumps(metric_data.additionalMetrics)
        except (TypeError, ValueError) as e:
            raise bad_request_error(f"Invalid additional metrics format: {str(e)}")
    
    updated_metric = MetricRecordService.update_metric_record(db, metric_id, metric_data)
    if not updated_metric:
        raise metric_not_found(metric_id)
    
    return updated_metric

@router.delete("/projects/{project_id}/metrics/{metric_id}")
def delete_metric_route(project_id: str, metric_id: str, db: Session = Depends(get_db)):
    """Delete a metric record"""
    # Verify project exists
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise project_not_found(project_id)
    
    # Verify metric exists and belongs to project
    from .storage import get_metric_by_id
    db_metric = get_metric_by_id(db, metric_id)
    if not db_metric or db_metric.project_id != project_id:
        raise metric_not_found(metric_id)
    
    success = MetricRecordService.delete_metric_record(db, metric_id)
    if not success:
        raise metric_not_found(metric_id)
    
    return {"message": "Metric record deleted successfully"}

# Metric settings routes
@router.put("/projects/{project_id}/metrics-config")
def update_project_metrics_config(project_id: str, metrics_config: List[MetricSettings], db: Session = Depends(get_db)):
    """Update metric configuration for a project"""
    # Verify project exists
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise project_not_found(project_id)
    
    # Convert settings to database format
    settings_data = [pydantic_setting_to_db(setting, project_id) for setting in metrics_config]
    
    # Update settings
    update_project_metric_settings(db, project_id, settings_data)
    
    return {"message": "Metric configuration updated successfully"}

@router.post("/projects/{project_id}/metrics-definitions")
def create_metric_definition(project_id: str, metric_data: CreateMetricRequest, db: Session = Depends(get_db)):
    """Create a new metric definition for a project"""
    # Verify project exists
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise project_not_found(project_id)
    
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
    create_metric_settings(db, setting_data)
    return {"message": "Metric definition created successfully", "metricId": metric_data.metricId}

@router.delete("/projects/{project_id}/metrics-definitions/{metric_id}")
def delete_metric_definition(project_id: str, metric_id: str, db: Session = Depends(get_db)):
    """Delete a metric definition from a project"""
    # Verify project exists
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise project_not_found(project_id)
    
    # Delete the metric setting
    success = delete_metric_setting(db, project_id, metric_id)
    
    if not success:
        raise metric_not_found(metric_id)
    
    return {"message": "Metric definition deleted successfully"}

# Utility routes
@router.get("/projects/{project_id}/models")
def get_available_models(project_id: str, db: Session = Depends(get_db)):
    """Get available models for a project"""
    # Verify project exists
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise project_not_found(project_id)
    
    model_names = MetricRecordService.get_models(db, project_id)
    return {"models": model_names}

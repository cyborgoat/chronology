"""
Database storage operations for the Chronology application.

This module contains all database operations for:
- Project management (CRUD operations)
- Metric record management (CRUD operations)
- Metric settings management
- Data conversion between database and API models
"""

import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from .models import ProjectDB, ProjectMetricDB, MetricSettingsDB, Project, ProjectMetric, MetricSettings
from .database import get_db

# Database operations for projects
def create_project(db: Session, project_data: dict) -> ProjectDB:
    db_project = ProjectDB(**project_data)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_all_projects(db: Session) -> List[ProjectDB]:
    return db.query(ProjectDB).all()

def get_project_by_id(db: Session, project_id: str) -> Optional[ProjectDB]:
    return db.query(ProjectDB).filter(ProjectDB.id == project_id).first()

def update_project(db: Session, project_id: str, project_data: dict) -> Optional[ProjectDB]:
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return None
    
    for key, value in project_data.items():
        if hasattr(db_project, key):
            setattr(db_project, key, value)
    
    db_project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: str) -> bool:
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return False
    
    db.delete(db_project)
    db.commit()
    return True

# Database operations for metrics
def create_metric(db: Session, metric_data: dict) -> ProjectMetricDB:
    db_metric = ProjectMetricDB(**metric_data)
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

def get_project_metrics(db: Session, project_id: str) -> List[ProjectMetricDB]:
    return db.query(ProjectMetricDB).filter(ProjectMetricDB.project_id == project_id).all()

def get_metric_by_id(db: Session, metric_id: str) -> Optional[ProjectMetricDB]:
    return db.query(ProjectMetricDB).filter(ProjectMetricDB.id == metric_id).first()

def update_metric(db: Session, metric_id: str, metric_data: dict) -> Optional[ProjectMetricDB]:
    db_metric = get_metric_by_id(db, metric_id)
    if not db_metric:
        return None
    
    for key, value in metric_data.items():
        if hasattr(db_metric, key):
            setattr(db_metric, key, value)
    
    db.commit()
    db.refresh(db_metric)
    return db_metric

def delete_metric(db: Session, metric_id: str) -> bool:
    db_metric = get_metric_by_id(db, metric_id)
    if not db_metric:
        return False
    
    db.delete(db_metric)
    db.commit()
    return True

# Database operations for metric settings
def create_metric_settings(db: Session, settings_data: dict) -> MetricSettingsDB:
    db_settings = MetricSettingsDB(**settings_data)
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings

def get_project_metric_settings(db: Session, project_id: str) -> List[MetricSettingsDB]:
    return db.query(MetricSettingsDB).filter(MetricSettingsDB.project_id == project_id).all()

def update_project_metric_settings(db: Session, project_id: str, settings_list: List[dict]) -> List[MetricSettingsDB]:
    # Delete existing settings for this project
    db.query(MetricSettingsDB).filter(MetricSettingsDB.project_id == project_id).delete()
    
    # Create new settings
    new_settings = []
    for settings_data in settings_list:
        settings_data['project_id'] = project_id
        db_settings = create_metric_settings(db, settings_data)
        new_settings.append(db_settings)
    
    return new_settings

def delete_metric_setting(db: Session, project_id: str, metric_id: str) -> bool:
    """Delete a specific metric setting from a project"""
    db_setting = db.query(MetricSettingsDB).filter(
        MetricSettingsDB.project_id == project_id,
        MetricSettingsDB.metric_id == metric_id
    ).first()
    
    if not db_setting:
        return False
    
    db.delete(db_setting)
    db.commit()
    return True

# Conversion functions between DB models and Pydantic models
def db_project_to_pydantic(db_project: ProjectDB) -> Project:
    """Convert database project to Pydantic model"""
    # Get metrics for this project
    metrics = []
    for db_metric in db_project.metrics:
        # Safely parse additional metrics JSON
        additional_metrics = None
        if db_metric.additional_metrics:
            try:
                additional_metrics = json.loads(db_metric.additional_metrics)
            except (json.JSONDecodeError, TypeError) as e:
                print(f"Warning: Failed to parse additional metrics for metric {db_metric.id}: {e}")
                additional_metrics = None
        
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
            'additionalMetrics': additional_metrics
        }
        metrics.append(ProjectMetric(**metric_dict))
    
    # Get metric settings for this project
    settings = []
    for db_setting in db_project.metrics_config:
        setting_dict = {
            'id': db_setting.metric_id,
            'name': db_setting.name,
            'type': db_setting.type,
            'color': db_setting.color,
            'unit': db_setting.unit,
            'enabled': db_setting.enabled,
            'min': db_setting.min_value,
            'max': db_setting.max_value,
            'description': db_setting.description
        }
        settings.append(MetricSettings(**setting_dict))
    
    project_dict = {
        'id': db_project.id,
        'name': db_project.name,
        'description': db_project.description,
        'createdAt': db_project.created_at.isoformat(),
        'updatedAt': db_project.updated_at.isoformat(),
        'records': metrics,
        'color': db_project.color,
        'metricsConfig': settings
    }
    
    return Project(**project_dict)

def pydantic_project_to_db(project: Project) -> dict:
    """Convert Pydantic project to database model dict"""
    return {
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'created_at': datetime.fromisoformat(project.createdAt),
        'updated_at': datetime.fromisoformat(project.updatedAt),
        'color': project.color
    }

def pydantic_metric_to_db(metric: ProjectMetric) -> dict:
    """Convert Pydantic metric to database model dict"""
    # Safely serialize additional metrics to JSON
    additional_metrics_json = None
    if metric.additionalMetrics is not None:
        try:
            additional_metrics_json = json.dumps(metric.additionalMetrics)
        except (TypeError, ValueError) as e:
            print(f"Warning: Failed to serialize additional metrics for metric {metric.id}: {e}")
            additional_metrics_json = None
    
    return {
        'id': metric.id,
        'project_id': metric.projectId,
        'timestamp': datetime.fromisoformat(metric.timestamp),
        'model_name': metric.modelName,
        'model_version': metric.modelVersion,
        'accuracy': metric.accuracy,
        'loss': metric.loss,
        'precision': metric.precision,
        'recall': metric.recall,
        'f1_score': metric.f1Score,
        'additional_metrics': additional_metrics_json
    }

def pydantic_setting_to_db(setting: MetricSettings, project_id: str) -> dict:
    """Convert Pydantic metric setting to database model dict"""
    return {
        'project_id': project_id,
        'metric_id': setting.id,
        'name': setting.name,
        'type': setting.type,
        'color': setting.color,
        'unit': setting.unit,
        'enabled': setting.enabled,
        'min_value': setting.min,
        'max_value': setting.max,
        'description': setting.description
    }

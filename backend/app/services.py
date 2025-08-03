"""
Service layer for business logic operations.
"""

from typing import List, Optional
from datetime import datetime
import uuid
import json

from sqlalchemy.orm import Session

from .models import (
    Project, ProjectMetric, CreateProjectRequest, UpdateProjectRequest,
    CreateMetricRecordRequest, UpdateMetricRequest
)
from .storage import (
    create_project, get_all_projects, get_project_by_id, update_project, delete_project,
    create_metric, get_project_metrics, update_metric, delete_metric,
    update_project_metric_settings, create_metric_settings, db_project_to_pydantic, pydantic_setting_to_db
)


class ProjectService:
    """Service for project operations."""
    
    @staticmethod
    def get_all_projects(db: Session) -> List[Project]:
        """Get all projects."""
        db_projects = get_all_projects(db)
        return [db_project_to_pydantic(project) for project in db_projects]
    
    @staticmethod
    def get_project_by_id(db: Session, project_id: str) -> Optional[Project]:
        """Get project by ID."""
        db_project = get_project_by_id(db, project_id)
        if not db_project:
            return None
        return db_project_to_pydantic(db_project)
    
    @staticmethod
    def create_project(db: Session, project_data: CreateProjectRequest) -> Project:
        """Create a new project."""
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
                create_metric_settings(db, setting_data)
        
        return db_project_to_pydantic(db_project)
    
    @staticmethod
    def update_project(db: Session, project_id: str, project_data: UpdateProjectRequest) -> Optional[Project]:
        """Update an existing project."""
        db_project = get_project_by_id(db, project_id)
        if not db_project:
            return None
        
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
    
    @staticmethod
    def delete_project(db: Session, project_id: str) -> bool:
        """Delete a project."""
        return delete_project(db, project_id)


class MetricRecordService:
    """Service for metric record operations."""
    
    @staticmethod
    def get_project_metric_records(db: Session, project_id: str) -> List[ProjectMetric]:
        """Get metric records for a project."""
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
    
    @staticmethod
    def create_metric_record(db: Session, project_id: str, metric_data: CreateMetricRecordRequest) -> ProjectMetric:
        """Create a new metric record."""
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
    
    @staticmethod
    def update_metric_record(db: Session, metric_id: str, metric_data: UpdateMetricRequest) -> Optional[ProjectMetric]:
        """Update a metric record."""
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
        if not updated_metric:
            return None
        
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
    
    @staticmethod
    def delete_metric_record(db: Session, metric_id: str) -> bool:
        """Delete a metric record."""
        return delete_metric(db, metric_id)
    
    @staticmethod
    def get_models(db: Session, project_id: str) -> List[str]:
        """Get unique model names for a project."""
        db_metrics = get_project_metrics(db, project_id)
        model_names = list(set(metric.model_name for metric in db_metrics if metric.model_name))
        return model_names 
"""
Database and API models for the Chronology application.

This module contains:
- SQLAlchemy database models for projects, metrics, and metric settings
- Pydantic models for API request/response serialization
- Type definitions for the application
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Text, Boolean, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

# SQLAlchemy Models
class ProjectDB(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    color = Column(String)
    
    # Relationship to metrics
    metrics = relationship("ProjectMetricDB", back_populates="project", cascade="all, delete-orphan")
    metrics_config = relationship("MetricSettingsDB", back_populates="project", cascade="all, delete-orphan")

class ProjectMetricDB(Base):
    __tablename__ = "project_metrics"
    
    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    model_name = Column(String, nullable=False)
    model_version = Column(String)
    
    # Metric values
    accuracy = Column(Float)
    loss = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    additional_metrics = Column(Text)  # JSON string for additional metrics
    
    # Relationship
    project = relationship("ProjectDB", back_populates="metrics")

class MetricSettingsDB(Base):
    __tablename__ = "metric_settings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    metric_id = Column(String, nullable=False)  # e.g., 'accuracy', 'loss'
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'int', 'float', 'percentage', 'string'
    color = Column(String, nullable=False)
    unit = Column(String)
    enabled = Column(Boolean, default=True)
    min_value = Column(Float)
    max_value = Column(Float)
    description = Column(Text)
    
    # Relationship
    project = relationship("ProjectDB", back_populates="metrics_config")

# Pydantic Models for API
class MetricSettings(BaseModel):
    id: str
    name: str
    type: str
    color: str
    unit: Optional[str] = None
    enabled: bool = True
    min: Optional[float] = None
    max: Optional[float] = None
    description: Optional[str] = None

class ProjectMetric(BaseModel):
    id: str
    projectId: str
    timestamp: str
    modelName: str
    modelVersion: Optional[str] = None
    accuracy: Optional[float] = None
    loss: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1Score: Optional[float] = None
    additionalMetrics: Optional[Dict[str, Any]] = None

class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    createdAt: str
    updatedAt: str
    records: List[ProjectMetric] = Field(default_factory=list)
    color: Optional[str] = None
    metricsConfig: List[MetricSettings] = Field(default_factory=list)

# Request/Response Models
class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    metricsConfig: Optional[List[MetricSettings]] = None

class UpdateProjectRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    metricsConfig: Optional[List[MetricSettings]] = None

class CreateMetricRecordRequest(BaseModel):
    timestamp: str
    modelName: str
    modelVersion: Optional[str] = None
    accuracy: Optional[float] = None
    loss: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1Score: Optional[float] = None
    additionalMetrics: Optional[Dict[str, Any]] = None

class CreateMetricRequest(BaseModel):
    metricId: str
    name: str
    type: str  # 'int', 'float', 'percentage', 'string'
    color: str
    unit: Optional[str] = None
    enabled: bool = True
    min: Optional[float] = None
    max: Optional[float] = None
    description: Optional[str] = None

class UpdateMetricRequest(BaseModel):
    timestamp: Optional[str] = None
    modelName: Optional[str] = None
    modelVersion: Optional[str] = None
    accuracy: Optional[float] = None
    loss: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1Score: Optional[float] = None
    additionalMetrics: Optional[Dict[str, Any]] = None

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


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
    timestamp: str
    modelName: str
    modelVersion: Optional[str] = None
    # Dynamic metric fields (accuracy, loss, etc.)
    metrics: Dict[str, Any] = Field(default_factory=dict)


class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    createdAt: str
    updatedAt: str
    metrics: List[ProjectMetric] = Field(default_factory=list)
    color: Optional[str] = None
    metricsConfig: List[MetricSettings] = Field(default_factory=list)

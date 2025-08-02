from fastapi import APIRouter, HTTPException
from typing import List
from .models import Project
from .storage import load_projects, save_projects, get_project

router = APIRouter()

@router.get("/projects", response_model=List[Project])
def list_projects():
    return load_projects()

@router.get("/projects/{project_id}", response_model=Project)
def get_project_route(project_id: str):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

import json
from pathlib import Path
from typing import List, Optional
from .models import Project

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
PROJECTS_FILE = DATA_DIR / "projects.json"

# Helper to load all projects

def load_projects() -> List[Project]:
    if not PROJECTS_FILE.exists():
        return []
    with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [Project(**item) for item in data]

# Helper to save all projects

def save_projects(projects: List[Project]):
    with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
        json.dump([p.dict() for p in projects], f, indent=2)

# Helper to get a single project

def get_project(project_id: str) -> Optional[Project]:
    for project in load_projects():
        if project.id == project_id:
            return project
    return None

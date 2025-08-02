from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router as project_router
from .database import create_tables
from .seed_data import seed_database

app = FastAPI(
    title="Chronology Backend", 
    version="0.1.0",
    description="Backend service for Chronology, a timeline visualization app for AI projects."
)

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize database tables and seed with sample data on startup"""
    create_tables()
    # Seed with sample data if database is empty
    try:
        seed_database()
    except Exception as e:
        print(f"Warning: Could not seed database: {e}")

@app.get("/")
def root():
    return {"message": "Chronology backend is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/seed")
def seed_endpoint():
    """Manually trigger database seeding"""
    try:
        seed_database()
        return {"message": "Database seeded successfully"}
    except Exception as e:
        return {"error": str(e)}

app.include_router(project_router)

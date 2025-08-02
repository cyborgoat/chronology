from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from .routes import router as project_router

app = FastAPI(title="Chronology Backend", version="0.1.0")

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Chronology backend is running!"}

app.include_router(project_router)

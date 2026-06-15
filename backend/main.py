from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, datasets, allocation, dashboard, history, analysis

# Initialize the database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ReliefNet API",
    description="Smart Resource Allocation for Emergency Response",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:5173", # Default Vite port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(allocation.router, prefix="/api/allocation", tags=["Allocation"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

@app.get("/")
def read_root():
    return {"message": "Welcome to ReliefNet API"}

from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class ModelRunRequest(BaseModel):
    model: str
    dataset: str

class ModelMetric(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    model: str
    dataset: str
    accuracy: float
    energy_kWh: float
    carbon_kg: float
    train_time_s: float
    inference_time_s: float
    green_score: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DatasetInfo(BaseModel):
    name: str
    description: str
    samples: int
    features: int

class Recommendation(BaseModel):
    model: str
    dataset: str
    green_score: float
    accuracy: float
    energy_kWh: float
    reason: str

# Simulated datasets
DATASETS = [
    {"name": "Iris", "description": "Iris flower classification (150 samples, 4 features)", "samples": 150, "features": 4},
    {"name": "MNIST", "description": "Handwritten digit recognition (70k samples, 784 features)", "samples": 70000, "features": 784},
    {"name": "Energy Efficiency", "description": "Building energy efficiency (768 samples, 8 features)", "samples": 768, "features": 8},
    {"name": "Wine Quality", "description": "Wine quality classification (1599 samples, 11 features)", "samples": 1599, "features": 11}
]

# Simulated model configurations with realistic metrics
MODEL_CONFIGS = {
    "RandomForest": {
        "Iris": {"accuracy": 0.96, "energy_base": 0.008, "train_time_base": 2.5, "inference_time": 0.15},
        "MNIST": {"accuracy": 0.92, "energy_base": 0.45, "train_time_base": 45, "inference_time": 2.1},
        "Energy Efficiency": {"accuracy": 0.89, "energy_base": 0.012, "train_time_base": 3.2, "inference_time": 0.18},
        "Wine Quality": {"accuracy": 0.87, "energy_base": 0.022, "train_time_base": 5.8, "inference_time": 0.25}
    },
    "LightGBM": {
        "Iris": {"accuracy": 0.94, "energy_base": 0.006, "train_time_base": 1.8, "inference_time": 0.12},
        "MNIST": {"accuracy": 0.91, "energy_base": 0.35, "train_time_base": 32, "inference_time": 1.5},
        "Energy Efficiency": {"accuracy": 0.92, "energy_base": 0.009, "train_time_base": 2.4, "inference_time": 0.14},
        "Wine Quality": {"accuracy": 0.89, "energy_base": 0.018, "train_time_base": 4.5, "inference_time": 0.20}
    },
    "MLP": {
        "Iris": {"accuracy": 0.95, "energy_base": 0.015, "train_time_base": 8.5, "inference_time": 0.22},
        "MNIST": {"accuracy": 0.97, "energy_base": 1.2, "train_time_base": 120, "inference_time": 3.5},
        "Energy Efficiency": {"accuracy": 0.88, "energy_base": 0.025, "train_time_base": 12, "inference_time": 0.28},
        "Wine Quality": {"accuracy": 0.86, "energy_base": 0.045, "train_time_base": 18, "inference_time": 0.35}
    },
    "CNN": {
        "Iris": {"accuracy": 0.93, "energy_base": 0.25, "train_time_base": 25, "inference_time": 0.45},
        "MNIST": {"accuracy": 0.99, "energy_base": 2.8, "train_time_base": 280, "inference_time": 6.5},
        "Energy Efficiency": {"accuracy": 0.85, "energy_base": 0.35, "train_time_base": 32, "inference_time": 0.55},
        "Wine Quality": {"accuracy": 0.84, "energy_base": 0.48, "train_time_base": 42, "inference_time": 0.68}
    },
    "DistilBERT": {
        "Iris": {"accuracy": 0.91, "energy_base": 0.85, "train_time_base": 65, "inference_time": 1.2},
        "MNIST": {"accuracy": 0.95, "energy_base": 8.5, "train_time_base": 850, "inference_time": 15},
        "Energy Efficiency": {"accuracy": 0.82, "energy_base": 1.2, "train_time_base": 95, "inference_time": 1.8},
        "Wine Quality": {"accuracy": 0.81, "energy_base": 1.5, "train_time_base": 120, "inference_time": 2.2}
    }
}

def calculate_green_score(accuracy: float, energy: float, time: float, alpha: float = 0.1) -> float:
    """Calculate Green Score: accuracy / (energy + alpha * time)"""
    denominator = energy + (alpha * time)
    if denominator == 0:
        return 0.0
    return round((accuracy / denominator) * 100, 2)

def simulate_model_run(model: str, dataset: str) -> dict:
    """Simulate model training and return metrics"""
    if model not in MODEL_CONFIGS:
        raise ValueError(f"Model {model} not supported")
    if dataset not in MODEL_CONFIGS[model]:
        raise ValueError(f"Dataset {dataset} not available for {model}")
    
    config = MODEL_CONFIGS[model][dataset]
    
    # Add some randomness to simulate real runs (±5%)
    accuracy = config["accuracy"] + random.uniform(-0.02, 0.02)
    accuracy = max(0.0, min(1.0, accuracy))  # Keep between 0 and 1
    
    energy_kWh = config["energy_base"] * random.uniform(0.95, 1.05)
    train_time_s = config["train_time_base"] * random.uniform(0.95, 1.05)
    inference_time_s = config["inference_time"] * random.uniform(0.95, 1.05)
    
    # Calculate carbon footprint (using average grid intensity: 0.5 kg CO2/kWh)
    carbon_kg = energy_kWh * 0.5
    
    # Calculate Green Score
    green_score = calculate_green_score(accuracy, energy_kWh, train_time_s)
    
    return {
        "accuracy": round(accuracy, 4),
        "energy_kWh": round(energy_kWh, 4),
        "carbon_kg": round(carbon_kg, 6),
        "train_time_s": round(train_time_s, 2),
        "inference_time_s": round(inference_time_s, 2),
        "green_score": green_score
    }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Green AI Benchmark API"}

@api_router.get("/datasets/list", response_model=List[DatasetInfo])
async def list_datasets():
    """Get list of available datasets"""
    return DATASETS

@api_router.post("/models/run", response_model=ModelMetric)
async def run_model(request: ModelRunRequest):
    """Run a model on a dataset and return metrics"""
    try:
        metrics = simulate_model_run(request.model, request.dataset)
        
        # Create ModelMetric object
        result = ModelMetric(
            model=request.model,
            dataset=request.dataset,
            **metrics
        )
        
        # Store in database
        doc = result.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.model_metrics.insert_one(doc)
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/results", response_model=List[ModelMetric])
async def get_results():
    """Get all benchmark results"""
    results = await db.model_metrics.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for result in results:
        if isinstance(result['timestamp'], str):
            result['timestamp'] = datetime.fromisoformat(result['timestamp'])
    
    return results

@api_router.delete("/results")
async def clear_results():
    """Clear all benchmark results"""
    result = await db.model_metrics.delete_many({})
    return {"deleted_count": result.deleted_count}

@api_router.get("/results/recommendations", response_model=List[Recommendation])
async def get_recommendations():
    """Get top models ranked by Green Score"""
    results = await db.model_metrics.find({}, {"_id": 0}).to_list(1000)
    
    if not results:
        return []
    
    # Sort by green_score descending
    sorted_results = sorted(results, key=lambda x: x['green_score'], reverse=True)
    
    # Get top 5 recommendations
    recommendations = []
    for result in sorted_results[:5]:
        reason = f"Achieves {result['accuracy']:.2%} accuracy with only {result['energy_kWh']:.4f} kWh energy consumption"
        recommendations.append(Recommendation(
            model=result['model'],
            dataset=result['dataset'],
            green_score=result['green_score'],
            accuracy=result['accuracy'],
            energy_kWh=result['energy_kWh'],
            reason=reason
        ))
    
    return recommendations

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
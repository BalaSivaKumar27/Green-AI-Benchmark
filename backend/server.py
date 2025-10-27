from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
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
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import psutil
import time
import io

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
    
class DatasetUploadResponse(BaseModel):
    dataset_id: str
    name: str
    samples: int
    features: int
    target_column: str

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

# Available ML models
AVAILABLE_MODELS = {
    "RandomForest": RandomForestClassifier,
    "LogisticRegression": LogisticRegression,
    "GradientBoosting": GradientBoostingClassifier,
    "MLP": MLPClassifier,
    "SVM": SVC,
    "KNN": KNeighborsClassifier,
    "DecisionTree": DecisionTreeClassifier
}

# Energy cost per second (simulated based on CPU usage)
ENERGY_COST_PER_SECOND = 0.0001  # kWh per second at 100% CPU
CARBON_INTENSITY = 0.5  # kg CO2 per kWh (average grid intensity)

def measure_training_energy(func):
    """Decorator to measure energy consumption during training"""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        start_cpu = psutil.cpu_percent(interval=0.1)
        
        result = func(*args, **kwargs)
        
        end_time = time.time()
        end_cpu = psutil.cpu_percent(interval=0.1)
        elapsed_time = end_time - start_time
        avg_cpu = (start_cpu + end_cpu) / 2
        
        # Estimate energy based on CPU usage and time
        energy_kWh = (avg_cpu / 100) * elapsed_time * ENERGY_COST_PER_SECOND
        carbon_kg = energy_kWh * CARBON_INTENSITY
        
        return {
            **result,
            "train_time_s": elapsed_time,
            "energy_kWh": energy_kWh,
            "carbon_kg": carbon_kg
        }
    return wrapper

@measure_training_energy
def train_and_evaluate_model(model_name: str, X_train, X_test, y_train, y_test):
    """Train a model and evaluate its performance"""
    try:
        # Get model class
        if model_name in AVAILABLE_MODELS:
            ModelClass = AVAILABLE_MODELS[model_name]
        else:
            # Try to use RandomForest as default for unknown models
            ModelClass = RandomForestClassifier
        
        # Initialize and train model
        if model_name == "MLP":
            model = ModelClass(hidden_layer_sizes=(100,), max_iter=500, random_state=42)
        elif model_name == "SVM":
            model = ModelClass(kernel='rbf', random_state=42)
        else:
            model = ModelClass(random_state=42)
        
        model.fit(X_train, y_train)
        
        # Predict and evaluate
        inference_start = time.time()
        y_pred = model.predict(X_test)
        inference_time = time.time() - inference_start
        
        accuracy = accuracy_score(y_test, y_pred)
        
        return {
            "accuracy": accuracy,
            "inference_time_s": inference_time
        }
    except Exception as e:
        raise ValueError(f"Error training model: {str(e)}")

def load_dataset_from_db(dataset_name: str):
    """Load a previously uploaded dataset or generate sample data"""
    # For pre-defined datasets, generate sample data
    if dataset_name == "Iris":
        from sklearn.datasets import load_iris
        data = load_iris()
        return pd.DataFrame(data.data, columns=data.feature_names), pd.Series(data.target)
    elif dataset_name == "Wine Quality":
        from sklearn.datasets import load_wine
        data = load_wine()
        return pd.DataFrame(data.data, columns=data.feature_names), pd.Series(data.target)
    elif dataset_name == "MNIST":
        from sklearn.datasets import load_digits
        data = load_digits()
        return pd.DataFrame(data.data), pd.Series(data.target)
    elif dataset_name == "Energy Efficiency":
        # Generate synthetic data
        np.random.seed(42)
        X = pd.DataFrame(np.random.randn(768, 8), columns=[f"feature_{i}" for i in range(8)])
        y = pd.Series(np.random.randint(0, 3, 768))
        return X, y
    else:
        raise ValueError(f"Dataset {dataset_name} not found")

async def load_uploaded_dataset(dataset_id: str):
    """Load an uploaded dataset from MongoDB"""
    dataset_doc = await db.uploaded_datasets.find_one({"id": dataset_id}, {"_id": 0})
    if not dataset_doc:
        raise ValueError(f"Dataset {dataset_id} not found")
    
    # Reconstruct dataframe from stored data
    df = pd.DataFrame(dataset_doc["data"])
    target_column = dataset_doc["target_column"]
    
    X = df.drop(columns=[target_column])
    y = df[target_column]
    
    return X, y

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
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
import os
from typing import List, Dict, Any
from pydantic import BaseModel

app = FastAPI(title="ParkEase ML Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class HistoricalData(BaseModel):
    startTime: str
    endTime: str
    duration: int
    dayOfWeek: int
    hour: int

class PredictionRequest(BaseModel):
    lotId: str
    currentOccupancy: int
    totalSlots: int
    currentTime: str
    historicalData: List[HistoricalData]

class PredictionResponse(BaseModel):
    predictions: Dict[str, int]
    confidence: float
    model_version: str

# Simple ML model for parking prediction
class ParkingPredictor:
    def __init__(self):
        self.model = None
        self.is_trained = False
        
    def prepare_features(self, data: List[HistoricalData], current_time: datetime):
        """Prepare features for prediction"""
        if not data:
            # Return default features if no historical data
            return np.array([[
                current_time.hour,
                current_time.weekday(),
                current_time.month,
                0,  # avg_duration
                0   # historical_occupancy
            ]])
        
        # Convert historical data to features
        df = pd.DataFrame([{
            'hour': item.hour,
            'day_of_week': item.dayOfWeek,
            'duration': item.duration
        } for item in data])
        
        # Calculate aggregated features
        hour_avg_duration = df.groupby('hour')['duration'].mean().get(current_time.hour, 60)
        day_avg_duration = df.groupby('day_of_week')['duration'].mean().get(current_time.weekday(), 60)
        
        features = np.array([[
            current_time.hour,
            current_time.weekday(),
            current_time.month,
            hour_avg_duration,
            len(data)  # historical activity level
        ]])
        
        return features
    
    def predict_availability(self, request: PredictionRequest):
        """Predict parking availability using heuristic model"""
        current_time = datetime.fromisoformat(request.currentTime.replace('Z', '+00:00'))
        
        # Heuristic-based prediction (can be replaced with trained ML model)
        hour = current_time.hour
        day_of_week = current_time.weekday()
        current_occupancy = request.currentOccupancy
        total_slots = request.totalSlots
        available_slots = total_slots - current_occupancy
        
        # Time-based demand patterns
        demand_patterns = {
            # Weekday patterns
            0: [0.3, 0.2, 0.1, 0.1, 0.2, 0.4, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.7, 0.9, 0.8, 0.6, 0.4, 0.3, 0.2, 0.2],
            1: [0.3, 0.2, 0.1, 0.1, 0.2, 0.4, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.7, 0.9, 0.8, 0.6, 0.4, 0.3, 0.2, 0.2],
            2: [0.3, 0.2, 0.1, 0.1, 0.2, 0.4, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.7, 0.9, 0.8, 0.6, 0.4, 0.3, 0.2, 0.2],
            3: [0.3, 0.2, 0.1, 0.1, 0.2, 0.4, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.7, 0.9, 0.8, 0.6, 0.4, 0.3, 0.2, 0.2],
            4: [0.3, 0.2, 0.1, 0.1, 0.2, 0.4, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.7, 0.9, 0.8, 0.6, 0.4, 0.3, 0.2, 0.2],
            # Weekend patterns
            5: [0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 0.8, 0.9, 0.9, 0.8, 0.8, 0.7, 0.6, 0.7, 0.8, 0.7, 0.5, 0.4, 0.3, 0.2],
            6: [0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 0.8, 0.9, 0.9, 0.8, 0.8, 0.7, 0.6, 0.7, 0.8, 0.7, 0.5, 0.4, 0.3, 0.2]
        }
        
        # Get demand multiplier for current time
        current_demand = demand_patterns[day_of_week][hour]
        
        # Predict future demand
        predictions = {}
        for hours_ahead, key in [(1, 'next1Hour'), (2, 'next2Hours'), (4, 'next4Hours')]:
            future_hour = (hour + hours_ahead) % 24
            future_demand = demand_patterns[day_of_week][future_hour]
            
            # Calculate expected occupancy change
            demand_change = future_demand - current_demand
            occupancy_change = int(demand_change * total_slots * 0.5)  # 50% sensitivity
            
            # Add some randomness for realism
            noise = np.random.randint(-2, 3)
            predicted_available = max(0, min(total_slots, available_slots - occupancy_change + noise))
            
            predictions[key] = predicted_available
        
        return predictions, 0.75  # 75% confidence for heuristic model

# Initialize predictor
predictor = ParkingPredictor()

@app.get("/")
async def root():
    return {"message": "ParkEase ML Engine", "status": "running", "version": "1.0.0"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_parking_availability(request: PredictionRequest):
    """Predict parking availability for the next few hours"""
    try:
        predictions, confidence = predictor.predict_availability(request)
        
        return PredictionResponse(
            predictions=predictions,
            confidence=confidence,
            model_version="heuristic_v1.0"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
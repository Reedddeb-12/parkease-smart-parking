from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
import numpy as np
from ultralytics import YOLO
import base64
from io import BytesIO
from PIL import Image
import json
from typing import List, Dict
from pydantic import BaseModel

app = FastAPI(title="ParkEase Computer Vision Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class DetectionResult(BaseModel):
    slotNumber: str
    isOccupied: bool
    confidence: float
    vehicleType: str = None

class OccupancyResponse(BaseModel):
    lotId: str
    slots: List[DetectionResult]
    availableSlots: int
    totalSlots: int
    detectedVehicles: int
    timestamp: str

# Vehicle detection class
class VehicleDetector:
    def __init__(self):
        try:
            # Load YOLOv8 model (will download if not present)
            self.model = YOLO('yolov8n.pt')  # nano version for speed
            self.vehicle_classes = [2, 3, 5, 7]  # car, motorcycle, bus, truck in COCO dataset
            print("YOLOv8 model loaded successfully")
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            self.model = None
    
    def detect_vehicles_in_image(self, image_array):
        """Detect vehicles in an image"""
        if self.model is None:
            return []
        
        try:
            results = self.model(image_array)
            detections = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        
                        if class_id in self.vehicle_classes and confidence > 0.5:
                            x1, y1, x2, y2 = box.xyxy[0].tolist()
                            detections.append({
                                'bbox': [x1, y1, x2, y2],
                                'confidence': confidence,
                                'class_id': class_id,
                                'vehicle_type': self.get_vehicle_type(class_id)
                            })
            
            return detections
        except Exception as e:
            print(f"Detection error: {e}")
            return []
    
    def get_vehicle_type(self, class_id):
        """Map COCO class ID to vehicle type"""
        mapping = {
            2: 'car',
            3: 'motorcycle',
            5: 'bus',
            7: 'truck'
        }
        return mapping.get(class_id, 'unknown')
    
    def analyze_parking_slots(self, image_array, slot_regions):
        """Analyze predefined parking slot regions for occupancy"""
        detections = self.detect_vehicles_in_image(image_array)
        slot_results = []
        
        for slot in slot_regions:
            slot_bbox = slot['bbox']  # [x1, y1, x2, y2]
            is_occupied = False
            vehicle_type = None
            max_confidence = 0
            
            # Check if any detected vehicle overlaps with this slot
            for detection in detections:
                det_bbox = detection['bbox']
                
                # Calculate intersection over union (IoU)
                iou = self.calculate_iou(slot_bbox, det_bbox)
                
                if iou > 0.3:  # 30% overlap threshold
                    is_occupied = True
                    if detection['confidence'] > max_confidence:
                        max_confidence = detection['confidence']
                        vehicle_type = detection['vehicle_type']
            
            slot_results.append(DetectionResult(
                slotNumber=slot['slotNumber'],
                isOccupied=is_occupied,
                confidence=max_confidence,
                vehicleType=vehicle_type
            ))
        
        return slot_results
    
    def calculate_iou(self, box1, box2):
        """Calculate Intersection over Union (IoU) of two bounding boxes"""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        if x2 <= x1 or y2 <= y1:
            return 0
        
        intersection = (x2 - x1) * (y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0

# Initialize detector
detector = VehicleDetector()

# Mock parking slot regions (in real implementation, these would be configured per parking lot)
MOCK_SLOT_REGIONS = {
    "default": [
        {"slotNumber": "S001", "bbox": [100, 100, 200, 250]},
        {"slotNumber": "S002", "bbox": [220, 100, 320, 250]},
        {"slotNumber": "S003", "bbox": [340, 100, 440, 250]},
        {"slotNumber": "S004", "bbox": [460, 100, 560, 250]},
        {"slotNumber": "S005", "bbox": [100, 270, 200, 420]},
        {"slotNumber": "S006", "bbox": [220, 270, 320, 420]},
        {"slotNumber": "S007", "bbox": [340, 270, 440, 420]},
        {"slotNumber": "S008", "bbox": [460, 270, 560, 420]},
    ]
}

@app.get("/")
async def root():
    return {"message": "ParkEase Computer Vision Service", "status": "running", "version": "1.0.0"}

@app.post("/analyze-image")
async def analyze_parking_image(file: UploadFile = File(...), lot_id: str = "default"):
    """Analyze parking lot image for vehicle occupancy"""
    try:
        # Read uploaded image
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        image_array = np.array(image)
        
        # Get slot regions for this parking lot
        slot_regions = MOCK_SLOT_REGIONS.get(lot_id, MOCK_SLOT_REGIONS["default"])
        
        # Analyze slots
        slot_results = detector.analyze_parking_slots(image_array, slot_regions)
        
        # Calculate statistics
        occupied_slots = sum(1 for slot in slot_results if slot.isOccupied)
        available_slots = len(slot_results) - occupied_slots
        
        return OccupancyResponse(
            lotId=lot_id,
            slots=slot_results,
            availableSlots=available_slots,
            totalSlots=len(slot_results),
            detectedVehicles=occupied_slots,
            timestamp=str(np.datetime64('now'))
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis error: {str(e)}")

@app.get("/occupancy/{lot_id}")
async def get_current_occupancy(lot_id: str):
    """Get current occupancy status (mock data for demo)"""
    try:
        # In real implementation, this would fetch from live CCTV feed
        slot_regions = MOCK_SLOT_REGIONS.get(lot_id, MOCK_SLOT_REGIONS["default"])
        
        # Generate mock occupancy data
        slot_results = []
        for slot in slot_regions:
            is_occupied = np.random.random() > 0.6  # 40% occupancy rate
            slot_results.append(DetectionResult(
                slotNumber=slot['slotNumber'],
                isOccupied=is_occupied,
                confidence=0.85 if is_occupied else 0.95,
                vehicleType='car' if is_occupied else None
            ))
        
        occupied_slots = sum(1 for slot in slot_results if slot.isOccupied)
        available_slots = len(slot_results) - occupied_slots
        
        return OccupancyResponse(
            lotId=lot_id,
            slots=slot_results,
            availableSlots=available_slots,
            totalSlots=len(slot_results),
            detectedVehicles=occupied_slots,
            timestamp=str(np.datetime64('now'))
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Occupancy check error: {str(e)}")

@app.post("/detect-vehicles")
async def detect_vehicles(file: UploadFile = File(...)):
    """Detect vehicles in uploaded image"""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        image_array = np.array(image)
        
        detections = detector.detect_vehicles_in_image(image_array)
        
        return {
            "detections": detections,
            "vehicle_count": len(detections),
            "timestamp": str(np.datetime64('now'))
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vehicle detection error: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": detector.model is not None,
        "timestamp": str(np.datetime64('now'))
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
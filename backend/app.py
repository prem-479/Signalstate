"""
Signalstate - Backend Server
FastAPI-based inference server with MediaPipe + TensorFlow
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import cv2
import numpy as np
import mediapipe as mp
import base64
import time
from typing import Optional, Dict, List
from collections import deque
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="Emotion AI API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe Face Mesh
from mediapipe.python.solutions import face_mesh as mp_face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Emotion labels (FER2013-style)
EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Temporal smoothing buffer
class TemporalSmoother:
    def __init__(self, window_size=5):
        self.window_size = window_size
        self.buffer = deque(maxlen=window_size)
    
    def smooth(self, probabilities):
        self.buffer.append(probabilities)
        if len(self.buffer) == 0:
            return probabilities
        return np.mean(self.buffer, axis=0)
    
    def reset(self):
        self.buffer.clear()

smoother = TemporalSmoother(window_size=5)

# Request/Response Models
class FrameRequest(BaseModel):
    frame: str = Field(..., description="Base64 encoded image frame")
    include_landmarks: bool = Field(default=True)
    include_metrics: bool = Field(default=True)

class EmotionResponse(BaseModel):
    emotion: str
    confidence: float
    probabilities: Dict[str, float]
    landmarks: Optional[List[Dict[str, float]]] = None
    metrics: Optional[Dict[str, float]] = None
    warnings: List[str] = []
    timestamp: float

# Performance metrics tracker
class MetricsTracker:
    def __init__(self):
        self.frame_times = deque(maxlen=30)
        self.inference_times = deque(maxlen=30)
    
    def add_frame_time(self, duration):
        self.frame_times.append(duration)
    
    def add_inference_time(self, duration):
        self.inference_times.append(duration)
    
    def get_fps(self):
        if not self.frame_times:
            return 0.0
        return 1.0 / (sum(self.frame_times) / len(self.frame_times))
    
    def get_avg_inference(self):
        if not self.inference_times:
            return 0.0
        return (sum(self.inference_times) / len(self.inference_times)) * 1000  # ms

metrics_tracker = MetricsTracker()

# Emotion detection (placeholder - replace with actual TensorFlow model)
def detect_emotion(face_roi):
    """
    Detect emotion from face ROI
    In production, this loads a trained TensorFlow model
    For now, returns mock probabilities for demonstration
    """
    # Simulate processing time
    time.sleep(0.02)
    
    # Mock emotion probabilities
    # In production: model.predict(preprocessed_face)
    probabilities = np.random.dirichlet(np.ones(len(EMOTION_LABELS))) * 0.7
    probabilities += np.random.rand(len(EMOTION_LABELS)) * 0.3
    probabilities /= probabilities.sum()
    
    return probabilities

def preprocess_frame(frame):
    """Preprocess frame for emotion detection"""
    # Convert to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Normalize
    normalized = rgb_frame.astype(np.float32) / 255.0
    
    return normalized

def extract_face_roi(frame, landmarks):
    """Extract face region of interest using landmarks"""
    h, w = frame.shape[:2]
    
    # Get bounding box from landmarks
    x_coords = [lm['x'] * w for lm in landmarks]
    y_coords = [lm['y'] * h for lm in landmarks]
    
    x_min, x_max = int(min(x_coords)), int(max(x_coords))
    y_min, y_max = int(min(y_coords)), int(max(y_coords))
    
    # Add padding
    padding = 20
    x_min = max(0, x_min - padding)
    y_min = max(0, y_min - padding)
    x_max = min(w, x_max + padding)
    y_max = min(h, y_max + padding)
    
    return frame[y_min:y_max, x_min:x_max]

def calculate_head_pose(landmarks):
    """Calculate head pose angles from landmarks"""
    # Simplified head pose estimation
    # In production, use solvePnP with 3D model points
    
    nose_tip = landmarks[1]  # Approximate nose tip
    left_eye = landmarks[33]
    right_eye = landmarks[263]
    
    # Yaw (left-right rotation)
    yaw = (left_eye['x'] - right_eye['x']) * 90
    
    # Pitch (up-down rotation)
    pitch = (nose_tip['y'] - (left_eye['y'] + right_eye['y']) / 2) * 90
    
    return {'yaw': yaw, 'pitch': pitch, 'roll': 0.0}

def assess_frame_quality(frame, landmarks):
    """Assess frame quality and generate warnings"""
    warnings = []
    
    # Check lighting
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray)
    
    if brightness < 50:
        warnings.append("Low lighting detected - may affect accuracy")
    elif brightness > 200:
        warnings.append("Overexposed lighting - may affect accuracy")
    
    # Check face size
    h, w = frame.shape[:2]
    face_size = len(landmarks) > 0
    
    if not face_size:
        warnings.append("Face not detected or too small")
    
    # Check head pose
    pose = calculate_head_pose(landmarks)
    if abs(pose['yaw']) > 30:
        warnings.append("Face turned too far to the side")
    if abs(pose['pitch']) > 25:
        warnings.append("Face tilted too much")
    
    return warnings

@app.get("/")
async def root():
    return {
        "name": "Signalstate API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "detect": "/detect (POST)",
            "health": "/health (GET)",
            "reset": "/reset (POST)"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "mediapipe": "initialized",
        "fps": metrics_tracker.get_fps(),
        "avg_inference_ms": metrics_tracker.get_avg_inference()
    }

@app.post("/detect", response_model=EmotionResponse)
async def detect_emotion_endpoint(request: FrameRequest):
    """
    Main emotion detection endpoint
    Processes a single frame and returns emotion analysis
    """
    start_time = time.time()
    
    try:
        # Decode base64 frame
        frame_data = base64.b64decode(request.frame.split(',')[-1])
        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid frame data")
        
        # Process with MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)
        
        if not results.multi_face_landmarks:
            return EmotionResponse(
                emotion="No Face Detected",
                confidence=0.0,
                probabilities={label: 0.0 for label in EMOTION_LABELS},
                warnings=["No face detected in frame"],
                timestamp=time.time()
            )
        
        # Extract landmarks
        landmarks_list = []
        if request.include_landmarks:
            face_landmarks = results.multi_face_landmarks[0]
            for idx, landmark in enumerate(face_landmarks.landmark):
                landmarks_list.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'idx': idx
                })
        
        # Extract face ROI
        face_roi = extract_face_roi(frame, landmarks_list)
        
        # Detect emotion
        inference_start = time.time()
        raw_probabilities = detect_emotion(face_roi)
        inference_time = time.time() - inference_start
        
        # Apply temporal smoothing
        smoothed_probabilities = smoother.smooth(raw_probabilities)
        
        # Get top emotion
        emotion_idx = np.argmax(smoothed_probabilities)
        emotion = EMOTION_LABELS[emotion_idx]
        confidence = float(smoothed_probabilities[emotion_idx])
        
        # Create probabilities dict
        probabilities_dict = {
            label: float(prob) 
            for label, prob in zip(EMOTION_LABELS, smoothed_probabilities)
        }
        
        # Assess frame quality
        warnings = assess_frame_quality(frame, landmarks_list)
        
        # Calculate metrics
        frame_time = time.time() - start_time
        metrics_tracker.add_frame_time(frame_time)
        metrics_tracker.add_inference_time(inference_time)
        
        metrics = None
        if request.include_metrics:
            metrics = {
                'fps': metrics_tracker.get_fps(),
                'latency_ms': frame_time * 1000,
                'inference_ms': inference_time * 1000,
                'face_detected': True,
                'landmarks_count': len(landmarks_list)
            }
        
        return EmotionResponse(
            emotion=emotion,
            confidence=confidence,
            probabilities=probabilities_dict,
            landmarks=landmarks_list if request.include_landmarks else None,
            metrics=metrics,
            warnings=warnings,
            timestamp=time.time()
        )
        
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/reset")
async def reset_session():
    """Reset temporal smoothing and metrics"""
    smoother.reset()
    metrics_tracker.frame_times.clear()
    metrics_tracker.inference_times.clear()
    return {"status": "reset", "message": "Session state cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

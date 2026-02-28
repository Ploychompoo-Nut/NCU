# FastAPI Backend for VascularAI Dashboard

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="VascularAI API", version="1.2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data
patients_data = [
    {"id": "Patient_001", "name": "John Doe", "age": 65, "status": "completed", "inferenceTime": 4.2, "result": "Success", "date": "2026-02-28"},
    {"id": "Patient_002", "name": "Jane Smith", "age": 72, "status": "completed", "inferenceTime": 3.8, "result": "Success", "date": "2026-02-28"},
    {"id": "Patient_003", "name": "Robert Chen", "age": 58, "status": "processing", "inferenceTime": None, "result": "Processing", "date": "2026-03-01"},
    {"id": "Patient_004", "name": "Maria Garcia", "age": 61, "status": "completed", "inferenceTime": 5.1, "result": "Failed", "date": "2026-02-27"},
    {"id": "Patient_005", "name": "David Kim", "age": 55, "status": "completed", "inferenceTime": 3.5, "result": "Success", "date": "2026-02-27"},
    {"id": "Patient_006", "name": "Sarah Wilson", "age": 68, "status": "queued", "inferenceTime": None, "result": "Queued", "date": "2026-03-01"},
]

metrics_data = {
    "Patient_001": [
        {"metric": "clDice", "value": 0.92},
        {"metric": "Dice Score", "value": 0.88},
        {"metric": "IoU", "value": 0.81},
    ],
    "Patient_002": [
        {"metric": "clDice", "value": 0.89},
        {"metric": "Dice Score", "value": 0.85},
        {"metric": "IoU", "value": 0.78},
    ],
    "Patient_004": [
        {"metric": "clDice", "value": 0.45},
        {"metric": "Dice Score", "value": 0.38},
        {"metric": "IoU", "value": 0.30},
    ],
    "Patient_005": [
        {"metric": "clDice", "value": 0.95},
        {"metric": "Dice Score", "value": 0.91},
        {"metric": "IoU", "value": 0.85},
    ],
}


@app.get("/")
def root():
    return {"message": "VascularAI API v1.2.0", "status": "online"}


@app.get("/api/patients")
def get_patients():
    return patients_data


@app.get("/api/metrics/{patient_id}")
def get_metrics(patient_id: str):
    if patient_id in metrics_data:
        return metrics_data[patient_id]
    return {"error": "Patient not found"}


@app.get("/api/status")
def get_status():
    return {
        "patientId": "Patient_003",
        "progress": 80,
        "stage": "Vessel Segmentation",
        "message": "Processing Patient_003... 80%",
    }


@app.get("/api/server")
def get_server_status():
    return {
        "online": True,
        "version": "v1.2.0",
        "gpu": "Apple M2 Pro",
        "modelVersion": "VascularNet v2.1",
    }

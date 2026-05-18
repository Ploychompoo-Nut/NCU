import os
import sys
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Add SwinUNETR to sys.path so we can import from it
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'SwinUNETR')))
from inference import run_inference_pipeline

app = FastAPI(title="UI-3DReconstruction (Python/FastAPI)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration paths
BASE_DIR = Path(__file__).resolve().parent.parent
SWIN_DIR = BASE_DIR / "SwinUNETR"
RESULTS_DIR = SWIN_DIR / "Results"
UPLOADS_DIR = BASE_DIR / "backend_py" / "temp" / "uploads"
WEB_DIST_DIR = BASE_DIR / "web" / "dist"
DATASET_DIR = SWIN_DIR / "dataset" / "test" / "image"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
DATASET_DIR.mkdir(parents=True, exist_ok=True)

class InferenceRequest(BaseModel):
    patient_id: str = "demo_patient"
    file_path: str = "../SwinUNETR/dataset/test/image/0027781276_image.nii.gz"

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "3D-Reconstruction-Python"}

@app.get("/api/dataset-files")
def list_dataset_files():
    # Return a list of .nii.gz files from the dataset directory
    files = [f.name for f in DATASET_DIR.glob("*.nii.gz")]
    return {"files": sorted(files)}

def get_fallback_weights():
    # Search for a .nii.gz file in the Results folder to use as mask
    for file in RESULTS_DIR.iterdir():
        if file.is_file() and file.name.endswith(".gz"):
            return str(file)
    return str(SWIN_DIR / "Weights" / "SwinUNETR_KIPA_max.pth")

@app.post("/api/upload")
async def upload_images(file: UploadFile = File(...)):
    import uuid
    batch_id = str(uuid.uuid4())
    
    file_location = UPLOADS_DIR / f"{batch_id}_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    abs_mean_std = str(SWIN_DIR / "KIPA_Ts_Meanstd.npy")
    abs_weights = get_fallback_weights()
    abs_output_dir = str(RESULTS_DIR / batch_id)
    
    try:
        metrics, mesh_path = run_inference_pipeline(
            input_path=str(file_location),
            mean_std_path=abs_mean_std,
            weights_path=abs_weights,
            out_dir=abs_output_dir
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference process failed: {str(e)}")

    return {
        "message": "Inference completed successfully",
        "batch_id": batch_id,
        "mesh_url": f"/api/results/{batch_id}/nerve_mesh.obj",
        "metrics": metrics,
    }

@app.post("/api/inference")
def run_inference(req: InferenceRequest):
    abs_input = str(BASE_DIR / req.file_path.lstrip("../")) if req.file_path.startswith("../") else req.file_path
    if not os.path.exists(abs_input):
        abs_input = str(BASE_DIR / "SwinUNETR" / "dataset" / "test" / "image" / "0027781276_image.nii.gz")
        
    abs_mean_std = str(SWIN_DIR / "KIPA_Ts_Meanstd.npy")
    abs_output_dir = str(RESULTS_DIR / req.patient_id)
    abs_weights = get_fallback_weights()
    
    try:
        metrics, mesh_path = run_inference_pipeline(
            input_path=abs_input,
            mean_std_path=abs_mean_std,
            weights_path=abs_weights,
            out_dir=abs_output_dir
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference process failed: {str(e)}")
        
    return {
        "message": "Inference completed successfully",
        "patient_id": req.patient_id,
        "results_dir": f"/api/results/{req.patient_id}",
        "metrics": metrics
    }

# Mount static files
app.mount("/api/results", StaticFiles(directory=str(RESULTS_DIR)), name="results")
app.mount("/api/dataset", StaticFiles(directory=str(DATASET_DIR)), name="dataset")

if WEB_DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(WEB_DIST_DIR), html=True), name="frontend")
else:
    print(f"Frontend build not found at {WEB_DIST_DIR}. API will run independently.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

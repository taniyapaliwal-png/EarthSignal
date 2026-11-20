"""Small API surface for the Earth Signal website's first milestone."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pipeline.ndvi import calculate_ndvi, valid_coverage
import numpy as np

app = FastAPI(title="Earth Signal API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok", "project": "Earth Signal", "observations_loaded": False}

@app.get("/api/capabilities")
def capabilities():
    return {
        "vegetation": {"name": "NDVI", "calculation": "ready", "source_observations": "not_loaded"},
        "land_surface_temperature": {"status": "planned", "source_observations": "not_loaded"},
        "air_quality": {"status": "planned", "source_observations": "not_loaded"},
    }

@app.post("/api/ndvi/preview")
def ndvi_preview(payload: dict):
    """Calculate NDVI for supplied reflectance arrays; not a satellite-data feed."""
    nir = np.asarray(payload.get("nir", []), dtype="float64")
    red = np.asarray(payload.get("red", []), dtype="float64")
    if nir.shape != red.shape or nir.size == 0:
        return {"error": "nir and red must be non-empty arrays with matching shapes"}
    mask = payload.get("valid_mask")
    result = calculate_ndvi(nir, red, mask)
    return {
        "ndvi": [None if np.isnan(value) else round(float(value), 6) for value in result.ravel()],
        "valid_coverage": valid_coverage(result),
        "note": "Calculated from supplied values; these are not fetched satellite observations.",
    }

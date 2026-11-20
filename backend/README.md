# Earth Signal API

Minimal FastAPI service for the first website milestone.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

Endpoints: `GET /api/health`, `GET /api/capabilities`, and `POST /api/ndvi/preview`.
The preview endpoint calculates NDVI only from values explicitly supplied by the caller; it does not fetch satellite observations.

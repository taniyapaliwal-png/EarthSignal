# Earth Signal

**Read the living planet.** An interactive, website-first atlas for exploring environmental change across Indian cities—starting with Chandigarh.

Earth Signal aims to make satellite and environmental observations understandable through maps, timelines, comparisons and evidence panels. The visual experience is designed to invite exploration; the science must remain traceable and honest.

## Current state

This repository contains an initial NDVI calculation pipeline with automated tests, plus the first interactive website milestone.

- [x] NDVI calculation with invalid pixels preserved as missing values (`NaN`)
- [x] Unit tests for known values, zero denominators, masks and valid coverage
- [x] Website frontend with illustrated India atlas, city selection, layer switcher, timeline preview and methodology panel
- [x] Minimal FastAPI endpoints for health, capability status and supplied-value NDVI preview
- [ ] Ingest and validate real satellite observations
- [ ] Replace schematic map artwork with a licensed, validated geographic boundary layer
- [ ] Serve real city-level environmental summaries and observation dates
- [ ] Add evidence-backed comparisons, anomaly analysis and validated forecasts

## Run the website

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite.

## Run the API (optional)

From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

API endpoints:

- `GET /api/health`
- `GET /api/capabilities`
- `POST /api/ndvi/preview` — calculates NDVI from values supplied in the request; it is not a satellite-data feed.

## Project structure

```text
EarthSignal/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── data/                    # source data and processed outputs (not committed)
├── docs/
│   └── EarthSignal_spec.csv
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── pipeline/
│   └── ndvi.py
├── tests/
│   └── test_ndvi.py
└── README.md
```

## Scientific guardrails

- NDVI indicates vegetation greenness; it is not a direct measure of tree count, biodiversity or total green space.
- Land-surface temperature is not the same as air temperature or the temperature people experience.
- Missing observations must never be presented as healthy or unchanged conditions.
- An anomaly is unusual relative to a defined baseline; it does not establish harm or cause.
- Forecasts and hypothetical scenarios must be clearly separated and evaluated against baselines.
- Every result should expose source, date range, spatial resolution, method, quality flags and uncertainty.

## Data sources under evaluation

- Copernicus Sentinel-2 for vegetation indices.
- USGS Landsat Collection 2 for historical land-surface temperature.
- ERA5 / ERA5-Land for weather and climate context.
- CPCB monitoring data for air quality, subject to coverage and access validation.
- Official municipal or government sources for city boundaries.

No source observations are bundled in the current milestone. The illustrated map and timeline are interface previews, not measured environmental results. The project is not a navigation service or a real-time digital twin.

## Tests

From the repository root:

```bash
python -m pytest -q
```

<div align="center">

<img src="assets/hero.svg" alt="EarthSignal: a slowly rotating globe with an orbiting satellite and Chandigarh marked as the pilot city" width="100%">

<br>

### Explore Indian cities as evolving digital worlds, and inspect the evidence behind every result.

<br>

![Status](https://img.shields.io/badge/status-early%20development-E3A33B?style=flat-square)
![Pilot city](https://img.shields.io/badge/pilot%20city-Chandigarh-1F6F8B?style=flat-square)
![Python](https://img.shields.io/badge/python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tests](https://img.shields.io/badge/tests-pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white)

[Vision](#vision) &nbsp;|&nbsp; [Four levels](#four-levels-of-exploration) &nbsp;|&nbsp; [How it works](#how-it-works) &nbsp;|&nbsp; [Trust](#built-on-trust) &nbsp;|&nbsp; [Roadmap](#roadmap) &nbsp;|&nbsp; [Quick start](#quick-start) &nbsp;|&nbsp; [Full project plan](docs/PROJECT_OVERVIEW.md)

</div>

---

## Vision

Satellites have been watching India's cities for decades, but most people never see what they recorded: where the vegetation thinned, where the heat gathered, which neighbourhoods changed and which stayed the same.

**EarthSignal** is an interactive environmental intelligence platform that makes that history explorable. You start on a navigable 3D Earth, dive into a city, move through time, and compare places. Then you open the **evidence drawer** and see exactly where every number came from.

> The globe should make users curious. Scientifically trustworthy results should make them stay.

The pilot city is **Chandigarh**. The architecture is designed for India-wide scale, but one city has to work properly, end to end, before any other is added.

---

## Four levels of exploration

| Level | Name | What you do |
|:--:|---|---|
| 1 | **Earth** | Spin an immersive 3D globe, search for a city, see environmental highlights |
| 2 | **City** | Zoom to satellite imagery, city boundaries and environmental map layers |
| 3 | **Investigation** | Scrub timelines, compare areas and years, inspect anomalies and their evidence |
| 4 | **Experiment** | Run validated forecasts and clearly labelled what-if scenarios, with uncertainty shown |

The main navigation is **Explore, Compare, Discover, Forecast and Stories**. A context panel opens when you select a place, layer or finding, and the timeline marks exactly which periods have observations and which are missing.

---

## How it works

<img src="assets/pipeline.svg" alt="The EarthSignal pipeline: ingest, standardise, mask, aggregate, store, serve, and attach evidence" width="100%">

Satellite imagery is processed **ahead of time** and stored as analysis-ready datasets, so the app stays fast and nothing is recomputed on every click. Each step is logged, versioned and reproducible.

---

## Built on trust

EarthSignal is designed to be careful. Beautiful maps are easy to make, and misleading ones are easier still.

<img src="assets/ndvi-grid.svg" alt="An 8 by 8 grid of synthetic NDVI pixels. Pixels hidden by cloud are hatched and marked NaN rather than painted as zero." width="100%">

These rules are written into the design, and each one has an acceptance test:

- **Gaps are shown, never hidden.** Missing observations are never displayed as healthy or unchanged.
- **Anomalies are not accusations.** An anomaly means "unusual compared with a defined baseline". It does not prove harm or cause.
- **Correlation is not causation.** The platform does not claim causes it cannot support.
- **Forecasts must earn their place.** Every model is compared with a simple baseline, tested on future periods it never saw, and may refuse to predict when the data is not good enough.
- **Scenarios are not forecasts.** Hypothetical interventions are kept separate from predictions, with assumptions visible.
- **Resolution is honest.** Coarse weather grids and sparse air-quality stations are never presented as neighbourhood-level precision.
- **The AI assistant never invents numbers.** Any figure it states must come from a real, testable query against processed data.

---

## Data sources

The sources below are **candidates**. Licences, coverage and access are confirmed in Phase 0 before anything depends on them.

| Variable | Candidate source | Notes |
|---|---|---|
| Vegetation | Copernicus Sentinel-2 | Fine detail, but the record starts in 2017 |
| Surface temperature | USGS Landsat Collection 2 | Decades of history, needs cloud and sensor screening |
| Weather and climate | ERA5 and ERA5-Land | Atmospheric context at a coarser resolution |
| Air quality | CPCB monitoring data | Station coverage and access to be validated |
| City boundaries | Official municipal or government sources | OpenStreetMap only if licence and suitability allow |

Different variables cover different years. EarthSignal never promises a uniform 20-year record for everything.

---

## Tech stack

| Layer | Choice | Status |
|---|---|:--:|
| Numerics | Python, NumPy | In use |
| Testing | pytest | In use |
| API | FastAPI, Uvicorn | Next |
| Geospatial processing | Rasterio, GeoPandas, xarray | Planned |
| Machine learning | scikit-learn (baselines, anomalies, forecasts) | Planned |
| Database | PostgreSQL + PostGIS | Planned |
| Raster storage | Cloud-Optimized GeoTIFFs | Planned |
| Frontend | React, TypeScript, Vite | Planned |
| Globe and maps | CesiumJS or equivalent, MapLibre for 2D | Planned |
| Visual effects and charts | Three.js (where it adds value), Plotly | Planned |

---

## Roadmap

Planning is complete and the build has started. Phases are ordered so that real science exists before the visuals depend on it.

**Phase 0: Research** *(1 to 2 weeks)*
- [ ] Confirm the Chandigarh boundary, data licences and time coverage
- [ ] Process a sample dataset successfully
- [ ] Write the pilot-city feasibility report (the go/no-go gate for the full globe build)

**Phase 1: Data engine** *(3 to 5 weeks)*
- [x] NDVI calculation that keeps missing pixels missing
- [x] Automated tests for the NDVI calculation
- [ ] FastAPI backend with health and sample endpoints
- [ ] Ingestion, cloud masks, aggregation and metadata
- [ ] Reproducible processing with validated outputs

**Phase 2: Virtual Earth UI** *(3 to 5 weeks)*
- [ ] Globe, city transition, map layers and timeline
- [ ] Accessible 2D fallback
- [ ] Real processed data explorable in the app

**Phase 3: Discovery** *(2 to 4 weeks)*
- [ ] Area and year comparisons, anomaly highlights, evidence drawer
- [ ] One guided story

**Phase 4: Prediction** *(3 to 5 weeks)*
- [ ] One properly evaluated forecasting task, with baseline and uncertainty

**Phase 5: Release** *(2 to 4 weeks)*
- [ ] Polished animation, exportable reports, evidence-backed assistant, deployment and documentation

The whole plan is estimated at 14 to 25 weeks and will be re-estimated after Phase 0. Details, exit criteria and acceptance tests are in the [full project plan](docs/PROJECT_OVERVIEW.md).

---

## Quick start

You need Python 3.11 or newer.

```bash
# 1. Get the code
git clone https://github.com/<your-username>/earthsignal.git
cd earthsignal

# 2. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the tests
python -m pytest
```

---

## Project structure

```
earthsignal/
├── assets/        Illustrations used in this README
├── data/          Dataset catalogue, licences, provenance, small sample files
├── docs/          Project plan, methodology, data dictionary, limitations
├── pipeline/      Reproducible processing code (NDVI lives here)
├── tests/         Scientific, data-quality and API tests
├── requirements.txt
└── README.md
```

Folders planned for later phases: `backend/` (API), `frontend/` (globe, map and evidence panels), `analysis/` (exploration and validation) and `models/` (training, evaluation and versioned metadata).

---

## What EarthSignal will not do

- Replace Google Maps or offer live navigation
- Model every building or process in a city in real time
- Prove causation from correlation alone
- Behave like a chatbot that makes up environmental facts
- Promise to know a city's future exactly

---

## About

Built by **Taniya** as a portfolio-quality project in environmental data science and full-stack engineering. The goal is to document the whole journey honestly: the problem, the data validation, the experiments (including the ones that fail), the baseline comparisons and the remaining limitations.

> The globe on this page is a stylised illustration. The real globe, driven by real data, is what this project is building towards.

<div align="center">
<br>
<sub>Build a virtual world that looks extraordinary because the science inside it is extraordinary.</sub>
</div>

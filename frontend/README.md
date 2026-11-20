# Earth Signal — website

A website-first, interactive atlas for exploring environmental change. This first frontend milestone is intentionally honest about data availability: the map is schematic, the timeline is an interface preview, and no satellite observations are bundled yet.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Current interactions

- Search and select indexed Indian cities, including the Chandigarh pilot.
- Switch between vegetation (NDVI), land-surface temperature and air-quality lenses.
- Move the timeline control (the year is a UI selection, not a claim that data exists for that year).
- Open the methodology panel to see what the selected layer can and cannot tell you.
- Use responsive layout and reduced-motion support.

## Important data note

The map artwork is schematic and is not a boundary dataset or navigation map. The NDVI calculation exists in the Python pipeline, but no Sentinel-2 scenes have been ingested. The site must not show invented environmental measurements.

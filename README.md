# GeoCast

Environmental time-series forecasts for surface heat, vegetation, and climatic water availability. The frontend displays observations and 1-, 3-, and 6-month outlooks. A Python backend serves forecasts from saved ridge-regression models.

## Quick start

Requirements: Python 3.12–3.14. Node.js 20+ is only needed for frontend checks and optional npm shortcuts.

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements-dev.lock -e backend
python -m geocast.cli train --source sample --region all
python -m uvicorn geocast.api:app --host 127.0.0.1 --port 5173
```

On Windows, activate with `.venv\Scripts\Activate.ps1` in PowerShell instead.

Open [the dashboard](http://127.0.0.1:5173/) or [API documentation](http://127.0.0.1:5173/docs). The checked-in samples are real observations and let training run without NASA or Google authentication. Map tiles, fonts, and Leaflet still load from external providers.

On macOS/Linux, `make setup`, `make train`, and `make serve` provide the same workflow. With the virtual environment activated, `npm run dev` runs the Python API with reload.

## Repository layout

```text
backend/
  src/geocast/
    api.py                 FastAPI routes and frontend hosting
    schemas.py             Validated API response contracts
    config.py              Regions and environment configuration
    cli.py                 Explicit training command
    pipeline.py            Acquisition → preparation → training → save
    services.py            Artifact storage and inference responses
    data/                  MODIS / ERA5 clients and monthly features
    ml/                    scikit-learn fitting, validation, and inference
  tests/                   Model, data, API, and migration tests
  pyproject.toml           Python package and dependency ranges
  requirements-dev.lock   Exact tested development dependency versions
frontend/
  index.html               Dashboard
  landing.html             Project introduction
  src/app.js               Application state and rendering
  src/components/          Forecast visualization
  src/lib/                 API client and display helpers
  src/styles/              Dashboard and landing styles
  src/config.js            Display labels and locations
scripts/                   Optional Earth Engine extractor
data/samples/             Small observed datasets for reproducible training
artifacts/                 Generated models; ignored by Git
docs/                     Architecture, model card, and Earth Engine setup
.github/workflows/ci.yml   Automated checks on pushes and pull requests
```

The old browser training prototype is preserved locally in `.local-archive/` and excluded from Git.

## Training and inference

The original model fitted ridge equations with JavaScript matrix operations. Training now uses **Python + scikit-learn Ridge**. JavaScript only requests forecasts and renders the interface.

```sh
# Reproducible offline training on the included observations
python -m geocast.cli train --source sample --region all

# Fetch fresh public MODIS/ERA5 observations and retrain one region
python -m geocast.cli train --source live --region chengalpattu
```

Each command prepares matched monthly records, performs chronological recursive validation, refits on the full available history, and writes `artifacts/<region>.json`. Artifacts include standardized coefficients, feature means/scales, model version, package versions, data fingerprint, provenance, and validation results. They contain no executable pickle data.

The API **does not train or fetch data on requests**. It loads saved coefficients and recursively predicts the requested horizon. If no artifact exists, it returns HTTP 503 with the training command. Re-running the CLI replaces the artifact atomically; the next API request uses it.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Service status and available trained regions |
| `GET /api/regions` | Supported regions and coordinates |
| `GET /api/forecast/{region}?horizon=6` | Saved-model inference, 1–6 months |
| `GET /docs` | Interactive API reference |

See [architecture](docs/architecture.md) and the [model card](docs/model-card.md) for details.

## Checks

With the virtual environment activated:

```sh
npm ci
npm run check
python -m ruff check backend
python -m ruff format --check backend
python -m pytest backend/tests
```

Tests cover numerical parity with the former JavaScript model for all three regions, withheld-data isolation, missing months, physical bounds, water balance, contribution reconciliation, saved-model inference, API errors, and frontend file isolation. GitHub Actions runs these checks and trains all sample regions without external data calls.

## Configuration and publishing

Copy `.env.example` to `.env` only if you need custom data or artifact paths. Credentials, virtual environments, downloaded caches, generated artifacts, and local archives are ignored. Only `frontend/` is web-accessible; source datasets, `.env`, and model files are not exposed as static files.

The repository is prepared for an ordinary Git commit and push. No GitHub repository is created or pushed automatically, and no remote URL is assumed.

## Deploy to Vercel

Import `weeyev/gwcc` with **Root Directory set to the repository root** (leave it
blank, not `backend`). The committed `vercel.json` selects FastAPI, builds the React frontend, and trains all
three regions from the checked-in samples during the build. Leave Install Command
and Output Directory at their defaults. `pyproject.toml` installs the local `geocast-backend` package;
`app.py` loads its source so the frontend, samples, and generated model paths stay
relative to the repository root. No NASA or Google credentials are required.

After deployment, check `/api/health` lists all three trained regions and open `/`
to verify the dashboard. Training happens during builds, never on forecast requests.

## Scientific limits

These models use roughly two years of point-level MODIS observations and coarse ERA5 weather estimates. Product QA flags are not yet screened, and a single short chronological validation window provides limited evidence. Water availability means rainfall minus reference evapotranspiration, not measured water extent or groundwater. NDVI is greenness, not a deforestation measurement. Contributions explain a prediction and do not establish causes or intervention effects.

Sources and snapshot provenance: [data/samples/README.md](data/samples/README.md). Optional Landsat/Sentinel work: [Earth Engine setup](docs/earth-engine.md).

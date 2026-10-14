"""FastAPI inference service plus the public frontend; never trains on request."""

import logging

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from geocast.config import MODEL_VERSION, REGIONS, Settings
from geocast.schemas import ForecastResponse
from geocast.services import ArtifactStore, ModelNotTrained, forecast_payload

logger = logging.getLogger(__name__)


def create_app(settings=None):
    settings = settings or Settings.from_env()
    store = ArtifactStore(settings.artifact_dir)
    app = FastAPI(
        title="GeoCast Forecast API",
        version="0.2.0",
        description="Inference from explicitly trained monthly ridge models. Training is a CLI operation.",
    )

    @app.middleware("http")
    async def no_stale_app(request, call_next):
        response = await call_next(request)
        if request.url.path.endswith((".html", ".js", ".css")) or request.url.path == "/":
            response.headers["Cache-Control"] = "no-cache"
        return response

    @app.get("/api/health", tags=["status"])
    def health():
        return {
            "status": "ok",
            "modelVersion": MODEL_VERSION,
            "trainedRegions": store.trained_regions(),
        }

    @app.get("/api/regions", tags=["status"])
    def regions():
        return [{"id": key, **value} for key, value in REGIONS.items()]

    @app.get("/api/forecast/{region}", response_model=ForecastResponse, tags=["forecasts"])
    def forecast(region: str, response: Response, horizon: int = Query(6, ge=1, le=6)):
        """Predict 1–6 months from saved coefficients; missing models return 503."""
        if region not in REGIONS:
            raise HTTPException(status_code=404, detail="Unknown region.")
        try:
            artifact = store.load(region)
            result = forecast_payload(artifact, horizon)
        except ModelNotTrained as error:
            raise HTTPException(status_code=503, detail=str(error)) from error
        except (ValueError, KeyError, OSError) as error:
            logger.exception("Failed to read trained artifact for %s", region)
            raise HTTPException(
                status_code=500, detail="Saved model is unreadable. Retrain this region."
            ) from error
        response.headers["Cache-Control"] = "no-store"
        return result

    # Only frontend files are web-accessible. Datasets, .env and artifacts stay private.
    if settings.frontend_dir.is_dir():

        @app.get("/dashboard", include_in_schema=False)
        def dashboard():
            return FileResponse(settings.frontend_dir / "index.html")

        app.mount("/", StaticFiles(directory=settings.frontend_dir, html=True), name="frontend")
    return app


app = create_app()

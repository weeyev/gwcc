"""Offline training pipeline, shared by CLI commands and tests."""

import hashlib
import json
from datetime import datetime, timezone
from importlib.metadata import version

from geocast.config import MODEL_VERSION
from geocast.data.features import match_monthly, satellite_observations
from geocast.data.http import JsonClient
from geocast.data.modis import fetch_modis
from geocast.data.weather import fetch_weather
from geocast.ml.training import train_outlook
from geocast.services import ArtifactStore


def train_region(settings, region, source="sample"):
    if source == "sample":
        satellite = json.loads((settings.sample_dir / "modis" / f"{region}.json").read_text())
        weather_file = json.loads((settings.sample_dir / "weather.json").read_text())
        weather = weather_file["regions"][region]
    elif source == "live":
        client = JsonClient(settings.cache_dir)
        try:
            satellite = fetch_modis(client, region)
            weather = fetch_weather(client, region)
        finally:
            client.close()
    else:
        raise ValueError("Source must be sample or live")
    products = {product["product"]: product for product in satellite["observations"]}
    observations = {
        "lst": satellite_observations(products["MOD11A2"]),
        "ndvi": satellite_observations(products["MOD13Q1"]),
    }
    rows = match_monthly(**observations, weather=weather["history"])
    training = train_outlook(rows)
    training.pop("future")
    fingerprint = hashlib.sha256(
        json.dumps(rows, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()
    artifact = {
        "schemaVersion": 1,
        "modelVersion": MODEL_VERSION,
        "region": region,
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "dataFingerprint": fingerprint,
        "versions": {name: version(name) for name in ("numpy", "scikit-learn")},
        "sourceMetadata": {
            "satelliteRetrieved": satellite.get("retrieved"),
            "weatherGridCell": weather.get("gridCell"),
        },
        "observations": observations,
        "weather": weather["history"],
        "training": training,
    }
    path = ArtifactStore(settings.artifact_dir).save(region, artifact)
    return artifact, path

"""Artifact storage and inference API payloads; training is explicit."""

import json
from pathlib import Path
from tempfile import NamedTemporaryFile

from geocast.config import MODEL_VERSION, REGIONS
from geocast.ml.forecast import rollout


class ModelNotTrained(FileNotFoundError):
    pass


class ArtifactStore:
    def __init__(self, directory: Path):
        self.directory = directory

    def path(self, region):
        if region not in REGIONS:
            raise ValueError("Unknown region")
        return self.directory / f"{region}.json"

    def save(self, region, artifact):
        self.directory.mkdir(parents=True, exist_ok=True)
        destination = self.path(region)
        with NamedTemporaryFile(mode="w", dir=self.directory, suffix=".tmp", delete=False) as file:
            json.dump(artifact, file, allow_nan=False, separators=(",", ":"))
            temporary = Path(file.name)
        temporary.replace(destination)
        return destination

    def load(self, region):
        path = self.path(region)
        if not path.exists():
            raise ModelNotTrained(
                f"No trained model for {region}. Run: geocast train --region {region} --source sample"
            )
        artifact = json.loads(path.read_text())
        if artifact.get("schemaVersion") != 1 or artifact.get("modelVersion") != MODEL_VERSION:
            raise ModelNotTrained(f"Model for {region} needs retraining with this code version.")
        return artifact

    def trained_regions(self):
        return [region for region in REGIONS if self.path(region).exists()]


def forecast_payload(artifact, horizon=6):
    trained = artifact["training"]
    outlook = {key: value for key, value in trained.items() if key != "models"}
    outlook["future"] = rollout(trained["models"], trained["history"][-1], horizon)
    return {
        **artifact["observations"],
        "weather": artifact["weather"],
        "outlook": outlook,
        "metadata": {
            key: artifact[key]
            for key in (
                "region",
                "trainedAt",
                "modelVersion",
                "dataFingerprint",
                "source",
                "versions",
            )
        },
    }

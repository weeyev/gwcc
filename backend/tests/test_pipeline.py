import json
from pathlib import Path
from unittest.mock import patch

import pytest

from geocast.pipeline import train_region
from geocast.services import ArtifactStore, forecast_payload


@pytest.mark.parametrize("region", ["chengalpattu", "chennai", "kanchipuram"])
def test_python_model_preserves_predictions_and_saved_inference(settings, region):
    artifact, path = train_region(settings, region, "sample")
    reference = json.loads(
        (Path(__file__).parent / "fixtures/browser-model-reference.json").read_text()
    )[region]
    assert path.exists()
    assert len(artifact["dataFingerprint"]) == 64
    assert artifact["versions"]["scikit-learn"]
    loaded = ArtifactStore(settings.artifact_dir).load(region)
    # Inference remains usable even if training is unavailable.
    with patch(
        "geocast.ml.training.fit_suite", side_effect=AssertionError("Inference trained a model")
    ):
        payload = forecast_payload(loaded)
    for actual, expected in zip(payload["outlook"]["future"], reference["future"]):
        assert actual["month"] == expected["month"]
        for key in expected.keys() - {"month"}:
            assert actual[key] == pytest.approx(expected[key], abs=1e-8)
    for target, metrics in reference["errors"].items():
        for key, value in metrics.items():
            assert payload["outlook"]["errors"][target][key] == pytest.approx(value, abs=1e-8)

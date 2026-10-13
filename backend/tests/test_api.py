from fastapi.testclient import TestClient

from geocast.api import create_app
from geocast.pipeline import train_region


def test_forecast_routes_and_frontend_boundary(settings):
    train_region(settings, "chengalpattu", "sample")
    client = TestClient(create_app(settings))
    assert client.get("/api/health").json()["trainedRegions"] == ["chengalpattu"]
    for horizon in (1, 3, 6):
        response = client.get(f"/api/forecast/chengalpattu?horizon={horizon}")
        assert response.status_code == 200
        assert len(response.json()["outlook"]["future"]) == horizon
        assert response.json()["metadata"]["source"] == "sample"
    assert client.get("/api/forecast/chengalpattu?horizon=7").status_code == 422
    assert client.get("/api/forecast/missing").status_code == 404
    assert client.get("/api/forecast/chennai").status_code == 503
    assert client.get("/").status_code == 200
    assert client.get("/src/app.js").status_code == 200
    assert client.get("/docs").status_code == 200
    for path in (
        "/.env",
        "/artifacts/chengalpattu.json",
        "/backend/src/geocast/api.py",
        "/data/samples/weather.json",
    ):
        assert client.get(path).status_code == 404


def test_missing_models_do_not_trigger_training(settings):
    client = TestClient(create_app(settings))
    result = client.get("/api/forecast/chengalpattu")
    assert result.status_code == 503
    assert "geocast train" in result.json()["detail"]
    assert not settings.artifact_dir.exists()

import httpx

from geocast.data.features import satellite_observations
from geocast.data.http import JsonClient


def test_product_fill_values_and_scaling():
    heat = satellite_observations(
        {
            "product": "MOD11A2",
            "scale": 0.02,
            "records": [{"date": "2026-01-01", "value": 15000}, {"date": "2026-01-09", "value": 0}],
        }
    )
    assert len(heat) == 1
    assert round(heat[0]["value"], 2) == 26.85
    ndvi = satellite_observations(
        {
            "product": "MOD13Q1",
            "scale": 0.0001,
            "records": [
                {"date": "2026-01-01", "value": -3000},
                {"date": "2026-01-17", "value": -1000},
            ],
        }
    )
    assert ndvi == [{"date": "2026-01-17", "value": -0.1}]


def test_data_cache_prevents_repeat_network_request(tmp_path):
    calls = []

    def handler(request):
        calls.append(request)
        return httpx.Response(200, json={"result": 1})

    client = JsonClient(tmp_path, transport=httpx.MockTransport(handler))
    try:
        assert client.get("https://example.test/data", {"region": "test"}) == {"result": 1}
        assert client.get("https://example.test/data", {"region": "test"}) == {"result": 1}
        assert len(calls) == 1
    finally:
        client.close()

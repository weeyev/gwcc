"""NASA ORNL MODIS point histories, grouped into API-sized date requests."""

from datetime import date, timedelta

from geocast.config import REGIONS
from geocast.data.http import DataSourceError

BASE = "https://modis.ornl.gov/rst/api/v1"
PRODUCTS = (("MOD11A2", "LST_Day_1km"), ("MOD13Q1", "250m_16_days_NDVI"))


def fetch_modis(client, region):
    place = REGIONS[region]
    location = {key: place[key] for key in ("latitude", "longitude")}
    cutoff = (date.today() - timedelta(days=731)).isoformat()
    observations = []
    for product, band in PRODUCTS:
        dates = client.get(f"{BASE}/{product}/dates", location)["dates"]
        dates = sorted(
            (item for item in dates if item["calendar_date"] >= cutoff),
            key=lambda item: item["calendar_date"],
        )
        if not dates:
            raise DataSourceError(f"No recent dates available for {product}.")
        records, scale, unit = [], None, None
        for offset in range(0, len(dates), 10):
            chunk = dates[offset : offset + 10]
            body = client.get(
                f"{BASE}/{product}/subset",
                {
                    **location,
                    "startDate": chunk[0]["modis_date"],
                    "endDate": chunk[-1]["modis_date"],
                    "kmAboveBelow": 0,
                    "kmLeftRight": 0,
                    "band": band,
                },
            )
            scale, unit = float(body["scale"]), body["units"]
            records.extend(
                {"date": row["calendar_date"], "value": row["data"][0]} for row in body["subset"]
            )
        observations.append(
            {"product": product, "band": band, "scale": scale, "unit": unit, "records": records}
        )
    return {
        "region": region,
        **location,
        "source": "NASA ORNL MODIS subset REST API",
        "retrieved": date.today().isoformat(),
        "observations": observations,
    }

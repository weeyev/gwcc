"""ERA5 weather acquisition and complete-month aggregation."""

from collections import defaultdict
from datetime import date, timedelta
from statistics import mean

from geocast.config import REGIONS
from geocast.data.http import DataSourceError

FACTORS = {
    "temperature": ("temperature_2m_mean", mean),
    "rainfall": ("precipitation_sum", sum),
    "radiation": ("shortwave_radiation_sum", mean),
    "evapotranspiration": ("et0_fao_evapotranspiration", sum),
}


def monthly(daily):
    groups = defaultdict(lambda: defaultdict(list))
    for index, day in enumerate(daily["time"]):
        for name, (field, _) in FACTORS.items():
            value = daily[field][index]
            if value is not None:
                groups[day[:7]][name].append(value)
    result = []
    for month, values in sorted(groups.items()):
        if all(values[name] for name in FACTORS):
            result.append(
                {
                    "month": month,
                    **{name: aggregate(values[name]) for name, (_, aggregate) in FACTORS.items()},
                }
            )
    return result


def fetch_weather(client, region):
    today = date.today()
    end = today.replace(day=1) - timedelta(days=1)
    if today.day <= 10:
        end = end.replace(day=1) - timedelta(days=1)
    start = date(today.year - 3, 1, 1)
    place = REGIONS[region]
    payload = client.get(
        "https://archive-api.open-meteo.com/v1/archive",
        {
            "latitude": place["latitude"],
            "longitude": place["longitude"],
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "daily": ",".join(field for field, _ in FACTORS.values()),
            "timezone": "Asia/Kolkata",
            "models": "era5",
        },
    )
    if not payload.get("daily", {}).get("time"):
        raise DataSourceError("No weather records returned.")
    return {
        "history": monthly(payload["daily"]),
        "gridCell": {key: payload[key] for key in ("latitude", "longitude")},
        "retrieved": today.isoformat(),
    }

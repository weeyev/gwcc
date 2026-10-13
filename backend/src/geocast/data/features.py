"""Convert observed satellite composites and join monthly weather records."""

import math
from collections import defaultdict
from statistics import mean

VARIABLES = ("lst", "ndvi", "temperature", "rainfall", "radiation", "evapotranspiration")


def satellite_observations(product):
    is_heat = product["product"] == "MOD11A2"
    rows = []
    for record in product["records"]:
        value = record.get("value")
        if not isinstance(value, (int, float)) or not math.isfinite(value):
            continue
        if not (0 < value < 65535 if is_heat else -2000 <= value <= 10000):
            continue
        scaled = value * product["scale"] - (273.15 if is_heat else 0)
        rows.append({"date": record["date"], "value": scaled})
    return sorted(rows, key=lambda row: row["date"])


def match_monthly(lst, ndvi, weather):
    buckets = defaultdict(lambda: {"lst": [], "ndvi": []})
    for key, points in (("lst", lst), ("ndvi", ndvi)):
        for point in points:
            if math.isfinite(point["value"]):
                buckets[point["date"][:7]][key].append(point["value"])
    weather_by_month = {row["month"]: row for row in weather}
    rows = []
    for month, values in sorted(buckets.items()):
        if not values["lst"] or not values["ndvi"] or month not in weather_by_month:
            continue
        row = {
            **weather_by_month[month],
            "month": month,
            "lst": mean(values["lst"]),
            "ndvi": mean(values["ndvi"]),
        }
        if all(
            isinstance(row.get(key), (int, float)) and math.isfinite(row[key]) for key in VARIABLES
        ):
            rows.append(row)
    return rows

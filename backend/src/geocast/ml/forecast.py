"""Pure inference from saved coefficients; no model fitting occurs here."""

import math

from geocast.data.features import VARIABLES

LABELS = {
    "lst": "Prior surface temperature",
    "ndvi": "Prior vegetation greenness",
    "temperature": "Prior air temperature",
    "rainfall": "Prior rainfall",
    "radiation": "Prior solar radiation",
    "evapotranspiration": "Prior evapotranspiration",
}


def next_month(month):
    year, value = map(int, month.split("-"))
    return f"{year + (value == 12):04d}-{1 if value == 12 else value + 1:02d}"


def month_index(month):
    year, value = map(int, month.split("-"))
    return year * 12 + value - 1


def value_for(row, target):
    return row["rainfall"] - row["evapotranspiration"] if target == "balance" else row[target]


def inputs(previous, forecast_month):
    month = int(forecast_month[5:])
    return [
        *[previous[key] for key in VARIABLES],
        math.sin(2 * math.pi * month / 12),
        math.cos(2 * math.pi * month / 12),
    ]


def bounded(value, target):
    if target == "ndvi":
        return max(-1, min(1, value))
    return max(0, value) if target in ("rainfall", "radiation", "evapotranspiration") else value


def rollout(models, origin, horizon=6):
    if not 1 <= horizon <= 12:
        raise ValueError("Horizon must be between 1 and 12 months.")
    result = []
    previous = dict(origin)
    for _ in range(horizon):
        month = next_month(previous["month"])
        x = inputs(previous, month)
        row = {"month": month, "drivers": {}, "baselines": {}}
        for target in VARIABLES:
            model = models[target]
            effects = [
                model["targetScale"] * weight * (x[j] - model["means"][j]) / model["scales"][j]
                for j, weight in enumerate(model["weights"])
            ]
            raw = model["targetMean"] + sum(effects)
            row[target] = bounded(raw, target)
            row["baselines"][target] = model["targetMean"]
            drivers = [
                {"key": key, "label": LABELS[key], "effect": effects[j]}
                for j, key in enumerate(VARIABLES)
            ]
            drivers.append({"key": "season", "label": "Seasonal cycle", "effect": sum(effects[6:])})
            if abs(row[target] - raw) > 1e-10:
                drivers.append(
                    {
                        "key": "bound",
                        "label": "Physical range adjustment",
                        "effect": row[target] - raw,
                    }
                )
            row["drivers"][target] = drivers
        row["balance"] = row["rainfall"] - row["evapotranspiration"]
        row["baselines"]["balance"] = (
            row["baselines"]["rainfall"] - row["baselines"]["evapotranspiration"]
        )
        rain = {driver["key"]: driver for driver in row["drivers"]["rainfall"]}
        et = {driver["key"]: driver for driver in row["drivers"]["evapotranspiration"]}
        row["drivers"]["balance"] = [
            {
                "key": key,
                "label": (rain.get(key) or et[key])["label"],
                "effect": rain.get(key, {}).get("effect", 0) - et.get(key, {}).get("effect", 0),
            }
            for key in dict.fromkeys([*rain, *et])
        ]
        if any(not math.isfinite(row[key]) for key in VARIABLES):
            raise ValueError("Forecast could not be computed reliably.")
        result.append(row)
        previous = row
    return result

import copy
import math

import pytest

from geocast.data.features import VARIABLES, match_monthly
from geocast.ml.forecast import next_month, value_for
from geocast.ml.training import InsufficientHistory, train_outlook


def history(count=48):
    month = "2022-01"
    rows = []
    for i in range(count):
        season = math.sin(2 * math.pi * (i % 12) / 12)
        rows.append(
            {
                "month": month,
                "lst": 31 + 6 * season + 0.03 * i,
                "ndvi": 0.45 - 0.1 * season + 0.025 * math.cos(i),
                "temperature": 27 + 3 * season,
                "rainfall": max(0, 90 - 50 * season + 10 * math.sin(i)),
                "radiation": 16 + 4 * season,
                "evapotranspiration": 100 + 20 * season,
            }
        )
        month = next_month(month)
    return rows


def test_recursive_future_bounds_water_balance_and_contributions():
    result = train_outlook(history())
    assert [row["month"] for row in result["future"]] == [
        f"2026-{month:02d}" for month in range(1, 7)
    ]
    for row in result["future"]:
        assert all(math.isfinite(row[key]) for key in VARIABLES)
        assert -1 <= row["ndvi"] <= 1
        assert all(row[key] >= 0 for key in ("rainfall", "radiation", "evapotranspiration"))
        assert row["balance"] == row["rainfall"] - row["evapotranspiration"]
        for target in ("lst", "ndvi", "balance"):
            total = row["baselines"][target] + sum(
                driver["effect"] for driver in row["drivers"][target]
            )
            assert total == pytest.approx(value_for(row, target), abs=1e-8)


def test_withheld_observations_never_enter_validation_predictions():
    rows = history()
    before = train_outlook(rows)
    modified = copy.deepcopy(rows)
    for row in modified:
        if row["month"] > before["validationOrigin"]:
            row.update(
                lst=row["lst"] + 100,
                ndvi=-0.9,
                rainfall=900,
                temperature=1,
                radiation=3,
                evapotranspiration=2,
            )
    after = train_outlook(modified)
    for target in ("lst", "ndvi", "balance"):
        assert [row["forecast"] for row in before["errors"][target]["history"]] == [
            row["forecast"] for row in after["errors"][target]["history"]
        ]
        assert before["errors"][target]["rmse"] != after["errors"][target]["rmse"]


def test_missing_months_are_not_adjacent_training_pairs_or_filled_test_values():
    rows = history()
    complete = train_outlook(rows)
    gap = train_outlook([row for i, row in enumerate(rows) if i != 15])
    assert gap["samples"] == complete["samples"] - 2
    gap = train_outlook([row for i, row in enumerate(rows) if i != len(rows) - 3])
    assert gap["testCount"] == gap["holdout"] - 1
    assert rows[-3]["month"] not in [row["month"] for row in gap["errors"]["lst"]["history"]]


def test_short_history_does_not_produce_forecast():
    with pytest.raises(InsufficientHistory, match="at least 14"):
        train_outlook(history(8))


def test_monthly_join_uses_observations_and_preserves_gaps():
    rows = match_monthly(
        lst=[
            {"date": "2022-01-01", "value": 30},
            {"date": "2022-01-09", "value": 34},
            {"date": "2022-02-01", "value": 35},
        ],
        ndvi=[{"date": "2022-01-01", "value": 0.3}, {"date": "2022-03-01", "value": 0.4}],
        weather=history(3),
    )
    assert len(rows) == 1
    assert rows[0]["lst"] == 32
    assert rows[0]["ndvi"] == 0.3

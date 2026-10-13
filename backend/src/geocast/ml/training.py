"""Chronological training and recursive validation, called by the CLI only."""

from math import sqrt
from statistics import mean

from geocast.data.features import VARIABLES
from geocast.ml.forecast import inputs, month_index, next_month, rollout, value_for
from geocast.ml.ridge import fit_ridge


class InsufficientHistory(ValueError):
    pass


def examples_from(rows):
    return [
        {"x": inputs(previous, row["month"]), "row": row}
        for previous, row in zip(rows, rows[1:])
        if next_month(previous["month"]) == row["month"]
    ]


def fit_suite(rows):
    examples = examples_from(rows)
    return {target: fit_ridge(examples, target) for target in VARIABLES}


def train_outlook(rows, horizon=6):
    if not rows:
        raise InsufficientHistory("No matched satellite and weather months are available.")
    pairs = len(examples_from(rows))
    if pairs < 14:
        raise InsufficientHistory(f"Only {pairs} consecutive month pairs; at least 14 are needed.")
    requested_holdout = min(6, max(3, pairs // 4))
    cutoff = month_index(rows[-1]["month"]) - requested_holdout
    train_rows = [row for row in rows if month_index(row["month"]) <= cutoff]
    test_rows = [row for row in rows if month_index(row["month"]) > cutoff]
    if len(test_rows) < 3 or len(examples_from(train_rows)) < 9:
        raise InsufficientHistory("Too few observed months for a chronological forecast check.")
    holdout = month_index(rows[-1]["month"]) - month_index(train_rows[-1]["month"])
    if holdout > 12:
        raise InsufficientHistory(
            "The recent observation gap is too large for a useful forecast check."
        )
    test_forecast = rollout(fit_suite(train_rows), train_rows[-1], holdout)
    test_by_month = {row["month"]: row for row in test_forecast}
    errors = {}
    for target in ("lst", "ndvi", "balance"):
        origin = value_for(train_rows[-1], target)
        errors[target] = {
            "rmse": sqrt(
                mean(
                    (value_for(row, target) - value_for(test_by_month[row["month"]], target)) ** 2
                    for row in test_rows
                )
            ),
            "baselineRMSE": sqrt(mean((value_for(row, target) - origin) ** 2 for row in test_rows)),
            "history": [
                {
                    "month": row["month"],
                    "actual": value_for(row, target),
                    "forecast": value_for(test_by_month[row["month"]], target),
                }
                for row in test_rows
            ],
        }
    models = fit_suite(rows)
    return {
        "models": models,
        "history": rows,
        "future": rollout(models, rows[-1], horizon),
        "errors": errors,
        "samples": pairs,
        "trainSamples": len(examples_from(train_rows)),
        "holdout": holdout,
        "testCount": len(test_rows),
        "origin": rows[-1]["month"],
        "validationOrigin": train_rows[-1]["month"],
        "testStart": test_rows[0]["month"],
        "testEnd": test_rows[-1]["month"],
        "method": "Multivariate ridge autoregression (scikit-learn)",
    }

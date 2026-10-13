"""Standardized ridge regressions, fitted with scikit-learn and stored as JSON."""

import numpy as np
from sklearn.linear_model import Ridge

ALPHA = 10.0


def fit_ridge(examples, target):
    x = np.asarray([example["x"] for example in examples], dtype=float)
    y = np.asarray([example["row"][target] for example in examples], dtype=float)
    means = x.mean(axis=0)
    scales = np.maximum(x.std(axis=0), 1e-6)
    target_mean = float(y.mean())
    target_scale = max(float(y.std()), 1e-6)
    estimator = Ridge(alpha=ALPHA, fit_intercept=False, solver="cholesky")
    estimator.fit((x - means) / scales, (y - target_mean) / target_scale)
    return {
        "means": means.tolist(),
        "scales": scales.tolist(),
        "targetMean": target_mean,
        "targetScale": target_scale,
        "weights": estimator.coef_.tolist(),
    }

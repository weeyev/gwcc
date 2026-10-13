# Model card

## Objective and inputs

Predict monthly land surface temperature (LST), vegetation greenness (NDVI), and climatic water balance at one of three Tamil Nadu point locations. Public MODIS point products provide LST and NDVI, while ERA5 provides air temperature, rainfall, radiation, and reference evapotranspiration. Satellite composites are averaged by their start month and joined to weather by calendar month. Missing satellite months stay absent.

## Model

Six ridge equations jointly form a multivariate autoregression. Each equation uses the preceding month's six variables and annual sine/cosine terms. Inputs and targets are standardized using training-only statistics; scikit-learn `Ridge(alpha=10, fit_intercept=False, solver="cholesky")` fits the standardized equations. Fixed regularization is not tuned on the validation window.

Prediction restores original units. Rainfall, radiation, and reference evapotranspiration are bounded at zero; NDVI is bounded to [-1, 1]. Water balance equals rainfall minus reference evapotranspiration. Future steps use the previous predicted state for all six inputs. There is no access to future observed weather during inference.

## Validation

The final 3–6 calendar months form one chronological forecast window. Earlier records alone fit the validation model. It rolls forward through the entire window, including missing observation months, and is scored only where matched observations exist. Persistence holds the observed value at the forecast origin constant. The final fit uses all available consecutive monthly pairs.

The UI reports model and persistence RMSE, training pair counts, scoring counts, and the forecast origin. A horizon longer than the validation window is labelled. No calibrated uncertainty interval is claimed. This is an exploratory model from a small sample, not evidence of established generalization.

## Contributions

Each standardized linear term contributes relative to the training target mean. Seasonal terms are combined. Clipping adds an explicit physical-range adjustment, and water contributions are rainfall contributions minus evapotranspiration contributions. Contributions therefore reconcile with the prediction. They explain the model and do not estimate causal environmental effects.

## Limitations

- MODIS point footprints and coarse ERA5 cells differ in scale and location.
- Numeric fill values are filtered, but product quality flags are not yet screened.
- NDVI cannot establish forest loss; water balance is not water extent, groundwater, streamflow, or flooding.
- Land cover, built-up area, irrigation, water extraction, and pollution are absent.
- Seasonality and correlated inputs can affect attribution. Ground observations, richer spatial data, multiple forecast origins, and intervention evidence are needed for stronger conclusions.

The Python migration is checked numerically against the previous JavaScript model on all three observed sample regions to a tolerance of 1e-8.

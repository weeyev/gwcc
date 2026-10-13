"""Public forecast response contract, also used by generated OpenAPI docs."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ApiModel(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)


class PointObservation(ApiModel):
    date: str
    value: float


class MonthlyWeather(ApiModel):
    month: str = Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    temperature: float
    rainfall: float
    radiation: float
    evapotranspiration: float


class MonthlyObservation(MonthlyWeather):
    lst: float
    ndvi: float


class Driver(ApiModel):
    key: str
    label: str
    effect: float


class ForecastMonth(MonthlyObservation):
    balance: float
    drivers: dict[str, list[Driver]]
    baselines: dict[str, float]


class ValidationMonth(ApiModel):
    month: str
    actual: float
    forecast: float


class ModelError(ApiModel):
    rmse: float
    baselineRMSE: float
    history: list[ValidationMonth]


class Outlook(ApiModel):
    history: list[MonthlyObservation]
    future: list[ForecastMonth]
    errors: dict[str, ModelError]
    samples: int
    trainSamples: int
    holdout: int
    testCount: int
    origin: str
    validationOrigin: str
    testStart: str
    testEnd: str
    method: str


class ModelMetadata(ApiModel):
    region: str
    trainedAt: str
    modelVersion: str
    dataFingerprint: str
    source: Literal["sample", "live"]
    versions: dict[str, str]


class ForecastResponse(ApiModel):
    lst: list[PointObservation]
    ndvi: list[PointObservation]
    weather: list[MonthlyWeather]
    outlook: Outlook
    metadata: ModelMetadata

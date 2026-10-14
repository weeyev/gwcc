export interface RegionConfig {
  name: string;
  lat: number;
  lon: number;
}

export interface OutcomeConfig {
  name: string;
  target: 'lst' | 'ndvi' | 'balance';
  unit: string;
  color: string;
  description: string;
}

export interface ObservationPoint {
  date: string;
  value: number;
}

export interface WeatherPoint {
  month: string;
  temperature: number;
  rainfall: number;
  radiation: number;
  evapotranspiration: number;
  lst?: number;
  ndvi?: number;
  balance?: number;
}

export interface DriverEffect {
  key: string;
  label: string;
  effect: number;
}

export interface ForecastMonthData {
  month: string;
  lst: number;
  ndvi: number;
  balance: number;
  temperature: number;
  rainfall: number;
  radiation: number;
  evapotranspiration: number;
  drivers?: Record<string, DriverEffect[]>;
  baselines?: Record<string, number>;
}

export interface ErrorMetric {
  rmse: number;
  baselineRMSE: number;
  history?: Array<{
    month: string;
    actual: number;
    forecast: number;
  }>;
}

export interface ForecastResponsePayload {
  lst: ObservationPoint[];
  ndvi: ObservationPoint[];
  weather: WeatherPoint[];
  outlook: {
    history: WeatherPoint[];
    future: ForecastMonthData[];
    errors: Record<'lst' | 'ndvi' | 'balance', ErrorMetric>;
    samples: number;
    trainSamples: number;
    origin: string;
    method: string;
  };
  metadata: {
    region: string;
    trainedAt: string;
    modelVersion: string;
    dataFingerprint: string;
    source: string;
    versions: Record<string, string>;
  };
}

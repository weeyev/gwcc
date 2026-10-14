import { ForecastResponsePayload } from '../types';

export async function getForecast(region: string): Promise<ForecastResponsePayload> {
  const response = await fetch(`/api/forecast/${encodeURIComponent(region)}?horizon=6`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || 'Forecast service is currently unavailable.');
  }
  return response.json();
}

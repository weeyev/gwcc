export async function getForecast(region) {
  const response = await fetch(`/api/forecast/${encodeURIComponent(region)}?horizon=6`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || 'Forecast service unavailable.');
  }
  return response.json();
}

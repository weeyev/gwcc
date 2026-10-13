// Display helpers only. Fitting and forecasting run in the Python backend.
export const VARIABLES = ['lst', 'ndvi', 'temperature', 'rainfall', 'radiation', 'evapotranspiration'];
export function monthIndex(month) {
  const [year, value] = month.split('-').map(Number);
  return year * 12 + value - 1;
}
export function valueFor(row, target) {
  return target === 'balance' ? row.rainfall - row.evapotranspiration : row[target];
}

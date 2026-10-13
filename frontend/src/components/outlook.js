import { monthIndex, valueFor, VARIABLES } from '../lib/series.js';
const FACTORS = {
  lst: { name: 'Land surface temperature', unit: '°C', digits: 1 },
  ndvi: { name: 'Vegetation greenness', unit: 'NDVI', digits: 3 },
  temperature: { name: 'Air temperature', unit: '°C', digits: 1 },
  rainfall: { name: 'Rainfall', unit: 'mm', digits: 1 },
  radiation: { name: 'Solar radiation', unit: 'MJ/m²/day', digits: 1 },
  evapotranspiration: { name: 'Reference evapotranspiration', unit: 'mm', digits: 1 },
};
const prettyMonth = month => new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const digitsFor = target => target === 'ndvi' ? 3 : 1;
function format(value, target, unit, signed = false) {
  return `${signed && value > 0 ? '+' : ''}${value.toFixed(digitsFor(target))}${unit ? ` ${unit}` : ''}`;
}
function chart(history, future, config) {
  const width = 860, height = 285, left = 56, right = 824, top = 22, bottom = 232;
  const rows = [...history, ...future], values = rows.map(row => valueFor(row, config.target));
  const min = Math.min(...values), max = Math.max(...values), padding = Math.max((max - min) * .14, config.target === 'ndvi' ? .015 : 1);
  const low = min - padding, high = max + padding;
  const start = monthIndex(rows[0].month), finish = monthIndex(rows.at(-1).month);
  const x = row => left + (monthIndex(row.month) - start) / Math.max(1, finish - start) * (right - left);
  const y = row => bottom - (valueFor(row, config.target) - low) / (high - low) * (bottom - top);
  const path = (points, gaps = false) => points.map((row, i) => `${!i || (gaps && monthIndex(row.month) - monthIndex(points[i - 1].month) > 1) ? 'M' : 'L'}${x(row).toFixed(1)} ${y(row).toFixed(1)}`).join(' ');
  const boundary = x(history.at(-1));
  const ticks = Array.from({ length: 4 }, (_, i) => low + i * (high - low) / 3);
  return `<svg viewBox="0 0 ${width} ${height}" class="outlook-chart" role="img" aria-label="${config.name}: solid observed history, dashed forecast through ${future.at(-1).month}">
    <rect x="${boundary}" y="${top}" width="${right - boundary}" height="${bottom - top}" fill="#eef5e9"/>
    ${ticks.map(value => { const py = bottom - (value - low) / (high - low) * (bottom - top); return `<path d="M${left} ${py}H${right}" stroke="#dde7dc" stroke-dasharray="3 5"/><text x="${left - 10}" y="${py + 4}" text-anchor="end" class="axis-label">${value.toFixed(config.target === 'ndvi' ? 2 : 0)}</text>`; }).join('')}
    <path d="${path(history, true)}" fill="none" stroke="${config.color}" stroke-width="2.7"/>
    <path d="${path([history.at(-1), ...future])}" fill="none" stroke="${config.color}" stroke-width="2.7" stroke-dasharray="6 5"/>
    <path d="M${boundary} ${top}V${bottom}" stroke="#72917c" stroke-dasharray="3 4"/>
    ${future.map(row => `<circle cx="${x(row)}" cy="${y(row)}" r="3.5" fill="${config.color}"/>`).join('')}
    <text x="${left}" y="263" class="axis-label">${prettyMonth(history[0].month)}</text>
    <text x="${boundary}" y="263" text-anchor="middle" class="axis-label">${prettyMonth(history.at(-1).month)}</text>
    <text x="${right}" y="263" text-anchor="end" class="axis-label">${prettyMonth(future.at(-1).month)}</text>
    <text x="${right - 8}" y="${top + 15}" text-anchor="end" class="chart-forecast-label">FORECAST</text>
  </svg>`;
}
export function mountOutlook(container, outlook, config) {
  if (outlook.error) {
    container.innerHTML = `<div class="forecast-error" role="status"><strong>Forecast unavailable</strong><p>${outlook.error}</p></div>`;
    return;
  }
  let horizon = 6, monthIndexSelected = 0;
  const target = config.target, unit = config.unit || 'NDVI', last = outlook.history.at(-1);
  const error = outlook.errors[target], beats = error.rmse < error.baselineRMSE;
  function render() {
    const future = outlook.future.slice(0, horizon), selected = future[monthIndexSelected];
    const prediction = valueFor(selected, target), observed = valueFor(last, target), change = prediction - observed;
    const finalChange = valueFor(future.at(-1), target) - observed;
    const drivers = [...selected.drivers[target]].sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));
    const maxEffect = Math.max(...drivers.map(driver => Math.abs(driver.effect)), 1e-6);
    const outlookSentence = target === 'balance'
      ? `${future.filter(row => row.balance < 0).length} of ${horizon} forecast months have rainfall below reference evapotranspiration. This is a projected climatic water deficit, not measured water loss.`
      : `${config.name} is projected ${Math.abs(finalChange).toFixed(digitsFor(target))} ${unit} ${finalChange >= 0 ? 'above' : 'below'} the last matched observation by ${prettyMonth(future.at(-1).month)}. This includes seasonal variation.`;
    container.innerHTML = `<div class="outlook-heading"><div><small>03 / FUTURE OUTLOOK</small><h2>What may happen next?</h2><p>${config.name} · observed through ${prettyMonth(outlook.origin)} · provisional model</p></div><div class="horizon-control" role="group" aria-label="Forecast horizon">${[1, 3, 6].map(n => `<button type="button" data-horizon="${n}" aria-pressed="${horizon === n}">${n} ${n === 1 ? 'month' : 'months'}</button>`).join('')}</div></div>
      <div class="forecast-summary"><div><small>SELECTED FORECAST · ${prettyMonth(selected.month)}</small><strong>${format(prediction, target, unit)}</strong><span>${format(change, target, unit, true)} vs ${prettyMonth(outlook.origin)} monthly observation</span></div><p>${outlookSentence}</p></div>
      <div class="timeline"><div class="timeline-key"><span><i style="border-color:${config.color}"></i>Observed monthly values</span><span><i class="dashed" style="border-color:${config.color}"></i>Recursive model forecast</span></div>${chart(outlook.history.slice(-12), future, config)}
      <div class="forecast-months" role="group" aria-label="Select forecast month">${future.map((row, i) => `<button type="button" data-month="${i}" aria-pressed="${monthIndexSelected === i}"><span>${prettyMonth(row.month)}</span><b>${format(valueFor(row, target), target, unit)}</b><small>${format(valueFor(row, target) - observed, target, unit, true)}</small></button>`).join('')}</div></div>
      <div class="forecast-explanations"><section class="drivers"><small>INPUT CONTRIBUTIONS · ${prettyMonth(selected.month)}</small><h3>What pushes this prediction?</h3><p>Contributions relative to the model reference of ${format(selected.baselines[target], target, unit)}. These describe the fitted model, not proven causes.</p>${drivers.map(driver => `<div class="driver-row"><div><span>${driver.label}</span><b class="${driver.effect >= 0 ? 'raises' : 'lowers'}">${format(driver.effect, target, unit, true)}</b></div><div class="driver-track"><i style="width:${Math.abs(driver.effect) / maxEffect * 100}%;background:${driver.effect >= 0 ? '#d88055' : '#4e8969'}"></i></div></div>`).join('')}</section>
      <section class="model-check"><small>HISTORICAL FORECAST CHECK</small><h3>${beats ? 'Ahead of a simple baseline' : 'Baseline performed better'}</h3><div class="validation-values"><div><b>${format(error.rmse, target, unit)}</b><span>Model RMSE</span></div><div><b>${format(error.baselineRMSE, target, unit)}</b><span>Persistence RMSE</span></div></div><p>The model was trained through ${prettyMonth(outlook.validationOrigin)} and forecast ${outlook.holdout} months without seeing their observations. ${outlook.testCount} observed months were available for scoring; missing observations were not filled. Persistence holds the last observed value constant.</p><p class="validation-detail">${outlook.trainSamples} training pairs for this check · ${outlook.samples} for the final fit · ridge regularization 10</p><div class="model-limit">One historical forecast window is a limited check. ${horizon > outlook.holdout ? `The ${horizon}-month endpoint extends beyond the ${outlook.holdout} tested months. ` : ''}No calibrated prediction interval is available. Later months reuse predicted inputs.</div>
      <details><summary>Compare test predictions with observations</summary><table><thead><tr><th>Month</th><th>Observed</th><th>Predicted</th></tr></thead><tbody>${error.history.map(row => `<tr><td>${row.month}</td><td>${format(row.actual, target, unit)}</td><td>${format(row.forecast, target, unit)}</td></tr>`).join('')}</tbody></table></details></section></div>
      <section class="factor-outlook"><small>FACTOR OUTLOOK · ${prettyMonth(selected.month)}</small><h3>How are the inputs expected to change?</h3><p>All six variables are forecast together from their earlier values. This table shows the selected future month; the outcome model uses the preceding month’s inputs.</p><div class="table-scroll"><table><thead><tr><th>Variable</th><th>Last monthly observation<br>${outlook.origin}</th><th>Model forecast<br>${selected.month}</th><th>Change</th></tr></thead><tbody>${VARIABLES.map(key => { const item = FACTORS[key]; const delta = selected[key] - last[key]; return `<tr><th scope="row">${item.name}</th><td>${last[key].toFixed(item.digits)} ${item.unit}</td><td>${selected[key].toFixed(item.digits)} ${item.unit}</td><td>${delta > 0 ? '+' : ''}${delta.toFixed(item.digits)} ${item.unit}</td></tr>`; }).join('')}</tbody></table></div></section>`;
    container.querySelectorAll('[data-horizon]').forEach(button => button.addEventListener('click', () => {
      horizon = Number(button.dataset.horizon); monthIndexSelected = Math.min(monthIndexSelected, horizon - 1); render();
      container.querySelector(`[data-horizon="${horizon}"]`).focus({ preventScroll: true });
    }));
    container.querySelectorAll('[data-month]').forEach(button => button.addEventListener('click', () => {
      monthIndexSelected = Number(button.dataset.month); render();
      container.querySelector(`[data-month="${monthIndexSelected}"]`).focus({ preventScroll: true });
    }));
  }
  render();
}

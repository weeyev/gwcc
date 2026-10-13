import { getForecast } from './lib/api.js';
import { mountOutlook } from './components/outlook.js';
import { places, outcomes } from './config.js';

let selected = 'chengalpattu', outcome = (new URLSearchParams(location.search).get('outcome') in outcomes ? new URLSearchParams(location.search).get('outcome') : 'heat'), map, marker, request = 0, payload = null;
const regionCache = new Map();
const app = document.querySelector('#app');
function shell() {
  app.innerHTML = `<header><a class="brand" href="/landing.html"><span class="brand-mark">◎</span><span>GeoCast</span><small>ENVIRONMENTAL INTELLIGENCE</small></a><span class="header-status"><i></i> OBSERVATIONS + FORECASTS</span></header>
    <main><section class="hero"><div class="eyebrow">ENVIRONMENTAL CHANGE · TIME-SERIES FORECASTING</div><h1>What could<br><em>change next?</em></h1><p>Follow the outlook for heat, vegetation, and water availability. Explore predicted conditions, the factors used by the model, and how it performed on withheld observations.</p>
    <div class="hero-actions"><label>AREA<select id="region">${Object.entries(places).map(([key,place]) => `<option value="${key}">${place.name}, Tamil Nadu</option>`).join('')}</select></label><label>OUTCOME<select id="outcome">${Object.entries(outcomes).map(([key,item]) => `<option value="${key}" ${key === outcome ? 'selected' : ''}>${item.name}</option>`).join('')}</select></label><a class="forecast-shortcut" href="#forecast">View future outlook ↓</a></div></section>
    <section class="workspace"><div class="map-card"><div class="card-head"><div><small>01 / STUDY AREA</small><h2>Where is change occurring?</h2></div><span id="coordinates"></span></div><div id="map"></div><div class="map-foot">OpenStreetMap basemap · MODIS point pixels and ERA5 grid estimates; spatial resolutions differ.</div></div>
    <div class="question-card"><small>THE SELECTED OUTCOME</small><h2 id="question"></h2><p id="questionDescription"></p><div class="evidence-status" id="evidenceStatus" role="status">Loading observations…</div><div class="next-step"><strong>A provisional outlook</strong><span>About two years of matched monthly records. Model contributions describe predictive relationships; land-use causes and intervention effects remain unverified.</span></div></div></section>
    <section class="outlook-card" id="forecast" aria-label="Future outlook" aria-busy="true"><div class="loading">Loading observations for the forecast…</div></section>
    <section class="observations"><div class="section-head"><div><small>OBSERVATIONS BEHIND THE MODEL</small><h2>What has already changed?</h2></div><span id="updated">Loading data…</span></div><div id="measurements" class="measurements"><div class="loading">Retrieving NASA MODIS observations…</div></div><p class="data-note" id="dataNote"></p></section>
    <footer><div><a href="https://modis.ornl.gov/data/modis_webservice.html" target="_blank" rel="noopener">NASA MODIS ↗</a> · <a href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noopener">ERA5 weather via Open-Meteo ↗</a></div><span>GeoCast · 6-month outlook</span></footer></main>`;
  document.querySelector('#region').onchange = event => { selected = event.target.value; drawMap(); load(); };
  document.querySelector('#outcome').onchange = event => { outcome = event.target.value; renderOutcome(); };
  drawMap(); renderOutcome(); load();
}
function drawMap() {
  const place = places[selected];
  document.querySelector('#coordinates').textContent = `${place.lat.toFixed(4)}° N · ${place.lon.toFixed(4)}° E`;
  if (!window.L) { document.querySelector('#map').textContent = 'Map library unavailable'; return; }
  if (!map) {
    map = L.map('map', { zoomControl: false }).setView([place.lat, place.lon], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
  } else map.setView([place.lat, place.lon], 11);
  if (marker) marker.remove();
  marker = L.circleMarker([place.lat, place.lon], { radius: 10, color: '#fff', weight: 3, fillColor: '#e2693e', fillOpacity: 1 }).addTo(map).bindPopup(`${place.name} · sample point`);
  requestAnimationFrame(() => map.invalidateSize());
}
function trend(rows, color) {
  if (rows.length < 2) return '<div class="no-trend">Not enough valid observations</div>';
  const values = rows.map(row => row.value), low = Math.min(...values), high = Math.max(...values), range = Math.max(high - low, .01);
  const start = Date.parse(rows[0].date), end = Date.parse(rows.at(-1).date);
  const points = rows.map(row => `${14 + (Date.parse(row.date) - start) / Math.max(1, end - start) * 472},${93 - (row.value - low) / range * 73}`).join(' ');
  return `<svg viewBox="0 0 500 112" preserveAspectRatio="none" role="img" aria-label="Trend across ${rows.length} observations"><path d="M14 93H486" stroke="#e4ebe3"/><polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>`;
}
function card(rows, label, source, unit, color) {
  if (!rows.length) return `<article class="measure"><small>${source}</small><h3>${label}</h3><strong>Unavailable</strong></article>`;
  const first = rows[0], last = rows.at(-1), difference = last.value - first.value, digits = unit ? 1 : 3;
  return `<article class="measure"><div class="measure-top"><small>${source}</small><span>${rows.length} observations</span></div><h3>${label}</h3><div class="measure-value">${last.value.toFixed(digits)} <small>${unit}</small></div>${trend(rows, color)}<div class="measure-change"><b class="${difference > 0 ? 'rising' : 'falling'}">${difference >= 0 ? '+' : ''}${difference.toFixed(digits)} ${unit}</b><span>${first.date} → ${last.date}</span></div></article>`;
}
function renderOutcome() {
  const config = outcomes[outcome];
  document.querySelector('#question').textContent = `${config.name}: the coming months`;
  document.querySelector('#questionDescription').textContent = config.description;
  if (!payload) return;
  const { lst, ndvi, weather, outlook } = payload;
  const satelliteCards = [
    ['Land surface temperature', 'MOD11A2 · 1 km', lst, '°C', '#df7046'],
    ['Vegetation greenness', 'MOD13Q1 · 250 m', ndvi, '', '#367b52'],
  ];
  const charts = outcome === 'water' ? [
    ['Water-balance proxy', 'ERA5 rainfall − reference evapotranspiration', weather.slice(-24).map(row => ({ date: row.month, value: row.rainfall - row.evapotranspiration })), 'mm', '#438dae'],
    ['Rainfall', 'ERA5 monthly total', weather.slice(-24).map(row => ({ date: row.month, value: row.rainfall })), 'mm', '#367b87'],
  ] : outcome === 'heat' ? satelliteCards : satelliteCards.toReversed();
  document.querySelector('#measurements').innerHTML = charts.map(([label, source, rows, unit, color]) => card(rows, label, source, unit, color)).join('');
  document.querySelector('#updated').textContent = outcome === 'water' ? `Weather observed through ${weather.at(-1).month}` : `Latest LST: ${lst.at(-1)?.date || 'unavailable'} · NDVI: ${ndvi.at(-1)?.date || 'unavailable'}`;
  document.querySelector('#dataNote').textContent = 'MODIS point pixels and coarse ERA5 weather cells cover different areas. Missing numeric values are filtered; product QA flags are not yet applied. Monthly satellite composites are averaged by start month. Gaps stay missing, and water availability is a climatic proxy.';
  document.querySelector('#dataNote').textContent += ` ${payload.metadata.source === 'sample' ? 'Using the checked-in observed data snapshot.' : 'Using refreshed API observations.'} Python model trained ${payload.metadata.trainedAt.slice(0, 10)}.`;
  mountOutlook(document.querySelector('#forecast'), outlook, config);
  document.querySelector('#forecast').setAttribute('aria-busy', 'false');
  document.querySelector('#evidenceStatus').textContent = outlook.error ? 'Insufficient history for a tested forecast.' : outlook.errors[config.target].rmse < outlook.errors[config.target].baselineRMSE ? 'Provisional model beat persistence in the historical forecast check.' : 'Persistence performed better in the historical forecast check.';
}
async function load() {
  const id = ++request, region = selected;
  payload = null;
  document.querySelector('#measurements').innerHTML = '<div class="loading">Retrieving NASA MODIS observations…</div>';
  const forecast = document.querySelector('#forecast');
  forecast.innerHTML = '<div class="loading">Preparing the forecast from matched monthly history…</div>';
  forecast.setAttribute('aria-busy', 'true');
  document.querySelector('#evidenceStatus').textContent = 'Checking observations';
  document.querySelector('#updated').textContent = 'Loading data…';
  document.querySelector('#dataNote').textContent = '';
  try {
    if (regionCache.has(region)) payload = regionCache.get(region);
    else {
      const data = await getForecast(region);
      regionCache.set(region, data);
      if (id !== request) return;
      payload = data;
    }
    renderOutcome();
  } catch (error) {
    if (id !== request) return;
    forecast.innerHTML = '<div class="forecast-error" role="status"><strong>Forecast data is temporarily unavailable.</strong><p>A trained forecast must be available from the Python API.</p><button type="button" id="retry">Retry forecast request</button></div>';
    forecast.setAttribute('aria-busy', 'false');
    forecast.querySelector('p').textContent = error.message;
    document.querySelector('#retry').onclick = load;
    document.querySelector('#measurements').innerHTML = '<div class="loading">Observations could not be retrieved.</div>';
    document.querySelector('#evidenceStatus').textContent = 'Evidence unavailable';
    document.querySelector('#updated').textContent = 'Connection failed';
  }
}
shell();

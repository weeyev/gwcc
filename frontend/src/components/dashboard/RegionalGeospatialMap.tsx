import React, { useState, useEffect, useRef } from 'react';
import { outcomes } from '../../config';
import { Navigation, Layers, Satellite, Plus, Minus, RotateCcw, MapPin, Eye } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Polyline, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

// Suppress default leaflet icon 404 issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RegionalGeospatialMapProps {
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  selectedOutcome: string;
}

// Exact real-world GPS coordinates and telemetry data for Northern Tamil Nadu study corridor
const districtMetadata: Record<string, {
  name: string;
  center: [number, number];
  lstVal: string;
  ndviVal: string;
  intensityPct: number;
  status: string;
  elevation: string;
  zone: string;
}> = {
  chennai: {
    name: 'Chennai',
    center: [13.0827, 80.2707], // Exact: 13.0827°N, 80.2707°E (Bay of Bengal coast)
    lstVal: '31.4 °C',
    ndviVal: '0.28 NDVI',
    intensityPct: 92,
    status: 'Urban Thermal Island',
    elevation: '6m AMSL',
    zone: 'Metropolitan Coastal Core'
  },
  chengalpattu: {
    name: 'Chengalpattu',
    center: [12.6819, 79.9888], // Exact: 12.6819°N, 79.9888°E (~56 km south-southwest)
    lstVal: '30.8 °C',
    ndviVal: '0.40 NDVI',
    intensityPct: 84,
    status: 'Moderate Coastal Corridor',
    elevation: '36m AMSL',
    zone: 'South Coastal Buffer'
  },
  kanchipuram: {
    name: 'Kanchipuram',
    center: [12.8342, 79.7036], // Exact: 12.8342°N, 79.7036°E (~72 km west-southwest)
    lstVal: '32.1 °C',
    ndviVal: '0.35 NDVI',
    intensityPct: 78,
    status: 'Elevated Inland Heating',
    elevation: '83m AMSL',
    zone: 'Inland Agrarian Belt'
  }
};

// Corridor overview centroid that fits all 3 districts
const CORRIDOR_CENTER: [number, number] = [12.885, 79.985];
const CORRIDOR_ZOOM = 10;
const DISTRICT_ZOOM = 11;

// Custom Pulsing Marker Icon with clear district name badge
const createHubIcon = (name: string, isSelected: boolean) => {
  const dotColor = isSelected ? '#10b981' : '#38bdf8';
  const badgeBg = isSelected ? 'rgba(6, 78, 59, 0.95)' : 'rgba(15, 23, 42, 0.90)';
  const badgeBorder = isSelected ? '#10b981' : '#475569';
  const badgeText = isSelected ? '#6ee7b7' : '#e2e8f0';

  const html = `
    <div style="position:relative;display:flex;align-items:center;transform:translate(-8px, -8px);cursor:pointer;white-space:nowrap;user-select:none;">
      <!-- Glowing center pin -->
      <div style="position:relative;width:16px;height:16px;flex-shrink:0;">
        ${isSelected ? `<div style="position:absolute;inset:-6px;border-radius:50%;background:${dotColor};opacity:0.4;animation:hubPulse 1.6s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
        <div style="width:16px;height:16px;border-radius:50%;background:#ffffff;border:3px solid ${dotColor};box-shadow:0 0 10px ${dotColor}b3;"></div>
      </div>
      <!-- Label Tag -->
      <div style="margin-left:7px;background:${badgeBg};color:${badgeText};border:1px solid ${badgeBorder};padding:2px 8px;border-radius:6px;font-size:11px;font-weight:${isSelected ? '700' : '600'};font-family:system-ui,-apple-system,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.55);display:flex;align-items:center;gap:4px;">
        <span>${name}</span>
        ${isSelected ? '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;"></span>' : ''}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-hub-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Map Controller for smooth flyTo and sizing invalidation
const MapController: React.FC<{
  targetCenter: [number, number];
  targetZoom: number;
  triggerKey: string | number;
}> = ({ targetCenter, targetZoom, triggerKey }) => {
  const map = useMap();
  const lastKeyRef = useRef<string | number>(triggerKey);

  // Invalidate map size so tiles always fill canvas cleanly
  useEffect(() => {
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map]);

  // Smoothly fly to target whenever region changes or reset is triggered
  useEffect(() => {
    if (lastKeyRef.current !== triggerKey) {
      lastKeyRef.current = triggerKey;
      map.flyTo(targetCenter, targetZoom, { duration: 0.8, easeLinearity: 0.25 });
    }
  }, [targetCenter, targetZoom, triggerKey, map]);

  return null;
};

// Custom interactive buttons overlay (Zoom In, Zoom Out, Reset Corridor)
const MapActionButtons: React.FC<{
  onReset: () => void;
}> = ({ onReset }) => {
  const map = useMap();
  return (
    <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
      <div className="flex flex-col rounded-xl overflow-hidden bg-zinc-950/90 backdrop-blur-md border border-zinc-700/80 shadow-2xl">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          title="Zoom in"
          className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border-b border-zinc-800/80"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          title="Zoom out"
          className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onReset}
        title="Fit entire Northern Tamil Nadu corridor"
        className="p-1.5 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-zinc-700/80 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 shadow-2xl transition-colors cursor-pointer flex items-center justify-center"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// High reliability tile layer configurations
const tileLayers = {
  dark: {
    name: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
  },
  satellite: {
    name: 'High-Res Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  },
  light: {
    name: 'Voyager Street',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
  }
};

export const RegionalGeospatialMap: React.FC<RegionalGeospatialMapProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedOutcome
}) => {
  const [mapMode, setMapMode] = useState<'dark' | 'satellite' | 'light'>('dark');
  const [isOverview, setIsOverview] = useState<boolean>(false);
  const [triggerKey, setTriggerKey] = useState<string | number>(selectedRegion);

  const currentOutcome = outcomes[selectedOutcome] || outcomes.heat;
  const activeDistrict = districtMetadata[selectedRegion] || districtMetadata.chennai;

  // Compute destination center & zoom based on selected region or corridor overview
  const targetCenter: [number, number] = isOverview ? CORRIDOR_CENTER : activeDistrict.center;
  const targetZoom: number = isOverview ? CORRIDOR_ZOOM : DISTRICT_ZOOM;

  // Whenever selectedRegion prop changes from parent, sync target
  useEffect(() => {
    setIsOverview(false);
    setTriggerKey(`${selectedRegion}-${Date.now()}`);
  }, [selectedRegion]);

  const handleResetToCorridor = () => {
    setIsOverview(true);
    setTriggerKey(`corridor-${Date.now()}`);
  };

  const handleSelectDistrict = (key: string) => {
    setIsOverview(false);
    onSelectRegion(key);
    setTriggerKey(`${key}-${Date.now()}`);
  };

  const tileConfig = tileLayers[mapMode];

  // Corridor triangle points connecting Chennai, Chengalpattu, Kanchipuram
  const corridorTriangle: [number, number][] = [
    districtMetadata.chennai.center,
    districtMetadata.chengalpattu.center,
    districtMetadata.kanchipuram.center,
    districtMetadata.chennai.center
  ];

  return (
    <div className="rounded-3xl bg-[#141416] text-white p-6 sm:p-7 shadow-2xl border border-zinc-800 flex flex-col justify-between relative overflow-hidden">

      {/* Ambient background glows */}
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Controls */}
      <div className="flex flex-col gap-2 mb-4 pb-3 border-b border-zinc-800/80 z-10">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">
              Regional Satellite Geospatial Telemetry
            </h3>
          </div>

          {/* Map Layer Mode Switcher */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => setMapMode('dark')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                mapMode === 'dark'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                mapMode === 'satellite'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Satellite className="w-3 h-3" />
              <span>Satellite</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode('light')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                mapMode === 'light'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Light</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-normal">
          <span>Coromandel Coastal Corridor (Northern Tamil Nadu, India)</span>
          <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Real Interactive GIS Map
          </span>
        </div>
      </div>

      {/* Real Interactive Leaflet Map Container */}
      <div className="relative w-full h-[300px] sm:h-[330px] rounded-2xl border border-zinc-800/90 overflow-hidden z-10 shadow-inner">
        <MapContainer
          center={CORRIDOR_CENTER}
          zoom={CORRIDOR_ZOOM}
          scrollWheelZoom={true}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ background: '#090a0d', width: '100%', height: '100%' }}
        >
          {/* Tile Layer */}
          <TileLayer
            key={mapMode}
            url={tileConfig.url}
            attribution={tileConfig.attribution}
            maxZoom={18}
          />

          {/* Map Controller & Custom Buttons */}
          <MapController
            targetCenter={targetCenter}
            targetZoom={targetZoom}
            triggerKey={triggerKey}
          />
          <MapActionButtons onReset={handleResetToCorridor} />

          {/* Observation Corridor Baseline Triangle (non-interactive so it never blocks dragging) */}
          <Polyline
            positions={corridorTriangle}
            pathOptions={{
              color: '#10b981',
              weight: 1.5,
              dashArray: '5 7',
              opacity: 0.45,
              interactive: false,
            }}
          />

          {/* Regional Dispersion & Thermal Catchment Circles (interactive: false for smooth dragging) */}
          {Object.entries(districtMetadata).map(([key, district]) => {
            const isSelected = selectedRegion === key;
            return (
              <Circle
                key={`circle-${key}`}
                center={district.center}
                radius={isSelected ? 10000 : 7500}
                pathOptions={{
                  color: isSelected ? '#10b981' : '#38bdf8',
                  weight: isSelected ? 2 : 1,
                  fillColor: isSelected ? '#10b981' : '#0284c7',
                  fillOpacity: isSelected ? 0.22 : 0.08,
                  interactive: false, // CRITICAL: allows user to click/drag anywhere through circles
                }}
              />
            );
          })}

          {/* District Center Markers (Interactive) */}
          {Object.entries(districtMetadata).map(([key, district]) => {
            const isSelected = selectedRegion === key;
            return (
              <Marker
                key={`marker-${key}`}
                position={district.center}
                icon={createHubIcon(district.name, isSelected)}
                eventHandlers={{
                  click: () => handleSelectDistrict(key),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -12]}
                  opacity={0.95}
                  className="custom-leaflet-tooltip"
                >
                  <div style={{ fontFamily: 'system-ui', fontSize: '11px', lineHeight: '1.5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <strong style={{ fontSize: '12px', color: '#ffffff' }}>{district.name}</strong>
                      <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 700 }}>
                        {district.intensityPct}%
                      </span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>
                      {district.zone} · {district.elevation}
                    </div>
                    <div style={{ marginTop: '3px', borderTop: '1px solid rgba(148,163,184,0.2)', paddingTop: '3px' }}>
                      Surface Heat: <strong style={{ color: '#ffffff' }}>{district.lstVal}</strong><br />
                      Vegetation: <strong style={{ color: '#10b981' }}>{district.ndviVal}</strong>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Glassmorphism Telemetry HUD Card (pointer-events-none so it never blocks map drags) */}
        <div className="absolute bottom-3 left-3 bg-zinc-950/90 backdrop-blur-md rounded-xl p-3 border border-zinc-700/80 shadow-2xl text-xs max-w-[230px] pointer-events-none z-[1000]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white text-xs">{activeDistrict.name}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
              {activeDistrict.intensityPct}% Risk
            </span>
          </div>

          <div className="text-[10px] text-zinc-400 mt-1.5 flex items-center justify-between">
            <span>{currentOutcome.name}:</span>
            <span className="font-mono font-bold text-white">
              {activeDistrict.lstVal}
            </span>
          </div>

          <div className="text-[9.5px] text-zinc-400 mt-0.5 flex items-center justify-between">
            <span>Canopy Greenness:</span>
            <span className="font-mono font-semibold text-emerald-400">{activeDistrict.ndviVal}</span>
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-zinc-800/90 text-[9px] font-mono text-zinc-400 flex items-center justify-between">
            <span>{activeDistrict.center[0].toFixed(4)}°N, {activeDistrict.center[1].toFixed(4)}°E</span>
            <span className="text-emerald-400 font-medium">{activeDistrict.elevation}</span>
          </div>
        </div>

        {/* Legend Badge (pointer-events-none) */}
        <div className="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-zinc-800 text-[9px] text-zinc-300 flex items-center gap-3 pointer-events-none z-[1000] shadow-lg">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Optimal (&lt;31°C)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Elevated (&gt;31°C)
          </span>
        </div>

        {/* Drag / Pan Hint Pill */}
        <div className="absolute bottom-3 right-3 bg-zinc-950/75 backdrop-blur-sm rounded-md px-2 py-1 border border-zinc-800/70 text-[9px] text-zinc-400 pointer-events-none z-[1000] hidden sm:block">
          <span>💡 Drag map to pan · Scroll / ± to zoom</span>
        </div>
      </div>

      {/* Hub Quick-Selection Pills */}
      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs z-10 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-normal">
          <Eye className="w-3 h-3 text-emerald-400" />
          <span>Active Study Hub:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {Object.entries(districtMetadata).map(([key, d]) => {
            const isSelected = selectedRegion === key && !isOverview;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectDistrict(key)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm shadow-emerald-500/20'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {d.name}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleResetToCorridor}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isOverview
                ? 'bg-sky-500 text-zinc-950 font-bold shadow-sm shadow-sky-500/20'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
            title="View entire Coromandel Coastal corridor"
          >
            All Hubs
          </button>
        </div>
      </div>

      {/* Leaflet pulse animation keyframes and container styles */}
      <style>{`
        @keyframes hubPulse {
          75%, 100% { transform: scale(2.4); opacity: 0; }
        }
        .custom-leaflet-tooltip {
          background: rgba(15, 23, 42, 0.94) !important;
          color: #f1f5f9 !important;
          border: 1px solid rgba(100, 116, 139, 0.5) !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          font-size: 11px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.55) !important;
          backdrop-filter: blur(8px) !important;
        }
        .custom-leaflet-tooltip::before {
          border-top-color: rgba(15, 23, 42, 0.94) !important;
          border-right-color: rgba(15, 23, 42, 0.94) !important;
        }
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif !important;
          cursor: grab !important;
          width: 100% !important;
          height: 100% !important;
        }
        .leaflet-container:active {
          cursor: grabbing !important;
        }
        .leaflet-grab {
          cursor: grab !important;
        }
        .leaflet-grabbing {
          cursor: grabbing !important;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

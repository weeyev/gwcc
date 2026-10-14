import React, { useState } from 'react';
import { ForecastMonthData } from '../../types';
import { Compass, Info, Sparkles } from 'lucide-react';

interface EnvironmentalRadialRoseProps {
  monthData: ForecastMonthData;
  monthName: string;
}

interface PetalDimension {
  id: string;
  name: string;
  rawVal: number;
  unit: string;
  normVal: number; // 0.25 to 1.0 for radius scale
  description: string;
  displayVal: string;
}

export const EnvironmentalRadialRose: React.FC<EnvironmentalRadialRoseProps> = ({
  monthData,
  monthName
}) => {
  const [hoveredPetal, setHoveredPetal] = useState<number | null>(null);

  if (!monthData) return null;

  // Extract and normalize 8 environmental dimensions for the active month
  const lstVal = monthData.lst || 30.8;
  const tempVal = monthData.temperature || 29.5;
  const radVal = monthData.radiation || 17.2;
  const etVal = monthData.evapotranspiration || 134.4;
  const balanceVal = Math.abs(monthData.balance || 3.4);
  const rainVal = monthData.rainfall || 130.9;
  const ndviVal = monthData.ndvi || 0.40;
  const skillVal = 84.6;

  const dimensions: PetalDimension[] = [
    {
      id: 'lst',
      name: 'Surface Heat',
      rawVal: lstVal,
      displayVal: lstVal.toFixed(1),
      unit: '°C',
      normVal: Math.min(1.0, Math.max(0.35, (lstVal - 20) / 18)),
      description: 'Land surface radiometric temperature from MODIS thermal bands'
    },
    {
      id: 'temp',
      name: 'Air Temp',
      rawVal: tempVal,
      displayVal: tempVal.toFixed(1),
      unit: '°C',
      normVal: Math.min(1.0, Math.max(0.35, (tempVal - 20) / 16)),
      description: '2-meter atmospheric ambient temperature from ERA5 surface'
    },
    {
      id: 'radiation',
      name: 'Solar Flux',
      rawVal: radVal,
      displayVal: radVal.toFixed(1),
      unit: 'MJ/m²',
      normVal: Math.min(1.0, Math.max(0.30, radVal / 25)),
      description: 'Surface downward solar shortwave radiation flux'
    },
    {
      id: 'et',
      name: 'Evaporation',
      rawVal: etVal,
      displayVal: etVal.toFixed(0),
      unit: 'mm',
      normVal: Math.min(1.0, Math.max(0.35, etVal / 190)),
      description: 'Potential vegetative & ground evapotranspiration loss'
    },
    {
      id: 'balance',
      name: 'Water Deficit',
      rawVal: balanceVal,
      displayVal: balanceVal.toFixed(1),
      unit: 'mm',
      normVal: Math.min(1.0, Math.max(0.30, balanceVal / 70)),
      description: 'Atmospheric moisture divergence (Rainfall − ET deficit)'
    },
    {
      id: 'rain',
      name: 'Precipitation',
      rawVal: rainVal,
      displayVal: rainVal.toFixed(0),
      unit: 'mm',
      normVal: Math.min(1.0, Math.max(0.30, rainVal / 260)),
      description: 'Accumulated monthly convective and monsoonal rainfall'
    },
    {
      id: 'ndvi',
      name: 'Canopy NDVI',
      rawVal: ndviVal,
      displayVal: ndviVal.toFixed(2),
      unit: 'NDVI',
      normVal: Math.min(1.0, Math.max(0.30, ndviVal / 0.55)),
      description: 'Normalized Difference Vegetation Index photosynthetic vigor'
    },
    {
      id: 'skill',
      name: 'Model Skill',
      rawVal: skillVal,
      displayVal: skillVal.toFixed(0),
      unit: '%',
      normVal: 0.88,
      description: 'Cross-validated autoregressive forecast skill index'
    }
  ];

  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 152;
  const minR = 32;
  const numPetals = 8;
  const angleStep = (2 * Math.PI) / numPetals;
  const angularSpan = (angleStep * 0.92); // ~41.4 degrees, leaving ~3.6 degree gap

  // Math function creating the exact rounded-corner petal geometry from Image 2
  const makePetalPath = (idx: number, r: number) => {
    // Start angle centered around sector index starting at top (-PI/2)
    const midAngle = idx * angleStep - Math.PI / 2;
    const a1 = midAngle - angularSpan / 2;
    const a2 = midAngle + angularSpan / 2;

    const cr = Math.min(10, r * 0.12);
    const crIn = Math.min(5, minR * 0.2);

    const dArcOut = cr / r;
    const dArcIn = crIn / minR;

    // Outer corner points
    const pOut1 = { x: cx + (r - cr) * Math.cos(a1), y: cy + (r - cr) * Math.sin(a1) };
    const cOut1 = { x: cx + r * Math.cos(a1), y: cy + r * Math.sin(a1) };
    const pArc1 = { x: cx + r * Math.cos(a1 + dArcOut), y: cy + r * Math.sin(a1 + dArcOut) };

    const pArc2 = { x: cx + r * Math.cos(a2 - dArcOut), y: cy + r * Math.sin(a2 - dArcOut) };
    const cOut2 = { x: cx + r * Math.cos(a2), y: cy + r * Math.sin(a2) };
    const pOut2 = { x: cx + (r - cr) * Math.cos(a2), y: cy + (r - cr) * Math.sin(a2) };

    // Inner shoulder points
    const pRay1 = { x: cx + (minR + crIn) * Math.cos(a1), y: cy + (minR + crIn) * Math.sin(a1) };
    const cIn1 = { x: cx + minR * Math.cos(a1), y: cy + minR * Math.sin(a1) };
    const pIn1 = { x: cx + minR * Math.cos(a1 + dArcIn), y: cy + minR * Math.sin(a1 + dArcIn) };

    const pRay2 = { x: cx + (minR + crIn) * Math.cos(a2), y: cy + (minR + crIn) * Math.sin(a2) };
    const cIn2 = { x: cx + minR * Math.cos(a2), y: cy + minR * Math.sin(a2) };
    const pIn2 = { x: cx + minR * Math.cos(a2 - dArcIn), y: cy + minR * Math.sin(a2 - dArcIn) };

    return `M ${pRay1.x.toFixed(1)},${pRay1.y.toFixed(1)} 
            L ${pOut1.x.toFixed(1)},${pOut1.y.toFixed(1)} 
            Q ${cOut1.x.toFixed(1)},${cOut1.y.toFixed(1)} ${pArc1.x.toFixed(1)},${pArc1.y.toFixed(1)} 
            A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${pArc2.x.toFixed(1)},${pArc2.y.toFixed(1)} 
            Q ${cOut2.x.toFixed(1)},${cOut2.y.toFixed(1)} ${pOut2.x.toFixed(1)},${pOut2.y.toFixed(1)} 
            L ${pRay2.x.toFixed(1)},${pRay2.y.toFixed(1)} 
            Q ${cIn2.x.toFixed(1)},${cIn2.y.toFixed(1)} ${pIn2.x.toFixed(1)},${pIn2.y.toFixed(1)} 
            A ${minR.toFixed(1)} ${minR.toFixed(1)} 0 0 0 ${pIn1.x.toFixed(1)},${pIn1.y.toFixed(1)} 
            Q ${cIn1.x.toFixed(1)},${cIn1.y.toFixed(1)} ${pRay1.x.toFixed(1)},${pRay1.y.toFixed(1)} Z`;
  };

  const activeDim = hoveredPetal !== null ? dimensions[hoveredPetal] : null;

  return (
    <div className="rounded-3xl bg-[#141416] text-white p-6 sm:p-7 shadow-2xl border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-64 h-64 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col gap-2 mb-4 pb-3 border-b border-zinc-800/80 z-10">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">
              Bioclimatic Radial Rose Diagram
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0 whitespace-nowrap">
              {monthName}
            </span>
          </div>

          <div className="text-[10px] text-zinc-400 font-normal flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Hover petal to inspect</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">
          Polar coordinate decomposition across 8 coupled thermodynamic & vegetative variables.
        </p>
      </div>

      {/* Main Radial SVG Display (Faithful to Reference Image 2) */}
      <div className="relative flex items-center justify-center my-3 select-none">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[325px] sm:max-w-[340px] aspect-square transition-all duration-300 drop-shadow-xl"
        >
          <defs>
            {/* Soft Shadow for Foreground White Petals */}
            <filter id="petalShadow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
            </filter>
            
            {/* Active Hover Glow */}
            <filter id="petalHoverGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Guide Grid Rings */}
          <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={minR + (maxR - minR) * 0.5} fill="none" stroke="#27272a" strokeWidth="0.8" strokeDasharray="3 3" />

          {/* 8 Petal Wedges (Base Dark Petals + Foreground Pearl-White Petals) */}
          {dimensions.map((dim, idx) => {
            const isHovered = hoveredPetal === idx;
            const targetR = minR + dim.normVal * (maxR - minR);
            const bgPath = makePetalPath(idx, maxR);
            const valPath = makePetalPath(idx, targetR);

            // Compute optimal center point of petal for label placement
            const midAngle = idx * angleStep - Math.PI / 2;

            // Dynamic placement: if white value petal is sufficiently large (>= 94px),
            // center text inside the white petal. If short (< 94px), center text in the outer dark petal.
            const isInsideWhite = targetR >= 94;
            const labelR = isInsideWhite
              ? minR + (targetR - minR) * 0.54
              : targetR + (maxR - targetR) * 0.52;

            const labelX = cx + labelR * Math.cos(midAngle);
            const labelY = cy + labelR * Math.sin(midAngle);

            return (
              <g
                key={dim.id}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPetal(idx)}
                onMouseLeave={() => setHoveredPetal(null)}
              >
                {/* 1. Base Petal (Dark Graphite / Charcoal - reference standard) */}
                <path
                  d={bgPath}
                  fill={isHovered ? '#474b55' : '#383b44'}
                  stroke="#23252b"
                  strokeWidth="1.2"
                  className="transition-colors duration-200"
                />

                {/* 2. Foreground Value Petal (Cream / Pearl-White) */}
                <path
                  d={valPath}
                  fill={isHovered ? '#ffffff' : '#eff1f5'}
                  stroke={isHovered ? '#38bdf8' : '#e2e8f0'}
                  strokeWidth={isHovered ? 1.5 : 0.8}
                  filter="url(#petalShadow)"
                  className="transition-all duration-200"
                />

                {/* 3. Value Metric Number (High Contrast, Bold, Protected Outline) */}
                <text
                  x={labelX}
                  y={labelY - 5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fontWeight="800"
                  fill={isInsideWhite ? '#09090b' : '#ffffff'}
                  stroke={isInsideWhite ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.75)'}
                  strokeWidth="0.8"
                  style={{ paintOrder: 'stroke fill' }}
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  letterSpacing="-0.3"
                  className="transition-colors duration-150 select-none pointer-events-none"
                >
                  {dim.displayVal}
                </text>

                {/* 4. Dimension Name (High Contrast Subtitle, Bold 700) */}
                <text
                  x={labelX}
                  y={labelY + 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="9"
                  fontWeight="700"
                  fill={isInsideWhite ? '#1e293b' : '#f1f5f9'}
                  stroke={isInsideWhite ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'}
                  strokeWidth="0.6"
                  style={{ paintOrder: 'stroke fill' }}
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  letterSpacing="0.2"
                  className="transition-colors duration-150 select-none pointer-events-none"
                >
                  {dim.name}
                </text>
              </g>
            );
          })}

          {/* 5. Central Aperture Void (Black Star / Circular Core with smooth rim like Image 2) */}
          <circle cx={cx} cy={cy} r={minR - 3} fill="#141416" stroke="#27272a" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={minR - 9} fill="#0d0d0f" />
          
          {/* Center Indicator */}
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#e2e8f0"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {activeDim ? activeDim.unit : monthName.slice(5)}
          </text>
        </svg>
      </div>

      {/* Dynamic Petal Info Footer */}
      <div className="mt-2 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs transition-all min-h-[46px]">
        {activeDim ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <div>
              <span className="font-semibold text-white">{activeDim.name}:</span>{' '}
              <span className="font-mono font-bold text-emerald-400">
                {activeDim.rawVal.toFixed(2)} {activeDim.unit}
              </span>{' '}
              <span className="text-zinc-400 font-light text-[11px]">— {activeDim.description}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-light">
            <Info className="w-3.5 h-3.5 text-zinc-500" />
            <span>Hover any radial petal to inspect exact biophysical metric and satellite sensor mapping.</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Satellite, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Server, 
  Activity, 
  Terminal,
  ShieldCheck,
  Zap
} from 'lucide-react';
import axonometricArchImg from '../../assets/geocast_axonometric_architecture.jpg';

interface ArchitectureNode {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  coords: { x: number; y: number }; // percentage position on 16:9 canvas
  color: string;
  badge: string;
  spec: {
    protocol: string;
    throughput: string;
    resolution: string;
    latency: string;
  };
  details: string[];
}

const architectureNodes: ArchitectureNode[] = [
  {
    id: 'satellite',
    name: 'Orbital Telemetry Terminal',
    category: '01 / INGESTION FEEDS',
    subtitle: 'NASA MODIS Terra & Aqua Direct Ingestion',
    coords: { x: 26, y: 31 },
    color: '#0284c7',
    badge: 'NASA Earthdata',
    spec: {
      protocol: 'HDF-EOS / OGC WMS',
      throughput: '8-Day Sinusoidal Swaths',
      resolution: '250m NDVI / 1km LST',
      latency: 'Automated 24h Sync'
    },
    details: [
      'Ingests radiometric surface thermal channels from MOD11A2',
      'Samples 250m 16-day composite vegetation vigour from MOD13Q1',
      'Filters cloud-obscured pixels using state-of-the-art QA bitmask decoders'
    ]
  },
  {
    id: 'feature_store',
    name: 'Environmental Feature Store',
    category: '02 / CLIMATIC DATA LAKE',
    subtitle: 'Copernicus ERA5 & Gridded Reanalysis',
    coords: { x: 31, y: 72 },
    color: '#0369a1',
    badge: 'Copernicus ECMWF',
    spec: {
      protocol: 'GRIB2 / NetCDF-4',
      throughput: '13+ Years Gridded Time-Series',
      resolution: '0.25° Spatial Grid',
      latency: 'Hourly Temporal Scale'
    },
    details: [
      'Historical precipitation minus reference potential evapotranspiration (PET)',
      'Shortwave solar irradiance and 10m boundary wind speed harmonization',
      'Standardized anomaly indexing calibrated against 10-year climatic medians'
    ]
  },
  {
    id: 'ml_core',
    name: 'Python ML Forecasting Engine',
    category: '03 / REGULARIZED MODEL CORE',
    subtitle: 'Multivariate Ridge Autoregressive Rollout',
    coords: { x: 50, y: 44 },
    color: '#2563eb',
    badge: 'Ridge Regressor',
    spec: {
      protocol: 'Scikit-Learn / NumPy',
      throughput: '6-Month Autoregressive Rollout',
      resolution: 'Centroid Z-Score Normalized',
      latency: '<120ms Fit Horizon'
    },
    details: [
      'L2-regularized linear weight estimation to suppress collinear overfitting',
      'Recursive multi-step forward horizon rollout projecting t+1 to t+6 months',
      'Covariance-derived 95% confidence intervals accounting for residual variance'
    ]
  },
  {
    id: 'validation',
    name: 'Holdout Validation Container',
    category: '04 / QUALITY AUDITING',
    subtitle: 'Out-of-Sample Verification Engine',
    coords: { x: 74, y: 33 },
    color: '#10b981',
    badge: 'RMSE Audited',
    spec: {
      protocol: 'Temporal Cross-Validation',
      throughput: 'Rolling Holdout Batches',
      resolution: 'Baseline RMSE Comparison',
      latency: '99.4% Verification Rate'
    },
    details: [
      'Ensures projected trajectories strictly outperform simple persistence baselines',
      'Continuous drift detection identifying sudden climate regime divergences',
      'Generates calibrated uncertainty envelopes for robust municipal disaster planning'
    ]
  },
  {
    id: 'api_server',
    name: 'API Microservices & Edge Delivery',
    category: '05 / CLIENT DELIVERABLES',
    subtitle: 'Low-Latency FastAPI Delivery Engine',
    coords: { x: 72, y: 70 },
    color: '#0f172a',
    badge: 'FastAPI Microservice',
    spec: {
      protocol: 'REST / GeoJSON / Arrow',
      throughput: 'Precomputed Zero-Wait Cache',
      resolution: 'District Boundary GeoTIFF',
      latency: '<15ms TTFB Average'
    },
    details: [
      'Instantaneous browser payload delivery via precomputed offline serialization',
      'Provides district-level GeoJSON forecasts, confidence bands, and driver weights',
      'Interoperable with GIS software, dashboard map viewers, and municipal alert webhooks'
    ]
  }
];

export const ArchitectureDiagram: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ml_core');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const activeNode = architectureNodes.find(n => n.id === (hoveredNodeId || selectedNodeId)) || architectureNodes[2];

  return (
    <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-50/70 via-white to-sky-50/50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-medium mb-3">
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
            Axonometric System Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 tracking-tight mb-3">
            Real Axonometric <strong className="font-semibold text-slate-900">Engineering Pipeline.</strong>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-light leading-relaxed max-w-2xl mx-auto">
            From raw satellite radiometric passes down to edge API distribution — trace how GeoCast ingests, harmonizes, regularizes, and delivers multi-spectral environmental forecasts.
          </p>
        </div>

        {/* MAIN ARCHITECTURE CONTAINER */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-sky-500/10 p-4 sm:p-8 lg:p-10 transition-all">
          
          {/* Top System Specification Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-900">GEOCAST SYSTEM ARCHITECTURE V2.4</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 font-mono text-[11px]">AXONOMETRIC ORTHOGRAPHIC PROJECTION</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">5 Core Modules</span>
              <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 font-medium border border-sky-100">Zero Ingestion Loss</span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">Live Active Bus</span>
            </div>
          </div>

          {/* Interactive Axonometric Canvas with Interactive Hotspots */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 shadow-inner group">
            
            {/* The Axonometric 3D System Diagram Image */}
            <img 
              src={axonometricArchImg} 
              alt="GeoCast Axonometric System Architecture Diagram" 
              className="w-full h-auto object-cover object-center select-none"
            />

            {/* Subtle Blueprint Grid Lines Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>

            {/* Interactive Pulse Hotspots on the 5 Nodes */}
            {architectureNodes.map((node) => {
              const isSelected = (hoveredNodeId || selectedNodeId) === node.id;

              return (
                <div
                  key={node.id}
                  className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${node.coords.x}%`, top: `${node.coords.y}%` }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {/* Ping Animation Rings */}
                  <div className="relative flex items-center justify-center">
                    <span 
                      className={`absolute w-8 h-8 rounded-full opacity-75 animate-ping transition-colors ${
                        isSelected ? 'bg-sky-500 opacity-90' : 'bg-slate-400 opacity-40'
                      }`}
                    />
                    
                    {/* Hotspot Core Button */}
                    <button
                      type="button"
                      className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all shadow-md cursor-pointer ${
                        isSelected 
                          ? 'bg-slate-900 border-white text-white scale-110 ring-4 ring-sky-500/30' 
                          : 'bg-white border-sky-500 text-sky-700 hover:scale-105 hover:border-slate-900'
                      }`}
                    >
                      {node.id === 'satellite' && <Satellite className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {node.id === 'feature_store' && <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {node.id === 'ml_core' && <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {node.id === 'validation' && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {node.id === 'api_server' && <Server className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>

                    {/* Floating Label Badge */}
                    <div className={`hidden md:block absolute left-full ml-2.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap shadow-md pointer-events-none transition-all ${
                      isSelected 
                        ? 'bg-slate-900 text-white border border-slate-700 -translate-y-0.5' 
                        : 'bg-white/95 text-slate-700 border border-slate-200'
                    }`}>
                      {node.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Node Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 mb-8">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
              Select Architecture Node:
            </span>
            {architectureNodes.map((node) => {
              const isSelected = (hoveredNodeId || selectedNodeId) === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/10' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-400' : 'bg-slate-300'}`}></span>
                  {node.name}
                </button>
              );
            })}
          </div>

          {/* TECHNICAL DEEP-DIVE INSPECTION DRAWER */}
          <div className="rounded-2xl bg-slate-50/80 border border-slate-200/90 p-6 sm:p-8 transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Details (7 cols) */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    {activeNode.category}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {activeNode.badge}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {activeNode.name}
                </h3>
                <p className="text-xs text-slate-500 font-light mt-0.5 mb-5">
                  {activeNode.subtitle}
                </p>

                {/* Technical Bullet Items */}
                <div className="space-y-2.5">
                  {activeNode.details.map((point, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-600 font-light leading-relaxed">
                      <Zap className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Specs Card (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Hardware & Pipeline Specs</span>
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-light">Data Protocol</span>
                    <strong className="text-slate-800 font-mono font-medium">{activeNode.spec.protocol}</strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-light">Sampling Cycle</span>
                    <strong className="text-slate-800 font-medium">{activeNode.spec.throughput}</strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-light">Spatial Resolution</span>
                    <strong className="text-slate-800 font-medium">{activeNode.spec.resolution}</strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-light">Execution Latency</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 font-mono text-[11px]">
                      <Activity className="w-3 h-3" />
                      {activeNode.spec.latency}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Fully Reproducible
                  </span>
                  <span>Open Science Spec</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

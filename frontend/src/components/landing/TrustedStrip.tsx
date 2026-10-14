import React from 'react';
import { Globe2, CloudRain, Layers, Database, Cpu } from 'lucide-react';

export const TrustedStrip: React.FC = () => {
  return (
    <section className="w-full py-8 bg-white border-b border-slate-100 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-6">
          Harmonized With Global Environmental Data Repositories
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-500 text-xs font-normal">
          <span className="flex items-center gap-1.5"><Globe2 className="w-4 h-4 text-sky-600" /> NASA Earthdata (MODIS)</span>
          <span className="flex items-center gap-1.5"><CloudRain className="w-4 h-4 text-sky-600" /> Copernicus ECMWF (ERA5)</span>
          <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-sky-600" /> Open-Meteo Climate API</span>
          <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-sky-600" /> USGS Landsat-9</span>
          <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-sky-600" /> Google Earth Engine</span>
        </div>
      </div>
    </section>
  );
};

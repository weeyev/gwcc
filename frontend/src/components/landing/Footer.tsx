import React from 'react';

interface FooterProps {
  onOpenDashboard: (outcome?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDashboard }) => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-12 px-6 sm:px-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div className="md:col-span-1">
          {/* Logo is text only */}
          <div className="text-lg font-semibold text-white tracking-tight mb-2">
            GeoCast<span className="text-sky-500">.</span>
          </div>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            Planetary environmental intelligence platform combining multi-spectral satellite observations with transparent time-series forecasting.
          </p>
        </div>

        <div>
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Platform</h5>
          <ul className="space-y-2 text-slate-400 font-light">
            <li><button type="button" onClick={() => onOpenDashboard()} className="hover:text-white transition-colors cursor-pointer">Interactive Dashboard</button></li>
            <li><button type="button" onClick={() => onOpenDashboard('heat')} className="hover:text-white transition-colors cursor-pointer">Surface Heat (LST)</button></li>
            <li><button type="button" onClick={() => onOpenDashboard('vegetation')} className="hover:text-white transition-colors cursor-pointer">Vegetation Canopy (NDVI)</button></li>
            <li><button type="button" onClick={() => onOpenDashboard('water')} className="hover:text-white transition-colors cursor-pointer">Climatic Water Balance</button></li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Data Citations</h5>
          <ul className="space-y-2 text-slate-400 font-light">
            <li><a href="https://modis.ornl.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">NASA MODIS Web Service ↗</a></li>
            <li><a href="https://www.ecmwf.int/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">ECMWF ERA5 Atmospheric Reanalysis ↗</a></li>
            <li><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Open-Meteo Weather API ↗</a></li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Methodology</h5>
          <ul className="space-y-2 text-slate-400 font-light">
            <li><a href="#architecture" className="hover:text-white transition-colors">Scientific Architecture</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Feature Definitions</a></li>
            <li><a href="#usecases" className="hover:text-white transition-colors">Operational Case Studies</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 font-light">
        <span>© 2026 GeoCast Research Initiative. Open science and reproducible environmental intelligence.</span>
        <button 
          type="button" 
          onClick={() => onOpenDashboard()}
          className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
        >
          Launch Live Demo ↗
        </button>
      </div>
    </footer>
  );
};

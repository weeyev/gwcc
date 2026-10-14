import React from 'react';

export interface NavbarProps {
  currentView: 'landing' | 'dashboard';
  onNavigate: (view: 'landing' | 'dashboard', hash?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="w-full h-14 bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-50 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between">
        {/* Brand Text Logo - strictly text only, no icon */}
        <button 
          type="button"
          onClick={() => onNavigate('landing')}
          className="text-left font-semibold text-xl tracking-tight text-slate-900 hover:text-sky-700 transition-colors cursor-pointer"
        >
          GeoCast<span className="text-sky-600">.</span>
        </button>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-8">
        <button
          type="button"
          onClick={() => onNavigate('landing', '#overview')}
          className={`text-xs font-normal transition-colors cursor-pointer ${currentView === 'landing' ? 'text-sky-700' : 'text-slate-600 hover:text-sky-600'}`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => onNavigate('landing', '#features')}
          className="text-xs font-normal text-slate-600 hover:text-sky-600 transition-colors cursor-pointer"
        >
          Platform
        </button>
        <button
          type="button"
          onClick={() => onNavigate('landing', '#architecture')}
          className="text-xs font-normal text-slate-600 hover:text-sky-600 transition-colors cursor-pointer"
        >
          Architecture
        </button>
        <button
          type="button"
          onClick={() => onNavigate('landing', '#usecases')}
          className="text-xs font-normal text-slate-600 hover:text-sky-600 transition-colors cursor-pointer"
        >
          Use Cases
        </button>
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`text-xs font-normal transition-colors cursor-pointer ${currentView === 'dashboard' ? 'text-sky-700 font-medium' : 'text-slate-600 hover:text-sky-600'}`}
        >
          Live Demo
        </button>
      </nav>

      {/* CTA Button */}
      <div className="flex items-center gap-3">
        {currentView === 'dashboard' ? (
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="text-xs font-medium text-slate-600 hover:text-sky-600 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ← Back to Overview
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-900 hover:bg-sky-700 text-white px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-sky-500/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          {currentView === 'dashboard' ? 'In Dashboard' : 'Try it out →'}
        </button>
      </div>
      </div>
    </header>
  );
};

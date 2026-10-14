import React from 'react';

export const StatsBanner: React.FC = () => {
  return (
    <section className="py-6 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="rounded-2xl bg-slate-900 text-white p-8 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-xl shadow-slate-900/20">
        <div>
          <div className="text-3xl font-semibold text-white tracking-tight">250M+</div>
          <div className="text-[11px] text-sky-300 uppercase tracking-wider mt-1">Harmonized Points</div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-white tracking-tight">12,000+</div>
          <div className="text-[11px] text-sky-300 uppercase tracking-wider mt-1">Spatial Grid Cells</div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-white tracking-tight">6 Mo</div>
          <div className="text-[11px] text-sky-300 uppercase tracking-wider mt-1">Validated Horizon</div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-white tracking-tight">99.8%</div>
          <div className="text-[11px] text-sky-300 uppercase tracking-wider mt-1">Pipeline Reliability</div>
        </div>
      </div>
    </section>
  );
};

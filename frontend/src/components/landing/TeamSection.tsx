import React from 'react';

export const TeamSection: React.FC = () => {
  return (
    <section id="about" className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center text-slate-500">
        <h4 className="text-sm font-semibold text-slate-700 mb-1">👥 Core Research & Engineering Team</h4>
        <p className="text-xs max-w-md mx-auto text-slate-500 font-light">
          Academic advisory board, researcher credentials, and institutional collaboration details will be updated here.
        </p>
      </div>
    </section>
  );
};

import React, { useEffect, useRef } from 'react';

interface HeroSectionProps {
  onOpenDashboard: (outcome?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDashboard }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Container Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      let progress = 1 - rect.top / windowHeight;
      progress = Math.max(0, Math.min(1, progress));

      const rotateX = (1 - progress) * 12;
      const scale = 0.96 + progress * 0.04;
      const translateY = (1 - progress) * 15;

      cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) scale(${scale}) translateY(${translateY}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="overview" className="relative min-h-[90vh] pt-12 sm:pt-16 pb-16 px-4 sm:px-8 flex flex-col items-center text-center overflow-hidden bg-gradient-to-b from-sky-100/90 via-sky-50/50 to-white">
      
      {/* Background Sky Atmosphere Image & Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img 
          src="/src/assets/sky_clouds_hero_bg.jpg" 
          alt="Sky clouds landscape" 
          className="w-full h-full object-cover object-top opacity-35 filter saturate-110 mask-radial" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/60 via-transparent to-white"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white/90 shadow-sm text-sky-800 text-xs font-medium tracking-wide mb-5">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
          Live Real-Time Satellite & Climate Intelligence
        </div>

        {/* Reduced & Elegant Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-900 tracking-tight leading-[1.18] mb-4">
          See Weather Before <br />
          <strong className="font-semibold text-sky-900">It Becomes Risk.</strong>
        </h1>

        {/* Clean Humanized Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-slate-600 font-light max-w-2xl leading-relaxed mb-6">
          Monitor ground-level thermal anomalies, vegetation health, and moisture balances in real time. 
          GeoCast unifies NASA MODIS satellite passes with ERA5 climate modeling to deliver tested 6-month environmental foresight for planners, agronomists, and operators.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => onOpenDashboard()}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-sky-700 text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-md shadow-slate-900/10 hover:-translate-y-0.5 cursor-pointer"
          >
            Try it out <span>→</span>
          </button>
          <a
            href="#architecture"
            className="inline-flex items-center gap-1.5 bg-white/80 hover:bg-white text-slate-700 hover:text-sky-700 text-xs sm:text-sm font-normal px-5 py-2.5 rounded-full border border-sky-100 shadow-sm transition-all hover:-translate-y-0.5"
          >
            View Architecture <span>↓</span>
          </a>
        </div>
      </div>

      {/* GLASSY BORDER 3D CONTAINER SCROLL MOCKUP */}
      <div className="relative z-10 w-full max-w-7xl mx-auto mt-2 px-2 sm:px-6 lg:px-8">
        <div 
          ref={cardRef} 
          className="w-full rounded-2xl bg-white/45 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-sky-500/15 p-2 sm:p-3 transition-transform duration-100 ease-out will-change-transform"
        >
          <div className="rounded-xl bg-white border border-slate-200/80 overflow-hidden shadow-inner">
            
            {/* Window Header Bar */}
            <div className="h-10 bg-slate-50/90 border-b border-slate-200/80 px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-200/60 text-[11px] font-normal text-slate-600">
                <span className="text-slate-400 font-mono text-[10px]">https://</span>
                app.geocast.internal/preview
              </div>

              <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Forecast Engine
              </div>
            </div>

            {/* Mockup Screen Viewport */}
            <div className="relative min-h-[360px] sm:min-h-[460px] bg-slate-50 flex items-center justify-center overflow-hidden">
              <div className="relative w-full group">
                <img 
                  src="/src/assets/geocast_dashboard_mockup.jpg" 
                  alt="GeoCast Environmental Dashboard Mockup" 
                  className="w-full h-auto object-cover block"
                />
                {/* Hover launch button overlay */}
                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onOpenDashboard()}
                    className="bg-white text-slate-900 hover:bg-sky-600 hover:text-white font-medium text-xs px-5 py-2.5 rounded-full shadow-lg transition-transform transform scale-95 group-hover:scale-100 cursor-pointer"
                  >
                    Launch Interactive Dashboard →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

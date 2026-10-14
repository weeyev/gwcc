import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';

export const App: React.FC = () => {
  // By default must be landing page
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>(() => {
    if (window.location.pathname === '/dashboard' || window.location.hash === '#dashboard') {
      return 'dashboard';
    }
    return 'landing';
  });

  const [targetOutcome, setTargetOutcome] = useState<string>('heat');

  // Sync with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/dashboard' || window.location.hash === '#dashboard') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view: 'landing' | 'dashboard', hash?: string) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      window.history.pushState(null, '', '/dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.pushState(null, '', '/');
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleOpenDashboardWithOutcome = (outcome?: string) => {
    if (outcome) setTargetOutcome(outcome);
    handleNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-light selection:bg-sky-500 selection:text-white">
      {/* Thin full-width glass header (not oval) */}
      <Navbar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentView === 'landing' ? (
          <LandingPage onOpenDashboard={handleOpenDashboardWithOutcome} />
        ) : (
          <Dashboard 
            initialOutcome={targetOutcome}
            onBackToLanding={() => handleNavigate('landing')} 
          />
        )}
      </main>
    </div>
  );
};

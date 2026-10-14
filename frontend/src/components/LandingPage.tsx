import React from 'react';
import {
  HeroSection,
  TrustedStrip,
  ClimateSandbox,
  FeaturesSection,
  ArchitectureDiagram,
  UseCasesSection,
  StatsBanner,
  TeamSection,
  Footer
} from './landing';

interface LandingPageProps {
  onOpenDashboard: (outcome?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenDashboard }) => {
  return (
    <div className="w-full bg-white text-slate-800 font-light">
      {/* 1. Hero Atmosphere & 3D Container Scroll Mockup */}
      <HeroSection onOpenDashboard={onOpenDashboard} />

      {/* 2. Global Repositories Integration Strip */}
      <TrustedStrip />

      {/* 3. Interactive Regional Climate Anomaly Sandbox */}
      <ClimateSandbox onOpenDashboard={onOpenDashboard} />

      {/* 4. Four Interactive Graphical Feature Cards */}
      <FeaturesSection />

      {/* 5. Scientific Architecture Pipeline & Moving Dashed Flows */}
      <ArchitectureDiagram />

      {/* 6. Real-World Field Use Cases with Telemetry Micro-Widgets */}
      <UseCasesSection onOpenDashboard={onOpenDashboard} />

      {/* 7. Key Operational Statistics Strip */}
      <StatsBanner />

      {/* 8. Core Research Team Advisory */}
      <TeamSection />

      {/* 9. Modern Platform Footer */}
      <Footer onOpenDashboard={onOpenDashboard} />
    </div>
  );
};

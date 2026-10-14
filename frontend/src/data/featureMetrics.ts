export interface DiurnalPoint {
  time: string;
  temp: number;
  pass: string | null;
  desc: string;
}

export const tempHours: DiurnalPoint[] = [
  { time: '06:00', temp: 21.2, pass: 'Night Baseline', desc: 'Nocturnal radiometric cooling' },
  { time: '08:00', temp: 23.4, pass: null, desc: 'Early solar radiation onset' },
  { time: '10:00', temp: 25.8, pass: 'Terra (10:30)', desc: 'Morning ascending overpass' },
  { time: '12:00', temp: 27.6, pass: null, desc: 'Midday solar noon heating' },
  { time: '14:00', temp: 28.4, pass: 'Aqua (13:30)', desc: 'Peak radiometric surface heat' },
  { time: '16:00', temp: 26.9, pass: null, desc: 'Afternoon thermal latency' },
  { time: '18:00', temp: 24.5, pass: null, desc: 'Sunset boundary re-radiation' },
  { time: '20:00', temp: 22.8, pass: 'Night Radiance', desc: 'Pre-midnight surface settling' },
];

export interface AlertScenario {
  lead: string;
  sigma: string;
  risk: string;
  conf: string;
  sub: string;
  heatStress: number;
  rainDeficit: number;
  vegShock: number;
  badgeBg: string;
  badgeText: string;
  curveOffset: number;
}

export const alertScenarios: Record<'2W' | '4W' | '6W', AlertScenario> = {
  '2W': {
    lead: '2 Weeks Ahead',
    sigma: '+2.8σ',
    risk: 'Critical Heatwave Threat',
    conf: '96.4%',
    sub: 'Radiometric divergence +3.6°C above urban canopy baseline',
    heatStress: 94,
    rainDeficit: 82,
    vegShock: 64,
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
    badgeText: 'text-rose-600',
    curveOffset: 88,
  },
  '4W': {
    lead: '4 Weeks Ahead',
    sigma: '+2.4σ',
    risk: 'Pre-Monsoon Deficit Warning',
    conf: '91.8%',
    sub: 'Persistent moisture deficit building across regional grid cells',
    heatStress: 84,
    rainDeficit: 76,
    vegShock: 52,
    badgeBg: 'bg-orange-50 border-orange-200 text-orange-700',
    badgeText: 'text-orange-600',
    curveOffset: 76,
  },
  '6W': {
    lead: '6 Weeks Ahead',
    sigma: '+2.1σ',
    risk: 'Elevated Anomaly Horizon',
    conf: '86.5%',
    sub: 'Early warning trigger identifies systemic seasonal trend drift',
    heatStress: 76,
    rainDeficit: 68,
    vegShock: 42,
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
    badgeText: 'text-amber-600',
    curveOffset: 65,
  },
};

export interface RainDataPoint {
  month: string;
  rain: number;
  pet: number;
  net: number;
}

export const rainData: RainDataPoint[] = [
  { month: 'Jan', rain: 11.8, pet: 14.2, net: -2.4 },
  { month: 'Feb', rain: 14.2, pet: 15.1, net: -0.9 },
  { month: 'Mar', rain: 18.3, pet: 18.0, net: +0.3 },
  { month: 'Apr', rain: 22.8, pet: 21.4, net: +1.4 },
  { month: 'May', rain: 28.4, pet: 24.1, net: +4.3 },
  { month: 'Jun', rain: 34.6, pet: 26.5, net: +8.1 },
  { month: 'Jul', rain: 42.1, pet: 28.2, net: +13.9 },
  { month: 'Aug', rain: 38.5, pet: 27.0, net: +11.5 },
  { month: 'Sep', rain: 29.2, pet: 22.8, net: +6.4 },
  { month: 'Oct', rain: 21.5, pet: 18.6, net: +2.9 },
  { month: 'Nov', rain: 15.3, pet: 15.2, net: +0.1 },
  { month: 'Dec', rain: 12.0, pet: 13.5, net: -1.5 },
];

export interface NdviStepPoint {
  month: string;
  val: number;
  status: string;
  vigor: number;
  label: string;
}

export const ndviSteps: NdviStepPoint[] = [
  { month: 'Jan', val: 0.38, status: 'Dormant Soil', vigor: 42, label: 'Post-harvest stubble baseline' },
  { month: 'Feb', val: 0.36, status: 'Dry Scrub', vigor: 38, label: 'Late winter moisture minimum' },
  { month: 'Mar', val: 0.39, status: 'Bud Break', vigor: 48, label: 'Early vegetative emergence' },
  { month: 'Apr', val: 0.44, status: 'Active Growth', vigor: 64, label: 'Irrigated canopy acceleration' },
  { month: 'May', val: 0.49, status: 'Lush Foliage', vigor: 78, label: 'Pre-monsoon leaf area expansion' },
  { month: 'Jun', val: 0.53, status: 'Peak Canopy', vigor: 89, label: 'Optimal chlorophyll density index' },
];

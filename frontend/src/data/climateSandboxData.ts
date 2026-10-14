export interface MetricTrajectory {
  months: string[];
  actual: number[];
  forecast: number[];
  ciUpper: number[];
  ciLower: number[];
  baseline: number;
  unit: string;
  trend: string;
}

export interface DriverAttribution {
  label: string;
  pct: number;
  color: string;
}

export interface RegionalClimateProfile {
  name: string;
  desc: string;
  lst: MetricTrajectory;
  ndvi: MetricTrajectory;
  balance: MetricTrajectory;
  drivers: DriverAttribution[];
}

export type SandboxRegionKey = 'chengalpattu' | 'vellore' | 'coimbatore' | 'madurai' | 'salem';
export type SandboxMetricKey = 'lst' | 'ndvi' | 'balance';

export const regionalSandboxData: Record<SandboxRegionKey, RegionalClimateProfile> = {
  chengalpattu: {
    name: 'Chengalpattu (Coastal Plain)',
    desc: 'Coastal maritime climate with humid boundary layer and seasonal monsoon shift.',
    lst: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [25.8, 26.9, 29.2, 31.0, 32.4, 32.9],
      forecast: [26.0, 27.2, 29.5, 31.4, 32.8, 33.1],
      ciUpper: [26.6, 28.0, 30.4, 32.3, 33.7, 34.0],
      ciLower: [25.4, 26.4, 28.6, 30.5, 31.9, 32.2],
      baseline: 30.1,
      unit: '°C',
      trend: '+1.8°C above historical 10-yr mean'
    },
    ndvi: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [0.41, 0.39, 0.38, 0.43, 0.47, 0.51],
      forecast: [0.42, 0.40, 0.38, 0.44, 0.48, 0.52],
      ciUpper: [0.45, 0.43, 0.41, 0.47, 0.51, 0.55],
      ciLower: [0.39, 0.37, 0.35, 0.41, 0.45, 0.49],
      baseline: 0.44,
      unit: 'NDVI',
      trend: '+18% post-monsoon vegetative vigor'
    },
    balance: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [-14, -18, -22, +12, +42, +34],
      forecast: [-12, -18, -25, +15, +48, +36],
      ciUpper: [-8, -12, -18, +24, +56, +44],
      ciLower: [-16, -24, -32, +6, +40, +28],
      baseline: +7.2,
      unit: 'mm/mo',
      trend: '+44.0 mm net catchment recharge'
    },
    drivers: [
      { label: 'Surface Solar Radiation', pct: 46, color: 'bg-amber-500' },
      { label: 'Rainfall Deficit Divergence', pct: 34, color: 'bg-sky-500' },
      { label: 'Maritime Boundary Wind', pct: 20, color: 'bg-emerald-500' }
    ]
  },
  vellore: {
    name: 'Vellore (Inland Basin)',
    desc: 'Semi-arid topographical basin characterized by rapid land heating and dry heat spikes.',
    lst: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [27.2, 28.9, 31.8, 34.2, 35.8, 35.5],
      forecast: [27.8, 29.4, 32.1, 34.6, 36.2, 35.8],
      ciUpper: [28.6, 30.2, 33.1, 35.6, 37.2, 36.8],
      ciLower: [27.0, 28.6, 31.1, 33.6, 35.2, 34.8],
      baseline: 32.8,
      unit: '°C',
      trend: '+2.6°C elevated heat anomaly'
    },
    ndvi: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [0.34, 0.32, 0.30, 0.35, 0.40, 0.44],
      forecast: [0.35, 0.33, 0.31, 0.36, 0.41, 0.46],
      ciUpper: [0.38, 0.36, 0.34, 0.39, 0.44, 0.49],
      ciLower: [0.32, 0.30, 0.28, 0.33, 0.38, 0.43],
      baseline: 0.37,
      unit: 'NDVI',
      trend: 'Moderate dryland vegetation rebound'
    },
    balance: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [-24, -32, -38, -12, +24, +15],
      forecast: [-22, -30, -35, -10, +28, +18],
      ciUpper: [-16, -22, -26, +2, +38, +28],
      ciLower: [-28, -38, -44, -22, +18, +8],
      baseline: -8.5,
      unit: 'mm/mo',
      trend: 'High evapotranspiration deficit watch'
    },
    drivers: [
      { label: 'Surface Solar Radiation', pct: 54, color: 'bg-amber-500' },
      { label: 'Soil Moisture Scarcity', pct: 31, color: 'bg-rose-500' },
      { label: 'Inland Thermal Advection', pct: 15, color: 'bg-sky-500' }
    ]
  },
  coimbatore: {
    name: 'Coimbatore (Rainshadow Plateau)',
    desc: 'Western Ghats adjacent plateau with stable moderate temperatures and high wind shear.',
    lst: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [24.1, 25.4, 27.9, 29.5, 30.1, 29.4],
      forecast: [24.5, 25.8, 28.2, 29.9, 30.5, 29.8],
      ciUpper: [25.2, 26.5, 29.0, 30.7, 31.3, 30.6],
      ciLower: [23.8, 25.1, 27.4, 29.1, 29.7, 29.0],
      baseline: 28.0,
      unit: '°C',
      trend: '+1.1°C mild seasonal temperature shift'
    },
    ndvi: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [0.47, 0.45, 0.43, 0.49, 0.54, 0.58],
      forecast: [0.48, 0.46, 0.44, 0.50, 0.55, 0.59],
      ciUpper: [0.51, 0.49, 0.47, 0.53, 0.58, 0.62],
      ciLower: [0.45, 0.43, 0.41, 0.47, 0.52, 0.56],
      baseline: 0.51,
      unit: 'NDVI',
      trend: 'High canopy vitality index'
    },
    balance: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [-10, -14, -18, +28, +58, +48],
      forecast: [-8, -12, -15, +32, +64, +52],
      ciUpper: [-2, -6, -8, +42, +74, +62],
      ciLower: [-14, -18, -22, +22, +54, +42],
      baseline: +24.0,
      unit: 'mm/mo',
      trend: 'Strong positive hydrological surplus'
    },
    drivers: [
      { label: 'Orographic Airflow', pct: 44, color: 'bg-emerald-500' },
      { label: 'Canopy Transpiration', pct: 36, color: 'bg-sky-500' },
      { label: 'Incident Solar Flux', pct: 20, color: 'bg-amber-500' }
    ]
  },
  madurai: {
    name: 'Madurai (Semiarid Valley)',
    desc: 'Vaigai river plain with pronounced pre-monsoon heat build-up and agricultural demand.',
    lst: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [26.6, 28.2, 31.0, 33.4, 34.8, 34.5],
      forecast: [27.0, 28.6, 31.5, 33.8, 35.2, 34.9],
      ciUpper: [27.7, 29.3, 32.3, 34.7, 36.1, 35.8],
      ciLower: [26.3, 27.9, 30.7, 32.9, 34.3, 34.0],
      baseline: 31.9,
      unit: '°C',
      trend: '+2.1°C thermal stress divergence'
    },
    ndvi: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [0.35, 0.33, 0.32, 0.37, 0.42, 0.46],
      forecast: [0.36, 0.34, 0.33, 0.38, 0.43, 0.47],
      ciUpper: [0.39, 0.37, 0.36, 0.41, 0.46, 0.50],
      ciLower: [0.33, 0.31, 0.30, 0.35, 0.40, 0.44],
      baseline: 0.39,
      unit: 'NDVI',
      trend: 'Agronomic irrigation dependent vigor'
    },
    balance: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [-20, -28, -32, -8, +30, +18],
      forecast: [-18, -26, -30, -5, +35, +22],
      ciUpper: [-12, -20, -22, +5, +45, +32],
      ciLower: [-24, -32, -38, -15, +25, +12],
      baseline: -2.4,
      unit: 'mm/mo',
      trend: 'Seasonal deficit turning to positive inflow'
    },
    drivers: [
      { label: 'Surface Solar Radiation', pct: 50, color: 'bg-amber-500' },
      { label: 'Irrigation Evapotranspiration', pct: 32, color: 'bg-sky-500' },
      { label: 'Boundary Wind Velocity', pct: 18, color: 'bg-emerald-500' }
    ]
  },
  salem: {
    name: 'Salem (Interior Foothills)',
    desc: 'Eastern Ghats foothills corridor featuring interspersed cropland and industrial clusters.',
    lst: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [25.4, 26.8, 29.4, 31.6, 33.0, 32.3],
      forecast: [25.9, 27.2, 29.8, 32.0, 33.4, 32.7],
      ciUpper: [26.6, 27.9, 30.6, 32.8, 34.2, 33.5],
      ciLower: [25.2, 26.5, 29.0, 31.2, 32.6, 31.9],
      baseline: 30.1,
      unit: '°C',
      trend: '+1.5°C moderate heat baseline'
    },
    ndvi: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [0.40, 0.38, 0.36, 0.41, 0.46, 0.50],
      forecast: [0.41, 0.39, 0.37, 0.42, 0.47, 0.51],
      ciUpper: [0.44, 0.42, 0.40, 0.45, 0.50, 0.54],
      ciLower: [0.38, 0.36, 0.34, 0.39, 0.44, 0.48],
      baseline: 0.43,
      unit: 'NDVI',
      trend: 'Steady vegetative canopy expansion'
    },
    balance: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      actual: [-16, -22, -28, +14, +38, +26],
      forecast: [-14, -20, -26, +18, +42, +30],
      ciUpper: [-8, -14, -18, +26, +50, +38],
      ciLower: [-20, -26, -34, +10, +34, +22],
      baseline: +9.0,
      unit: 'mm/mo',
      trend: '+32.0 mm catchment buffer gain'
    },
    drivers: [
      { label: 'Surface Solar Radiation', pct: 48, color: 'bg-amber-500' },
      { label: 'Hillslope Precipitation', pct: 34, color: 'bg-sky-500' },
      { label: 'Vegetation Canopy Drag', pct: 18, color: 'bg-emerald-500' }
    ]
  }
};

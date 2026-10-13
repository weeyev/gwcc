export const places = {
  chengalpattu: { name: 'Chengalpattu', lat: 12.6819, lon: 79.9888 },
  chennai: { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  kanchipuram: { name: 'Kanchipuram', lat: 12.8342, lon: 79.7036 },
};
export const outcomes = {
  heat: { name: 'Surface heat', target: 'lst', unit: '°C', color: '#df7046', description: 'Forecast satellite land surface temperature using prior vegetation and weather conditions.' },
  vegetation: { name: 'Vegetation', target: 'ndvi', unit: 'NDVI', color: '#367b52', description: 'Forecast vegetation greenness using prior heat, vegetation, and weather conditions. NDVI alone does not measure deforestation.' },
  water: { name: 'Water availability', target: 'balance', unit: 'mm', color: '#438dae', description: 'Forecast rainfall minus reference evapotranspiration. This climatic water-balance proxy does not measure surface-water extent or groundwater.' },
};

// Mock data for INSpace Insurance Risk Analytics Platform

// San Francisco Bay Area coordinates
const SF_CENTER = { lat: 37.7749, lng: -122.4194 };

// Asset types with colors
export const ASSET_TYPES = {
  factories: { name: 'Factories', color: '#f97316', icon: 'factory' },
  retail: { name: 'Retail', color: '#22c55e', icon: 'store' },
  warehouses: { name: 'Warehouses', color: '#eab308', icon: 'warehouse' },
  residential: { name: 'Residential', color: '#3b82f6', icon: 'home' },
  commercial: { name: 'Commercial', color: '#8b5cf6', icon: 'building' },
  industrial: { name: 'Industrial', color: '#ef4444', icon: 'industry' },
};

// Generate random assets around SF Bay Area
const generateAssets = (count = 85) => {
  const assets = [];
  const types = Object.keys(ASSET_TYPES);
  const constructionTypes = ['Wood Frame', 'Steel Frame', 'Concrete', 'Masonry', 'Mixed'];
  const coverageTypes = ['Full Coverage', 'Basic', 'Premium', 'Standard'];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const lat = SF_CENTER.lat + (Math.random() - 0.5) * 0.15;
    const lng = SF_CENTER.lng + (Math.random() - 0.5) * 0.25;
    
    // Determine if asset is in flood zone (roughly 40% of assets)
    const inFloodZone = Math.random() < 0.4;
    const floodDepth = inFloodZone ? Math.round(Math.random() * 8 * 10) / 10 : 0;
    
    assets.push({
      assetId: `${type.toUpperCase().slice(0, 4)}-${String(i + 1).padStart(5, '0')}`,
      latitude: lat,
      longitude: lng,
      giv: Math.round(Math.random() * 50000000 + 1000000), // $1M - $51M
      pnl: Math.round((Math.random() - 0.3) * 2000000), // -$600K to +$1.4M
      assetType: type,
      constructionType: constructionTypes[Math.floor(Math.random() * constructionTypes.length)],
      yearBuilt: Math.floor(Math.random() * 60) + 1960,
      coverageType: coverageTypes[Math.floor(Math.random() * coverageTypes.length)],
      riskScore: Math.round(Math.random() * 100),
      address: generateAddress(),
      inFloodZone,
      floodDepth,
      floodCategory: inFloodZone 
        ? (['primary', 'secondary', 'fringe'])[Math.floor(Math.random() * 3)]
        : null,
    });
  }
  
  return assets;
};

const streetNames = [
  'Market St', 'Mission St', 'Howard St', 'Folsom St', 'Harrison St',
  'Bryant St', 'Brannan St', 'Townsend St', 'King St', 'Berry St',
  'Van Ness Ave', 'Geary Blvd', 'Post St', 'Sutter St', 'Bush St',
  'Pine St', 'California St', 'Sacramento St', 'Clay St', 'Washington St'
];

const generateAddress = () => {
  const number = Math.floor(Math.random() * 9000) + 100;
  const street = streetNames[Math.floor(Math.random() * streetNames.length)];
  return `${number} ${street}, San Francisco, CA`;
};

// Generate flood zones (polygons)
export const generateFloodZones = () => {
  const zones = [];
  
  // Primary flood zone - larger area near bay
  zones.push({
    flood_id: 'FZ-001',
    flood_category: 'primary',
    flood_depth_m: 2.5,
    return_period_yr: 100,
    probability_pct: 1,
    data_source: 'FEMA NFHL',
    timestamp: '2024-01-15T00:00:00Z',
    coordinates: [
      [37.7850, -122.3900],
      [37.7900, -122.3800],
      [37.7950, -122.3850],
      [37.7920, -122.4000],
      [37.7850, -122.3950],
    ],
  });
  
  // Secondary flood zone
  zones.push({
    flood_id: 'FZ-002',
    flood_category: 'secondary',
    flood_depth_m: 1.2,
    return_period_yr: 50,
    probability_pct: 2,
    data_source: 'FEMA NFHL',
    timestamp: '2024-01-15T00:00:00Z',
    coordinates: [
      [37.7700, -122.4100],
      [37.7750, -122.4000],
      [37.7800, -122.4050],
      [37.7780, -122.4200],
      [37.7720, -122.4180],
    ],
  });
  
  // Fringe flood zone
  zones.push({
    flood_id: 'FZ-003',
    flood_category: 'fringe',
    flood_depth_m: 0.5,
    return_period_yr: 25,
    probability_pct: 4,
    data_source: 'FEMA NFHL',
    timestamp: '2024-01-15T00:00:00Z',
    coordinates: [
      [37.7600, -122.4300],
      [37.7650, -122.4200],
      [37.7700, -122.4250],
      [37.7680, -122.4400],
      [37.7620, -122.4380],
    ],
  });

  // Additional primary zone
  zones.push({
    flood_id: 'FZ-004',
    flood_category: 'primary',
    flood_depth_m: 3.1,
    return_period_yr: 100,
    probability_pct: 1,
    data_source: 'FEMA NFHL',
    timestamp: '2024-01-15T00:00:00Z',
    coordinates: [
      [37.7820, -122.4500],
      [37.7870, -122.4400],
      [37.7920, -122.4450],
      [37.7900, -122.4600],
      [37.7840, -122.4580],
    ],
  });
  
  return zones;
};

// Initial KPI values
export const INITIAL_KPIS = {
  totalGIV: 5200000000, // $5.2B
  totalPnL: -12000000, // -$12M
  impactedGIV: 1100000000, // $1.1B
  impactedPnL: -4500000, // -$4.5M
  assetCount: 85,
};

// Flood-specific KPIs (calculated based on flooded assets)
export const calculateFloodKPIs = (assets) => {
  const floodedAssets = assets.filter(a => a.inFloodZone);
  const floodedGIV = floodedAssets.reduce((sum, a) => sum + a.giv, 0);
  
  // Estimate flood loss based on depth and construction type
  const estimatedLoss = floodedAssets.reduce((sum, a) => {
    const exposureFactor = getExposureFactor(a.floodDepth, a.constructionType);
    return sum + (a.giv * exposureFactor);
  }, 0);
  
  const depths = floodedAssets.map(a => a.floodDepth).filter(d => d > 0);
  const medianDepth = depths.length > 0 
    ? depths.sort((a, b) => a - b)[Math.floor(depths.length / 2)]
    : 0;
  
  return {
    floodedGIV,
    estimatedFloodLoss: estimatedLoss,
    exposedAssetCount: floodedAssets.length,
    medianFloodDepth: medianDepth,
    totalAssets: assets.length,
  };
};

// Exposure factor based on flood depth and construction type
const getExposureFactor = (depth, constructionType) => {
  const baseFactors = {
    'Wood Frame': 0.15,
    'Steel Frame': 0.08,
    'Concrete': 0.06,
    'Masonry': 0.10,
    'Mixed': 0.12,
  };
  
  const baseFactor = baseFactors[constructionType] || 0.10;
  
  // Increase factor based on depth
  if (depth < 1) return baseFactor * 0.5;
  if (depth < 2) return baseFactor * 1.0;
  if (depth < 3) return baseFactor * 1.5;
  return baseFactor * 2.0;
};

// Base map options
export const BASE_MAPS = {
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  streets: {
    name: 'Streets',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  topographic: {
    name: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
};

// Generate and export assets
export const MOCK_ASSETS = generateAssets(85);
export const FLOOD_ZONES = generateFloodZones();

// Format currency
export const formatCurrency = (value) => {
  if (Math.abs(value) >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

// Format number with commas
export const formatNumber = (value) => {
  return value.toLocaleString();
};

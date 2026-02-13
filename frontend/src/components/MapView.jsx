import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polygon, Popup, useMap, useMapEvents } from 'react-leaflet';
import { ZoomIn, ZoomOut, Locate } from 'lucide-react';
import { Button } from './ui/button';
import { ASSET_TYPES, BASE_MAPS, FLOOD_ZONES } from '../data/mockData';
import 'leaflet/dist/leaflet.css';

// Map center (San Francisco)
const SF_CENTER = [37.7749, -122.4194];
const DEFAULT_ZOOM = 13;

// Flood zone colors with opacity
const FLOOD_COLORS = {
  primary: { fill: '#e8aeb3', stroke: '#1e3a5f' },
  secondary: { fill: '#bfe1ff', stroke: '#1e3a5f' },
  fringe: { fill: '#fff3bf', stroke: '#1e3a5f' },
};

// Custom zoom controls
const ZoomControls = () => {
  const map = useMap();

  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-1" data-testid="zoom-controls">
      <Button
        variant="secondary"
        size="icon"
        className="w-8 h-8 bg-white shadow-md hover:bg-slate-100"
        onClick={() => map.zoomIn()}
        data-testid="zoom-in-btn"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="w-8 h-8 bg-white shadow-md hover:bg-slate-100"
        onClick={() => map.zoomOut()}
        data-testid="zoom-out-btn"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="w-8 h-8 bg-white shadow-md hover:bg-slate-100 mt-2"
        onClick={() => map.setView(SF_CENTER, DEFAULT_ZOOM)}
        data-testid="reset-view-btn"
      >
        <Locate className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Handle map click events
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    },
  });
  return null;
};

// Component to invalidate map size on container resize
const MapResizer = () => {
  const map = useMap();
  
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    
    const container = map.getContainer();
    resizeObserver.observe(container);
    
    // Initial invalidation
    setTimeout(() => map.invalidateSize(), 100);
    
    return () => resizeObserver.disconnect();
  }, [map]);
  
  return null;
};

export const MapView = ({
  assets,
  baseMap,
  activeFilters,
  isFloodLayerOn,
  floodOpacity,
  showOnlyExposed,
  selectedAsset,
  setSelectedAsset,
  onAssetClick,
}) => {
  const mapRef = useRef(null);
  const [hoveredFloodZone, setHoveredFloodZone] = useState(null);

  // Filter assets based on active filters and exposure
  const filteredAssets = assets.filter(asset => {
    // Check if asset type is in active filters
    if (!activeFilters[asset.assetType]) return false;
    
    // If showing only exposed and flood layer is on, filter to exposed only
    if (showOnlyExposed && isFloodLayerOn && !asset.inFloodZone) return false;
    
    return true;
  });

  // Get current base map config
  const currentBaseMap = BASE_MAPS[baseMap] || BASE_MAPS.streets;

  // Handle asset marker click
  const handleAssetClick = (asset, e) => {
    e.originalEvent?.stopPropagation();
    setSelectedAsset(asset);
    if (onAssetClick) onAssetClick(asset);
  };

  // Handle map background click (deselect)
  const handleMapClick = (e) => {
    // Only deselect if clicking on map background (not on a marker)
    if (!e.originalEvent?.target?.closest('.leaflet-marker-icon') && 
        !e.originalEvent?.target?.closest('.leaflet-interactive')) {
      // Don't deselect on map click - user might want to keep selection while panning
    }
  };

  // Get marker style based on asset state
  const getMarkerStyle = (asset) => {
    const assetType = ASSET_TYPES[asset.assetType];
    const isSelected = selectedAsset?.assetId === asset.assetId;
    const isExposed = asset.inFloodZone;
    
    let opacity = 1;
    let radius = 8;
    let weight = 2;
    
    // If flood layer is on and showing all, dim non-exposed
    if (isFloodLayerOn && !showOnlyExposed && !isExposed) {
      opacity = 0.3;
    }
    
    // If selected, highlight
    if (isSelected) {
      radius = 12;
      weight = 3;
    }
    
    return {
      radius,
      fillColor: assetType?.color || '#6b7280',
      color: isSelected ? '#0B1120' : '#ffffff',
      weight,
      opacity,
      fillOpacity: opacity * 0.8,
    };
  };

  return (
    <div className="relative w-full h-full" data-testid="map-view">
      <MapContainer
        ref={mapRef}
        center={SF_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={true}
      >
        <MapResizer />
        <ZoomControls />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Base Map Tiles */}
        <TileLayer
          key={baseMap}
          url={currentBaseMap.url}
          attribution={currentBaseMap.attribution}
        />

        {/* Flood Zones Layer */}
        {isFloodLayerOn && FLOOD_ZONES.map((zone) => {
          const zoneColors = FLOOD_COLORS[zone.flood_category] || FLOOD_COLORS.primary;
          const isHovered = hoveredFloodZone === zone.flood_id;
          
          return (
            <Polygon
              key={zone.flood_id}
              positions={zone.coordinates}
              pathOptions={{
                fillColor: zoneColors.fill,
                fillOpacity: floodOpacity * (isHovered ? 1 : 0.75),
                color: zoneColors.stroke,
                weight: isHovered ? 2 : 1,
                opacity: floodOpacity,
              }}
              eventHandlers={{
                mouseover: () => setHoveredFloodZone(zone.flood_id),
                mouseout: () => setHoveredFloodZone(null),
              }}
            >
              <Popup className="flood-popup" data-testid={`flood-popup-${zone.flood_id}`}>
                <div className="p-2 min-w-[200px]">
                  <h4 className="font-barlow font-semibold text-sm text-slate-800 mb-2">
                    Flood Zone Details
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Zone ID:</span>
                      <span className="font-medium">{zone.flood_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Category:</span>
                      <span className="font-medium capitalize">{zone.flood_category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Depth:</span>
                      <span className="font-medium">{zone.flood_depth_m}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Return Period:</span>
                      <span className="font-medium">{zone.return_period_yr} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Probability:</span>
                      <span className="font-medium">{zone.probability_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data Source:</span>
                      <span className="font-medium">{zone.data_source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Updated:</span>
                      <span className="font-medium">
                        {new Date(zone.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Asset Markers */}
        {filteredAssets.map((asset) => {
          const style = getMarkerStyle(asset);
          const isSelected = selectedAsset?.assetId === asset.assetId;
          
          return (
            <CircleMarker
              key={asset.assetId}
              center={[asset.latitude, asset.longitude]}
              {...style}
              eventHandlers={{
                click: (e) => handleAssetClick(asset, e),
              }}
              data-testid={`asset-marker-${asset.assetId}`}
            >
              {isSelected && (
                <Popup data-testid={`asset-popup-${asset.assetId}`}>
                  <div className="p-2 min-w-[180px]">
                    <div className="font-barlow font-semibold text-sm text-slate-800 mb-1">
                      {asset.assetId}
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {ASSET_TYPES[asset.assetType]?.name}
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">GIV:</span>
                        <span className="font-medium">${(asset.giv / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Risk:</span>
                        <span className="font-medium">{asset.riskScore}</span>
                      </div>
                      {isFloodLayerOn && asset.inFloodZone && (
                        <div className="flex justify-between text-blue-600">
                          <span>Flood Depth:</span>
                          <span className="font-medium">{asset.floodDepth}m</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              )}
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Attribution Overlay */}
      <div className="absolute bottom-2 right-2 z-[1000] bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-slate-500">
        Powered by OpenStreetMap & CARTO
      </div>
    </div>
  );
};

export default MapView;

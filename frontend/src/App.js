import { useState, useMemo, useEffect } from 'react';
import './App.css';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import Header from './components/Header';
import KPIBar from './components/KPIBar';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import MapView from './components/MapView';
import { 
  MOCK_ASSETS, 
  INITIAL_KPIS, 
  calculateFloodKPIs,
  ASSET_TYPES 
} from './data/mockData';

function App() {
  // View state
  const [activeView, setActiveView] = useState('portfolio');
  const [searchQuery, setSearchQuery] = useState('');

  // Panel collapse states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Map controls
  const [baseMap, setBaseMap] = useState('streets');
  const [activeFilters, setActiveFilters] = useState(() => {
    const filters = {};
    Object.keys(ASSET_TYPES).forEach(key => {
      filters[key] = true;
    });
    return filters;
  });

  // Flood layer controls
  const [isFloodLayerOn, setIsFloodLayerOn] = useState(false);
  const [floodOpacity, setFloodOpacity] = useState(0.75);
  const [showOnlyExposed, setShowOnlyExposed] = useState(false);

  // Selection state
  const [selectionMode, setSelectionMode] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);

  // Filter assets based on search and active filters
  const filteredAssets = useMemo(() => {
    let assets = [...MOCK_ASSETS];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      assets = assets.filter(asset => 
        asset.assetId.toLowerCase().includes(query) ||
        asset.address.toLowerCase().includes(query)
      );
    }

    return assets;
  }, [searchQuery]);

  // Calculate KPIs based on current state
  const displayedKPIs = useMemo(() => {
    if (selectedAsset) {
      return {
        totalGIV: selectedAsset.giv,
        totalPnL: selectedAsset.pnl,
        impactedGIV: selectedAsset.inFloodZone ? selectedAsset.giv : 0,
        impactedPnL: selectedAsset.inFloodZone ? selectedAsset.pnl : 0,
        assetCount: 1,
      };
    }

    if (selectedAssets.length > 0) {
      return {
        totalGIV: selectedAssets.reduce((sum, a) => sum + a.giv, 0),
        totalPnL: selectedAssets.reduce((sum, a) => sum + a.pnl, 0),
        impactedGIV: selectedAssets.filter(a => a.inFloodZone).reduce((sum, a) => sum + a.giv, 0),
        impactedPnL: selectedAssets.filter(a => a.inFloodZone).reduce((sum, a) => sum + a.pnl, 0),
        assetCount: selectedAssets.length,
      };
    }

    return INITIAL_KPIS;
  }, [selectedAsset, selectedAssets]);

  // Calculate flood KPIs
  const floodKPIs = useMemo(() => {
    const assetsToAnalyze = selectedAssets.length > 0 ? selectedAssets : 
                           selectedAsset ? [selectedAsset] : 
                           filteredAssets;
    return calculateFloodKPIs(assetsToAnalyze);
  }, [filteredAssets, selectedAsset, selectedAssets]);

  // Determine KPI label
  const kpiLabel = useMemo(() => {
    if (selectedAsset) {
      return 'Selected Asset';
    }
    if (selectedArea || selectedAssets.length > 0) {
      if (isFloodLayerOn) {
        return 'Based on flooded assets in this AOI';
      }
      return 'Selected Area Assets';
    }
    if (isFloodLayerOn) {
      return 'Based on flooded assets';
    }
    return 'Based on all your assets';
  }, [selectedAsset, selectedArea, selectedAssets, isFloodLayerOn]);

  // Handle view change
  useEffect(() => {
    if (activeView === 'simulation') {
      setIsFloodLayerOn(true);
      toast.info('Event Simulation Mode', {
        description: 'Flood layer activated for risk analysis',
      });
    }
  }, [activeView]);

  // Handle flood layer toggle
  useEffect(() => {
    if (isFloodLayerOn) {
      toast.success('Flood Layer Enabled', {
        description: `${floodKPIs.exposedAssetCount} assets in flood zones`,
      });
    }
  }, [isFloodLayerOn, floodKPIs.exposedAssetCount]);

  // Clear selection handler
  const handleClearSelection = () => {
    setSelectedAsset(null);
    setSelectedAssets([]);
    setSelectedArea(null);
    setSelectionMode(null);
    toast.info('Selection Cleared');
  };

  // Asset click handler
  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setSelectedAssets([]);
    toast.info(`Asset Selected: ${asset.assetId}`);
  };

  return (
    <div className="App min-h-screen bg-slate-50" data-testid="app-container">
      {/* Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <main className="pt-16 h-screen flex flex-col">
        {/* KPI Bar */}
        <KPIBar
          kpis={displayedKPIs}
          floodKPIs={floodKPIs}
          isFloodLayerOn={isFloodLayerOn}
          kpiLabel={kpiLabel}
          selectedAsset={selectedAsset}
        />

        {/* Main Grid Layout */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden" data-testid="main-grid">
          {/* Left Panel */}
          <div className={`${leftPanelCollapsed ? 'col-span-0' : 'col-span-2'} h-full transition-all duration-300`}>
            <LeftPanel
              isCollapsed={leftPanelCollapsed}
              setIsCollapsed={setLeftPanelCollapsed}
              baseMap={baseMap}
              setBaseMap={setBaseMap}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              isFloodLayerOn={isFloodLayerOn}
              setIsFloodLayerOn={setIsFloodLayerOn}
              floodOpacity={floodOpacity}
              setFloodOpacity={setFloodOpacity}
              showOnlyExposed={showOnlyExposed}
              setShowOnlyExposed={setShowOnlyExposed}
              selectionMode={selectionMode}
              setSelectionMode={setSelectionMode}
              onClearSelection={handleClearSelection}
            />
          </div>

          {/* Map View */}
          <div 
            className={`
              ${leftPanelCollapsed && rightPanelCollapsed ? 'col-span-12' : 
                leftPanelCollapsed || rightPanelCollapsed ? 'col-span-10' : 
                'col-span-8'}
              h-full transition-all duration-300 relative
            `}
            style={{ minWidth: '700px' }}
            data-testid="map-container"
          >
            <MapView
              assets={filteredAssets}
              baseMap={baseMap}
              activeFilters={activeFilters}
              isFloodLayerOn={isFloodLayerOn}
              floodOpacity={floodOpacity}
              showOnlyExposed={showOnlyExposed}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              onAssetClick={handleAssetClick}
            />
          </div>

          {/* Right Panel */}
          <div className={`${rightPanelCollapsed ? 'col-span-0' : 'col-span-2'} h-full transition-all duration-300`}>
            <RightPanel
              isCollapsed={rightPanelCollapsed}
              setIsCollapsed={setRightPanelCollapsed}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              selectedAssets={selectedAssets}
              isFloodLayerOn={isFloodLayerOn}
            />
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;

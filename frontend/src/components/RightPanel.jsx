import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Building, 
  MapPin,
  DollarSign,
  AlertTriangle,
  Calendar,
  Shield,
  Droplets,
  X,
  Printer,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { formatCurrency, ASSET_TYPES } from '../data/mockData';

export const RightPanel = ({
  isCollapsed,
  setIsCollapsed,
  selectedAsset,
  setSelectedAsset,
  selectedAssets,
  isFloodLayerOn,
}) => {
  const [activeTab, setActiveTab] = useState('selection');
  const [assetPage, setAssetPage] = useState(1);

  if (isCollapsed) {
    return (
      <div 
        className="w-12 bg-white border-l border-slate-200 h-full flex flex-col items-center py-4"
        data-testid="right-panel-collapsed"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="hover:bg-slate-100"
          data-testid="expand-right-panel-btn"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  const hasSelection = selectedAsset || (selectedAssets && selectedAssets.length > 0);
  const totalAssets = selectedAssets?.length || (selectedAsset ? 1 : 0);

  return (
    <div 
      className="w-full bg-white border-l border-slate-200 h-full flex flex-col"
      data-testid="right-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h2 className="font-barlow text-lg font-semibold text-slate-800">Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="hover:bg-slate-100 -mr-2"
          data-testid="collapse-right-panel-btn"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 p-1 mx-4 mt-2 max-w-[calc(100%-2rem)]">
          <TabsTrigger value="selection" className="text-xs" data-testid="selection-tab">
            Selection
          </TabsTrigger>
          <TabsTrigger value="details" className="text-xs" data-testid="details-tab">
            Property Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="selection" className="flex-1 p-4 mt-0">
          {!hasSelection ? (
            <EmptyState />
          ) : selectedAsset ? (
            <AssetCard 
              asset={selectedAsset} 
              onClose={() => setSelectedAsset(null)}
              isFloodLayerOn={isFloodLayerOn}
              page={assetPage}
              total={totalAssets}
              onPageChange={setAssetPage}
            />
          ) : (
            <SelectionSummary 
              assets={selectedAssets} 
              isFloodLayerOn={isFloodLayerOn}
            />
          )}
        </TabsContent>

        <TabsContent value="details" className="flex-1 p-4 mt-0">
          {!selectedAsset ? (
            <EmptyState type="property" />
          ) : (
            <PropertyDetails 
              asset={selectedAsset}
              isFloodLayerOn={isFloodLayerOn}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const EmptyState = ({ type = 'selection' }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-4" data-testid="empty-state">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
      <Building className="w-8 h-8 text-slate-400" />
    </div>
    <p className="text-sm text-slate-500">
      {type === 'selection' 
        ? 'Select an asset or area to view details.'
        : 'Click on an asset to view property details.'}
    </p>
  </div>
);

const AssetCard = ({ asset, onClose, isFloodLayerOn, page, total, onPageChange }) => {
  const assetType = ASSET_TYPES[asset.assetType];
  
  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden" data-testid="asset-card">
      {/* Card Header */}
      <div className="bg-[#0B1120] text-white p-3">
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant="outline" 
            className="text-xs bg-white/10 border-white/20 text-white"
          >
            {asset.assetId}
          </Badge>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-6 h-6 text-white/70 hover:text-white hover:bg-white/10">
              <Printer className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6 text-white/70 hover:text-white hover:bg-white/10">
              <Search className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6 text-white/70 hover:text-white hover:bg-white/10"
              onClick={onClose}
              data-testid="close-asset-btn"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 text-xs text-white/70">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-5 h-5 text-white/70 hover:text-white"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <span>{page} of {total}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-5 h-5 text-white/70 hover:text-white"
              disabled={page >= total}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 space-y-3">
        {/* Type */}
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: assetType?.color }}
          />
          <span className="text-sm font-medium text-slate-700">
            Type: {assetType?.name || asset.assetType}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-slate-600">{asset.address}</span>
        </div>

        <Separator />

        {/* GIV */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 uppercase">GIV</span>
          </div>
          <span className="font-barlow text-lg font-semibold text-slate-800">
            {formatCurrency(asset.giv)}
          </span>
        </div>

        {/* Risk Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 uppercase">Risk Score</span>
          </div>
          <Badge className={`font-barlow font-semibold ${getRiskColor(asset.riskScore)}`}>
            {asset.riskScore}
          </Badge>
        </div>

        {/* Flood Info (if flood layer is on) */}
        {isFloodLayerOn && asset.inFloodZone && (
          <>
            <Separator />
            <div className="p-2 bg-blue-50 rounded border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase">Flood Exposure</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Depth:</span>
                  <span className="ml-1 font-medium text-slate-700">{asset.floodDepth}m</span>
                </div>
                <div>
                  <span className="text-slate-500">Zone:</span>
                  <span className="ml-1 font-medium text-slate-700 capitalize">{asset.floodCategory}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SelectionSummary = ({ assets, isFloodLayerOn }) => {
  const totalGIV = assets.reduce((sum, a) => sum + a.giv, 0);
  const exposedCount = assets.filter(a => a.inFloodZone).length;

  return (
    <div className="space-y-4" data-testid="selection-summary">
      <div className="text-center">
        <div className="text-3xl font-barlow font-bold text-slate-800">{assets.length}</div>
        <div className="text-sm text-slate-500">Assets Selected</div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total GIV</span>
          <span className="font-semibold text-slate-800">{formatCurrency(totalGIV)}</span>
        </div>
        
        {isFloodLayerOn && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Exposed to Flood</span>
            <span className="font-semibold text-blue-600">{exposedCount}</span>
          </div>
        )}
      </div>

      <ScrollArea className="h-48 mt-4">
        <div className="space-y-2">
          {assets.slice(0, 10).map(asset => (
            <div 
              key={asset.assetId}
              className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
            >
              <span className="font-mono text-xs text-slate-600">{asset.assetId}</span>
              <span className="text-slate-800">{formatCurrency(asset.giv)}</span>
            </div>
          ))}
          {assets.length > 10 && (
            <div className="text-center text-xs text-slate-400 py-2">
              +{assets.length - 10} more assets
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const PropertyDetails = ({ asset, isFloodLayerOn }) => {
  const assetType = ASSET_TYPES[asset.assetType];

  return (
    <ScrollArea className="h-full" data-testid="property-details">
      <div className="space-y-4 pr-4">
        {/* Header */}
        <div>
          <h3 className="font-barlow text-lg font-semibold text-slate-800">{asset.assetId}</h3>
          <p className="text-sm text-slate-500">{asset.address}</p>
        </div>

        <Separator />

        {/* Basic Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Basic Information</h4>
          
          <DetailRow icon={Building} label="Asset Type" value={assetType?.name} />
          <DetailRow icon={Shield} label="Coverage Type" value={asset.coverageType} />
          <DetailRow icon={Calendar} label="Year Built" value={asset.yearBuilt} />
          <DetailRow icon={Building} label="Construction" value={asset.constructionType} />
        </div>

        <Separator />

        {/* Financial Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Financial</h4>
          
          <DetailRow icon={DollarSign} label="GIV" value={formatCurrency(asset.giv)} highlight />
          <DetailRow 
            icon={DollarSign} 
            label="PnL" 
            value={formatCurrency(asset.pnl)} 
            highlight
            valueColor={asset.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}
          />
        </div>

        <Separator />

        {/* Risk Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk Assessment</h4>
          
          <DetailRow icon={AlertTriangle} label="Risk Score" value={asset.riskScore} />
          
          {isFloodLayerOn && (
            <div className="p-3 bg-blue-50 rounded border border-blue-100 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase">Flood Risk</span>
              </div>
              {asset.inFloodZone ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <Badge variant="destructive" className="text-xs">In Flood Zone</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expected Depth</span>
                    <span className="font-medium">{asset.floodDepth}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Zone Category</span>
                    <span className="font-medium capitalize">{asset.floodCategory}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">Outside Flood Zone</Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

const DetailRow = ({ icon: Icon, label, value, highlight, valueColor }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
    <span className={`text-sm ${highlight ? 'font-semibold' : 'font-medium'} ${valueColor || 'text-slate-800'}`}>
      {value}
    </span>
  </div>
);

export default RightPanel;

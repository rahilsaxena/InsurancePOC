import { TrendingUp, TrendingDown, AlertTriangle, Building, Droplets } from 'lucide-react';
import { formatCurrency } from '../data/mockData';

export const KPIBar = ({ 
  kpis, 
  floodKPIs, 
  isFloodLayerOn, 
  kpiLabel,
  selectedAsset 
}) => {
  const showFloodKPIs = isFloodLayerOn && !selectedAsset;

  return (
    <div 
      className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm"
      data-testid="kpi-bar"
    >
      {/* KPI Label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {kpiLabel}
        </span>
        {isFloodLayerOn && (
          <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            <Droplets className="w-3 h-3" />
            Flood Layer Active
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4" data-testid="kpi-cards">
        {!showFloodKPIs ? (
          // Portfolio View KPIs
          <>
            <KPICard
              label="Total GIV"
              value={formatCurrency(kpis.totalGIV)}
              icon={<Building className="w-4 h-4" />}
              trend={null}
              testId="kpi-total-giv"
            />
            <KPICard
              label="Total PnL"
              value={formatCurrency(kpis.totalPnL)}
              icon={<TrendingDown className="w-4 h-4" />}
              trend={kpis.totalPnL >= 0 ? 'up' : 'down'}
              testId="kpi-total-pnl"
            />
            <KPICard
              label="Impacted GIV"
              value={formatCurrency(kpis.impactedGIV)}
              icon={<AlertTriangle className="w-4 h-4" />}
              trend={null}
              highlight="warning"
              testId="kpi-impacted-giv"
            />
            <KPICard
              label="Impacted PnL"
              value={formatCurrency(kpis.impactedPnL)}
              icon={<TrendingDown className="w-4 h-4" />}
              trend="down"
              highlight="danger"
              testId="kpi-impacted-pnl"
            />
            <KPICard
              label="Asset Count"
              value={kpis.assetCount.toString()}
              icon={<Building className="w-4 h-4" />}
              trend={null}
              testId="kpi-asset-count"
            />
          </>
        ) : (
          // Flood Layer KPIs
          <>
            <KPICard
              label="Flooded GIV"
              value={formatCurrency(floodKPIs.floodedGIV)}
              icon={<Droplets className="w-4 h-4" />}
              trend={null}
              highlight="flood"
              testId="kpi-flooded-giv"
            />
            <KPICard
              label="Est. Flood Loss"
              value={formatCurrency(floodKPIs.estimatedFloodLoss)}
              icon={<TrendingDown className="w-4 h-4" />}
              trend="down"
              highlight="danger"
              testId="kpi-flood-loss"
            />
            <KPICard
              label="Exposed Assets"
              value={floodKPIs.exposedAssetCount.toString()}
              icon={<AlertTriangle className="w-4 h-4" />}
              trend={null}
              highlight="warning"
              testId="kpi-exposed-assets"
            />
            <KPICard
              label="Median Depth"
              value={`${floodKPIs.medianFloodDepth.toFixed(1)}m`}
              icon={<Droplets className="w-4 h-4" />}
              trend={null}
              testId="kpi-median-depth"
            />
            <KPICard
              label="Total Assets"
              value={floodKPIs.totalAssets.toString()}
              icon={<Building className="w-4 h-4" />}
              trend={null}
              testId="kpi-total-assets"
            />
          </>
        )}
      </div>
    </div>
  );
};

const KPICard = ({ label, value, icon, trend, highlight, testId }) => {
  const getHighlightStyles = () => {
    switch (highlight) {
      case 'warning':
        return 'border-l-4 border-l-amber-500 bg-amber-50/50';
      case 'danger':
        return 'border-l-4 border-l-red-500 bg-red-50/50';
      case 'flood':
        return 'border-l-4 border-l-blue-500 bg-blue-50/50';
      default:
        return 'border-l-4 border-l-transparent';
    }
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-600';
  };

  return (
    <div 
      className={`p-3 rounded-sm bg-slate-50 ${getHighlightStyles()} transition-all hover:shadow-sm`}
      data-testid={testId}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`${getTrendColor()}`}>{icon}</span>
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={`font-barlow text-2xl font-semibold ${getTrendColor()}`}>
        {value}
      </div>
    </div>
  );
};

export default KPIBar;

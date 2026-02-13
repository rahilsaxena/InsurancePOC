import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Map, 
  Layers, 
  Filter, 
  MousePointer2,
  Lasso,
  Trash2,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Separator } from './ui/separator';
import { ASSET_TYPES, BASE_MAPS } from '../data/mockData';

export const LeftPanel = ({
  isCollapsed,
  setIsCollapsed,
  baseMap,
  setBaseMap,
  activeFilters,
  setActiveFilters,
  isFloodLayerOn,
  setIsFloodLayerOn,
  floodOpacity,
  setFloodOpacity,
  showOnlyExposed,
  setShowOnlyExposed,
  selectionMode,
  setSelectionMode,
  onClearSelection,
}) => {
  const [openSections, setOpenSections] = useState({
    baseMaps: true,
    filters: true,
    layers: true,
    selection: true,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFilter = (filterKey) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  if (isCollapsed) {
    return (
      <div 
        className="w-12 bg-white border-r border-slate-200 h-full flex flex-col items-center py-4 gap-4"
        data-testid="left-panel-collapsed"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="hover:bg-slate-100"
          data-testid="expand-panel-btn"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Separator />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <Map className="w-4 h-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Base Maps</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <Filter className="w-4 h-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Filters</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <Layers className="w-4 h-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Layers</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div 
      className="w-full bg-white border-r border-slate-200 h-full overflow-y-auto"
      data-testid="left-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h2 className="font-barlow text-lg font-semibold text-slate-800">Controls</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="hover:bg-slate-100 -mr-2"
          data-testid="collapse-panel-btn"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Base Maps Section */}
        <Collapsible open={openSections.baseMaps} onOpenChange={() => toggleSection('baseMaps')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              <span>Base Maps</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${openSections.baseMaps ? 'rotate-90' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-3">
            <div className="flex flex-wrap gap-2" data-testid="basemap-buttons">
              {Object.entries(BASE_MAPS).map(([key, map]) => (
                <Button
                  key={key}
                  variant={baseMap === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBaseMap(key)}
                  className={`text-xs ${baseMap === key ? 'bg-[#0B1120] hover:bg-[#1a2744]' : ''}`}
                  data-testid={`basemap-${key}-btn`}
                >
                  {map.name}
                </Button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Filters Section */}
        <Collapsible open={openSections.filters} onOpenChange={() => toggleSection('filters')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${openSections.filters ? 'rotate-90' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-3">
            <div className="space-y-2" data-testid="filter-checkboxes">
              {Object.entries(ASSET_TYPES).map(([key, type]) => (
                <div key={key} className="flex items-center gap-3">
                  <Checkbox
                    id={`filter-${key}`}
                    checked={activeFilters[key]}
                    onCheckedChange={() => toggleFilter(key)}
                    data-testid={`filter-${key}-checkbox`}
                  />
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: type.color }}
                  />
                  <Label 
                    htmlFor={`filter-${key}`}
                    className="text-sm text-slate-600 cursor-pointer"
                  >
                    {type.name}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Layers Section */}
        <Collapsible open={openSections.layers} onOpenChange={() => toggleSection('layers')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Layers</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${openSections.layers ? 'rotate-90' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-3 space-y-4">
            {/* Flood Expected Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-slate-700">Flood Expected</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>FEMA-style flood inundation layer showing expected flood zones and depths.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch
                  checked={isFloodLayerOn}
                  onCheckedChange={setIsFloodLayerOn}
                  data-testid="flood-layer-toggle"
                />
              </div>

              {isFloodLayerOn && (
                <>
                  {/* Opacity Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-500">Opacity</Label>
                      <span className="text-xs text-slate-500">{Math.round(floodOpacity * 100)}%</span>
                    </div>
                    <Slider
                      value={[floodOpacity]}
                      onValueChange={([value]) => setFloodOpacity(value)}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                      data-testid="flood-opacity-slider"
                    />
                  </div>

                  {/* Show Only Exposed */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="show-exposed"
                      checked={showOnlyExposed}
                      onCheckedChange={setShowOnlyExposed}
                      data-testid="show-exposed-checkbox"
                    />
                    <Label 
                      htmlFor="show-exposed"
                      className="text-sm text-slate-600 cursor-pointer"
                    >
                      Show only exposed assets
                    </Label>
                  </div>

                  {/* Flood Legend */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-sm">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                      Flood Expected - Zones & Depth
                    </h4>
                    <div className="space-y-2" data-testid="flood-legend">
                      <LegendItem 
                        color="#e8aeb3" 
                        pattern="solid"
                        label="Expected Inundation (Primary)" 
                      />
                      <LegendItem 
                        color="#bfe1ff" 
                        pattern="diagonal"
                        label="Secondary / Tidal Inundation" 
                      />
                      <LegendItem 
                        color="#fff3bf" 
                        pattern="dots"
                        label="Low depth / fringe inundation" 
                      />
                      <LegendItem 
                        color="transparent" 
                        border="#1e3a5f"
                        label="Flood boundary (shoreline/levee)" 
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Selection Tools Section */}
        <Collapsible open={openSections.selection} onOpenChange={() => toggleSection('selection')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
            <div className="flex items-center gap-2">
              <MousePointer2 className="w-4 h-4" />
              <span>Selection Tools</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${openSections.selection ? 'rotate-90' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-3 space-y-3">
            <div className="flex gap-2">
              <Button
                variant={selectionMode === 'lasso' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectionMode(selectionMode === 'lasso' ? null : 'lasso')}
                className={`flex-1 text-xs ${selectionMode === 'lasso' ? 'bg-[#0B1120] hover:bg-[#1a2744]' : ''}`}
                data-testid="lasso-tool-btn"
              >
                <Lasso className="w-3.5 h-3.5 mr-1" />
                Lasso / Polygon
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="w-full text-xs text-slate-600"
              data-testid="clear-selection-btn"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear Selection
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

const LegendItem = ({ color, pattern, border, label }) => {
  const getPatternStyle = () => {
    if (border) {
      return {
        backgroundColor: 'transparent',
        border: `2px solid ${border}`,
      };
    }
    
    switch (pattern) {
      case 'diagonal':
        return {
          backgroundColor: color,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.5) 2px,
            rgba(255,255,255,0.5) 4px
          )`,
        };
      case 'dots':
        return {
          backgroundColor: color,
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
        };
      default:
        return { backgroundColor: color };
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-5 h-4 rounded-sm flex-shrink-0"
        style={getPatternStyle()}
      />
      <span className="text-xs text-slate-600">{label}</span>
    </div>
  );
};

export default LeftPanel;

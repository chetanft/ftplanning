import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Info, 
  Package,
  ArrowUp,
  ArrowDown,
  Maximize2,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  ThumbsUp,
  XCircle
} from 'lucide-react';
import { generateStackingPlan } from '../utils/stackingOptimizer';
import { assessOrderFragility, FRAGILITY_DESCRIPTIONS } from '../utils/fragilityScoring';
import { getPackagingType, getPackagingIcon } from '../utils/packagingTypes';

/**
 * StackingVisualization - Layer-by-layer stacking diagram with fragility indication
 */
const StackingVisualization = ({ 
  orders = [], 
  vehicleSpecs = null,
  onItemClick = null,
  highlightedItemId = null
}) => {
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'layers', 'sequence'
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Generate stacking plan
  const stackingPlan = useMemo(() => {
    if (!orders || orders.length === 0 || !vehicleSpecs) {
      return null;
    }
    return generateStackingPlan(orders, vehicleSpecs);
  }, [orders, vehicleSpecs]);

  // Get color for fragility level
  const getFragilityColor = (score) => {
    return FRAGILITY_DESCRIPTIONS[score]?.color || '#6b7280';
  };

  // Get background color for fragility level
  const getFragilityBgColor = (score) => {
    return FRAGILITY_DESCRIPTIONS[score]?.bgColor || '#f3f4f6';
  };

  // Render 3D-like stacked view
  const render3DView = () => {
    if (!stackingPlan) return null;

    const layers = stackingPlan.visualizationData;
    const maxHeight = stackingPlan.summary.maxHeight || 2000;

    return (
      <div 
        className="relative p-4"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
      >
        {/* Vehicle outline */}
        <div className="relative mx-auto" style={{ maxWidth: '400px' }}>
          {/* Truck bed outline */}
          <div className="border-2 border-gray-300 rounded-lg bg-gray-50 p-2 relative">
            {/* Cab indicator */}
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-16 bg-gray-300 rounded-r-lg"></div>
            </div>

            {/* Layers stack (bottom to top) */}
            <div 
              className="flex flex-col-reverse"
              style={{ minHeight: '200px' }}
            >
              {layers.map((layer, index) => (
                <div
                  key={index}
                  className={`relative mb-1 p-2 rounded transition-all ${
                    selectedLayer === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: layer.color,
                    minHeight: `${Math.max(40, (layer.maxHeight / maxHeight) * 100)}px`
                  }}
                  onClick={() => setSelectedLayer(selectedLayer === index ? null : index)}
                >
                  {/* Layer label */}
                  <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    L{index + 1}
                  </div>

                  {/* Items in layer */}
                  <div className="flex flex-wrap gap-1">
                    {layer.items.map((item, itemIndex) => {
                      const isHighlighted = highlightedItemId === item.id;
                      
                      return (
                        <div
                          key={itemIndex}
                          className={`p-2 rounded cursor-pointer transition-all ${
                            isHighlighted 
                              ? 'ring-2 ring-blue-500 scale-105' 
                              : 'hover:scale-102'
                          }`}
                          style={{
                            backgroundColor: 'white',
                            borderLeft: `4px solid ${item.fragility.color}`,
                            minWidth: '60px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onItemClick) onItemClick(item);
                          }}
                          title={`${item.name}\nFragility: ${item.fragility.label}\nWeight: ${item.weight}kg`}
                        >
                          {(() => {
                            const IconComponent = getPackagingIcon(item.packagingType || 'corrugated_box');
                            return <IconComponent className="h-5 w-5 mb-1 text-muted-foreground" />;
                          })()}
                          {showLabels && (
                            <>
                              <div className="text-xs font-medium truncate max-w-16">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.weight}kg
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Layer stats */}
                  <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 text-right">
                    <div>{layer.stats.itemCount} items</div>
                    <div>{layer.stats.totalWeight}kg</div>
                  </div>

                  {/* Warnings */}
                  {showWarnings && layer.warnings.length > 0 && (
                    <div className="absolute -right-8 top-0">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </div>
                  )}
                </div>
              ))}

              {/* Floor indicator */}
              <div className="h-2 bg-gray-400 rounded-t mt-1"></div>
            </div>

            {/* Height indicator */}
            <div className="absolute -left-16 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
              <span>{maxHeight}mm</span>
              <span>0</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render layer-by-layer view
  const renderLayerView = () => {
    if (!stackingPlan) return null;

    return (
      <div className="space-y-4 p-4">
        {stackingPlan.visualizationData.map((layer, index) => (
          <div
            key={index}
            className={`border rounded-lg overflow-hidden ${
              selectedLayer === index ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            {/* Layer header */}
            <div 
              className="p-3 flex items-center justify-between cursor-pointer"
              style={{ backgroundColor: layer.color }}
              onClick={() => setSelectedLayer(selectedLayer === index ? null : index)}
            >
              <div className="flex items-center">
                <Layers className="h-4 w-4 mr-2 text-gray-600" />
                <span className="font-medium text-gray-800">{layer.layerLabel}</span>
                <span className="ml-2 text-sm text-gray-600">
                  ({layer.stats.itemCount} items, {layer.stats.totalWeight}kg)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {layer.warnings.length > 0 && (
                  <span className="flex items-center text-orange-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {layer.warnings.length}
                  </span>
                )}
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: getFragilityBgColor(Math.round(parseFloat(layer.stats.avgFragility))),
                    color: getFragilityColor(Math.round(parseFloat(layer.stats.avgFragility)))
                  }}
                >
                  Avg: {layer.stats.avgFragility}
                </span>
              </div>
            </div>

            {/* Layer content */}
            {(selectedLayer === index || selectedLayer === null) && (
              <div className="p-3 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {layer.items.map((item, itemIndex) => {
                    const isHighlighted = highlightedItemId === item.id;
                    
                    return (
                      <div
                        key={itemIndex}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isHighlighted 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                        }`}
                        onClick={() => onItemClick && onItemClick(item)}
                      >
                        <div className="flex items-center mb-2">
                          {(() => {
                            const IconComponent = getPackagingIcon(item.packagingType || 'corrugated_box');
                            return <IconComponent className="h-5 w-5 mr-2 text-muted-foreground" />;
                          })()}
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fragility.color }}
                            title={`Fragility: ${item.fragility.label}`}
                          />
                        </div>
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.quantity}x • {item.weight}kg
                        </div>
                        <div 
                          className="text-xs mt-1"
                          style={{ color: item.fragility.color }}
                        >
                          {item.fragility.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Layer warnings */}
                {showWarnings && layer.warnings.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {layer.warnings.map((warning, wIndex) => (
                      <div 
                        key={wIndex}
                        className="flex items-center text-sm text-orange-600 bg-orange-50 rounded p-2"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {warning.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render loading sequence view
  const renderSequenceView = () => {
    if (!stackingPlan) return null;

    return (
      <div className="p-4">
        <div className="space-y-2">
          {stackingPlan.sequence.map((step, index) => {
            const isHighlighted = highlightedItemId === step.itemId;
            
            return (
              <div
                key={index}
                className={`flex items-start p-3 rounded-lg border transition-all ${
                  isHighlighted 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onItemClick && onItemClick(step)}
              >
                {/* Step number */}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 flex-shrink-0"
                  style={{ backgroundColor: step.fragility.color }}
                >
                  {step.loadingOrder}
                </div>

                {/* Step details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-gray-900">
                      {step.seller || step.itemId}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({step.quantity}x, {step.weight}kg)
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-1">
                    {step.instructions.slice(0, 3).map((instruction, iIndex) => (
                      <div 
                        key={iIndex}
                        className="text-sm text-gray-600 flex items-center"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2" />
                        {instruction}
                      </div>
                    ))}
                  </div>

                  {/* Warnings */}
                  {step.warnings.length > 0 && (
                    <div className="mt-2">
                      {step.warnings.map((warning, wIndex) => (
                        <div 
                          key={wIndex}
                          className="text-sm text-orange-600 flex items-center"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Layer indicator */}
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="text-xs text-gray-400">Layer {step.layer}</div>
                  <div 
                    className="text-xs px-2 py-0.5 rounded mt-1"
                    style={{ 
                      backgroundColor: getFragilityBgColor(step.fragility.score),
                      color: step.fragility.color
                    }}
                  >
                    {step.fragility.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render stability summary
  const renderStabilitySummary = () => {
    if (!stackingPlan) return null;

    const stability = stackingPlan.stability;

    return (
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Stability Analysis</h4>
          <div className="flex items-center">
            {(() => {
              const iconMap = {
                'CheckCircle': CheckCircle,
                'ThumbsUp': ThumbsUp,
                'AlertTriangle': AlertTriangle,
                'XCircle': XCircle
              };
              const IconComponent = iconMap[stability.rating.iconName] || CheckCircle;
              return <IconComponent className="h-6 w-6 mr-2" style={{ color: stability.rating.color }} />;
            })()}
            <span 
              className="font-bold text-xl"
              style={{ color: stability.rating.color }}
            >
              {Math.round(stability.overallScore)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div 
              className="text-lg font-bold"
              style={{ color: stability.weightDistribution.score >= 70 ? '#22c55e' : '#eab308' }}
            >
              {stability.weightDistribution.score}%
            </div>
            <div className="text-xs text-gray-500">Weight Dist.</div>
          </div>
          <div className="text-center">
            <div 
              className="text-lg font-bold"
              style={{ color: stability.fragilityProgression.score >= 80 ? '#22c55e' : '#eab308' }}
            >
              {stability.fragilityProgression.score}%
            </div>
            <div className="text-xs text-gray-500">Fragility Order</div>
          </div>
          <div className="text-center">
            <div 
              className="text-lg font-bold"
              style={{ color: stability.stackingCompatibility.score >= 80 ? '#22c55e' : '#eab308' }}
            >
              {stability.stackingCompatibility.score}%
            </div>
            <div className="text-xs text-gray-500">Compatibility</div>
          </div>
        </div>

        {stability.warnings.length > 0 && (
          <div className="mt-3 space-y-1">
            {stability.warnings.slice(0, 2).map((warning, index) => (
              <div key={index} className="flex items-center text-sm text-orange-600">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                {warning}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Layers className="h-5 w-5 text-blue-500 mr-2" />
            Stacking Visualization
          </h3>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-2 rounded ${showLabels ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              title={showLabels ? 'Hide Labels' : 'Show Labels'}
            >
              {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setShowWarnings(!showWarnings)}
              className={`p-2 rounded ${showWarnings ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
              title={showWarnings ? 'Hide Warnings' : 'Show Warnings'}
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
            <div className="border-l border-gray-200 h-6 mx-1" />
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-500">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex space-x-1 mt-3">
          {[
            { id: '3d', label: '3D View', icon: Maximize2 },
            { id: 'layers', label: 'Layers', icon: Layers },
            { id: 'sequence', label: 'Sequence', icon: ArrowDown }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <mode.icon className="h-4 w-4 mr-1" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* No data message */}
      {(!orders || orders.length === 0 || !vehicleSpecs) && (
        <div className="p-8 text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Add orders and select a vehicle to see the stacking visualization</p>
        </div>
      )}

      {/* Stability summary */}
      {stackingPlan && renderStabilitySummary()}

      {/* Main content */}
      <div className="overflow-auto" style={{ maxHeight: '500px' }}>
        {viewMode === '3d' && render3DView()}
        {viewMode === 'layers' && renderLayerView()}
        {viewMode === 'sequence' && renderSequenceView()}
      </div>

      {/* Legend */}
      {stackingPlan && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center space-x-4 text-xs">
            <span className="text-gray-500">Fragility:</span>
            {[1, 2, 3, 4, 5].map(level => (
              <div key={level} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: getFragilityColor(level) }}
                />
                <span className="text-gray-600">{level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StackingVisualization;



import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Shield,
  Snowflake,
  Package,
  DollarSign,
  TrendingUp,
  Layers,
  Info
} from 'lucide-react';
import { getVehicleRecommendations, analyzeVehicleSuitability } from '../services/vehicleRecommendation';
import { generateStackingPlan } from '../utils/stackingOptimizer';
import { assessOrderFragility } from '../utils/fragilityScoring';

/**
 * AIRecommendationsPanel - Displays AI-powered vehicle and loading recommendations
 */
const AIRecommendationsPanel = ({ 
  orders = [], 
  vehicleTypes = [],
  selectedVehicle = null,
  onSelectVehicle = null,
  onApplyRecommendation = null
}) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState(0);
  const [showStackingPlan, setShowStackingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState('vehicles');

  // Generate vehicle recommendations
  const recommendations = useMemo(() => {
    if (!orders || orders.length === 0 || !vehicleTypes || vehicleTypes.length === 0) {
      return [];
    }
    return getVehicleRecommendations(orders, vehicleTypes);
  }, [orders, vehicleTypes]);

  // Generate stacking plan for selected vehicle
  const stackingPlan = useMemo(() => {
    if (!selectedVehicle || !orders || orders.length === 0) return null;
    const vehicle = vehicleTypes.find(v => v.id === selectedVehicle) || vehicleTypes[0];
    return generateStackingPlan(orders, vehicle);
  }, [selectedVehicle, orders, vehicleTypes]);

  // Calculate cargo profile summary
  const cargoProfile = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    const fragilityScores = orders.map(o => assessOrderFragility(o).score);
    const totalWeight = orders.reduce((sum, o) => sum + (o.weight * (o.quantity || 1)), 0);
    
    return {
      totalOrders: orders.length,
      totalWeight: totalWeight,
      avgFragility: (fragilityScores.reduce((a, b) => a + b, 0) / fragilityScores.length).toFixed(1),
      maxFragility: Math.max(...fragilityScores),
      hasFragile: fragilityScores.some(s => s >= 4),
      hasTemperatureControl: orders.some(o => o.temperatureControlled),
      hasHazardous: orders.some(o => o.hazardous)
    };
  }, [orders]);

  // Render score bar
  const ScoreBar = ({ score, label, color = 'blue' }) => (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-gray-500 w-20">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color}-500 rounded-full transition-all`}
          style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
        />
      </div>
      <span className="text-xs font-medium w-8">{Math.round(score)}</span>
    </div>
  );

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#84cc16';
    if (score >= 40) return '#eab308';
    return '#ef4444';
  };

  // Render vehicle recommendation card
  const renderRecommendationCard = (rec, index) => {
    const isExpanded = expandedRecommendation === index;
    const isSelected = selectedVehicle === rec.vehicle.id;

    return (
      <div 
        key={rec.vehicle.id}
        className={`border rounded-lg overflow-hidden transition-all ${
          isSelected 
            ? 'border-blue-500 ring-2 ring-blue-200' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Header */}
        <div 
          className={`p-4 cursor-pointer ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
          onClick={() => setExpandedRecommendation(isExpanded ? -1 : index)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                rec.isTopChoice ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {rec.vehicle.climateControl ? (
                  <Snowflake className={`h-5 w-5 ${rec.isTopChoice ? 'text-green-600' : 'text-gray-500'}`} />
                ) : (
                  <Truck className={`h-5 w-5 ${rec.isTopChoice ? 'text-green-600' : 'text-gray-500'}`} />
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-900">{rec.vehicle.name}</h4>
                  {rec.isTopChoice && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Top Choice
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{rec.vehicle.category}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-bold text-lg" style={{ color: rec.matchQuality.color }}>
                  {Math.round(rec.totalScore)}
                </span>
              </div>
              <span 
                className="text-xs font-medium"
                style={{ color: rec.matchQuality.color }}
              >
                {rec.matchQuality.label}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center mt-3 space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <Package className="h-3 w-3 mr-1" />
              {rec.vehicleCount}x needed
            </span>
            <span className="flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              ₹{rec.estimatedCost.toLocaleString()}
            </span>
            {rec.vehicle.suspensionQuality >= 4 && (
              <span className="flex items-center text-blue-600">
                <Shield className="h-3 w-3 mr-1" />
                Premium
              </span>
            )}
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            {/* Score breakdown */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Score Breakdown</h5>
              <div className="space-y-2">
                {Object.entries(rec.recommendation.scoreBreakdown).map(([key, value]) => (
                  <ScoreBar key={key} label={key} score={value} />
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mb-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-700">{rec.recommendation.summary}</p>
            </div>

            {/* Reasons */}
            {rec.recommendation.reasons.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Advantages
                </h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {rec.recommendation.reasons.map((reason, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {rec.recommendation.warnings.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                  Considerations
                </h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {rec.recommendation.warnings.map((warning, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Features */}
            {rec.recommendation.features.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Key Features</h5>
                <div className="flex flex-wrap gap-2">
                  {rec.recommendation.features.map((feature, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event from bubbling to parent
                console.log('Applying recommendation:', rec.vehicle.name);
                if (onSelectVehicle) onSelectVehicle(rec.vehicle.id);
                if (onApplyRecommendation) onApplyRecommendation(rec);
              }}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isSelected ? 'Selected' : 'Select This Vehicle'}
            </button>
          </div>
        )}

        {/* Collapse/Expand indicator */}
        <button
          onClick={() => setExpandedRecommendation(isExpanded ? -1 : index)}
          className="w-full py-2 flex items-center justify-center text-gray-400 hover:text-gray-600 border-t border-gray-200"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  };

  // Render stacking plan overview
  const renderStackingPlan = () => {
    if (!stackingPlan) return null;

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stackingPlan.summary.totalLayers}
              </div>
              <div className="text-xs text-gray-500">Layers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stackingPlan.summary.totalItems}
              </div>
              <div className="text-xs text-gray-500">Items</div>
            </div>
            <div>
              <div 
                className="text-2xl font-bold"
                style={{ color: stackingPlan.stability.rating.color }}
              >
                {Math.round(stackingPlan.stability.overallScore)}
              </div>
              <div className="text-xs text-gray-500">Stability</div>
            </div>
          </div>
        </div>

        {/* Stability analysis */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3 flex items-center">
            {stackingPlan.stability.rating.icon}
            <span className="ml-2">Stability: {stackingPlan.stability.rating.label}</span>
          </h5>

          <div className="space-y-2">
            <ScoreBar 
              label="Weight" 
              score={stackingPlan.stability.weightDistribution.score} 
            />
            <ScoreBar 
              label="Fragility" 
              score={stackingPlan.stability.fragilityProgression.score} 
            />
            <ScoreBar 
              label="Compat." 
              score={stackingPlan.stability.stackingCompatibility.score} 
            />
          </div>

          {stackingPlan.stability.warnings.length > 0 && (
            <div className="mt-3 space-y-2">
              {stackingPlan.stability.warnings.map((warning, i) => (
                <div key={i} className="flex items-center text-sm text-orange-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {warning}
                </div>
              ))}
            </div>
          )}

          {stackingPlan.stability.recommendations.length > 0 && (
            <div className="mt-3 space-y-2">
              {stackingPlan.stability.recommendations.map((rec, i) => (
                <div key={i} className="flex items-center text-sm text-blue-600">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {rec}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Layer visualization */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Stacking Layers</h5>
          <div className="space-y-2">
            {stackingPlan.visualizationData.map((layer, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg"
                style={{ backgroundColor: layer.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{layer.layerLabel}</span>
                  <span className="text-sm text-gray-500">
                    {layer.stats.itemCount} items • {layer.stats.totalWeight}kg
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {layer.items.map((item, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 bg-white rounded text-xs flex items-center"
                      style={{ borderLeft: `3px solid ${item.fragility.color}` }}
                    >
                      {item.packagingIcon} {item.name}
                    </span>
                  ))}
                </div>
                {layer.warnings.length > 0 && (
                  <div className="mt-2 text-xs text-orange-600">
                    {layer.warnings.map((w, i) => (
                      <span key={i}>{w.message}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render cargo profile summary
  const renderCargoProfile = () => {
    if (!cargoProfile) return null;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Cargo Profile</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Orders:</span>
            <span className="font-medium">{cargoProfile.totalOrders}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Weight:</span>
            <span className="font-medium">{cargoProfile.totalWeight.toFixed(0)}kg</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Avg Fragility:</span>
            <span className="font-medium">{cargoProfile.avgFragility}/5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Max Fragility:</span>
            <span className="font-medium">{cargoProfile.maxFragility}/5</span>
          </div>
        </div>
        
        {/* Special requirements badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {cargoProfile.hasFragile && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Fragile Items
            </span>
          )}
          {cargoProfile.hasTemperatureControl && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center">
              <Snowflake className="h-3 w-3 mr-1" />
              Temp Control
            </span>
          )}
          {cargoProfile.hasHazardous && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Hazardous
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
          AI Recommendations
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Smart suggestions based on cargo fragility and requirements
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'vehicles'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Truck className="h-4 w-4 inline mr-1" />
          Vehicle Recommendations
        </button>
        <button
          onClick={() => setActiveTab('stacking')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'stacking'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="h-4 w-4 inline mr-1" />
          Stacking Plan
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Cargo profile summary */}
        {renderCargoProfile()}

        {/* No orders message */}
        {(!orders || orders.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Select orders to see AI recommendations</p>
          </div>
        )}

        {/* Vehicle recommendations tab */}
        {activeTab === 'vehicles' && orders.length > 0 && (
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => renderRecommendationCard(rec, index))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No suitable vehicles found for this cargo</p>
              </div>
            )}
          </div>
        )}

        {/* Stacking plan tab */}
        {activeTab === 'stacking' && orders.length > 0 && (
          <div>
            {selectedVehicle ? (
              renderStackingPlan()
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a vehicle to see the stacking plan</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationsPanel;


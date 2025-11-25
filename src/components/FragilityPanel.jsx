import React, { useState, useMemo } from 'react';
import { AlertTriangle, Package, Shield, Thermometer, Droplets, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { FRAGILITY_DESCRIPTIONS, MATERIAL_PROFILES, assessOrderFragility } from '../utils/fragilityScoring';
import { PACKAGING_TYPES, getPackagingType, recommendPackaging } from '../utils/packagingTypes';
import { fragilityLevels, materialProfileOptions, packagingTypeOptions } from '../data/mockData';

/**
 * FragilityPanel - Component for viewing and editing fragility/packaging settings
 */
const FragilityPanel = ({ 
  orders = [], 
  selectedOrder = null, 
  onUpdateOrder = null,
  onBulkUpdate = null,
  readOnly = false 
}) => {
  const [expandedSection, setExpandedSection] = useState('fragility');
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Calculate fragility summary for all orders
  const fragilitySummary = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    const scores = orders.map(o => {
      const assessment = assessOrderFragility(o);
      return assessment.score;
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    scores.forEach(s => distribution[s] = (distribution[s] || 0) + 1);

    return {
      average: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      max: Math.max(...scores),
      distribution,
      hasFragile: scores.some(s => s >= 4),
      hasExtremelyFragile: scores.includes(5),
      totalOrders: orders.length
    };
  }, [orders]);

  // Get current order's fragility assessment
  const currentAssessment = useMemo(() => {
    if (!selectedOrder) return null;
    return assessOrderFragility(selectedOrder);
  }, [selectedOrder]);

  // Get packaging recommendations
  const packagingRecommendations = useMemo(() => {
    if (!selectedOrder) return [];
    const fragility = currentAssessment?.score || 2;
    return recommendPackaging(fragility, {
      moistureProtection: selectedOrder.moistureSensitive,
      temperatureControl: selectedOrder.temperatureControlled,
      heavyDuty: (selectedOrder.weight * (selectedOrder.quantity || 1)) > 50
    });
  }, [selectedOrder, currentAssessment]);

  // Handle fragility score change
  const handleFragilityChange = (score) => {
    if (readOnly || !onUpdateOrder || !selectedOrder) return;
    onUpdateOrder(selectedOrder.id, { fragilityScore: score });
  };

  // Handle packaging type change
  const handlePackagingChange = (packagingType) => {
    if (readOnly || !onUpdateOrder || !selectedOrder) return;
    onUpdateOrder(selectedOrder.id, { packagingType });
  };

  // Handle material profile change
  const handleProfileChange = (materialProfile) => {
    if (readOnly || !onUpdateOrder || !selectedOrder) return;
    const profile = MATERIAL_PROFILES[materialProfile];
    onUpdateOrder(selectedOrder.id, { 
      materialProfile,
      fragilityScore: profile?.baseFragility || 2
    });
  };

  // Render fragility level selector
  const renderFragilitySelector = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Fragility Level
      </label>
      <div className="grid grid-cols-5 gap-2">
        {fragilityLevels.map(level => {
          const isSelected = currentAssessment?.score === level.score;
          return (
            <button
              key={level.score}
              onClick={() => handleFragilityChange(level.score)}
              disabled={readOnly}
              className={`p-2 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-current shadow-md scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              } ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              style={{ 
                borderColor: isSelected ? level.color : undefined,
                backgroundColor: isSelected ? `${level.color}15` : undefined
              }}
              title={level.description}
            >
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: level.color }}
              >
                {level.score}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {level.label}
              </div>
            </button>
          );
        })}
      </div>
      
      {currentAssessment && (
        <div 
          className="p-3 rounded-lg mt-2"
          style={{ backgroundColor: `${currentAssessment.color}15` }}
        >
          <div className="flex items-center">
            <Shield 
              className="h-5 w-5 mr-2" 
              style={{ color: currentAssessment.color }}
            />
            <span className="font-medium" style={{ color: currentAssessment.color }}>
              {currentAssessment.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {currentAssessment.description}
          </p>
        </div>
      )}
    </div>
  );

  // Render packaging selector
  const renderPackagingSelector = () => {
    const currentPackaging = selectedOrder?.packagingType || 'corrugated_box';
    const packagingInfo = getPackagingType(currentPackaging);

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Packaging Type
        </label>
        <select
          value={currentPackaging}
          onChange={(e) => handlePackagingChange(e.target.value)}
          disabled={readOnly}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {packagingTypeOptions.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>

        {packagingInfo && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{packagingInfo.icon}</span>
              <span className="text-sm text-gray-500">{packagingInfo.description}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <Package className="h-3 w-3 mr-1 text-gray-400" />
                <span>Crush: {packagingInfo.protection.crush}/5</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1 text-gray-400" />
                <span>Shock: {packagingInfo.protection.shock}/5</span>
              </div>
              <div className="flex items-center">
                <Droplets className="h-3 w-3 mr-1 text-gray-400" />
                <span>Moisture: {packagingInfo.protection.moisture}/5</span>
              </div>
              <div className="flex items-center">
                <Thermometer className="h-3 w-3 mr-1 text-gray-400" />
                <span>Temp: {packagingInfo.protection.temperature}/5</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Max stack: {packagingInfo.stackability.maxStackWeight}kg, {packagingInfo.stackability.maxStackLayers} layers
            </div>
          </div>
        )}

        {/* Packaging recommendations */}
        {showRecommendations && packagingRecommendations.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Recommended Packaging:
            </div>
            <div className="space-y-2">
              {packagingRecommendations.slice(0, 3).map((rec, idx) => (
                <button
                  key={rec.packaging.id}
                  onClick={() => handlePackagingChange(rec.packaging.id)}
                  disabled={readOnly}
                  className="w-full p-2 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {rec.packaging.icon} {rec.packaging.label}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      {rec.suitabilityScore}% match
                    </span>
                  </div>
                  {rec.reasons.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {rec.reasons.slice(0, 2).join(', ')}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showRecommendations ? 'Hide recommendations' : 'Show recommendations'}
        </button>
      </div>
    );
  };

  // Render material profile selector
  const renderProfileSelector = () => {
    const currentProfile = selectedOrder?.materialProfile || 'GENERAL';

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Material Profile
        </label>
        <select
          value={currentProfile}
          onChange={(e) => handleProfileChange(e.target.value)}
          disabled={readOnly}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {materialProfileOptions.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.label} (Fragility: {opt.fragilityScore})
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Render summary for all orders
  const renderSummary = () => {
    if (!fragilitySummary) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Load Fragility Summary</h4>
        
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{fragilitySummary.average}</div>
            <div className="text-xs text-gray-500">Avg Fragility</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{fragilitySummary.totalOrders}</div>
            <div className="text-xs text-gray-500">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: FRAGILITY_DESCRIPTIONS[fragilitySummary.max]?.color }}>
              {fragilitySummary.max}
            </div>
            <div className="text-xs text-gray-500">Max Fragility</div>
          </div>
        </div>

        {/* Distribution bar */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500 mb-1">Distribution:</div>
          <div className="flex h-6 rounded-lg overflow-hidden">
            {[1, 2, 3, 4, 5].map(level => {
              const count = fragilitySummary.distribution[level] || 0;
              const percentage = (count / fragilitySummary.totalOrders) * 100;
              if (percentage === 0) return null;
              
              return (
                <div
                  key={level}
                  className="flex items-center justify-center text-xs text-white font-medium"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: fragilityLevels.find(l => l.score === level)?.color,
                    minWidth: percentage > 0 ? '20px' : 0
                  }}
                  title={`Level ${level}: ${count} orders (${percentage.toFixed(1)}%)`}
                >
                  {percentage >= 10 ? count : ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warnings */}
        {fragilitySummary.hasExtremelyFragile && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">
              Contains extremely fragile items - special handling required
            </span>
          </div>
        )}

        {fragilitySummary.hasFragile && !fragilitySummary.hasExtremelyFragile && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center">
            <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm text-orange-700">
              Contains fragile items - careful handling required
            </span>
          </div>
        )}
      </div>
    );
  };

  // Collapsible section component
  const Section = ({ id, title, icon: Icon, children }) => {
    const isExpanded = expandedSection === id;
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center">
            <Icon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="font-medium text-gray-700">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="p-4 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Fragility & Packaging</h3>
        {!readOnly && selectedOrder && (
          <span className="text-sm text-gray-500">
            Editing: {selectedOrder.id}
          </span>
        )}
      </div>

      {/* Summary for all orders */}
      {renderSummary()}

      {/* No order selected message */}
      {!selectedOrder && (
        <div className="text-center py-8 text-gray-500">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select an order to view and edit fragility settings</p>
        </div>
      )}

      {/* Order-specific settings */}
      {selectedOrder && (
        <div className="space-y-3">
          <Section id="fragility" title="Fragility Level" icon={Shield}>
            {renderFragilitySelector()}
          </Section>

          <Section id="packaging" title="Packaging Type" icon={Package}>
            {renderPackagingSelector()}
          </Section>

          <Section id="profile" title="Material Profile" icon={Info}>
            {renderProfileSelector()}
          </Section>
        </div>
      )}
    </div>
  );
};

export default FragilityPanel;



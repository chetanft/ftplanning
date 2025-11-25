import React, { useState } from 'react';
import { Settings, Weight, Ruler, Package, AlertTriangle, Info, Cpu, Thermometer, Shield, Sliders, Truck } from 'lucide-react';

const ConstraintsPanel = ({ constraints, onConstraintsChange }) => {
  const [localConstraints, setLocalConstraints] = useState(constraints);
  const [activeSection, setActiveSection] = useState('load-planning');

  const handleConstraintChange = (key, value) => {
    const updated = { ...localConstraints, [key]: value };
    setLocalConstraints(updated);
    onConstraintsChange(updated);
  };

  const handleStackingRuleChange = (category, rule, value) => {
    const updated = {
      ...localConstraints,
      stackingRules: {
        ...localConstraints.stackingRules,
        [category]: {
          ...localConstraints.stackingRules?.[category],
          [rule]: value
        }
      }
    };
    setLocalConstraints(updated);
    onConstraintsChange(updated);
  };

  // Section tabs
  const sections = [
    { id: 'load-planning', label: 'Load Planning', icon: Package },
    { id: 'fragility-packaging', label: 'Fragility & Packaging', icon: Shield },
    { id: 'vehicle-optimization', label: 'Vehicle Optimization', icon: Truck },
    { id: 'advanced-ai', label: 'Advanced AI', icon: Cpu }
  ];

  // Load Planning Rules
  const loadPlanningItems = [
    {
      key: 'defaultStackingLogic',
      label: 'Default Stacking Logic',
      type: 'select',
      value: localConstraints.defaultStackingLogic || 'lifo',
      options: [
        { value: 'lifo', label: 'LIFO (Last In, First Out)' },
        { value: 'fifo', label: 'FIFO (First In, First Out)' }
      ],
      description: 'Default sequence for loading and unloading items'
    },
    {
      key: 'fullCoverageBaseRequired',
      label: 'Full Coverage Base Required',
      type: 'boolean',
      value: localConstraints.fullCoverageBaseRequired ?? true,
      description: 'Items must have full support from items below'
    },
    {
      key: 'maxOverhangTolerance',
      label: 'Maximum Overhang Tolerance (mm)',
      type: 'number',
      value: localConstraints.maxOverhangTolerance || 50,
      description: 'Allowed overhang in millimeters for stacked items'
    },
    {
      key: 'centerOfGravityEnabled',
      label: 'Center of Gravity Threshold',
      type: 'boolean',
      value: localConstraints.centerOfGravityEnabled ?? true,
      description: 'Enable center of gravity validation for load safety'
    },
    {
      key: 'centerOfGravityLimit',
      label: 'COG Height Limit (%)',
      type: 'number',
      value: localConstraints.centerOfGravityLimit || 60,
      description: 'Maximum COG height as percentage of vehicle height',
      showIf: localConstraints.centerOfGravityEnabled
    },
    {
      key: 'maxVerticalStackingLevels',
      label: 'Max Vertical Stacking Levels',
      type: 'number',
      value: localConstraints.maxVerticalStackingLevels || 4,
      description: 'Maximum number of items that can be stacked vertically'
    },
    {
      key: 'loadBearingEnforcement',
      label: 'Load Bearing Enforcement',
      type: 'boolean',
      value: localConstraints.loadBearingEnforcement ?? true,
      description: 'Enforce maximum weight limits on stacked items'
    },
    {
      key: 'stackIncompatibilityOverride',
      label: 'Stack Incompatibility Override',
      type: 'boolean',
      value: localConstraints.stackIncompatibilityOverride ?? false,
      description: 'Allow override of stacking incompatibility rules (use with caution)'
    }
  ];

  // Fragility & Packaging Settings
  const fragilityPackagingItems = [
    {
      key: 'fragilityScaleMax',
      label: 'Fragility Scoring System',
      type: 'select',
      value: localConstraints.fragilityScaleMax || 5,
      options: [
        { value: 3, label: '1-3 Scale (Simple)' },
        { value: 5, label: '1-5 Scale (Standard)' },
        { value: 10, label: '1-10 Scale (Detailed)' }
      ],
      description: 'Fragility scoring scale for items'
    },
    {
      key: 'defaultPackagingProtection',
      label: 'Default Packaging Protection Score',
      type: 'number',
      value: localConstraints.defaultPackagingProtection || 3,
      min: 1,
      max: 5,
      description: 'Default protection score for unspecified packaging'
    },
    {
      key: 'enforcePackagingCompatibility',
      label: 'Packaging Compatibility Matrix',
      type: 'boolean',
      value: localConstraints.enforcePackagingCompatibility ?? true,
      description: 'Enforce packaging compatibility rules during stacking'
    },
    {
      key: 'safetyMarginBuffer',
      label: 'Safety Margin Buffer (%)',
      type: 'number',
      value: localConstraints.safetyMarginBuffer || 10,
      description: 'Buffer percentage for crush resistance calculations'
    },
    {
      key: 'maxCrushPressure',
      label: 'Max Allowable Crush Pressure (kg/m²)',
      type: 'number',
      value: localConstraints.maxCrushPressure || 500,
      description: 'Maximum pressure allowed on fragile items'
    },
    {
      key: 'fragileHeavyMixAlert',
      label: 'Fragile + Heavy Mix Alert Threshold',
      type: 'select',
      value: localConstraints.fragileHeavyMixAlert || 'medium',
      options: [
        { value: 'low', label: 'Low (Alert at fragility diff > 1)' },
        { value: 'medium', label: 'Medium (Alert at fragility diff > 2)' },
        { value: 'high', label: 'High (Alert at fragility diff > 3)' },
        { value: 'off', label: 'Off (No alerts)' }
      ],
      description: 'Alert threshold for mixing fragile and heavy items'
    }
  ];

  // Vehicle Optimization Parameters
  const vehicleOptimizationItems = [
    {
      key: 'optimizationGoal',
      label: 'Optimization Goal',
      type: 'select',
      value: localConstraints.optimizationGoal || 'balanced',
      options: [
        { value: 'cost', label: 'Minimize Cost' },
        { value: 'space', label: 'Maximize Space Utilization' },
        { value: 'weight', label: 'Optimize Weight Distribution' },
        { value: 'minVehicles', label: 'Minimize Vehicles' },
        { value: 'balanced', label: 'Balanced (All Factors)' }
      ],
      description: 'Primary goal for vehicle optimization algorithm'
    },
    {
      key: 'aiVehicleSelection',
      label: 'AI-based Vehicle Selection',
      type: 'boolean',
      value: localConstraints.aiVehicleSelection ?? true,
      description: 'Enable AI to automatically select optimal vehicles'
    },
    {
      key: 'vehicleScoringWeights',
      label: 'Vehicle Scoring Weights',
      type: 'weights',
      value: localConstraints.vehicleScoringWeights || {
        cost: 30,
        volumeUtilization: 25,
        weightUtilization: 25,
        routeEfficiency: 20
      },
      description: 'Customize weightage for vehicle scoring formula'
    },
    {
      key: 'requireSuspensionType',
      label: 'Suspension Requirement',
      type: 'select',
      value: localConstraints.requireSuspensionType || 'any',
      options: [
        { value: 'any', label: 'Any Suspension' },
        { value: 'air', label: 'Air Suspension Required' },
        { value: 'leaf', label: 'Leaf Spring OK' }
      ],
      description: 'Vehicle suspension requirement for fragile goods'
    },
    {
      key: 'climateControlRequired',
      label: 'Climate Control',
      type: 'select',
      value: localConstraints.climateControlRequired || 'none',
      options: [
        { value: 'none', label: 'Not Required' },
        { value: 'refrigerated', label: 'Refrigerated (Cold Chain)' },
        { value: 'heated', label: 'Heated' },
        { value: 'temperatureControlled', label: 'Temperature Controlled' }
      ],
      description: 'Climate control requirements for sensitive cargo'
    }
  ];

  // Advanced AI Behavior
  const advancedAIItems = [
    {
      key: 'enableAISmartLoading',
      label: 'Enable AI Smart Loading',
      type: 'boolean',
      value: localConstraints.enableAISmartLoading ?? true,
      description: 'AI-powered intelligent load optimization'
    },
    {
      key: 'protectedZoneEnforcement',
      label: 'Protected Zone Enforcement',
      type: 'boolean',
      value: localConstraints.protectedZoneEnforcement ?? true,
      description: 'Reserve protected zones for fragile/sensitive items'
    },
    {
      key: 'fragilityWeightInPlacement',
      label: 'Fragility Weight in Placement (%)',
      type: 'number',
      value: localConstraints.fragilityWeightInPlacement || 40,
      min: 0,
      max: 100,
      description: 'Weight of fragility score in placement algorithm'
    },
    {
      key: 'stabilityScoring',
      label: 'Stability Scoring',
      type: 'boolean',
      value: localConstraints.stabilityScoring ?? true,
      description: 'Enable stability scoring for load configurations'
    },
    {
      key: 'stabilityThreshold',
      label: 'Stability Threshold',
      type: 'number',
      value: localConstraints.stabilityThreshold || 70,
      min: 0,
      max: 100,
      description: 'Minimum stability score required (0-100)',
      showIf: localConstraints.stabilityScoring
    },
    {
      key: 'riskTolerance',
      label: 'Risk Tolerance',
      type: 'slider',
      value: localConstraints.riskTolerance || 50,
      min: 0,
      max: 100,
      description: 'Risk tolerance level (0=Conservative, 100=Aggressive)'
    }
  ];

  const loadingSequenceOptions = [
    { value: 'lifo', label: 'LIFO (Last In, First Out)' },
    { value: 'fifo', label: 'FIFO (First In, First Out)' },
    { value: 'route', label: 'Route-based sequence' },
    { value: 'weight', label: 'Weight-based sequence' },
    { value: 'priority', label: 'Priority-based sequence' },
    { value: 'fragility', label: 'Fragility-based sequence' }
  ];

  const routeStrategyOptions = [
    { value: 'separate', label: 'Separate Vehicles per Route', description: 'Different vehicles for different routes' },
    { value: 'consolidate', label: 'Consolidate Routes', description: 'Club orders from different routes into same vehicle' }
  ];

  const renderFormField = (item) => {
    // Handle conditional visibility
    if (item.showIf !== undefined && !item.showIf) {
      return null;
    }

    switch (item.type) {
      case 'boolean':
        return (
          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900">{item.label}</label>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={item.value}
                onChange={(e) => handleConstraintChange(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        );

      case 'number':
        return (
          <div key={item.key} className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-1">{item.label}</label>
            <input
              type="number"
              value={item.value}
              min={item.min}
              max={item.max}
              onChange={(e) => handleConstraintChange(item.key, Number(e.target.value))}
              className="input-field"
            />
            {item.description && (
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {item.description}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={item.key} className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-1">{item.label}</label>
            <select
              value={item.value}
              onChange={(e) => handleConstraintChange(item.key, e.target.value)}
              className="input-field"
            >
              {item.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {item.description && (
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {item.description}
              </p>
            )}
          </div>
        );

      case 'slider':
        return (
          <div key={item.key} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-900">{item.label}</label>
              <span className="text-sm font-bold text-primary-600">{item.value}</span>
            </div>
            <input
              type="range"
              value={item.value}
              min={item.min}
              max={item.max}
              onChange={(e) => handleConstraintChange(item.key, Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
            {item.description && (
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {item.description}
              </p>
            )}
          </div>
        );

      case 'weights':
        return (
          <div key={item.key} className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-3">{item.label}</label>
            <div className="space-y-3">
              {Object.entries(item.value).map(([weightKey, weightValue]) => (
                <div key={weightKey} className="flex items-center">
                  <span className="text-xs text-gray-600 w-32 capitalize">
                    {weightKey.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input
                    type="range"
                    value={weightValue}
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const newWeights = { ...item.value, [weightKey]: Number(e.target.value) };
                      handleConstraintChange(item.key, newWeights);
                    }}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 mx-2"
                  />
                  <span className="text-xs font-medium text-gray-700 w-8">{weightValue}%</span>
                </div>
              ))}
            </div>
            {item.description && (
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {item.description}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const stackingRules = [
    {
      category: 'cuboidal',
      title: 'Cuboidal Items',
      rules: [
        { key: 'heavyBelowLight', label: 'Heavy items below light items', type: 'boolean', value: localConstraints.stackingRules?.cuboidal?.heavyBelowLight ?? true },
        { key: 'fullCoverageBase', label: 'Full coverage base required', type: 'boolean', value: localConstraints.stackingRules?.cuboidal?.fullCoverageBase ?? true },
        { key: 'preventTipping', label: 'Prevent tipping', type: 'boolean', value: localConstraints.stackingRules?.cuboidal?.preventTipping ?? true },
        { key: 'orientationFlexibility', label: 'Allow orientation changes', type: 'boolean', value: localConstraints.stackingRules?.cuboidal?.orientationFlexibility ?? false }
      ]
    },
    {
      category: 'cylindrical',
      title: 'Cylindrical Items',
      rules: [
        { key: 'interlocking', label: 'Use interlocking arrangement', type: 'boolean', value: localConstraints.stackingRules?.cylindrical?.interlocking ?? true },
        { key: 'preventRolling', label: 'Prevent rolling', type: 'boolean', value: localConstraints.stackingRules?.cylindrical?.preventRolling ?? true },
        { key: 'useWedges', label: 'Use wedges/braces', type: 'boolean', value: localConstraints.stackingRules?.cylindrical?.useWedges ?? true },
        { key: 'avoidHorizontalStacking', label: 'Avoid horizontal stacking for fragile items', type: 'boolean', value: localConstraints.stackingRules?.cylindrical?.avoidHorizontalStacking ?? true }
      ]
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'load-planning':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loadPlanningItems.map(item => renderFormField(item))}
            </div>

            {/* Loading Sequence */}
            <div className="card mt-6">
              <h4 className="text-md font-semibold mb-4">Loading Sequence Strategy</h4>
              <select
                value={localConstraints.loadingSequence || 'lifo'}
                onChange={(e) => handleConstraintChange('loadingSequence', e.target.value)}
                className="input-field"
              >
                {loadingSequenceOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Stacking Rules */}
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-4">Stacking Rules by Material Type</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {stackingRules.map((category) => (
                  <div key={category.category} className="card">
                    <h5 className="text-sm font-semibold mb-3 text-gray-700">{category.title}</h5>
                    <div className="space-y-2">
                      {category.rules.map((rule) => (
                        <label
                          key={rule.key}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                        >
                          <span className="text-sm text-gray-700">{rule.label}</span>
                          <input
                            type="checkbox"
                            checked={rule.value}
                            onChange={(e) => handleStackingRuleChange(category.category, rule.key, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'fragility-packaging':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {fragilityPackagingItems.map(item => renderFormField(item))}
            </div>

            {/* Packaging Type Defaults */}
            <div className="card mt-6">
              <h4 className="text-md font-semibold mb-4">Default Packaging Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'corrugated_box', label: 'Corrugated Box', icon: '📦', protection: 3 },
                  { id: 'wooden_crate', label: 'Wooden Crate', icon: '🪵', protection: 5 },
                  { id: 'plastic_container', label: 'Plastic Container', icon: '🧊', protection: 4 },
                  { id: 'metal_drum', label: 'Metal Drum', icon: '🛢️', protection: 5 },
                  { id: 'foam_padded', label: 'Foam Padded', icon: '🧽', protection: 5 },
                  { id: 'shrink_wrap', label: 'Shrink Wrap', icon: '🎁', protection: 1 },
                  { id: 'thermal_insulated', label: 'Thermal', icon: '❄️', protection: 4 },
                  { id: 'glass_carton', label: 'Glass Carton', icon: '🍾', protection: 4 }
                ].map(pkg => (
                  <div key={pkg.id} className="p-3 bg-gray-50 rounded-lg text-center">
                    <span className="text-2xl">{pkg.icon}</span>
                    <p className="text-xs font-medium mt-1">{pkg.label}</p>
                    <div className="flex justify-center mt-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full mx-0.5 ${i <= pkg.protection ? 'bg-primary-500' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'vehicle-optimization':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {vehicleOptimizationItems.map(item => renderFormField(item))}
            </div>

            {/* Route Strategy */}
            <div className="card mt-6">
              <h4 className="text-md font-semibold mb-4">Route Strategy</h4>
              <div className="space-y-3">
                {routeStrategyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                      (localConstraints.routeStrategy || 'separate') === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="routeStrategy"
                      value={option.value}
                      checked={(localConstraints.routeStrategy || 'separate') === option.value}
                      onChange={(e) => handleConstraintChange('routeStrategy', e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Vehicle Constraints */}
            <div className="card mt-6">
              <h4 className="text-md font-semibold mb-4">Vehicle Physical Constraints</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Weight (kg)</label>
                  <input
                    type="number"
                    value={localConstraints.maxWeight || 10000}
                    onChange={(e) => handleConstraintChange('maxWeight', Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Volume (m³)</label>
                  <input
                    type="number"
                    value={localConstraints.maxVolume || 40}
                    onChange={(e) => handleConstraintChange('maxVolume', Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Axle Load (kg)</label>
                  <input
                    type="number"
                    value={localConstraints.maxAxleLoad || 12000}
                    onChange={(e) => handleConstraintChange('maxAxleLoad', Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Length (mm)</label>
                  <input
                    type="number"
                    value={localConstraints.maxLength || 6100}
                    onChange={(e) => handleConstraintChange('maxLength', Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Width (mm)</label>
                  <input
                    type="number"
                    value={localConstraints.maxWidth || 2440}
                    onChange={(e) => handleConstraintChange('maxWidth', Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Height (mm)</label>
                  <input
                    type="number"
                    value={localConstraints.maxHeight || 2590}
                    onChange={(e) => handleConstraintChange('maxHeight', Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced-ai':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {advancedAIItems.map(item => renderFormField(item))}
            </div>

            {/* AI Hints Configuration */}
            <div className="card mt-6">
              <h4 className="text-md font-semibold mb-4">AI Hints & Recommendations</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <span className="text-sm font-medium text-gray-900">High-Risk Stacking Alerts</span>
                    <p className="text-xs text-gray-500">Show alerts when AI detects risky stacking configurations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localConstraints.showHighRiskStackingAlerts ?? true}
                    onChange={(e) => handleConstraintChange('showHighRiskStackingAlerts', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Protected Zone Suggestions</span>
                    <p className="text-xs text-gray-500">AI suggests protected zones for fragile items</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localConstraints.showProtectedZoneSuggestions ?? true}
                    onChange={(e) => handleConstraintChange('showProtectedZoneSuggestions', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Load Rebalancing Hints</span>
                    <p className="text-xs text-gray-500">Show suggestions to improve load balance</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localConstraints.showLoadRebalancingHints ?? true}
                    onChange={(e) => handleConstraintChange('showLoadRebalancingHints', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            {/* Safety Warning */}
            <div className="card border-yellow-200 bg-yellow-50 mt-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-md font-semibold text-yellow-800 mb-2">AI Safety Considerations</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• AI recommendations should be validated by operators</li>
                    <li>• Override settings may increase risk - use with caution</li>
                    <li>• Always verify load stability before dispatch</li>
                    <li>• Consider environmental conditions during transport</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === section.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Section Content */}
      <div className="animate-fade-in">
        {renderSectionContent()}
      </div>

      {/* Current Configuration Summary */}
      <div className="card bg-gray-50">
        <h4 className="text-md font-semibold mb-3">Current Configuration Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Optimization:</span>
            <span className="ml-1 font-medium capitalize">{localConstraints.optimizationGoal || 'Balanced'}</span>
          </div>
          <div>
            <span className="text-gray-500">Stacking:</span>
            <span className="ml-1 font-medium uppercase">{localConstraints.loadingSequence || 'LIFO'}</span>
          </div>
          <div>
            <span className="text-gray-500">AI Loading:</span>
            <span className="ml-1 font-medium">{localConstraints.enableAISmartLoading !== false ? 'On' : 'Off'}</span>
          </div>
          <div>
            <span className="text-gray-500">Risk Level:</span>
            <span className="ml-1 font-medium">{localConstraints.riskTolerance || 50}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstraintsPanel;

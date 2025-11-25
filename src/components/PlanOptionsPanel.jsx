import React, { useState } from 'react';
import { Settings, Sliders, Info, Shield, TrendingUp, Package, Truck, Route } from 'lucide-react';

/**
 * Plan Options Panel Component
 * Allows users to configure plan generation parameters before creating a plan
 */
const PlanOptionsPanel = ({ options, onOptionsChange }) => {
  const [localOptions, setLocalOptions] = useState(options || {
    loadPriorityStrategy: 'balanced',
    stackLogic: 'lifo',
    enforcePackagingCompatibility: true,
    fragilityBuffer: 10,
    maxWeightUtilization: 95,
    maxVolumeUtilization: 90,
    enableProtectedZoneLoading: true,
    allowPartialVehicleUsage: true,
    vehicleTypeOverride: 'auto',
    groupByRoute: true,
    stabilityEnforcement: true,
    riskToleranceThreshold: 50
  });

  const handleOptionChange = (key, value) => {
    const updated = { ...localOptions, [key]: value };
    setLocalOptions(updated);
    onOptionsChange(updated);
  };

  // Load Priority Strategies
  const loadPriorityStrategies = [
    { 
      value: 'fragility', 
      label: 'Fragility-First', 
      description: 'Prioritize fragile items for protected zones',
      icon: '🛡️'
    },
    { 
      value: 'weight', 
      label: 'Weight-First', 
      description: 'Heaviest items loaded first (bottom)',
      icon: '⚖️'
    },
    { 
      value: 'route', 
      label: 'Route-First', 
      description: 'Organize by delivery route sequence',
      icon: '🗺️'
    },
    { 
      value: 'cost', 
      label: 'Cost-First', 
      description: 'Minimize overall transportation cost',
      icon: '💰'
    },
    { 
      value: 'balanced', 
      label: 'Balanced', 
      description: 'AI optimizes all factors equally',
      icon: '⚖️'
    }
  ];

  // Stack Logic Options
  const stackLogicOptions = [
    { value: 'lifo', label: 'LIFO (Last In, First Out)', description: 'Last loaded items unloaded first' },
    { value: 'fifo', label: 'FIFO (First In, First Out)', description: 'First loaded items unloaded first' }
  ];

  // Vehicle Type Options
  const vehicleTypeOptions = [
    { value: 'auto', label: 'AI Auto-Select', description: 'Let AI choose optimal vehicles' },
    { value: 'small', label: 'Small (LCV)', description: 'Light Commercial Vehicles only' },
    { value: 'medium', label: 'Medium (SCV)', description: 'Standard Commercial Vehicles' },
    { value: 'large', label: 'Large (HCV)', description: 'Heavy Commercial Vehicles' },
    { value: 'mixed', label: 'Mixed Fleet', description: 'Allow combination of vehicle types' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary-600" />
            Plan Generation Options
          </h3>
          <p className="text-sm text-gray-500 mt-1">Configure parameters to customize the AI plan generation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Strategy & Logic */}
        <div className="space-y-6">
          {/* Load Priority Strategy */}
          <div className="card">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
              <h4 className="text-md font-semibold text-gray-900">Load Priority Strategy</h4>
            </div>
            <div className="space-y-2">
              {loadPriorityStrategies.map((strategy) => (
                <label
                  key={strategy.value}
                  className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                    localOptions.loadPriorityStrategy === strategy.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="loadPriorityStrategy"
                    value={strategy.value}
                    checked={localOptions.loadPriorityStrategy === strategy.value}
                    onChange={(e) => handleOptionChange('loadPriorityStrategy', e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{strategy.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{strategy.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{strategy.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Stack Logic */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Package className="h-5 w-5 text-primary-600 mr-2" />
              <h4 className="text-md font-semibold text-gray-900">Stack Logic</h4>
            </div>
            <div className="space-y-2">
              {stackLogicOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                    localOptions.stackLogic === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="stackLogic"
                    value={option.value}
                    checked={localOptions.stackLogic === option.value}
                    onChange={(e) => handleOptionChange('stackLogic', e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Vehicle Type Override */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Truck className="h-5 w-5 text-primary-600 mr-2" />
              <h4 className="text-md font-semibold text-gray-900">Vehicle Selection</h4>
            </div>
            <select
              value={localOptions.vehicleTypeOverride}
              onChange={(e) => handleOptionChange('vehicleTypeOverride', e.target.value)}
              className="input-field"
            >
              {vehicleTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column - Constraints & Toggles */}
        <div className="space-y-6">
          {/* Utilization Limits */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Sliders className="h-5 w-5 text-primary-600 mr-2" />
              <h4 className="text-md font-semibold text-gray-900">Max Utilization Limits</h4>
            </div>
            
            {/* Weight Utilization */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Max Weight Utilization</label>
                <span className="text-sm font-bold text-primary-600">{localOptions.maxWeightUtilization}%</span>
              </div>
              <input
                type="range"
                value={localOptions.maxWeightUtilization}
                min={70}
                max={100}
                onChange={(e) => handleOptionChange('maxWeightUtilization', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservative (70%)</span>
                <span>Full (100%)</span>
              </div>
            </div>

            {/* Volume Utilization */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Max Volume Utilization</label>
                <span className="text-sm font-bold text-primary-600">{localOptions.maxVolumeUtilization}%</span>
              </div>
              <input
                type="range"
                value={localOptions.maxVolumeUtilization}
                min={70}
                max={100}
                onChange={(e) => handleOptionChange('maxVolumeUtilization', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservative (70%)</span>
                <span>Full (100%)</span>
              </div>
            </div>

            {/* Fragility Buffer */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Fragility Spacing Buffer</label>
                <span className="text-sm font-bold text-primary-600">{localOptions.fragilityBuffer}%</span>
              </div>
              <input
                type="range"
                value={localOptions.fragilityBuffer}
                min={0}
                max={30}
                onChange={(e) => handleOptionChange('fragilityBuffer', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>No Buffer</span>
                <span>30% Extra Space</span>
              </div>
            </div>
          </div>

          {/* Protection & Safety Toggles */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-primary-600 mr-2" />
              <h4 className="text-md font-semibold text-gray-900">Protection & Safety</h4>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Protected Zone Loading</span>
                  <p className="text-xs text-gray-500 mt-0.5">Reserve safe zones for fragile items</p>
                </div>
                <input
                  type="checkbox"
                  checked={localOptions.enableProtectedZoneLoading}
                  onChange={(e) => handleOptionChange('enableProtectedZoneLoading', e.target.checked)}
                  className="ml-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Packaging Compatibility</span>
                  <p className="text-xs text-gray-500 mt-0.5">Enforce packaging stacking rules</p>
                </div>
                <input
                  type="checkbox"
                  checked={localOptions.enforcePackagingCompatibility}
                  onChange={(e) => handleOptionChange('enforcePackagingCompatibility', e.target.checked)}
                  className="ml-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Stability Enforcement</span>
                  <p className="text-xs text-gray-500 mt-0.5">Validate load stability and COG</p>
                </div>
                <input
                  type="checkbox"
                  checked={localOptions.stabilityEnforcement}
                  onChange={(e) => handleOptionChange('stabilityEnforcement', e.target.checked)}
                  className="ml-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          {/* Optimization Toggles */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Route className="h-5 w-5 text-primary-600 mr-2" />
              <h4 className="text-md font-semibold text-gray-900">Optimization Options</h4>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Group by Route/Cluster</span>
                  <p className="text-xs text-gray-500 mt-0.5">Organize orders by delivery route</p>
                </div>
                <input
                  type="checkbox"
                  checked={localOptions.groupByRoute}
                  onChange={(e) => handleOptionChange('groupByRoute', e.target.checked)}
                  className="ml-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Allow Partial Vehicle Usage</span>
                  <p className="text-xs text-gray-500 mt-0.5">Permit vehicles at less than full capacity</p>
                </div>
                <input
                  type="checkbox"
                  checked={localOptions.allowPartialVehicleUsage}
                  onChange={(e) => handleOptionChange('allowPartialVehicleUsage', e.target.checked)}
                  className="ml-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          {/* Risk Tolerance */}
          <div className="card">
            <div className="flex items-center mb-3">
              <Info className="h-5 w-5 text-primary-600 mr-2" />
              <h4 className="text-md font-semibold text-gray-900">Risk Tolerance Threshold</h4>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Acceptable Risk Level</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                localOptions.riskToleranceThreshold < 30 ? 'bg-green-100 text-green-800' :
                localOptions.riskToleranceThreshold < 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {localOptions.riskToleranceThreshold}/100
              </span>
            </div>
            <input
              type="range"
              value={localOptions.riskToleranceThreshold}
              min={0}
              max={100}
              onChange={(e) => handleOptionChange('riskToleranceThreshold', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative (0)</span>
              <span>Moderate (50)</span>
              <span>Aggressive (100)</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {localOptions.riskToleranceThreshold < 30 && 'Conservative: Strict safety rules, lower utilization'}
              {localOptions.riskToleranceThreshold >= 30 && localOptions.riskToleranceThreshold < 70 && 'Moderate: Balanced approach with standard rules'}
              {localOptions.riskToleranceThreshold >= 70 && 'Aggressive: Maximum utilization, flexible rules'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Configuration Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Strategy:</span>
            <span className="ml-1 font-medium capitalize">{localOptions.loadPriorityStrategy}</span>
          </div>
          <div>
            <span className="text-gray-600">Stack Logic:</span>
            <span className="ml-1 font-medium uppercase">{localOptions.stackLogic}</span>
          </div>
          <div>
            <span className="text-gray-600">Weight Limit:</span>
            <span className="ml-1 font-medium">{localOptions.maxWeightUtilization}%</span>
          </div>
          <div>
            <span className="text-gray-600">Volume Limit:</span>
            <span className="ml-1 font-medium">{localOptions.maxVolumeUtilization}%</span>
          </div>
          <div>
            <span className="text-gray-600">Protected Zones:</span>
            <span className="ml-1 font-medium">{localOptions.enableProtectedZoneLoading ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div>
            <span className="text-gray-600">Vehicle:</span>
            <span className="ml-1 font-medium capitalize">{localOptions.vehicleTypeOverride}</span>
          </div>
          <div>
            <span className="text-gray-600">Risk:</span>
            <span className="ml-1 font-medium">{localOptions.riskToleranceThreshold}/100</span>
          </div>
          <div>
            <span className="text-gray-600">Route Grouping:</span>
            <span className="ml-1 font-medium">{localOptions.groupByRoute ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h5 className="text-sm font-medium text-blue-900">AI Plan Generation</h5>
          <p className="text-xs text-blue-700 mt-1">
            The AI will use these parameters to generate an optimized load plan. You can modify these settings
            and regenerate the plan at any time. Changes will take effect on the next generation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanOptionsPanel;


import React, { useState } from 'react';
import { Settings, Weight, Ruler, Package, AlertTriangle, Info } from 'lucide-react';

const ConstraintsPanel = ({ constraints, onConstraintsChange }) => {
  const [localConstraints, setLocalConstraints] = useState(constraints);

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

  const constraintSections = [
    {
      title: 'Vehicle Constraints',
      icon: Weight,
      items: [
        {
          key: 'maxWeight',
          label: 'Maximum Weight (kg)',
          type: 'number',
          value: localConstraints.maxWeight,
          description: 'Maximum weight capacity of the vehicle'
        },
        {
          key: 'maxVolume',
          label: 'Maximum Volume (m³)',
          type: 'number',
          value: localConstraints.maxVolume,
          description: 'Maximum volume capacity of the vehicle'
        },
        {
          key: 'maxLength',
          label: 'Maximum Length (mm)',
          type: 'number',
          value: localConstraints.maxLength || 6100,
          description: 'Maximum length of the cargo area'
        },
        {
          key: 'maxWidth',
          label: 'Maximum Width (mm)',
          type: 'number',
          value: localConstraints.maxWidth || 2440,
          description: 'Maximum width of the cargo area'
        },
        {
          key: 'maxHeight',
          label: 'Maximum Height (mm)',
          type: 'number',
          value: localConstraints.maxHeight || 2590,
          description: 'Maximum height of the cargo area'
        }
      ]
    },
    {
      title: 'Load Distribution',
      icon: Package,
      items: [
        {
          key: 'maxAxleLoad',
          label: 'Maximum Axle Load (kg)',
          type: 'number',
          value: localConstraints.maxAxleLoad || 12000,
          description: 'Maximum weight per axle'
        },
        {
          key: 'centerOfGravityLimit',
          label: 'Center of Gravity Limit (%)',
          type: 'number',
          value: localConstraints.centerOfGravityLimit || 60,
          description: 'Maximum center of gravity height as percentage of vehicle height'
        },
        {
          key: 'weightDistributionTolerance',
          label: 'Weight Distribution Tolerance (%)',
          type: 'number',
          value: localConstraints.weightDistributionTolerance || 10,
          description: 'Allowed weight imbalance between left and right sides'
        }
      ]
    },
    {
      title: 'Stacking Rules',
      icon: Ruler,
      items: [
        {
          key: 'maxStackHeight',
          label: 'Maximum Stack Height (mm)',
          type: 'number',
          value: localConstraints.maxStackHeight || 2500,
          description: 'Maximum height for stacked items'
        },
        {
          key: 'maxStackWeight',
          label: 'Maximum Stack Weight (kg)',
          type: 'number',
          value: localConstraints.maxStackWeight || 1000,
          description: 'Maximum weight for a single stack'
        },
        {
          key: 'overhangTolerance',
          label: 'Overhang Tolerance (%)',
          type: 'number',
          value: localConstraints.overhangTolerance || 10,
          description: 'Allowed overhang percentage for stacked items'
        }
      ]
    }
  ];

  const stackingRules = [
    {
      category: 'cuboidal',
      title: 'Cuboidal Items',
      rules: [
        {
          key: 'heavyBelowLight',
          label: 'Heavy items below light items',
          type: 'boolean',
          value: localConstraints.stackingRules?.cuboidal?.heavyBelowLight ?? true
        },
        {
          key: 'fullCoverageBase',
          label: 'Full coverage base required',
          type: 'boolean',
          value: localConstraints.stackingRules?.cuboidal?.fullCoverageBase ?? true
        },
        {
          key: 'preventTipping',
          label: 'Prevent tipping',
          type: 'boolean',
          value: localConstraints.stackingRules?.cuboidal?.preventTipping ?? true
        },
        {
          key: 'orientationFlexibility',
          label: 'Allow orientation changes',
          type: 'boolean',
          value: localConstraints.stackingRules?.cuboidal?.orientationFlexibility ?? false
        }
      ]
    },
    {
      category: 'cylindrical',
      title: 'Cylindrical Items',
      rules: [
        {
          key: 'interlocking',
          label: 'Use interlocking arrangement',
          type: 'boolean',
          value: localConstraints.stackingRules?.cylindrical?.interlocking ?? true
        },
        {
          key: 'preventRolling',
          label: 'Prevent rolling',
          type: 'boolean',
          value: localConstraints.stackingRules?.cylindrical?.preventRolling ?? true
        },
        {
          key: 'useWedges',
          label: 'Use wedges/braces',
          type: 'boolean',
          value: localConstraints.stackingRules?.cylindrical?.useWedges ?? true
        },
        {
          key: 'avoidHorizontalStacking',
          label: 'Avoid horizontal stacking for fragile items',
          type: 'boolean',
          value: localConstraints.stackingRules?.cylindrical?.avoidHorizontalStacking ?? true
        }
      ]
    }
  ];

  const loadingSequenceOptions = [
    { value: 'lifo', label: 'LIFO (Last In, First Out)' },
    { value: 'fifo', label: 'FIFO (First In, First Out)' },
    { value: 'route', label: 'Route-based sequence' },
    { value: 'weight', label: 'Weight-based sequence' },
    { value: 'priority', label: 'Priority-based sequence' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Settings className="h-6 w-6 text-gray-400 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Constraints & Optimization Setup</h2>
          <p className="text-gray-600 mt-1">
            Configure loading constraints and optimization parameters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Physical Constraints */}
        <div className="space-y-6">
          {constraintSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="card">
                <div className="flex items-center mb-4">
                  <Icon className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                </div>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {item.label}
                      </label>
                      <input
                        type={item.type}
                        value={item.value}
                        onChange={(e) => handleConstraintChange(item.key, 
                          item.type === 'number' ? Number(e.target.value) : e.target.value
                        )}
                        className="input-field"
                        step={item.type === 'number' ? '0.1' : undefined}
                      />
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Info className="h-3 w-3 mr-1" />
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Loading Sequence */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Loading Sequence</h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Sequence Strategy
              </label>
              <select
                value={localConstraints.loadingSequence || 'lifo'}
                onChange={(e) => handleConstraintChange('loadingSequence', e.target.value)}
                className="input-field"
              >
                {loadingSequenceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Determines the order in which items are loaded and unloaded
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Stacking Rules */}
        <div className="space-y-6">
          {stackingRules.map((category) => (
            <div key={category.category} className="card">
              <h3 className="text-lg font-semibold mb-4">{category.title}</h3>
              <div className="space-y-3">
                {category.rules.map((rule) => (
                  <label
                    key={rule.key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {rule.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={rule.value}
                      onChange={(e) => handleStackingRuleChange(
                        category.category,
                        rule.key,
                        e.target.checked
                      )}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Safety Warnings */}
          <div className="card border-yellow-200 bg-yellow-50">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Safety Considerations</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Ensure weight distribution complies with vehicle regulations</li>
                  <li>• Verify stacking height doesn't exceed vehicle clearance</li>
                  <li>• Consider load securing requirements for transport</li>
                  <li>• Account for road conditions and journey duration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Optimization Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Max Weight:</span>
                <span className="font-medium">{localConstraints.maxWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Volume:</span>
                <span className="font-medium">{localConstraints.maxVolume} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Drop Points:</span>
                <span className="font-medium">{localConstraints.dropPoints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loading Sequence:</span>
                <span className="font-medium capitalize">
                  {localConstraints.loadingSequence || 'LIFO'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstraintsPanel;

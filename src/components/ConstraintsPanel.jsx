import React, { useState } from 'react';
import { Settings, Package, AlertTriangle, Info, Truck, Shield, Bot, Sliders, Target, Gauge, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
    { id: 'vehicle-optimization', label: 'Vehicle', icon: Truck },
    { id: 'advanced-ai', label: 'Advanced AI', icon: Bot },
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

  const stackingRules = [
    {
      category: 'cuboidal',
      title: 'Cuboidal Items',
      rules: [
        { key: 'heavyBelowLight', label: 'Heavy items below light items', value: localConstraints.stackingRules?.cuboidal?.heavyBelowLight ?? true },
        { key: 'fullCoverageBase', label: 'Full coverage base required', value: localConstraints.stackingRules?.cuboidal?.fullCoverageBase ?? true },
        { key: 'preventTipping', label: 'Prevent tipping', value: localConstraints.stackingRules?.cuboidal?.preventTipping ?? true },
        { key: 'orientationFlexibility', label: 'Allow orientation changes', value: localConstraints.stackingRules?.cuboidal?.orientationFlexibility ?? false }
      ]
    },
    {
      category: 'cylindrical',
      title: 'Cylindrical Items',
      rules: [
        { key: 'interlocking', label: 'Use interlocking arrangement', value: localConstraints.stackingRules?.cylindrical?.interlocking ?? true },
        { key: 'preventRolling', label: 'Prevent rolling', value: localConstraints.stackingRules?.cylindrical?.preventRolling ?? true },
        { key: 'useWedges', label: 'Use wedges/braces', value: localConstraints.stackingRules?.cylindrical?.useWedges ?? true },
        { key: 'avoidHorizontalStacking', label: 'Avoid horizontal stacking for fragile items', value: localConstraints.stackingRules?.cylindrical?.avoidHorizontalStacking ?? true }
      ]
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'load-planning':
        return (
          <div className="space-y-6">
            {/* Loading Sequence */}
            <div className="space-y-2">
              <Label>Default Stacking Logic</Label>
              <Select
                value={localConstraints.loadingSequence || 'lifo'}
                onValueChange={(value) => handleConstraintChange('loadingSequence', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                {loadingSequenceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Stacking Rules */}
            <div className="space-y-4">
              <Label>Stacking Rules by Material Type</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {stackingRules.map((category) => (
                  <Card key={category.category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {category.rules.map((rule) => (
                        <label
                          key={rule.key}
                          className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                        >
                          <span className="text-sm">{rule.label}</span>
                          <input
                            type="checkbox"
                            checked={rule.value}
                            onChange={(e) => handleStackingRuleChange(category.category, rule.key, e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                          />
                        </label>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Advanced Load Planning Rules */}
            <div className="space-y-4">
              <Label>Advanced Load Planning Rules</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Maximum Overhang Tolerance */}
                <div className="space-y-2">
                  <Label className="text-xs">Maximum Overhang Tolerance (mm)</Label>
                  <Input
                    type="number"
                    value={localConstraints.maxOverhangTolerance || 100}
                    onChange={(e) => handleConstraintChange('maxOverhangTolerance', Number(e.target.value))}
                    placeholder="100"
                  />
                  <p className="text-xs text-muted-foreground">Maximum allowed overhang in millimeters</p>
                </div>

                {/* Max Vertical Stacking Levels */}
                <div className="space-y-2">
                  <Label className="text-xs">Max Vertical Stacking Levels</Label>
                  <Input
                    type="number"
                    value={localConstraints.maxVerticalStackingLevels || 5}
                    onChange={(e) => handleConstraintChange('maxVerticalStackingLevels', Number(e.target.value))}
                    placeholder="5"
                    min="1"
                    max="20"
                  />
                  <p className="text-xs text-muted-foreground">Maximum number of vertical stacking layers</p>
                </div>

                {/* Center of Gravity Threshold */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Center of Gravity Threshold</Label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localConstraints.enableCenterOfGravityThreshold ?? true}
                          onChange={(e) => handleConstraintChange('enableCenterOfGravityThreshold', e.target.checked)}
                          className="h-4 w-4 rounded border-input mr-2"
                        />
                        <span className="text-xs">Enable</span>
                      </label>
                    </div>
                    {localConstraints.enableCenterOfGravityThreshold !== false && (
                      <div className="space-y-2">
                        <Label className="text-xs">Threshold (%)</Label>
                        <Input
                          type="number"
                          value={localConstraints.centerOfGravityThreshold || 20}
                          onChange={(e) => handleConstraintChange('centerOfGravityThreshold', Number(e.target.value))}
                          placeholder="20"
                          min="0"
                          max="50"
                        />
                        <p className="text-xs text-muted-foreground">Maximum offset percentage from center</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Load Bearing Enforcement */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Load Bearing Enforcement</Label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localConstraints.enforceLoadBearing ?? true}
                          onChange={(e) => handleConstraintChange('enforceLoadBearing', e.target.checked)}
                          className="h-4 w-4 rounded border-input mr-2"
                        />
                        <span className="text-xs">Enable</span>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Enforce load bearing capacity limits when stacking</p>
                  </CardContent>
                </Card>

                {/* Stack Incompatibility Override */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Stack Incompatibility Override</Label>
                      <Select
                        value={localConstraints.stackIncompatibilityOverride || 'no'}
                        onValueChange={(value) => handleConstraintChange('stackIncompatibilityOverride', value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">Allow overriding incompatible stacking rules</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'fragility-packaging':
        return (
          <div className="space-y-6">
            {/* Fragility Scoring System */}
            <div className="space-y-2">
              <Label>Fragility Scoring System</Label>
              <Select
                value={localConstraints.fragilityScoringScale || 'standard'}
                onValueChange={(value) => handleConstraintChange('fragilityScoringScale', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">1-3 Scale (Simple)</SelectItem>
                  <SelectItem value="standard">1-5 Scale (Standard)</SelectItem>
                  <SelectItem value="detailed">1-10 Scale (Detailed)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Default fragility scoring scale for orders</p>
            </div>

            <Separator />

            {/* Packaging Settings */}
            <div className="space-y-4">
              <Label>Packaging Settings</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Packaging Compatibility Matrix */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Packaging Compatibility Matrix</Label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localConstraints.enablePackagingCompatibilityMatrix ?? true}
                          onChange={(e) => handleConstraintChange('enablePackagingCompatibilityMatrix', e.target.checked)}
                          className="h-4 w-4 rounded border-input mr-2"
                        />
                        <span className="text-xs">Enable</span>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Enforce packaging compatibility rules when stacking</p>
                  </CardContent>
                </Card>

                {/* Default Packaging Protection Score */}
                <div className="space-y-2">
                  <Label className="text-xs">Default Packaging Protection Score</Label>
                  <Input
                    type="number"
                    value={localConstraints.defaultPackagingProtectionScore || 3}
                    onChange={(e) => handleConstraintChange('defaultPackagingProtectionScore', Number(e.target.value))}
                    placeholder="3"
                    min="1"
                    max="5"
                  />
                  <p className="text-xs text-muted-foreground">Default protection score (1-5 scale)</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Safety & Pressure Settings */}
            <div className="space-y-4">
              <Label>Safety & Pressure Settings</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Safety Margin Buffer */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">Safety Margin Buffer</Label>
                    <span className="text-sm font-medium text-primary">{localConstraints.safetyMarginBuffer || 10}%</span>
                  </div>
                  <Input
                    type="range"
                    value={localConstraints.safetyMarginBuffer || 10}
                    onChange={(e) => handleConstraintChange('safetyMarginBuffer', Number(e.target.value))}
                    min="0"
                    max="50"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Extra safety buffer for fragility calculations</p>
                </div>

                {/* Max Allowable Crush Pressure */}
                <div className="space-y-2">
                  <Label className="text-xs">Max Allowable Crush Pressure (kg/m²)</Label>
                  <Input
                    type="number"
                    value={localConstraints.maxCrushPressure || 500}
                    onChange={(e) => handleConstraintChange('maxCrushPressure', Number(e.target.value))}
                    placeholder="500"
                    min="50"
                    max="2000"
                  />
                  <p className="text-xs text-muted-foreground">Maximum pressure before crush risk warning</p>
                </div>

                {/* Fragile + Heavy Mix Alert Threshold */}
                <div className="space-y-2">
                  <Label className="text-xs">Fragile + Heavy Mix Alert Threshold</Label>
                  <Select
                    value={localConstraints.fragileHeavyMixAlertThreshold || 'medium'}
                    onValueChange={(value) => handleConstraintChange('fragileHeavyMixAlertThreshold', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Difference &gt; 1)</SelectItem>
                      <SelectItem value="medium">Medium (Difference &gt; 2)</SelectItem>
                      <SelectItem value="high">High (Difference &gt; 3)</SelectItem>
                      <SelectItem value="off">Off (No Alerts)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Alert when fragile and heavy items are mixed</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'vehicle-optimization':
        return (
          <div className="space-y-6">
            {/* Optimization Goal */}
            <div className="space-y-3">
              <Label>Optimization Goal</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'cost', label: 'Cost', description: 'Minimize transportation cost' },
                  { value: 'space', label: 'Space', description: 'Maximize space utilization' },
                  { value: 'weight', label: 'Weight', description: 'Optimize weight distribution' },
                  { value: 'min-vehicles', label: 'Min Vehicles', description: 'Minimize number of vehicles' },
                  { value: 'balanced', label: 'Balanced', description: 'Balance all factors' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                      (localConstraints.optimizationGoal || 'balanced') === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="optimizationGoal"
                      value={option.value}
                      checked={(localConstraints.optimizationGoal || 'balanced') === option.value}
                      onChange={(e) => handleConstraintChange('optimizationGoal', e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="text-sm font-medium">{option.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* AI Vehicle Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>AI-Based Vehicle Selection</Label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConstraints.enableAIVehicleSelection ?? true}
                    onChange={(e) => handleConstraintChange('enableAIVehicleSelection', e.target.checked)}
                    className="h-4 w-4 rounded border-input mr-2"
                  />
                  <span className="text-sm">Enable</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Use AI to automatically select optimal vehicles</p>
            </div>

            <Separator />

            {/* Vehicle Scoring Weightage */}
            {localConstraints.enableAIVehicleSelection !== false && (
              <div className="space-y-4">
                <Label>Vehicle Scoring Weightage (Customizable Formula)</Label>
                <div className="space-y-4">
                  {[
                    { key: 'costWeight', label: 'Cost', default: 25 },
                    { key: 'spaceWeight', label: 'Space Utilization', default: 25 },
                    { key: 'suitabilityWeight', label: 'Cargo Suitability', default: 30 },
                    { key: 'safetyWeight', label: 'Safety & Features', default: 20 }
                  ].map((weight) => (
                    <div key={weight.key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">{weight.label}</Label>
                        <span className="text-sm font-medium text-primary">{localConstraints[weight.key] || weight.default}%</span>
                      </div>
                      <Input
                        type="range"
                        value={localConstraints[weight.key] || weight.default}
                        onChange={(e) => handleConstraintChange(weight.key, Number(e.target.value))}
                        min="0"
                        max="100"
                        className="w-full"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">Adjust weights to customize vehicle scoring formula</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Vehicle Constraints */}
            <div className="space-y-4">
              <Label>Vehicle Constraints</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Suspension Requirement */}
                <div className="space-y-2">
                  <Label className="text-xs">Suspension Requirement</Label>
                  <Select
                    value={localConstraints.suspensionRequirement || 'any'}
                    onValueChange={(value) => handleConstraintChange('suspensionRequirement', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="air">Air Ride</SelectItem>
                      <SelectItem value="leaf">Leaf Spring</SelectItem>
                      <SelectItem value="premium">Premium (≥4/5)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Required suspension quality for fragile cargo</p>
                </div>

                {/* Climate Control Requirement */}
                <div className="space-y-2">
                  <Label className="text-xs">Climate Control Requirement</Label>
                  <Select
                    value={localConstraints.climateControlRequirement || 'none'}
                    onValueChange={(value) => handleConstraintChange('climateControlRequirement', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="refrigerated">Refrigerated</SelectItem>
                      <SelectItem value="heated">Heated</SelectItem>
                      <SelectItem value="temperature-controlled">Temperature Controlled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Required climate control for temperature-sensitive cargo</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Route Strategy */}
              <div className="space-y-3">
              <Label>Route Strategy</Label>
                {routeStrategyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                      (localConstraints.routeStrategy || 'separate') === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
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
                    <span className="text-sm font-medium">{option.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>

            <Separator />

            {/* Vehicle Physical Constraints */}
            <div className="space-y-4">
              <Label>Vehicle Physical Constraints</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Max Weight (kg)</Label>
                  <Input
                    type="number"
                    value={localConstraints.maxWeight || 10000}
                    onChange={(e) => handleConstraintChange('maxWeight', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Volume (m³)</Label>
                  <Input
                    type="number"
                    value={localConstraints.maxVolume || 40}
                    onChange={(e) => handleConstraintChange('maxVolume', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Axle Load (kg)</Label>
                  <Input
                    type="number"
                    value={localConstraints.maxAxleLoad || 12000}
                    onChange={(e) => handleConstraintChange('maxAxleLoad', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Length (mm)</Label>
                  <Input
                    type="number"
                    value={localConstraints.maxLength || 6100}
                    onChange={(e) => handleConstraintChange('maxLength', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Width (mm)</Label>
                  <Input
                    type="number"
                    value={localConstraints.maxWidth || 2440}
                    onChange={(e) => handleConstraintChange('maxWidth', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Height (mm)</Label>
                  <Input
                    type="number"
                    value={localConstraints.maxHeight || 2590}
                    onChange={(e) => handleConstraintChange('maxHeight', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced-ai':
        return (
          <div className="space-y-6">
            {/* AI Smart Loading */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Enable AI Smart Loading</Label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConstraints.enableAISmartLoading ?? true}
                    onChange={(e) => handleConstraintChange('enableAISmartLoading', e.target.checked)}
                    className="h-4 w-4 rounded border-input mr-2"
                  />
                  <span className="text-sm">Enable</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Use AI algorithms for intelligent load placement and optimization</p>
            </div>

            <Separator />

            {/* Protected Zone Enforcement */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Protected Zone Enforcement</Label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConstraints.enableProtectedZoneEnforcement ?? true}
                    onChange={(e) => handleConstraintChange('enableProtectedZoneEnforcement', e.target.checked)}
                    className="h-4 w-4 rounded border-input mr-2"
                  />
                  <span className="text-sm">Enable</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Reserve protected zones for fragile and sensitive items</p>
            </div>

            <Separator />

            {/* Fragility Weight in Placement Algorithm */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Fragility Weight in Placement Algorithm</Label>
                <span className="text-sm font-medium text-primary">{localConstraints.fragilityWeightInPlacement || 30}%</span>
              </div>
              <Input
                type="range"
                value={localConstraints.fragilityWeightInPlacement || 30}
                onChange={(e) => handleConstraintChange('fragilityWeightInPlacement', Number(e.target.value))}
                min="0"
                max="100"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low Priority (0%)</span>
                <span>High Priority (100%)</span>
              </div>
              <p className="text-xs text-muted-foreground">How much weight fragility has in placement algorithm</p>
            </div>

            <Separator />

            {/* Stability Scoring */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Stability Scoring</Label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConstraints.enableStabilityScoring ?? true}
                    onChange={(e) => handleConstraintChange('enableStabilityScoring', e.target.checked)}
                    className="h-4 w-4 rounded border-input mr-2"
                  />
                  <span className="text-sm">Enable</span>
                </label>
              </div>
              {localConstraints.enableStabilityScoring !== false && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">Stability Threshold</Label>
                    <span className="text-sm font-medium text-primary">{localConstraints.stabilityThreshold || 70}/100</span>
                  </div>
                  <Input
                    type="range"
                    value={localConstraints.stabilityThreshold || 70}
                    onChange={(e) => handleConstraintChange('stabilityThreshold', Number(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Minimum stability score required (0-100)</p>
                </div>
              )}
            </div>

            <Separator />

            {/* AI Hints Configuration */}
            <div className="space-y-4">
              <Label>AI Hints & Alerts</Label>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                  <div>
                    <span className="text-sm font-medium">High-Risk Stacking Alerts</span>
                    <p className="text-xs text-muted-foreground">Alert when fragile and heavy items are mixed</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localConstraints.enableHighRiskStackingAlerts ?? true}
                    onChange={(e) => handleConstraintChange('enableHighRiskStackingAlerts', e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                  <div>
                    <span className="text-sm font-medium">Protected Zone Suggestions</span>
                    <p className="text-xs text-muted-foreground">AI suggests protected zones for fragile items</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localConstraints.enableProtectedZoneSuggestions ?? true}
                    onChange={(e) => handleConstraintChange('enableProtectedZoneSuggestions', e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                  <div>
                    <span className="text-sm font-medium">Load Rebalancing Hints</span>
                    <p className="text-xs text-muted-foreground">AI provides hints for better load distribution</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localConstraints.enableLoadRebalancingHints ?? true}
                    onChange={(e) => handleConstraintChange('enableLoadRebalancingHints', e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                </label>
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
      <div className="flex space-x-2 border-b">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
            <Button
                key={section.id}
              variant="ghost"
                onClick={() => setActiveSection(section.id)}
              className={`rounded-none border-b-2 px-4 pb-3 pt-2 ${
                  activeSection === section.id
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {section.label}
            </Button>
            );
          })}
      </div>

      {/* Section Content */}
      <div>
        {renderSectionContent()}
      </div>

      {/* Current Configuration Summary */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Current Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
              <span className="text-muted-foreground">Stacking:</span>
            <span className="ml-1 font-medium uppercase">{localConstraints.loadingSequence || 'LIFO'}</span>
          </div>
          <div>
              <span className="text-muted-foreground">Route:</span>
              <span className="ml-1 font-medium capitalize">{localConstraints.routeStrategy || 'Separate'}</span>
          </div>
          <div>
              <span className="text-muted-foreground">Optimization:</span>
            <span className="ml-1 font-medium capitalize">{localConstraints.optimizationGoal || 'Balanced'}</span>
          </div>
          <div>
              <span className="text-muted-foreground">Fragility Scale:</span>
            <span className="ml-1 font-medium">{localConstraints.fragilityScoringScale === 'simple' ? '1-3' : localConstraints.fragilityScoringScale === 'detailed' ? '1-10' : '1-5'}</span>
          </div>
          <div>
              <span className="text-muted-foreground">Max Weight:</span>
              <span className="ml-1 font-medium">{(localConstraints.maxWeight || 10000).toLocaleString()} kg</span>
          </div>
            <div>
              <span className="text-muted-foreground">Max Volume:</span>
              <span className="ml-1 font-medium">{localConstraints.maxVolume || 40} m³</span>
        </div>
          <div>
              <span className="text-muted-foreground">AI Smart Loading:</span>
            <span className="ml-1 font-medium">{localConstraints.enableAISmartLoading !== false ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div>
              <span className="text-muted-foreground">Protected Zones:</span>
            <span className="ml-1 font-medium">{localConstraints.enableProtectedZoneEnforcement !== false ? 'Enabled' : 'Disabled'}</span>
          </div>
      </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConstraintsPanel;

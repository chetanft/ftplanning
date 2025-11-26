import React, { useState } from 'react';
import { Settings, Sliders, Info, Shield, TrendingUp, Package, Truck, Route, Bot, Scale, MapPin, DollarSign, Container, Snowflake, AirVent } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

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
      icon: Shield
    },
    { 
      value: 'weight', 
      label: 'Weight-First', 
      description: 'Heaviest items loaded first (bottom)',
      icon: Scale
    },
    { 
      value: 'route', 
      label: 'Route-First', 
      description: 'Organize by delivery route sequence',
      icon: MapPin
    },
    { 
      value: 'cost', 
      label: 'Cost-First', 
      description: 'Minimize overall transportation cost',
      icon: DollarSign
    },
    { 
      value: 'balanced', 
      label: 'Balanced', 
      description: 'AI optimizes all factors equally',
      icon: TrendingUp
    }
  ];

  // Stack Logic Options
  const stackLogicOptions = [
    { value: 'lifo', label: 'LIFO (Last In, First Out)', description: 'Last loaded items unloaded first' },
    { value: 'fifo', label: 'FIFO (First In, First Out)', description: 'First loaded items unloaded first' }
  ];

  // Vehicle Type Options - Categories and specific vehicles
  const vehicleTypeOptions = [
    // Auto selection
    { value: 'auto', label: 'AI Auto-Select', description: 'Let AI choose optimal vehicles', category: 'auto', icon: Bot },
    
    // Size categories
    { value: 'small', label: 'Small (LCV)', description: 'Tata Ace and similar', category: 'category', icon: Truck },
    { value: 'medium', label: 'Medium (SCV)', description: 'Eicher 14ft/17ft', category: 'category', icon: Truck },
    { value: 'large', label: 'Large (HCV)', description: 'Containers 20ft/32ft', category: 'category', icon: Container },
    { value: 'mixed', label: 'Mixed Fleet', description: 'Allow any combination', category: 'category', icon: Truck },
    
    // Specific vehicles
    { value: 'TATA_ACE', label: 'Tata Ace', description: 'Mini truck (1.5T)', category: 'specific', icon: Truck },
    { value: 'EICHER_14FT', label: 'Eicher 14ft', description: 'Medium truck (7T)', category: 'specific', icon: Truck },
    { value: 'EICHER_17FT', label: 'Eicher 17ft', description: 'Medium truck (9T)', category: 'specific', icon: Truck },
    { value: 'CONTAINER_20FT', label: 'Container 20ft', description: 'Standard container', category: 'specific', icon: Container },
    { value: 'CONTAINER_32FT', label: 'Container 32ft', description: 'Large container', category: 'specific', icon: Container },
    { value: 'REFRIGERATED_14FT', label: 'Refrigerated 14ft', description: 'Cold chain', category: 'specific', icon: Snowflake },
    { value: 'REFRIGERATED_20FT', label: 'Refrigerated 20ft', description: 'Large cold chain', category: 'specific', icon: Snowflake },
    { value: 'AIR_RIDE_20FT', label: 'Air Ride 20ft', description: 'Fragile goods', category: 'specific', icon: AirVent }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary" />
            Plan Generation Options
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Configure parameters to customize the AI plan generation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Strategy & Logic */}
        <div className="space-y-6">
          {/* Load Priority Strategy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Load Priority Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadPriorityStrategies.map((strategy) => {
                const Icon = strategy.icon;
                return (
                <label
                  key={strategy.value}
                  className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                    localOptions.loadPriorityStrategy === strategy.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
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
                        <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm font-medium">{strategy.label}</span>
                    </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{strategy.description}</p>
                  </div>
                </label>
                );
              })}
            </CardContent>
          </Card>

          {/* Stack Logic */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Stack Logic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stackLogicOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                    localOptions.stackLogic === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
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
                    <span className="text-sm font-medium">{option.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Vehicle Type Override */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Truck className="h-5 w-5 mr-2 text-primary" />
                Vehicle Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={localOptions.vehicleTypeOverride}
                onValueChange={(value) => handleOptionChange('vehicleTypeOverride', value)}
              >
                <SelectTrigger>
                  {(() => {
                    const selectedOption = vehicleTypeOptions.find(o => o.value === localOptions.vehicleTypeOverride);
                    return (
                      <>
                        {selectedOption && <selectedOption.icon className="h-4 w-4 mr-2" />}
                        <SelectValue placeholder="Select vehicle type" />
                      </>
                    );
                  })()}
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Automatic</SelectLabel>
                    {vehicleTypeOptions.filter(o => o.category === 'auto').map(option => {
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>By Size Category</SelectLabel>
                    {vehicleTypeOptions.filter(o => o.category === 'category').map(option => {
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Specific Vehicle Type</SelectLabel>
                    {vehicleTypeOptions.filter(o => o.category === 'specific').map(option => {
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            
            {localOptions.vehicleTypeOverride !== 'auto' && (
                <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-sm">
                    <span className="font-medium">Selected: </span>
                    <span>
                    {vehicleTypeOptions.find(o => o.value === localOptions.vehicleTypeOverride)?.label || localOptions.vehicleTypeOverride}
                  </span>
                </div>
                  <p className="text-xs text-muted-foreground mt-1">
                  Only this vehicle type will be used for plan generation
                </p>
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Constraints & Toggles */}
        <div className="space-y-6">
          {/* Utilization Limits */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Sliders className="h-5 w-5 mr-2 text-primary" />
                Max Utilization Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {/* Weight Utilization */}
              <div>
              <div className="flex justify-between items-center mb-2">
                  <Label>Max Weight Utilization</Label>
                  <span className="text-sm font-bold text-primary">{localOptions.maxWeightUtilization}%</span>
              </div>
                <Input
                type="range"
                value={localOptions.maxWeightUtilization}
                min={70}
                max={100}
                onChange={(e) => handleOptionChange('maxWeightUtilization', Number(e.target.value))}
                  className="w-full"
              />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Conservative (70%)</span>
                <span>Full (100%)</span>
              </div>
            </div>

            {/* Volume Utilization */}
              <div>
              <div className="flex justify-between items-center mb-2">
                  <Label>Max Volume Utilization</Label>
                  <span className="text-sm font-bold text-primary">{localOptions.maxVolumeUtilization}%</span>
              </div>
                <Input
                type="range"
                value={localOptions.maxVolumeUtilization}
                min={70}
                max={100}
                onChange={(e) => handleOptionChange('maxVolumeUtilization', Number(e.target.value))}
                  className="w-full"
              />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Conservative (70%)</span>
                <span>Full (100%)</span>
              </div>
            </div>

            {/* Fragility Buffer */}
            <div>
              <div className="flex justify-between items-center mb-2">
                  <Label>Fragility Spacing Buffer</Label>
                  <span className="text-sm font-bold text-primary">{localOptions.fragilityBuffer}%</span>
              </div>
                <Input
                type="range"
                value={localOptions.fragilityBuffer}
                min={0}
                max={30}
                onChange={(e) => handleOptionChange('fragilityBuffer', Number(e.target.value))}
                  className="w-full"
              />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>No Buffer</span>
                <span>30% Extra Space</span>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Protection & Safety Toggles */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Protection & Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-medium">Protected Zone Loading</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Reserve safe zones for fragile items</p>
                </div>
                <input
                  type="checkbox"
                  checked={localOptions.enableProtectedZoneLoading}
                  onChange={(e) => handleOptionChange('enableProtectedZoneLoading', e.target.checked)}
                  className="ml-3 rounded border-input"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-medium">Packaging Compatibility</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Enforce packaging stacking rules</p>
                </div>
                <input
                  type="checkbox"
                  checked={localOptions.enforcePackagingCompatibility}
                  onChange={(e) => handleOptionChange('enforcePackagingCompatibility', e.target.checked)}
                  className="ml-3 rounded border-input"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-medium">Stability Enforcement</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Validate load stability and COG</p>
                </div>
                <input
                  type="checkbox"
                  checked={localOptions.stabilityEnforcement}
                  onChange={(e) => handleOptionChange('stabilityEnforcement', e.target.checked)}
                  className="ml-3 rounded border-input"
                />
              </label>
            </CardContent>
          </Card>

          {/* Optimization Toggles */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Route className="h-5 w-5 mr-2 text-primary" />
                Optimization Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-medium">Group by Route/Cluster</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Organize orders by delivery route</p>
                </div>
                <input
                  type="checkbox"
                  checked={localOptions.groupByRoute}
                  onChange={(e) => handleOptionChange('groupByRoute', e.target.checked)}
                  className="ml-3 rounded border-input"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-medium">Allow Partial Vehicle Usage</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Permit vehicles at less than full capacity</p>
                </div>
                <input
                  type="checkbox"
                  checked={localOptions.allowPartialVehicleUsage}
                  onChange={(e) => handleOptionChange('allowPartialVehicleUsage', e.target.checked)}
                  className="ml-3 rounded border-input"
                />
              </label>
            </CardContent>
          </Card>

          {/* Risk Tolerance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                Risk Tolerance Threshold
              </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Acceptable Risk Level</span>
                <Badge variant={localOptions.riskToleranceThreshold < 30 ? 'success' : localOptions.riskToleranceThreshold < 70 ? 'warning' : 'destructive'}>
                {localOptions.riskToleranceThreshold}/100
                </Badge>
            </div>
              <Input
              type="range"
              value={localOptions.riskToleranceThreshold}
              min={0}
              max={100}
              onChange={(e) => handleOptionChange('riskToleranceThreshold', Number(e.target.value))}
                className="w-full"
            />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Conservative (0)</span>
              <span>Moderate (50)</span>
              <span>Aggressive (100)</span>
            </div>
              <p className="text-xs text-muted-foreground mt-2">
              {localOptions.riskToleranceThreshold < 30 && 'Conservative: Strict safety rules, lower utilization'}
              {localOptions.riskToleranceThreshold >= 30 && localOptions.riskToleranceThreshold < 70 && 'Moderate: Balanced approach with standard rules'}
              {localOptions.riskToleranceThreshold >= 70 && 'Aggressive: Maximum utilization, flexible rules'}
            </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
              <span className="text-muted-foreground">Strategy:</span>
            <span className="ml-1 font-medium capitalize">{localOptions.loadPriorityStrategy}</span>
          </div>
          <div>
              <span className="text-muted-foreground">Stack Logic:</span>
            <span className="ml-1 font-medium uppercase">{localOptions.stackLogic}</span>
          </div>
          <div>
              <span className="text-muted-foreground">Weight Limit:</span>
            <span className="ml-1 font-medium">{localOptions.maxWeightUtilization}%</span>
          </div>
          <div>
              <span className="text-muted-foreground">Volume Limit:</span>
            <span className="ml-1 font-medium">{localOptions.maxVolumeUtilization}%</span>
          </div>
          <div>
              <span className="text-muted-foreground">Protected Zones:</span>
            <span className="ml-1 font-medium">{localOptions.enableProtectedZoneLoading ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div>
              <span className="text-muted-foreground">Vehicle:</span>
            <span className="ml-1 font-medium capitalize">{localOptions.vehicleTypeOverride}</span>
          </div>
          <div>
              <span className="text-muted-foreground">Risk:</span>
            <span className="ml-1 font-medium">{localOptions.riskToleranceThreshold}/100</span>
          </div>
          <div>
              <span className="text-muted-foreground">Route Grouping:</span>
            <span className="ml-1 font-medium">{localOptions.groupByRoute ? 'On' : 'Off'}</span>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-start">
          <Info className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
            <h5 className="text-sm font-medium">AI Plan Generation</h5>
            <p className="text-xs text-muted-foreground mt-1">
            The AI will use these parameters to generate an optimized load plan. You can modify these settings
            and regenerate the plan at any time. Changes will take effect on the next generation.
          </p>
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanOptionsPanel;

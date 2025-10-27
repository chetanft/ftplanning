import React, { useState, useMemo, useEffect } from 'react';
import { Truck, Package, MapPin, Weight, BarChart3, Plus, Minus, AlertTriangle, CheckCircle, Lightbulb, Navigation, ArrowRight } from 'lucide-react';
import { vehicleTypes, routes } from '../data/mockData';
import { generateVehicleSuggestions, calculateUtilization, calculateOrderTotals, groupOrdersByRoute, generateDropPoints, suggestRouteType } from '../utils/vehicleOptimization';

const PlanCreation = ({ selectedOrders, materialTypes, onGeneratePlan }) => {
  // Auto-suggestion algorithm using utility function
  const autoSuggestVehicles = useMemo(() =>
    generateVehicleSuggestions(selectedOrders, vehicleTypes),
    [selectedOrders]
  );

  // Initialize with Eicher 14ft (only vehicle type available)
  const getInitialVehicleSelection = () => {
    if (autoSuggestVehicles.length > 0) {
      return autoSuggestVehicles[0].vehicles;
    }
    return [{ type: 'EICHER_14FT', quantity: 1 }];
  };

  const [selectedVehicles, setSelectedVehicles] = useState(getInitialVehicleSelection());
  const [optimizationPriorities, setOptimizationPriorities] = useState(['all']);
  const [dropPoints, setDropPoints] = useState(1);
  const [showAutoSuggestions, setShowAutoSuggestions] = useState(false);
  const [routeStrategy, setRouteStrategy] = useState('separate');
  const [loadingSequence, setLoadingSequence] = useState('lifo');
  const [allowMixedRoutes, setAllowMixedRoutes] = useState(false);

  // Group orders by route
  const ordersByRoute = useMemo(() => {
    return groupOrdersByRoute(selectedOrders);
  }, [selectedOrders]);

  // Calculate totals using utility function
  const totals = useMemo(() => calculateOrderTotals(selectedOrders), [selectedOrders]);

  // Generate drop points preview based on current settings
  const dropPointsPreview = useMemo(() => {
    return generateDropPoints(selectedOrders, dropPoints);
  }, [selectedOrders, dropPoints]);

  // Get route type suggestion
  const routeTypeSuggestion = useMemo(() => {
    return suggestRouteType(selectedOrders);
  }, [selectedOrders]);

  // Update vehicle selection when orders change
  useEffect(() => {
    if (autoSuggestVehicles.length > 0) {
      setSelectedVehicles(autoSuggestVehicles[0].vehicles);
    }
  }, [selectedOrders]); // Only depend on selectedOrders to avoid infinite loop

  // Log state changes for debugging
  useEffect(() => {
    console.log('Drop points updated:', dropPoints);
  }, [dropPoints]);

  useEffect(() => {
    console.log('Drop points preview updated:', dropPointsPreview);
  }, [dropPointsPreview]);

  useEffect(() => {
    console.log('Selected vehicles updated:', selectedVehicles);
  }, [selectedVehicles]);

  // Calculate utilization for current selection using utility function
  const currentUtilization = useMemo(() =>
    calculateUtilization(selectedVehicles, selectedOrders, vehicleTypes),
    [selectedVehicles, selectedOrders]
  );

  const handlePriorityToggle = (priority) => {
    if (priority === 'all') {
      setOptimizationPriorities(['all']);
    } else {
      const newPriorities = optimizationPriorities.includes(priority)
        ? optimizationPriorities.filter(p => p !== priority && p !== 'all')
        : [...optimizationPriorities.filter(p => p !== 'all'), priority];

      setOptimizationPriorities(newPriorities.length === 0 ? ['all'] : newPriorities);
    }
  };

  // Handler functions for vehicle selection
  const handleVehicleAdd = (vehicleType) => {
    const existingIndex = selectedVehicles.findIndex(sv => sv.type === vehicleType);
    if (existingIndex >= 0) {
      const updated = [...selectedVehicles];
      updated[existingIndex].quantity += 1;
      setSelectedVehicles(updated);
    } else {
      setSelectedVehicles([...selectedVehicles, { type: vehicleType, quantity: 1 }]);
    }
  };

  const handleVehicleRemove = (vehicleType) => {
    const existingIndex = selectedVehicles.findIndex(sv => sv.type === vehicleType);
    if (existingIndex >= 0) {
      const updated = [...selectedVehicles];
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1;
      } else {
        updated.splice(existingIndex, 1);
      }
      // Ensure at least one vehicle is selected (Eicher 14ft)
      if (updated.length === 0) {
        updated.push({ type: 'EICHER_14FT', quantity: 1 });
      }
      setSelectedVehicles(updated);
    }
  };

  const handleApplySuggestion = (suggestion) => {
    setSelectedVehicles(suggestion.vehicles);
    setShowAutoSuggestions(false);
  };

  const handleGeneratePlan = () => {
    // Validate and generate plan
    if (selectedVehicles.length === 0) {
      alert('Please select at least one vehicle');
      return;
    }

    // Check if we should use the suggested route type
    let finalDropPoints = dropPoints;
    let finalRouteStrategy = routeStrategy;

    if (routeTypeSuggestion.suggestion === 'SPMD' &&
        routeTypeSuggestion.dropLocations &&
        routeTypeSuggestion.dropLocations.length > 1) {

      // If SPMD is suggested and user has set drop points to match the suggestion
      if (dropPoints === routeTypeSuggestion.dropLocations.length) {
        finalRouteStrategy = 'consolidate'; // Use consolidated route strategy for multi-drop
        console.log('Using suggested multi-drop route with', dropPoints, 'drop points');
      }
    }

    // Prepare plan configuration
    const planConfig = {
      vehicles: selectedVehicles,
      priorities: optimizationPriorities,
      dropPoints: finalDropPoints,
      materialTypes,
      routeStrategy: finalRouteStrategy,
      loadingSequence,
      allowMixedRoutes,
      routeTypeSuggestion
    };

    // Call the parent component's handler
    onGeneratePlan(planConfig);
  };

  const getUtilizationColor = (percentage) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 90) return 'bg-yellow-500';
    if (percentage > 70) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const priorities = [
    { id: 'cost', label: 'Cost', icon: '💰' },
    { id: 'volume', label: 'Volume', icon: '📦' },
    { id: 'weight', label: 'Weight', icon: '⚖️' },
    { id: 'route', label: 'Route', icon: '🗺️' },
    { id: 'all', label: 'All (Balanced)', icon: '⚖️' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plan Creation</h2>
          <p className="text-gray-600 mt-1">
            Configure your dispatch plan for {selectedOrders.length} selected orders
          </p>
        </div>
        <button
          onClick={handleGeneratePlan}
          className="btn-primary flex items-center"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Generate Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Plan Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Freight Orders Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Freight Orders Summary</h3>
            <div className="space-y-4">
              {Object.entries(ordersByRoute).map(([routeId, orders]) => {
                const route = routes.find(r => r.id === routeId);
                const routeWeight = orders.reduce((sum, order) => sum + (order.weight * order.quantity), 0);
                const routeOrders = orders.length;

                return (
                  <div key={routeId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <h4 className="font-medium text-gray-900">{route?.name}</h4>
                          <p className="text-sm text-gray-500">
                            {selectedVehicles.length === 1
                              ? vehicleTypes.find(v => v.id === selectedVehicles[0].type)?.name
                              : `${selectedVehicles.length} vehicle types`
                            } — {
                            Math.max(currentUtilization.weight, currentUtilization.volume) > 90 ? 'Optimized' : 'Underutilized'
                          }</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{routeOrders} orders</div>
                        <div className="text-sm text-gray-500">{routeWeight} kg</div>
                      </div>
                    </div>

                    {/* Orders in this route */}
                    <div className="space-y-2">
                      {orders.map(order => (
                        <div key={order.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{order.id} - {order.seller}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-500">{order.quantity} units</span>
                            <span className="text-gray-500">{order.weight * order.quantity} kg</span>
                            <button className="text-red-600 hover:text-red-800">
                              <Minus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="mt-3 text-primary-600 hover:text-primary-800 text-sm flex items-center">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Unplanned Orders
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plan Statistics */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Plan Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{selectedOrders.length}</div>
                <div className="text-sm text-gray-500">Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {selectedVehicles.reduce((total, vehicle) => total + vehicle.quantity, 0)}
                </div>
                <div className="text-sm text-gray-500">Vehicles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totals.totalWeight.toFixed(0)}</div>
                <div className="text-sm text-gray-500">Total Weight (kg)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{selectedVehicles.reduce((total, sv) => {
                    const vehicle = vehicleTypes.find(v => v.id === sv.type);
                    // Estimate based on average route distance of 1500km
                    const estimatedDistance = 1500;
                    return total + (vehicle?.costPerKm * sv.quantity * estimatedDistance || 0);
                  }, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Est. Cost</div>
              </div>
            </div>

            {/* Utilization Bars */}
            <div className="mt-6 space-y-4">

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Weight Utilization</span>
                  <span className="font-medium">{currentUtilization.weight.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getUtilizationColor(currentUtilization.weight)}`}
                    style={{ width: `${Math.min(currentUtilization.weight, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Volume Utilization</span>
                  <span className="font-medium">{currentUtilization.volume.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getUtilizationColor(currentUtilization.volume)}`}
                    style={{ width: `${Math.min(currentUtilization.volume, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {(currentUtilization.weight > 100 || currentUtilization.volume > 100) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">
                  Warning: Capacity exceeded. Consider adding more vehicles or using auto-suggestions.
                </span>
              </div>
            )}

            {/* Auto-suggestions section */}
            {autoSuggestVehicles.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mr-1" />
                    Smart Suggestions
                  </h4>
                  <button
                    onClick={() => setShowAutoSuggestions(!showAutoSuggestions)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    {showAutoSuggestions ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showAutoSuggestions && (
                  <div className="space-y-2">
                    {autoSuggestVehicles.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleApplySuggestion(suggestion)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-blue-900">
                              {suggestion.description}
                            </div>
                            <div className="text-xs text-blue-700">
                              Cost: ₹{suggestion.totalCost}/km • Efficiency: {suggestion.efficiency.toFixed(1)}%
                            </div>
                          </div>
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Configuration */}
        <div className="space-y-6">
          {/* Vehicle Selection - Eicher 14ft Only */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Vehicle Configuration</h3>
            {(() => {
              const vehicle = vehicleTypes[0]; // Only Eicher 14ft available
              const selectedVehicle = selectedVehicles.find(sv => sv.type === vehicle.id);
              const quantity = selectedVehicle?.quantity || 1;

              return (
                <div className="p-4 border border-primary-500 bg-primary-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Truck className="h-5 w-5 text-primary-600 mr-2" />
                        <div className="font-medium text-gray-900">{vehicle.name}</div>
                      </div>

                      {/* Vehicle specifications */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Weight className="h-3 w-3 mr-1" />
                          Max Weight: {vehicle.maxWeight/1000}T
                        </div>
                        <div className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          Volume: {vehicle.volume}m³
                        </div>
                        <div>
                          L×W×H: {(vehicle.dimensions.length/1000).toFixed(2)}×{(vehicle.dimensions.width/1000).toFixed(2)}×{(vehicle.dimensions.height/1000).toFixed(2)}m
                        </div>
                        <div>
                          Cost: ₹{vehicle.costPerKm}/km
                        </div>
                      </div>

                      {/* Per vehicle utilization */}
                      <div className="mt-2 p-2 bg-white rounded border">
                        <div className="text-xs text-gray-600 mb-1">
                          Per Vehicle Utilization:
                        </div>
                        <div className="flex space-x-4 text-xs">
                          <div>
                            Weight: {((totals.totalWeight / (vehicle.maxWeight * quantity)) * 100).toFixed(1)}%
                          </div>
                          <div>
                            Volume: {((totals.totalVolume / (vehicle.volume * quantity)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle quantity controls */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-200">
                    <div className="text-sm font-medium text-gray-900">
                      Number of Vehicles:
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleVehicleRemove(vehicle.id)}
                        disabled={quantity <= 1}
                        className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-lg font-bold w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleVehicleAdd(vehicle.id)}
                        className="btn-secondary p-2"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Optimization Priorities */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Optimization Priorities</h3>
            <div className="space-y-2">
              {priorities.map(priority => (
                <label
                  key={priority.id}
                  className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={optimizationPriorities.includes(priority.id)}
                    onChange={() => handlePriorityToggle(priority.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                  />
                  <span className="mr-2">{priority.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{priority.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Route Type Suggestion */}
          {routeTypeSuggestion.suggestion === 'SPMD' && (
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-start">
                <Lightbulb className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Multi-Drop Route Suggested</h3>
                  <p className="text-sm text-blue-600 mb-2">{routeTypeSuggestion.reason}</p>

                  <div className="bg-white rounded-lg p-3 border border-blue-200 mt-3">
                    <div className="flex items-center text-sm text-blue-800 font-medium mb-2">
                      <span>Suggested Route:</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 text-sm">
                      <span className="font-medium">{routeTypeSuggestion.pickupLocation}</span>
                      {routeTypeSuggestion.dropLocations.map((location, index) => (
                        <React.Fragment key={index}>
                          <ArrowRight className="h-3 w-3 text-blue-400" />
                          <span>{location}</span>
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      Confidence: {routeTypeSuggestion.confidence}%
                    </div>
                  </div>

                  <div className="mt-3 text-sm">
                    <p>Set drop points to {routeTypeSuggestion.dropLocations.length} to use this route.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drop Points */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Drop Points</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const newValue = Math.max(1, dropPoints - 1);
                  console.log('Decreasing drop points to:', newValue);
                  setDropPoints(newValue);
                }}
                className="btn-secondary p-2"
                aria-label="Decrease drop points"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-gray-900">{dropPoints}</div>
                <div className="text-sm text-gray-500">Drop Points</div>
              </div>
              <button
                onClick={() => {
                  const newValue = dropPoints + 1;
                  console.log('Increasing drop points to:', newValue);
                  setDropPoints(newValue);
                }}
                className="btn-secondary p-2"
                aria-label="Increase drop points"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Drop Points Preview */}
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Drop Points Preview ({dropPointsPreview.length})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dropPointsPreview.map((dp, index) => (
                  <div key={dp.id} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <Navigation className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">{dp.location}</div>
                        <div className="text-xs text-gray-500">
                          {dp.orders.length} orders • {dp.route}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Multiple drop points allow for more granular delivery planning
            </div>
          </div>

          {/* Material Types */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Material Types</h3>
            <div className="space-y-2">
              {materialTypes && materialTypes.length > 0 ? (
                materialTypes.map(type => (
                  <div key={type} className="flex items-center p-2 bg-gray-50 rounded">
                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 p-2">
                  No material types selected. This will be determined automatically.
                </div>
              )}
            </div>
          </div>

          {/* Route Strategy */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Route Strategy</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Assignment Strategy
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="routeStrategy"
                      value="separate"
                      checked={routeStrategy === 'separate'}
                      onChange={(e) => setRouteStrategy(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500 mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Separate Vehicles per Route</div>
                      <div className="text-xs text-gray-500">Different vehicles for different routes</div>
                    </div>
                  </label>
                  <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="routeStrategy"
                      value="consolidate"
                      checked={routeStrategy === 'consolidate'}
                      onChange={(e) => setRouteStrategy(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500 mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Consolidate Routes</div>
                      <div className="text-xs text-gray-500">Club orders from different routes</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loading Sequence
                </label>
                <select
                  value={loadingSequence}
                  onChange={(e) => setLoadingSequence(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="lifo">LIFO (Last In, First Out)</option>
                  <option value="fifo">FIFO (First In, First Out)</option>
                  <option value="route">Route-based sequence</option>
                  <option value="weight">Weight-based sequence</option>
                  <option value="priority">Priority-based sequence</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {loadingSequence === 'lifo' && 'Heavy items loaded first (unloaded last)'}
                  {loadingSequence === 'fifo' && 'Light items loaded first (unloaded first)'}
                  {loadingSequence === 'route' && 'Maintain original order'}
                  {loadingSequence === 'weight' && 'Heaviest items first'}
                  {loadingSequence === 'priority' && 'High priority items first'}
                </div>
              </div>

              {routeStrategy === 'consolidate' && (
                <div>
                  <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowMixedRoutes}
                      onChange={(e) => setAllowMixedRoutes(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Allow Mixed Routes</div>
                      <div className="text-xs text-gray-500">Allow orders from different routes in same vehicle</div>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCreation;

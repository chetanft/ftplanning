import React, { useState, useMemo, useEffect } from 'react';
import { Truck, Package, MapPin, Weight, BarChart3, Plus, Minus, AlertTriangle, CheckCircle, Lightbulb, Navigation, ArrowRight } from 'lucide-react';
import { vehicleTypes, routes } from '../data/mockData';
import { generateVehicleSuggestions, calculateUtilization, calculateOrderTotals, groupOrdersByRoute, generateDropPoints, suggestRouteType } from '../utils/vehicleOptimization';
import { getRouteDistance, calculateMultiCityRouteDistance } from '../services/routeDistanceService';
import AIRecommendationsPanel from './AIRecommendationsPanel';

const PlanCreation = ({ selectedOrders, materialTypes, onGeneratePlan, constraints }) => {
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
  const [showAutoSuggestions, setShowAutoSuggestions] = useState(false);
  const [selectedAIVehicle, setSelectedAIVehicle] = useState(null); // Track AI-selected vehicle for visual feedback

  // Group orders by route
  const ordersByRoute = useMemo(() => {
    return groupOrdersByRoute(selectedOrders);
  }, [selectedOrders]);

  // Calculate totals using utility function
  const totals = useMemo(() => calculateOrderTotals(selectedOrders), [selectedOrders]);

  // Derive drop points from unique delivery locations in selected orders
  const derivedDropPoints = useMemo(() => {
    const uniqueLocations = new Set();
    selectedOrders.forEach(order => {
      if (order.deliveryLocation) {
        uniqueLocations.add(order.deliveryLocation);
      } else if (order.route) {
        // Fall back to route destination
        const route = routes.find(r => r.id === order.route);
        if (route?.destination) {
          uniqueLocations.add(route.destination);
        }
      }
    });
    return Array.from(uniqueLocations);
  }, [selectedOrders]);

  // Generate drop points preview based on derived locations
  const dropPointsPreview = useMemo(() => {
    return generateDropPoints(selectedOrders, derivedDropPoints.length || 1);
  }, [selectedOrders, derivedDropPoints]);

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

  // Calculate utilization for current selection using utility function
  const currentUtilization = useMemo(() =>
    calculateUtilization(selectedVehicles, selectedOrders, vehicleTypes),
    [selectedVehicles, selectedOrders]
  );

  const handleApplySuggestion = (suggestion) => {
    setSelectedVehicles(suggestion.vehicles);
    setShowAutoSuggestions(false);
  };

  const handleApplyAIRecommendation = (recommendation) => {
    console.log('Applying AI recommendation:', recommendation.vehicle.name, 'x', recommendation.vehicleCount);
    
    // Apply the recommended vehicle configuration
    setSelectedVehicles([{ 
      type: recommendation.vehicle.id, 
      quantity: recommendation.vehicleCount 
    }]);
    
    // Track the selected vehicle for visual feedback
    setSelectedAIVehicle(recommendation.vehicle.id);
    
    // Close auto-suggestions if open
    setShowAutoSuggestions(false);
  };

  const handleGeneratePlan = () => {
    // Validate and generate plan
    if (selectedVehicles.length === 0) {
      alert('Please select at least one vehicle');
      return;
    }

    // Use derived drop points from order data
    const dropPointCount = derivedDropPoints.length || 1;
    
    // Use route strategy from constraints (Settings panel)
    let finalRouteStrategy = constraints?.routeStrategy || 'separate';

    // If SPMD is suggested and multiple drop points detected, use consolidate strategy
    if (routeTypeSuggestion.suggestion === 'SPMD' &&
        routeTypeSuggestion.dropLocations &&
        routeTypeSuggestion.dropLocations.length > 1) {
      finalRouteStrategy = 'consolidate';
    }

    // Prepare plan configuration using settings from constraints
    const planConfig = {
      vehicles: selectedVehicles,
      priorities: [constraints?.optimizationPriority || 'all'],
      dropPoints: dropPointCount,
      materialTypes,
      routeStrategy: finalRouteStrategy,
      loadingSequence: constraints?.loadingSequence || 'lifo',
      allowMixedRoutes: false,
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
          
          {/* AI Recommendations */}
          <AIRecommendationsPanel
            orders={selectedOrders}
            vehicleTypes={vehicleTypes}
            selectedVehicle={selectedAIVehicle}
            onSelectVehicle={setSelectedAIVehicle}
            onApplyRecommendation={handleApplyAIRecommendation}
          />

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
                    // Calculate actual distance based on routes in selected orders
                    const routeIds = [...new Set(selectedOrders.map(o => o.route))];
                    const totalDistance = routeIds.reduce((sum, routeId) => {
                      const dist = getRouteDistance(routeId);
                      return sum + (dist || 1000); // Fallback only for unknown routes
                    }, 0);
                    const avgDistancePerRoute = routeIds.length > 0 ? totalDistance / routeIds.length : 1000;
                    return total + (vehicle?.costPerKm * sv.quantity * avgDistancePerRoute || 0);
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

        {/* Right Column - Plan Summary & Settings */}
        <div className="space-y-6">
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
                </div>
              </div>
            </div>
          )}

          {/* Delivery Locations (Read-Only) */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Navigation className="h-5 w-5 text-gray-400 mr-2" />
              Delivery Locations
            </h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900">{derivedDropPoints.length || 1}</div>
              <div className="text-sm text-gray-500">Drop {derivedDropPoints.length === 1 ? 'Point' : 'Points'}</div>
            </div>
            
            {/* Drop Points List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {dropPointsPreview.map((dp) => (
                <div key={dp.id} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-primary-500 mr-2" />
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

            <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Drop points are automatically derived from selected orders
            </div>
          </div>

          {/* Material Types */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="h-5 w-5 text-gray-400 mr-2" />
              Material Types
            </h3>
            <div className="space-y-2">
              {materialTypes && materialTypes.length > 0 ? (
                materialTypes.map(type => (
                  <div key={type} className="flex items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 p-2">
                  Determined automatically from selected orders
                </div>
              )}
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="card bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Plan Settings</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Route Strategy:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {constraints?.routeStrategy === 'consolidate' ? 'Consolidate Routes' : 'Separate Vehicles'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Loading Sequence:</span>
                <span className="font-medium text-gray-900 uppercase">
                  {constraints?.loadingSequence || 'LIFO'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Optimization:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {constraints?.optimizationPriority === 'all' ? 'Balanced' : constraints?.optimizationPriority || 'Balanced'}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Configure these settings in the Settings panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCreation;

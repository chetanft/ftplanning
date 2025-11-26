import React, { useState, useMemo, useEffect } from 'react';
import { Truck, Package, MapPin, Weight, BarChart3, Plus, Minus, AlertTriangle, CheckCircle, Lightbulb, Navigation, ArrowRight } from 'lucide-react';
import { vehicleTypes, routes } from '../data/mockData';
import { generateVehicleSuggestions, calculateUtilization, calculateOrderTotals, groupOrdersByRoute, generateDropPoints, suggestRouteType } from '../utils/vehicleOptimization';
import { getRouteDistance, calculateMultiCityRouteDistance } from '../services/routeDistanceService';
import AIRecommendationsPanel from './AIRecommendationsPanel';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import PlanEditModal from './PlanEditModal';
import { Switch } from "@/components/ui/switch"; // Assuming Switch exists or will fallback to simple toggle
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { scoreUnplannedOrders } from '../utils/orderRecommendation';

const PlanCreation = ({ selectedOrders, materialTypes, onGeneratePlan, constraints, availableOrders = [], onAddOrder }) => {
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

  // Manual Mode State
  const [isManualMode, setIsManualMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [manualPlan, setManualPlan] = useState(null);

  // Stacking Direction State
  const [stackingDirection, setStackingDirection] = useState('bottom-up'); // 'bottom-up', 'pier-to-pier'

  // Popover state for unplanned orders (keyed by routeId)
  const [openPopovers, setOpenPopovers] = useState({});

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

  // Utilization Recommendations Logic
  const utilizationRecommendations = useMemo(() => {
    // Only suggest if we have available orders and current utilization is somewhat low but not empty
    if (!availableOrders.length || !currentUtilization || currentUtilization.weight > 95 || currentUtilization.volume > 95) {
      return [];
    }

    const recommendations = [];
    const currentWeight = totals.totalWeight;
    const currentVolume = totals.totalVolume;

    // Calculate total capacity of selected vehicles
    let totalMaxWeight = 0;
    let totalMaxVolume = 0;

    selectedVehicles.forEach(sv => {
      const vehicleSpec = vehicleTypes.find(v => v.id === sv.type);
      if (vehicleSpec) {
        totalMaxWeight += vehicleSpec.maxWeight * sv.quantity;
        totalMaxVolume += vehicleSpec.volume * sv.quantity;
      }
    });

    const remainingWeight = totalMaxWeight - currentWeight;
    const remainingVolume = totalMaxVolume - currentVolume;

    // Simple greedy strategy: find orders that fit
    // Filter orders that fit within remaining capacity (with some buffer)
    const candidates = availableOrders.filter(order => {
      const orderVolume = order.materialType === 'cuboidal'
        ? (order.dimensions.length * order.dimensions.width * order.dimensions.height) / 1e9
        : (Math.PI * Math.pow((order.dimensions.diameter || 0) / 2000, 2) * ((order.dimensions.height || 0) / 1000));

      const totalOrderWeight = order.weight * (order.quantity || 1);
      const totalOrderVolume = orderVolume * (order.quantity || 1);

      return totalOrderWeight <= remainingWeight && totalOrderVolume <= remainingVolume;
    });

    // Sort by weight (heaviest first) to maximize utilization
    candidates.sort((a, b) => (b.weight * (b.quantity || 1)) - (a.weight * (a.quantity || 1)));

    // Take top 3
    return candidates.slice(0, 3);
  }, [availableOrders, currentUtilization, totals, selectedVehicles]);

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
      stackingDirection, // Pass stacking direction
      allowMixedRoutes: false,
      routeTypeSuggestion,
      // Add manual plan data if in manual mode
      isManualMode,
      manualPlan: isManualMode ? manualPlan : null
    };

    // Call the parent component's handler
    onGeneratePlan(planConfig);
  };

  const handleManualPlanSave = (planData) => {
    setManualPlan(planData);
    // Optionally calculate utilization based on manual plan
    // But for now we just store it
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
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={!isManualMode ? "white" : "ghost"}
              size="sm"
              onClick={() => setIsManualMode(false)}
              className={!isManualMode ? "bg-white shadow-sm" : ""}
            >
              AI Optimized
            </Button>
            <Button
              variant={isManualMode ? "white" : "ghost"}
              size="sm"
              onClick={() => setIsManualMode(true)}
              className={isManualMode ? "bg-white shadow-sm" : ""}
            >
              Manual Plan
            </Button>
          </div>

          {isManualMode ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                {manualPlan ? 'Edit Manual Plan' : 'Create Manual Plan'}
              </Button>
              <Button onClick={handleGeneratePlan} disabled={!manualPlan}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Plan
              </Button>
            </div>
          ) : (
            <Button onClick={handleGeneratePlan}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Plan
            </Button>
          )}
        </div>
      </div>

      {/* Manual Plan Editor Modal */}
      <PlanEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleManualPlanSave}
        currentPlan={manualPlan || { items: [] }}
        allOrders={selectedOrders}
        vehicleSpecs={vehicleTypes.find(v => v.id === selectedVehicles[0]?.type)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Plan Summary */}
        <div className="lg:col-span-2 space-y-6">

          {/* AI Recommendations */}
          <AIRecommendationsPanel
            orders={selectedOrders}
            vehicleTypes={vehicleTypes}
            selectedVehicle={selectedVehicles[0]?.type}
            onSelectVehicle={(vehicleId) => {
              const vehicle = vehicleTypes.find(v => v.id === vehicleId);
              if (vehicle) {
                setSelectedVehicles([{ type: vehicleId, quantity: 1 }]);
              }
            }}
            onApplyRecommendation={handleApplyAIRecommendation}
            utilizationRecommendations={utilizationRecommendations}
            onAddOrder={onAddOrder}
            currentUtilization={currentUtilization}
            selectedOrders={selectedOrders}
            selectedVehicles={selectedVehicles}
          />

          {/* Freight Orders Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Freight Orders Summary</CardTitle>
            </CardHeader>
            <CardContent>
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
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Popover
                        open={openPopovers[routeId] || false}
                        onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, [routeId]: open }))}
                      >
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-3">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Unplanned Orders
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm mb-3">
                              Unplanned Orders for {route?.name || routeId}
                            </h4>
                            {(() => {
                              // Debug: Log for troubleshooting
                              console.log('🔍 Debug Unplanned Orders:', {
                                routeId,
                                routeName: route?.name,
                                availableOrdersCount: availableOrders?.length,
                                selectedOrdersCount: selectedOrders?.length,
                                availableOrdersSample: availableOrders?.slice(0, 3).map(o => ({ id: o.id, route: o.route })),
                                routeUnplannedSample: availableOrders?.filter(o => String(o.route) === String(routeId)).slice(0, 3).map(o => ({ id: o.id, route: o.route }))
                              });

                              // Debug: Log for troubleshooting
                              if (!availableOrders || availableOrders.length === 0) {
                                return (
                                  <div className="text-sm text-gray-500 py-4 text-center">
                                    <div>No unplanned orders available</div>
                                    <div className="text-xs mt-1 text-gray-400">
                                      All orders may already be selected ({selectedOrders?.length || 0} selected)
                                    </div>
                                  </div>
                                );
                              }

                              // Filter available orders by this route
                              // Match by route ID, or by delivery location matching route destination
                              const routeUnplannedOrders = availableOrders.filter(order => {
                                // Direct route match (most common case) - strict comparison
                                const routeMatch = String(order.route) === String(routeId);
                                if (routeMatch) return true;

                                // Match by delivery location if route object exists
                                if (route && order.delivery) {
                                  const deliveryLower = order.delivery.toLowerCase();
                                  const routeDestinationLower = route.destination.toLowerCase();
                                  // Check if delivery location contains route destination or vice versa
                                  if (deliveryLower.includes(routeDestinationLower) ||
                                    routeDestinationLower.includes(deliveryLower)) {
                                    return true;
                                  }
                                }

                                // Match by deliveryLocation field if it exists
                                if (route && order.deliveryLocation) {
                                  const deliveryLocLower = order.deliveryLocation.toLowerCase();
                                  const routeDestinationLower = route.destination.toLowerCase();
                                  if (deliveryLocLower.includes(routeDestinationLower) ||
                                    routeDestinationLower.includes(deliveryLocLower)) {
                                    return true;
                                  }
                                }

                                return false;
                              });

                              // If no route-specific orders, show all unplanned orders as fallback
                              const ordersToShow = routeUnplannedOrders.length > 0
                                ? routeUnplannedOrders
                                : availableOrders;

                              if (ordersToShow.length === 0) {
                                // This shouldn't happen if availableOrders.length > 0, but handle it anyway
                                return (
                                  <div className="text-sm text-gray-500 py-4 text-center">
                                    <div>No unplanned orders available</div>
                                    {availableOrders.length > 0 && (
                                      <div className="text-xs mt-1 text-gray-400 space-y-1">
                                        <div>{availableOrders.length} unplanned orders exist but none match route "{routeId}"</div>
                                        <div className="text-blue-600 cursor-pointer underline" onClick={() => {
                                          console.log('Available orders:', availableOrders.map(o => ({ id: o.id, route: o.route, delivery: o.delivery })));
                                          console.log('Looking for routeId:', routeId);
                                        }}>
                                          Click to see debug info in console
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              // Show indicator if showing all orders instead of route-specific
                              const isShowingAll = routeUnplannedOrders.length > 0 && availableOrders.length > 0;

                              // Score and rank orders
                              const vehicleSpec = vehicleTypes.find(v => v.id === selectedVehicles[0]?.type);
                              const scoredOrders = scoreUnplannedOrders(
                                ordersToShow,
                                selectedOrders,
                                currentUtilization,
                                vehicleSpec
                              ).filter(order => order.recommendation?.canFit); // Only show orders that can fit

                              return (
                                <div className="space-y-2">
                                  {routeUnplannedOrders.length > 0 && (
                                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded mb-2">
                                      ✓ Found {routeUnplannedOrders.length} order{routeUnplannedOrders.length !== 1 ? 's' : ''} for route "{routeId}"
                                    </div>
                                  )}
                                  {isShowingAll && (
                                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2">
                                      Showing all unplanned orders ({availableOrders.length} total)
                                      <div className="text-gray-500 mt-1">
                                        No orders found matching route "{routeId}"
                                        <div className="text-xs mt-1 text-gray-400">
                                          Available routes in unplanned: {[...new Set(availableOrders.map(o => o.route))].join(', ')}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="max-h-96 overflow-y-auto space-y-3">
                                    {scoredOrders.map(order => (
                                      <div
                                        key={order.id}
                                        className={`border rounded-lg p-3 ${order.recommendation?.canFit
                                          ? 'border-gray-200 hover:border-blue-300'
                                          : 'border-red-200 bg-red-50 opacity-60'
                                          }`}
                                      >
                                        {/* Header with Order ID and Score */}
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <div className="text-sm font-semibold text-gray-900">
                                                {order.id}
                                              </div>
                                              {order.recommendation && (
                                                <span
                                                  className="text-xs font-bold px-2 py-0.5 rounded"
                                                  style={{
                                                    backgroundColor: `${order.recommendation.quality.color}20`,
                                                    color: order.recommendation.quality.color
                                                  }}
                                                >
                                                  {order.recommendation.totalScore}
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-0.5">
                                              {order.seller || order.customer}
                                            </div>
                                          </div>
                                          {order.recommendation && (
                                            <div className="text-right">
                                              <div
                                                className="text-xs font-medium"
                                                style={{ color: order.recommendation.quality.color }}
                                              >
                                                {order.recommendation.quality.label}
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Weight:</span>
                                            <span className="font-medium">{order.weight * (order.quantity || 1)}kg</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Qty:</span>
                                            <span className="font-medium">{order.quantity || 1}</span>
                                          </div>
                                          {order.recommendation && (
                                            <>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">W Fit:</span>
                                                <span className="font-medium">{order.recommendation.metrics.weightFit}%</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">V Fit:</span>
                                                <span className="font-medium">{order.recommendation.metrics.volumeFit}%</span>
                                              </div>
                                            </>
                                          )}
                                        </div>

                                        {/* Reasons */}
                                        {order.recommendation?.reasons && order.recommendation.reasons.length > 0 && (
                                          <div className="mb-2">
                                            <div className="text-xs text-gray-500 space-y-0.5">
                                              {order.recommendation.reasons.slice(0, 2).map((reason, idx) => (
                                                <div key={idx} className="flex items-center">
                                                  <span className="w-1 h-1 bg-green-500 rounded-full mr-1.5"></span>
                                                  {reason}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Add Button */}
                                        <Button
                                          size="sm"
                                          variant={order.recommendation?.canFit ? "default" : "outline"}
                                          className="w-full"
                                          disabled={!order.recommendation?.canFit}
                                          onClick={() => {
                                            if (onAddOrder) {
                                              onAddOrder(order);
                                              setOpenPopovers(prev => ({ ...prev, [routeId]: false }));
                                            }
                                          }}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          {order.recommendation?.canFit ? 'Add Order' : 'Won\'t Fit'}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>



          {/* Plan Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Statistics</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <span className="text-muted-foreground">Weight Utilization</span>
                    <span className="font-medium">{currentUtilization.weight.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={Math.min(currentUtilization.weight, 100)}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Volume Utilization</span>
                    <span className="font-medium">{currentUtilization.volume.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={Math.min(currentUtilization.volume, 100)}
                    className="h-2"
                  />
                </div>
              </div>

              {(currentUtilization.weight > 100 || currentUtilization.volume > 100) && (
                <Card className="mt-4 border-destructive/50 bg-destructive/10">
                  <CardContent className="p-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                    <span className="text-sm text-destructive">
                      Warning: Capacity exceeded. Consider adding more vehicles or using auto-suggestions.
                    </span>
                  </CardContent>
                </Card>
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
            </CardContent>
          </Card>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="h-5 w-5 text-muted-foreground mr-2" />
                Delivery Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
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

              <div className="mt-3 text-xs text-muted-foreground bg-muted p-2 rounded">
                Drop points are automatically derived from selected orders
              </div>
            </CardContent>
          </Card>

          {/* Material Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 text-muted-foreground mr-2" />
                Material Types
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Current Settings Summary */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Plan Settings</CardTitle>
            </CardHeader>
            <CardContent>
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

                {/* Stacking Direction Selector */}
                <div className="flex justify-between items-center pt-2 border-t mt-2">
                  <span className="text-gray-600">Stack Direction:</span>
                  <select
                    className="text-sm border rounded p-1 bg-white"
                    value={stackingDirection}
                    onChange={(e) => setStackingDirection(e.target.value)}
                  >
                    <option value="bottom-up">Bottom-Up (Standard)</option>
                    <option value="pier-to-pier">Pier-to-Pier (Side)</option>
                  </select>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Configure these settings in the Settings panel
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanCreation;

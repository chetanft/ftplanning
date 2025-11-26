import React, { useState, useMemo } from 'react';
import { Package, Settings, BarChart3, FileText, Map, X } from 'lucide-react';
import AppLayout from './components/layout/AppLayout';
import OrderIntake from './components/OrderIntake';
import MaterialTypeModal from './components/MaterialTypeModal';
import PlanCreation from './components/PlanCreation';
import ConstraintsPanel from './components/ConstraintsPanel';
import TruckVisualization from './components/TruckVisualization';
import RouteVisualization from './components/RouteVisualization';
import CreatePlanPage from './components/CreatePlanPage';
import PlansList from './components/PlansList';
import ErrorBoundary from './components/ErrorBoundary';
import { sampleOrders, vehicleTypes } from './data/mockData';
import { distributeOrdersAcrossVehicles, calculateOrderTotals } from './utils/vehicleOptimization';
import { LoadOptimizer } from './utils/loadOptimization';
import GoogleMapsService from './services/googleMapsService';
import { getVehicleRouteInfo, calculatePlanCost } from './services/routeDistanceService';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function App() {
  const [currentView, setCurrentView] = useState('orders');
  const [orders, setOrders] = useState(sampleOrders);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [plans, setPlans] = useState([]);
  const [materialTypeModalOpen, setMaterialTypeModalOpen] = useState(false);
  const [selectedMaterialTypes, setSelectedMaterialTypes] = useState([]);
  const [planData, setPlanData] = useState(null);
  const [constraintsModalOpen, setConstraintsModalOpen] = useState(false);
  const [constraints, setConstraints] = useState({
    optimizationPriority: 'all',
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    maxWeight: 25000,
    maxVolume: 38.5,
    dropPoints: 1,
    priorities: ['all']
  });

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
  const googleMapsService = useMemo(() => new GoogleMapsService(googleMapsApiKey), [googleMapsApiKey]);

  const handleUpdateOrder = (orderId, updates) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
    setSelectedOrders(prevSelected =>
      prevSelected.map(order =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  };

  const handleAddOrder = (order) => {
    // Check if order is already selected
    if (!selectedOrders.find(o => o.id === order.id)) {
      setSelectedOrders(prev => [...prev, order]);
    }
  };

  // Calculate available orders (orders not currently selected)
  const availableOrders = useMemo(() => {
    const selectedIds = new Set(selectedOrders.map(o => o.id));
    return orders.filter(order => !selectedIds.has(order.id));
  }, [orders, selectedOrders]);

  const handleCreatePlan = () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order to create a plan');
      return;
    }

    const detectedMaterialTypes = [...new Set(selectedOrders.map(order => order.materialType))];
    let autoSelectedTypes = [];
    if (detectedMaterialTypes.includes('cuboidal') && detectedMaterialTypes.includes('cylindrical')) {
      autoSelectedTypes = ['both'];
    } else if (detectedMaterialTypes.includes('cuboidal')) {
      autoSelectedTypes = ['cuboidal'];
    } else if (detectedMaterialTypes.includes('cylindrical')) {
      autoSelectedTypes = ['cylindrical'];
    }

    if (autoSelectedTypes.length > 0) {
      setSelectedMaterialTypes(autoSelectedTypes);
      setCurrentView('wizard');
    } else {
      setSelectedMaterialTypes(autoSelectedTypes);
      setMaterialTypeModalOpen(true);
    }
  };

  const handleMaterialTypeSelection = (types) => {
    setSelectedMaterialTypes(types);
    setMaterialTypeModalOpen(false);
    setCurrentView('wizard');
  };

  const handleGeneratePlan = async (planConfig) => {
    const { totalWeight, totalVolume } = calculateOrderTotals(selectedOrders);
    const routeOptions = {
      routeStrategy: constraints.routeStrategy || planConfig.routeStrategy || 'separate',
      loadingSequence: constraints.loadingSequence || planConfig.loadingSequence || 'lifo',
      allowMixedRoutes: planConfig.allowMixedRoutes || false,
      dropPoints: planConfig.dropPoints || 1,
      vehicleTypeOverride: planConfig.vehicleTypeOverride || 'auto'
    };

    let optimizedVehicles;

    if (planConfig.isManualMode && planConfig.manualPlan) {
      // MANUAL MODE: Use the manually created plan
      // Assuming single vehicle for manual mode for now, or that manualPlan contains vehicle mapping
      // The current PlanEditModal produces a flat list of items with positions for a single vehicle context

      const vehicleSpec = vehicleTypes.find(vt => vt.id === planConfig.vehicles[0].type);
      const manualItems = planConfig.manualPlan.items;

      // Calculate route info for the manually assigned orders
      const routeInfo = getVehicleRouteInfo({
        type: vehicleSpec.id,
        orders: manualItems,
        costPerKm: vehicleSpec.costPerKm
      });

      optimizedVehicles = [{
        type: vehicleSpec.id,
        quantity: 1, // Manual mode currently focuses on single vehicle planning
        orders: manualItems,
        loadPlan: {
          items: manualItems,
          metrics: planConfig.manualPlan.metrics,
          warnings: planConfig.manualPlan.warnings
        },
        optimizedPositions: manualItems,
        routeInfo: routeInfo
      }];
    } else {
      // AI MODE: Run optimization
      const vehicles = distributeOrdersAcrossVehicles(selectedOrders, planConfig.vehicles, vehicleTypes, routeOptions);

      optimizedVehicles = vehicles.map(vehicle => {
        const vehicleSpec = vehicleTypes.find(vt => vt.id === vehicle.type);
        const loadOptimizer = new LoadOptimizer(vehicleSpec, constraints);
        const loadPlan = loadOptimizer.optimizeLoad(vehicle.orders);
        const routeInfo = getVehicleRouteInfo({
          ...vehicle,
          costPerKm: vehicleSpec?.costPerKm
        });

        return {
          ...vehicle,
          loadPlan,
          optimizedPositions: loadPlan.items,
          routeInfo: routeInfo
        };
      });
    }

    const planCostInfo = calculatePlanCost(
      optimizedVehicles.map(v => ({
        ...v,
        costPerKm: vehicleTypes.find(vt => vt.id === v.type)?.costPerKm
      }))
    );
    const totalCost = planCostInfo.totalCost;

    const generatedPlan = {
      id: `PLAN-${String(plans.length + 1).padStart(3, '0')}`,
      orders: selectedOrders,
      materialTypes: selectedMaterialTypes,
      constraints: constraints,
      vehicles: optimizedVehicles,
      vehicleConfig: planConfig.vehicles,
      dropPoints: planConfig.dropPoints,
      routeStrategy: planConfig.routeStrategy,
      loadingSequence: planConfig.loadingSequence,
      allowMixedRoutes: planConfig.allowMixedRoutes,
      totalCost: totalCost,
      totalDistance: planCostInfo.totalDistance,
      totalDuration: planCostInfo.totalDuration,
      costBreakdown: planCostInfo.breakdown,
      totalWeight: totalWeight,
      totalVolume: totalVolume,
      createdAt: new Date().toISOString(),
      status: 'Planned'
    };

    setPlanData(generatedPlan);
  };

  const handlePublishPlan = () => {
    if (planData) {
      setPlans([planData, ...plans]);
    }
    const updatedOrders = orders.map(order => {
      if (selectedOrders.some(selected => selected.id === order.id)) {
        return { ...order, status: 'planned' };
      }
      return order;
    });
    setOrders(updatedOrders);
    alert('Plan published successfully!');
    setSelectedOrders([]);
    setPlanData(null);
    setCurrentView('plans');
  };

  const navigation = [
    { id: 'orders', label: 'Order Intake', icon: Package },
    { id: 'plans', label: 'Plans', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    // Visualization is context-dependent, usually accessed from Plans
    // { id: 'visualization', label: '3D Load View', icon: LayoutDashboard },
    // { id: 'routes', label: 'Route Map', icon: Map },
  ];

  return (
    <AppLayout
      navigation={navigation}
      currentView={currentView}
      onChangeView={setCurrentView}
      onSettingsClick={() => setConstraintsModalOpen(true)}
    >
      {currentView === 'orders' && (
        <OrderIntake
          orders={orders}
          selectedOrders={selectedOrders}
          onOrderSelection={setSelectedOrders}
          onUpdateOrder={handleUpdateOrder}
          onCreatePlan={handleCreatePlan}
        />
      )}

      {currentView === 'planning' && (
        selectedOrders.length > 0 ? (
          <PlanCreation
            selectedOrders={selectedOrders}
            materialTypes={selectedMaterialTypes}
            constraints={constraints}
            onGeneratePlan={handleGeneratePlan}
            availableOrders={availableOrders}
            onAddOrder={handleAddOrder}
          />
        ) : (
          <Card className="text-center py-12">
            <div className="flex flex-col items-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Orders Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please go to Order Intake and select some orders to create a plan.
              </p>
              <Button onClick={() => setCurrentView('orders')}>
                Go to Order Intake
              </Button>
            </div>
          </Card>
        )
      )}

      {currentView === 'plans' && (
        <PlansList
          plans={plans}
          onViewPlan={(plan) => {
            setPlanData(plan);
            setCurrentView('visualization');
          }}
        />
      )}

      {currentView === 'wizard' && (
        selectedOrders.length > 0 ? (
          <CreatePlanPage
            selectedOrders={selectedOrders}
            materialTypes={selectedMaterialTypes}
            onGeneratePlan={handleGeneratePlan}
            onPublishPlan={handlePublishPlan}
            planData={planData}
            googleMapsApiKey={googleMapsApiKey}
            availableOrders={availableOrders}
            onAddOrder={handleAddOrder}
          />
        ) : (
          <Card className="text-center py-12">
            <div className="flex flex-col items-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Orders Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please go to Order Intake and select some orders to create a plan.
              </p>
              <Button onClick={() => setCurrentView('orders')}>
                Go to Order Intake
              </Button>
            </div>
          </Card>
        )
      )}

      {currentView === 'visualization' && (
        planData ? (
          <ErrorBoundary
            title="3D Visualization Error"
            message="There was an issue loading the 3D visualization component."
          >
            <TruckVisualization
              planData={planData}
            />
          </ErrorBoundary>
        ) : (
          <Card className="text-center py-12">
            <div className="flex flex-col items-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Plan Generated</h3>
              <p className="text-muted-foreground mb-4">
                Please create and generate a plan first to view the 3D visualization.
              </p>
              <Button onClick={() => setCurrentView('orders')}>
                Start with Order Intake
              </Button>
            </div>
          </Card>
        )
      )}

      {currentView === 'routes' && (
        planData ? (
          <ErrorBoundary
            title="Route Visualization Error"
            message="There was an issue loading the route visualization component."
          >
            <RouteVisualization
              planData={planData}
              googleMapsApiKey={googleMapsApiKey}
              availableOrders={orders.filter(o => !selectedOrders.find(so => so.id === o.id) && o.status !== 'planned')}
              onAddOrder={(order) => setSelectedOrders([...selectedOrders, order])}
            />
          </ErrorBoundary>
        ) : (
          <Card className="text-center py-12">
            <div className="flex flex-col items-center">
              <Map className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Routes to Display</h3>
              <p className="text-muted-foreground mb-4">
                Please create and generate a plan first to view route optimization.
              </p>
              <Button onClick={() => setCurrentView('orders')}>
                Start with Order Intake
              </Button>
            </div>
          </Card>
        )
      )}

      {currentView === 'reports' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Reports & Analytics</h2>
          <p className="text-muted-foreground">Reports functionality will be implemented here.</p>
        </Card>
      )}

      {/* Material Type Selection Modal */}
      <MaterialTypeModal
        isOpen={materialTypeModalOpen}
        onClose={() => setMaterialTypeModalOpen(false)}
        onSelect={handleMaterialTypeSelection}
        preSelectedTypes={selectedMaterialTypes}
      />

      {/* Constraints Modal */}
      {constraintsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Constraints & Settings</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConstraintsModalOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <ConstraintsPanel
                constraints={constraints}
                onConstraintsChange={setConstraints}
              />
              <div className="flex justify-end mt-6">
                <Button onClick={() => setConstraintsModalOpen(false)}>
                  Save & Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default App;

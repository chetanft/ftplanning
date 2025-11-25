import React, { useState } from 'react';
import { Truck, Package, Settings, BarChart3, FileText, Map } from 'lucide-react';
import OrderIntake from './components/OrderIntake';
import MaterialTypeModal from './components/MaterialTypeModal';
import PlanCreation from './components/PlanCreation';
import ConstraintsPanel from './components/ConstraintsPanel';
import TruckVisualization from './components/TruckVisualization';
import RouteVisualization from './components/RouteVisualization';
import CreatePlanPage from './components/CreatePlanPage';
import PlansList from './components/PlansList';
import ErrorBoundary from './components/ErrorBoundary';
import { sampleOrders, vehicleTypes, routes } from './data/mockData';
import { distributeOrdersAcrossVehicles, calculateOrderTotals } from './utils/vehicleOptimization';
import { LoadOptimizer } from './utils/loadOptimization';
import GoogleMapsService from './services/googleMapsService';
import { getVehicleRouteInfo, calculatePlanCost } from './services/routeDistanceService';

function App() {
  const [currentView, setCurrentView] = useState('orders');
  const [orders, setOrders] = useState(sampleOrders);
  const [selectedOrders, setSelectedOrders] = useState([]);
  // Initialize with empty plans array - no mock data
  const [plans, setPlans] = useState([]);
  const [materialTypeModalOpen, setMaterialTypeModalOpen] = useState(false);
  const [selectedMaterialTypes, setSelectedMaterialTypes] = useState([]);
  const [planData, setPlanData] = useState(null);
  const [constraintsModalOpen, setConstraintsModalOpen] = useState(false);
  const [constraints, setConstraints] = useState({
    // Optimization settings
    optimizationPriority: 'all',
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    // Vehicle constraints
    maxWeight: 25000,
    maxVolume: 38.5,
    // Legacy/derived
    dropPoints: 1,
    priorities: ['all']
  });

  // Google Maps API key - in production, this should be in environment variables
  // For Vite, use import.meta.env instead of process.env
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
  const googleMapsService = new GoogleMapsService(googleMapsApiKey);



  const handleUpdateOrder = (orderId, updates) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
    
    // Also update selected orders if they are modified
    setSelectedOrders(prevSelected => 
      prevSelected.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  };

  const handleCreatePlan = () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order to create a plan');
      return;
    }

    // Auto-detect material types from selected orders
    const detectedMaterialTypes = [...new Set(selectedOrders.map(order => order.materialType))];

    // Auto-select material types based on detected types
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
      // Set the auto-selected types before opening modal
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
    // Enhanced plan generation with multiple vehicles using utility functions
    const { totalWeight, totalVolume } = calculateOrderTotals(selectedOrders);

    // Use settings from constraints (Settings panel) with fallback to planConfig
    const routeOptions = {
      routeStrategy: constraints.routeStrategy || planConfig.routeStrategy || 'separate',
      loadingSequence: constraints.loadingSequence || planConfig.loadingSequence || 'lifo',
      allowMixedRoutes: planConfig.allowMixedRoutes || false,
      dropPoints: planConfig.dropPoints || 1
    };

    // Use the optimized distribution algorithm with route awareness
    const vehicles = distributeOrdersAcrossVehicles(selectedOrders, planConfig.vehicles, vehicleTypes, routeOptions);

    // Enhanced load optimization for each vehicle
    const optimizedVehicles = vehicles.map(vehicle => {
      const vehicleSpec = vehicleTypes.find(vt => vt.id === vehicle.type);
      const loadOptimizer = new LoadOptimizer(vehicleSpec, constraints);
      const loadPlan = loadOptimizer.optimizeLoad(vehicle.orders);

      // Get actual route info for this vehicle using the route distance service
      const routeInfo = getVehicleRouteInfo({
        ...vehicle,
        costPerKm: vehicleSpec?.costPerKm
      });

      return {
        ...vehicle,
        loadPlan,
        optimizedPositions: loadPlan.items,
        routeInfo: routeInfo // Include route details for display
      };
    });

    // Calculate total cost using the route distance service (actual distances)
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
    // Add plan to plans list
    if (planData) {
      setPlans([planData, ...plans]);
    }

    // Update status of selected orders to 'planned'
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
    setCurrentView('plans'); // Redirect to Plans List
  };

  const navigation = [
    { id: 'orders', label: 'Order Intake', icon: Package },
    { id: 'plans', label: 'Plans', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-yellow-500">Freight Tiger</span> SmartDispatch Planner
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setConstraintsModalOpen(true)}
                className="flex items-center text-gray-500 hover:text-gray-700"
                title="Constraints & Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-500">
                {selectedOrders.length} orders selected
              </span>
              {currentView === 'orders' && (
                <button
                  onClick={handleCreatePlan}
                  className="btn-primary"
                  disabled={selectedOrders.length === 0}
                >
                  Create Plan
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    currentView === item.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'orders' && (
          <OrderIntake
            orders={orders}
            selectedOrders={selectedOrders}
            onOrderSelection={setSelectedOrders}
            onUpdateOrder={handleUpdateOrder}
          />
        )}

        {currentView === 'planning' && (
          selectedOrders.length > 0 ? (
            <PlanCreation
              selectedOrders={selectedOrders}
              materialTypes={selectedMaterialTypes}
              constraints={constraints}
              onGeneratePlan={handleGeneratePlan}
            />
          ) : (
            <div className="card text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Selected</h3>
              <p className="text-gray-600 mb-4">
                Please go to Order Intake and select some orders to create a plan.
              </p>
              <button
                onClick={() => setCurrentView('orders')}
                className="btn-primary"
              >
                Go to Order Intake
              </button>
            </div>
          )
        )}

        {currentView === 'plans' && (
          <PlansList 
            plans={plans} 
            onViewPlan={(plan) => {
              setPlanData(plan);
              // Currently we don't have a separate view mode for details, 
              // could reuse wizard in read-only or just log it for now.
              // For demo purposes, let's show the visualization view
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
            />
          ) : (
            <div className="card text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Selected</h3>
              <p className="text-gray-600 mb-4">
                Please go to Order Intake and select some orders to create a plan.
              </p>
              <button
                onClick={() => setCurrentView('orders')}
                className="btn-primary"
              >
                Go to Order Intake
              </button>
            </div>
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
            <div className="card text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Plan Generated</h3>
              <p className="text-gray-600 mb-4">
                Please create and generate a plan first to view the 3D visualization.
              </p>
              <button
                onClick={() => setCurrentView('orders')}
                className="btn-primary"
              >
                Start with Order Intake
              </button>
            </div>
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
              />
            </ErrorBoundary>
          ) : (
            <div className="card text-center py-12">
              <Map className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Routes to Display</h3>
              <p className="text-gray-600 mb-4">
                Please create and generate a plan first to view route optimization.
              </p>
              <button
                onClick={() => setCurrentView('orders')}
                className="btn-primary"
              >
                Start with Order Intake
              </button>
            </div>
          )
        )}

        {currentView === 'reports' && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Reports & Analytics</h2>
            <p className="text-gray-600">Reports functionality will be implemented here.</p>
          </div>
        )}
      </main>

      {/* Material Type Selection Modal */}
      <MaterialTypeModal
        isOpen={materialTypeModalOpen}
        onClose={() => setMaterialTypeModalOpen(false)}
        onSelect={handleMaterialTypeSelection}
        preSelectedTypes={selectedMaterialTypes}
      />

      {/* Constraints Modal */}
      {constraintsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Constraints & Settings</h2>
                <button
                  onClick={() => setConstraintsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ConstraintsPanel
                constraints={constraints}
                onConstraintsChange={setConstraints}
              />
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setConstraintsModalOpen(false)}
                  className="btn-primary"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

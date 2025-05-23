import React, { useState } from 'react';
import { Truck, Package, Settings, BarChart3, FileText, Map } from 'lucide-react';
import OrderIntake from './components/OrderIntake';
import MaterialTypeModal from './components/MaterialTypeModal';
import PlanCreation from './components/PlanCreation';
import ConstraintsPanel from './components/ConstraintsPanel';
import TruckVisualization from './components/TruckVisualization';
import RouteVisualization from './components/RouteVisualization';
import ErrorBoundary from './components/ErrorBoundary';
import { sampleOrders, vehicleTypes, routes } from './data/mockData';
import { distributeOrdersAcrossVehicles, calculateOrderTotals } from './utils/vehicleOptimization';
import { LoadOptimizer } from './utils/loadOptimization';
import GoogleMapsService from './services/googleMapsService';

function App() {
  const [currentView, setCurrentView] = useState('orders');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [materialTypeModalOpen, setMaterialTypeModalOpen] = useState(false);
  const [selectedMaterialTypes, setSelectedMaterialTypes] = useState([]);
  const [planData, setPlanData] = useState(null);
  const [constraints, setConstraints] = useState({
    priorities: ['all'],
    dropPoints: 1,
    maxWeight: 25000,
    maxVolume: 38.5
  });

  // Google Maps API key - in production, this should be in environment variables
  // For Vite, use import.meta.env instead of process.env
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
  const googleMapsService = new GoogleMapsService(googleMapsApiKey);



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

    // Set the auto-selected types before opening modal
    setSelectedMaterialTypes(autoSelectedTypes);
    setMaterialTypeModalOpen(true);
  };

  const handleMaterialTypeSelection = (types) => {
    setSelectedMaterialTypes(types);
    setMaterialTypeModalOpen(false);
    setCurrentView('planning');
  };

  const handleGeneratePlan = async (planConfig) => {
    // Enhanced plan generation with multiple vehicles using utility functions
    const { totalWeight, totalVolume } = calculateOrderTotals(selectedOrders);

    // Configure route strategy options
    const routeOptions = {
      routeStrategy: planConfig.routeStrategy || 'separate', // 'separate' or 'consolidate'
      loadingSequence: planConfig.loadingSequence || 'lifo',
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

      return {
        ...vehicle,
        loadPlan,
        optimizedPositions: loadPlan.items
      };
    });

    // Calculate total cost based on actual routes and distances
    const totalCost = optimizedVehicles.reduce((sum, vehicle) => {
      const vehicleType = vehicleTypes.find(vt => vt.id === vehicle.type);
      const routeInfo = routes.find(r => r.id === vehicle.route);
      const distance = routeInfo?.distance || 1000; // Fallback to 1000km if route not found
      return sum + (vehicleType?.costPerKm * distance);
    }, 0);

    const generatedPlan = {
      id: `PLAN_${Date.now()}`,
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
      totalWeight: totalWeight,
      totalVolume: totalVolume,
      createdAt: new Date().toISOString()
    };

    setPlanData(generatedPlan);
    setCurrentView('visualization');
  };

  const navigation = [
    { id: 'orders', label: 'Order Intake', icon: Package },
    { id: 'planning', label: 'Plan Creation', icon: Truck },
    { id: 'constraints', label: 'Constraints', icon: Settings },
    { id: 'visualization', label: '3D View', icon: BarChart3 },
    { id: 'routes', label: 'Route Map', icon: Map },
    { id: 'reports', label: 'Reports', icon: FileText }
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
            orders={sampleOrders}
            selectedOrders={selectedOrders}
            onOrderSelection={setSelectedOrders}
          />
        )}

        {currentView === 'planning' && (
          selectedOrders.length > 0 ? (
            <PlanCreation
              selectedOrders={selectedOrders}
              materialTypes={selectedMaterialTypes}
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

        {currentView === 'constraints' && (
          <ConstraintsPanel
            constraints={constraints}
            onConstraintsChange={setConstraints}
          />
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
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { Truck, BarChart3, Map, FileText } from 'lucide-react';
import PlanCreation from './PlanCreation';
import TruckVisualization from './TruckVisualization';
import RouteVisualization from './RouteVisualization';
import ErrorBoundary from './ErrorBoundary';

const CreatePlanPage = ({
  selectedOrders,
  materialTypes,
  onGeneratePlan,
  planData,
  googleMapsApiKey
}) => {
  const [activeTab, setActiveTab] = useState('plan-creation');

  // Switch to 3D view when plan data is available
  React.useEffect(() => {
    if (planData && activeTab === 'plan-creation') {
      setActiveTab('3d-view');
    }
  }, [planData]);

  const tabs = [
    { id: 'plan-creation', label: 'Plan Creation', icon: Truck },
    { id: '3d-view', label: '3D View', icon: BarChart3 },
    { id: 'route-map', label: 'Route Map', icon: Map }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Plan</h2>
          <p className="text-gray-600 mt-1">
            Configure and visualize your dispatch plan for {selectedOrders.length} selected orders
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'plan-creation' && (
          <PlanCreation
            key="plan-creation-component" // Add key to ensure proper re-rendering
            selectedOrders={selectedOrders}
            materialTypes={materialTypes}
            onGeneratePlan={(planConfig) => {
              console.log('Generating plan with config:', planConfig);
              onGeneratePlan(planConfig);
              // Tab switching is handled by the useEffect
            }}
          />
        )}

        {activeTab === '3d-view' && (
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
                onClick={() => setActiveTab('plan-creation')}
                className="btn-primary"
              >
                Go to Plan Creation
              </button>
            </div>
          )
        )}

        {activeTab === 'route-map' && (
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
                onClick={() => setActiveTab('plan-creation')}
                className="btn-primary"
              >
                Go to Plan Creation
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CreatePlanPage;

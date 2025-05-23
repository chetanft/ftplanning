import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Text } from '@react-three/drei';
import { RotateCcw, Download, Eye, EyeOff, Move, BarChart3, AlertTriangle } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';



// 3D Item Component
const Item3D = ({ item, position, onClick, isSelected }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (isSelected && meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const getItemColor = (materialType, priority) => {
    if (materialType === 'cylindrical') {
      return priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981';
    }
    return priority === 'high' ? '#DC2626' : priority === 'medium' ? '#D97706' : '#059669';
  };

  if (item.materialType === 'cylindrical') {
    return (
      <Cylinder
        ref={meshRef}
        args={[item.dimensions.diameter/2000, item.dimensions.diameter/2000, item.dimensions.height/1000]}
        position={position}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={getItemColor(item.materialType, item.priority)}
          opacity={isSelected ? 0.8 : 0.7}
          transparent
        />
      </Cylinder>
    );
  }

  return (
    <Box
      ref={meshRef}
      args={[item.dimensions.length/1000, item.dimensions.height/1000, item.dimensions.width/1000]}
      position={position}
      onClick={onClick}
    >
      <meshStandardMaterial
        color={getItemColor(item.materialType, item.priority)}
        opacity={isSelected ? 0.8 : 0.7}
        transparent
      />
    </Box>
  );
};

// Vehicle Container Component with ID label
const VehicleContainer = ({ vehicle, position, vehicleIndex }) => {
  const dimensions = vehicle.vehicleType?.dimensions || {
    length: 6100,
    width: 2440,
    height: 2590
  };

  // Get vehicle color based on index
  const getVehicleColor = (index) => {
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B'];
    return colors[index % colors.length];
  };

  return (
    <group position={position}>
      {/* Truck bed outline */}
      <Box
        args={[dimensions.length/1000, 0.05, dimensions.width/1000]}
        position={[0, 0.025, 0]}
      >
        <meshStandardMaterial color={getVehicleColor(vehicleIndex)} opacity={0.3} transparent />
      </Box>

      {/* Truck walls (wireframe) */}
      <Box
        args={[dimensions.length/1000, dimensions.height/1000, dimensions.width/1000]}
        position={[0, dimensions.height/2000, 0]}
      >
        <meshStandardMaterial color={getVehicleColor(vehicleIndex)} wireframe opacity={0.4} transparent />
      </Box>

      {/* Vehicle ID Label */}
      <Text
        position={[0, dimensions.height/1000 + 0.5, dimensions.width/2000 + 0.5]}
        fontSize={0.3}
        color={getVehicleColor(vehicleIndex)}
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
      >
        {vehicle.id}
      </Text>
    </group>
  );
};

// Main 3D Scene Component
const Scene3D = ({ planData, selectedItem, onItemSelect, showLabels, selectedVehicleId }) => {
  // Filter vehicles based on selection
  const vehiclesToShow = selectedVehicleId === 'all'
    ? planData.vehicles || []
    : planData.vehicles?.filter(v => v.id === selectedVehicleId) || [];

  // Calculate vehicle spacing
  const calculateVehicleSpacing = () => {
    if (vehiclesToShow.length <= 1) return 0;

    const maxLength = Math.max(...vehiclesToShow.map(v =>
      v.vehicleType?.dimensions?.length || 6100
    ));
    return maxLength / 1000 + 2; // 2m spacing between vehicles
  };

  const vehicleSpacing = calculateVehicleSpacing();

  // Arrange items for a specific vehicle with improved stacking
  const arrangeItemsForVehicle = (vehicle, vehiclePosition) => {
    const dimensions = vehicle.vehicleType?.dimensions || {
      length: 6100,
      width: 2440,
      height: 2590
    };

    const positions = [];
    const containerLength = dimensions.length / 1000; // Convert to meters
    const containerWidth = dimensions.width / 1000;   // Convert to meters
    const containerHeight = dimensions.height / 1000; // Convert to meters

    // Create a 3D grid to track occupied space
    const gridResolution = 0.1; // 10cm resolution
    const gridX = Math.ceil(containerLength / gridResolution);
    const gridZ = Math.ceil(containerWidth / gridResolution);
    const gridY = Math.ceil(containerHeight / gridResolution);
    const occupiedGrid = new Array(gridX).fill(null).map(() =>
      new Array(gridZ).fill(null).map(() =>
        new Array(gridY).fill(false)
      )
    );

    const orders = vehicle.orders || [];

    // Function to check if a position is available
    const isPositionAvailable = (x, z, y, itemLength, itemWidth, itemHeight) => {
      const startX = Math.floor((x + containerLength/2) / gridResolution);
      const endX = Math.ceil((x + containerLength/2 + itemLength) / gridResolution);
      const startZ = Math.floor((z + containerWidth/2) / gridResolution);
      const endZ = Math.ceil((z + containerWidth/2 + itemWidth) / gridResolution);
      const startY = Math.floor(y / gridResolution);
      const endY = Math.ceil((y + itemHeight) / gridResolution);

      // Check boundaries
      if (startX < 0 || endX > gridX || startZ < 0 || endZ > gridZ || startY < 0 || endY > gridY) {
        return false;
      }

      // Check if space is occupied
      for (let gx = startX; gx < endX; gx++) {
        for (let gz = startZ; gz < endZ; gz++) {
          for (let gy = startY; gy < endY; gy++) {
            if (occupiedGrid[gx][gz][gy]) {
              return false;
            }
          }
        }
      }
      return true;
    };

    // Function to mark position as occupied
    const markPositionOccupied = (x, z, y, itemLength, itemWidth, itemHeight) => {
      const startX = Math.floor((x + containerLength/2) / gridResolution);
      const endX = Math.ceil((x + containerLength/2 + itemLength) / gridResolution);
      const startZ = Math.floor((z + containerWidth/2) / gridResolution);
      const endZ = Math.ceil((z + containerWidth/2 + itemWidth) / gridResolution);
      const startY = Math.floor(y / gridResolution);
      const endY = Math.ceil((y + itemHeight) / gridResolution);

      for (let gx = startX; gx < endX; gx++) {
        for (let gz = startZ; gz < endZ; gz++) {
          for (let gy = startY; gy < endY; gy++) {
            if (gx >= 0 && gx < gridX && gz >= 0 && gz < gridZ && gy >= 0 && gy < gridY) {
              occupiedGrid[gx][gz][gy] = true;
            }
          }
        }
      }
    };

    // Function to find the lowest available position
    const findLowestPosition = (itemLength, itemWidth, itemHeight) => {
      for (let y = 0.025; y + itemHeight <= containerHeight; y += gridResolution) {
        for (let z = -containerWidth/2; z + itemWidth <= containerWidth/2; z += gridResolution) {
          for (let x = -containerLength/2; x + itemLength <= containerLength/2; x += gridResolution) {
            if (isPositionAvailable(x, z, y, itemLength, itemWidth, itemHeight)) {
              return { x, z, y };
            }
          }
        }
      }
      return null; // No position found
    };

    // Create a list of all items with their properties
    const allItems = [];
    orders.forEach((order, orderIndex) => {
      for (let i = 0; i < Math.min(order.quantity, 15); i++) { // Increased limit for better visualization
        const itemWidth = order.materialType === 'cylindrical'
          ? order.dimensions.diameter/1000
          : order.dimensions.width/1000;
        const itemLength = order.materialType === 'cylindrical'
          ? order.dimensions.diameter/1000
          : order.dimensions.length/1000;
        const itemHeight = order.dimensions.height/1000;

        allItems.push({
          ...order,
          itemIndex: i,
          itemWidth,
          itemLength,
          itemHeight,
          volume: itemLength * itemWidth * itemHeight,
          id: `${vehicle.id}_${order.id}_${i}`
        });
      }
    });

    // Sort items by volume (largest first) for better packing
    allItems.sort((a, b) => b.volume - a.volume);

    // Place each item
    allItems.forEach((item) => {
      // Find the best position for this item
      const position = findLowestPosition(item.itemLength, item.itemWidth, item.itemHeight);

      if (position) {
        positions.push({
          ...item,
          vehicleId: vehicle.id,
          position: [
            vehiclePosition[0] + position.x + item.itemLength/2,
            vehiclePosition[1] + position.y + item.itemHeight/2,
            vehiclePosition[2] + position.z + item.itemWidth/2
          ]
        });

        // Mark this space as occupied
        markPositionOccupied(position.x, position.z, position.y, item.itemLength, item.itemWidth, item.itemHeight);
      }
    });

    return positions;
  };

  // Get all item positions for all vehicles
  const getAllItemPositions = () => {
    const allPositions = [];

    vehiclesToShow.forEach((vehicle, index) => {
      const vehiclePosition = [
        index * vehicleSpacing - ((vehiclesToShow.length - 1) * vehicleSpacing) / 2,
        0,
        0
      ];

      const vehicleItems = arrangeItemsForVehicle(vehicle, vehiclePosition);
      allPositions.push(...vehicleItems);
    });

    return allPositions;
  };

  const itemPositions = getAllItemPositions();

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />

      {/* Render all vehicle containers */}
      {vehiclesToShow.map((vehicle, index) => {
        const vehiclePosition = [
          index * vehicleSpacing - ((vehiclesToShow.length - 1) * vehicleSpacing) / 2,
          0,
          0
        ];

        return (
          <VehicleContainer
            key={vehicle.id}
            vehicle={vehicle}
            position={vehiclePosition}
            vehicleIndex={index}
          />
        );
      })}

      {/* Render all items */}
      {itemPositions.map((item) => (
        <Item3D
          key={item.id}
          item={item}
          position={item.position}
          onClick={() => onItemSelect(item)}
          isSelected={selectedItem?.id === item.id}
        />
      ))}

      {/* Render labels - completely removed */}

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  );
};

const TruckVisualization = ({ planData }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState('3d');
  const [selectedVehicleId, setSelectedVehicleId] = useState('all');
  const [webglError, setWebglError] = useState(false);

  const handleItemSelect = (item) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const handleExport = () => {
    // Implement export functionality
    alert('Export functionality will be implemented');
  };

  const resetView = () => {
    setSelectedItem(null);
  };

  // Check WebGL support
  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (!checkWebGLSupport()) {
      setWebglError(true);
    }
  }, []);

  const calculateUtilization = () => {
    const vehicles = planData.vehicles || [];

    if (selectedVehicleId === 'all') {
      // Calculate total utilization across all vehicles
      let totalWeight = 0;
      let totalVolume = 0;
      let totalMaxWeight = 0;
      let totalMaxVolume = 0;

      vehicles.forEach(vehicle => {
        const vehicleOrders = vehicle.orders || [];
        const vehicleWeight = vehicleOrders.reduce((sum, order) => sum + (order.weight * order.quantity), 0);
        const vehicleVolume = vehicleOrders.reduce((sum, order) => {
          if (order.materialType === 'cuboidal') {
            const volume = (order.dimensions.length * order.dimensions.width * order.dimensions.height) / 1000000000;
            return sum + (volume * order.quantity);
          } else {
            const radius = order.dimensions.diameter / 2000;
            const height = order.dimensions.height / 1000;
            const volume = Math.PI * radius * radius * height;
            return sum + (volume * order.quantity);
          }
        }, 0);

        totalWeight += vehicleWeight;
        totalVolume += vehicleVolume;
        totalMaxWeight += vehicle.vehicleType?.maxWeight || 25000;
        totalMaxVolume += vehicle.vehicleType?.volume || 38.5;
      });

      return {
        weight: totalMaxWeight > 0 ? (totalWeight / totalMaxWeight) * 100 : 0,
        volume: totalMaxVolume > 0 ? (totalVolume / totalMaxVolume) * 100 : 0
      };
    } else {
      // Calculate utilization for selected vehicle
      const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (!selectedVehicle) return { weight: 0, volume: 0 };

      const vehicleOrders = selectedVehicle.orders || [];
      const totalWeight = vehicleOrders.reduce((sum, order) => sum + (order.weight * order.quantity), 0);
      const totalVolume = vehicleOrders.reduce((sum, order) => {
        if (order.materialType === 'cuboidal') {
          const volume = (order.dimensions.length * order.dimensions.width * order.dimensions.height) / 1000000000;
          return sum + (volume * order.quantity);
        } else {
          const radius = order.dimensions.diameter / 2000;
          const height = order.dimensions.height / 1000;
          const volume = Math.PI * radius * radius * height;
          return sum + (volume * order.quantity);
        }
      }, 0);

      const maxWeight = selectedVehicle.vehicleType?.maxWeight || 25000;
      const maxVolume = selectedVehicle.vehicleType?.volume || 38.5;

      return {
        weight: (totalWeight / maxWeight) * 100,
        volume: (totalVolume / maxVolume) * 100
      };
    }
  };

  const utilization = calculateUtilization();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            <span className="text-yellow-500">Freight Tiger</span> 3D Truck Load Visualization
          </h2>
          <p className="text-gray-600 mt-1">
            Interactive 3D view of your optimized load plan
            {planData.vehicles && planData.vehicles.length > 1 && (
              <span className="ml-2 text-sm font-medium text-blue-600">
                ({planData.vehicles.length} vehicles)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Vehicle Selector */}
          {planData.vehicles && planData.vehicles.length > 1 && (
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="btn-secondary text-sm"
            >
              <option value="all">All Vehicles</option>
              {planData.vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.id} ({vehicle.vehicleType?.name || 'Unknown'})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowLabels(!showLabels)}
            className="btn-secondary flex items-center opacity-50 cursor-not-allowed"
            disabled
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Labels (Disabled)
          </button>
          <button onClick={resetView} className="btn-secondary flex items-center">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset View
          </button>
          <button onClick={handleExport} className="btn-primary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D Visualization */}
        <div className="lg:col-span-3">
          <div className="card p-0 overflow-hidden">
            <div className="h-96 lg:h-[600px] relative">
              {webglError ? (
                // WebGL Error Fallback
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-blue-50">
                  <div className="text-center p-8">
                    <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">3D Visualization Unavailable</h3>
                    <p className="text-gray-600 mb-4">
                      WebGL is not supported or enabled in your browser
                    </p>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-500 mb-2">Load Summary:</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Volume Utilization:</span>
                          <span className="font-medium">{utilization.volume.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Weight Utilization:</span>
                          <span className="font-medium">{utilization.weight.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Vehicles:</span>
                          <span className="font-medium">{planData.vehicles?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 3D Canvas with Error Boundary
                <ErrorBoundary
                  title="3D Visualization Error"
                  message="There was an issue rendering the 3D visualization."
                >
                  <Canvas
                    camera={{ position: [8, 6, 8], fov: 60 }}
                    onCreated={({ gl }) => {
                      // Handle WebGL context lost
                      gl.domElement.addEventListener('webglcontextlost', (event) => {
                        event.preventDefault();
                        console.warn('WebGL context lost');
                        setWebglError(true);
                      });
                    }}
                  >
                    <Scene3D
                      planData={planData}
                      selectedItem={selectedItem}
                      onItemSelect={handleItemSelect}
                      showLabels={showLabels}
                      selectedVehicleId={selectedVehicleId}
                    />
                  </Canvas>

                  {/* 3D Controls Overlay */}
                  <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs text-gray-600">
                    <div className="flex items-center mb-1">
                      <Move className="h-3 w-3 mr-1" />
                      Left click + drag to rotate
                    </div>
                    <div>Right click + drag to pan • Scroll to zoom</div>
                  </div>
                </ErrorBoundary>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Load Statistics */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Load Statistics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Volume Utilization</span>
                  <span className="font-medium">{utilization.volume.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill bg-blue-500"
                    style={{ width: `${Math.min(utilization.volume, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weight Utilization</span>
                  <span className="font-medium">{utilization.weight.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill bg-green-500"
                    style={{ width: `${Math.min(utilization.weight, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2 text-sm">
                {selectedVehicleId === 'all' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Vehicles:</span>
                      <span className="font-medium">{planData.vehicles?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="font-medium">
                        {planData.vehicles?.reduce((sum, vehicle) => sum + (vehicle.orders?.length || 0), 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-medium">
                        {planData.vehicles?.reduce((sum, vehicle) =>
                          sum + (vehicle.orders?.reduce((orderSum, order) => orderSum + order.quantity, 0) || 0), 0
                        ) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle Types:</span>
                      <span className="font-medium text-xs">
                        {[...new Set(planData.vehicles?.map(v => v.vehicleType?.name) || [])].join(', ')}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {(() => {
                      const selectedVehicle = planData.vehicles?.find(v => v.id === selectedVehicleId);
                      return selectedVehicle ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Vehicle ID:</span>
                            <span className="font-medium">{selectedVehicle.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Vehicle Type:</span>
                            <span className="font-medium">{selectedVehicle.vehicleType?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Orders:</span>
                            <span className="font-medium">{selectedVehicle.orders?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Items:</span>
                            <span className="font-medium">
                              {selectedVehicle.orders?.reduce((sum, order) => sum + order.quantity, 0) || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Route:</span>
                            <span className="font-medium text-xs">{selectedVehicle.route || 'Mixed'}</span>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Drop Points:</span>
                  <span className="font-medium">{planData.dropPoints || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route Strategy:</span>
                  <span className="font-medium capitalize">{planData.routeStrategy || 'separate'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Item Details */}
          {selectedItem && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Selected Item</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium ml-2">{selectedItem.id.split('_')[0]}</span>
                </div>
                <div>
                  <span className="text-gray-600">Material Type:</span>
                  <span className="font-medium ml-2 capitalize">{selectedItem.materialType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium ml-2">{selectedItem.weight} kg</span>
                </div>
                <div>
                  <span className="text-gray-600">Dimensions:</span>
                  <div className="ml-2 font-medium">
                    {selectedItem.materialType === 'cylindrical'
                      ? `Ø${selectedItem.dimensions.diameter}mm × ${selectedItem.dimensions.height}mm`
                      : `${selectedItem.dimensions.length} × ${selectedItem.dimensions.width} × ${selectedItem.dimensions.height}mm`
                    }
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Priority:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    selectedItem.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedItem.priority}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Color Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span>High Priority</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span>Medium Priority</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span>Low Priority</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span>Cuboidal Items</span>
                </div>
                <div className="flex items-center mt-1">
                  <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                  <span>Cylindrical Items</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckVisualization;

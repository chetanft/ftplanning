import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Truck, Route, AlertTriangle, Map } from 'lucide-react';

const RouteVisualization = ({ planData, googleMapsApiKey }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [useStaticMap, setUseStaticMap] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const directionsRenderersRef = useRef([]);

  // Check if we should use static map (no API key or API key is placeholder)
  const shouldUseStaticMap = !googleMapsApiKey || googleMapsApiKey === 'YOUR_API_KEY_HERE';

  useEffect(() => {
    if (shouldUseStaticMap) {
      setUseStaticMap(true);
      generateStaticRouteData();
    } else if (googleMapsApiKey && !window.google) {
      loadGoogleMapsScript();
    } else if (window.google) {
      initializeMap();
    }
  }, [googleMapsApiKey, shouldUseStaticMap]);

  useEffect(() => {
    if (planData) {
      if (useStaticMap) {
        generateStaticRouteData();
      } else if (mapLoaded) {
        calculateOptimalRoutes();
      }
    }
  }, [planData, mapLoaded, useStaticMap]);

  // Cleanup function to prevent DOM manipulation errors
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, []);

  // Cleanup function to prevent DOM manipulation errors
  const cleanupMap = () => {
    try {
      // Clear directions renderers
      directionsRenderersRef.current.forEach(renderer => {
        if (renderer && renderer.setMap) {
          renderer.setMap(null);
        }
      });
      directionsRenderersRef.current = [];

      // Clear Google Map instance
      if (googleMapRef.current) {
        googleMapRef.current = null;
      }
    } catch (error) {
      console.warn('Error during map cleanup:', error);
    }
  };

  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
      initializeMap();
    };
    script.onerror = () => {
      setMapError('Failed to load Google Maps API');
      setUseStaticMap(true);
      generateStaticRouteData();
    };
    document.head.appendChild(script);
  };

  // Generate static route data when Google Maps is not available
  const generateStaticRouteData = () => {
    if (!planData?.vehicles) return;

    const staticRoutes = planData.vehicles.map((vehicle, index) => {
      // Calculate estimated distance and duration based on route
      const routeInfo = getRouteInfo(vehicle.route);
      const estimatedDistance = routeInfo?.distance || 1000; // Default 1000km
      const estimatedDuration = estimatedDistance / 60; // Assume 60 km/h average speed

      return {
        vehicleId: vehicle.id,
        route: null, // No actual Google Maps route
        orders: vehicle.orders || [],
        dropPoints: vehicle.dropPoints || [],
        optimizedOrder: [],
        totalDistance: estimatedDistance,
        totalDuration: estimatedDuration,
        estimatedCost: estimatedDistance * (vehicle.costPerKm || 25),
        isStatic: true
      };
    });

    setRouteData(staticRoutes);
  };

  // Helper function to get route information from mock data
  const getRouteInfo = (routeId) => {
    const routes = {
      'DEL-MUM': { distance: 1400, duration: 18 },
      'DEL-HYD': { distance: 1500, duration: 20 },
      'DEL-CHE': { distance: 2200, duration: 28 },
      'DEL-BAN': { distance: 2100, duration: 26 }
    };
    return routes[routeId];
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 6,
      center: { lat: 28.6139, lng: 77.2090 }, // Delhi center
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    googleMapRef.current = map;
  };

  const calculateOptimalRoutes = async () => {
    if (!planData.vehicles || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    const routePromises = planData.vehicles.map(async (vehicle) => {
      const waypoints = extractWaypoints(vehicle.orders, vehicle.dropPoints);

      if (waypoints.length < 2) return null;

      try {
        const result = await new Promise((resolve, reject) => {
          directionsService.route({
            origin: waypoints[0],
            destination: waypoints[waypoints.length - 1],
            waypoints: waypoints.slice(1, -1).map(wp => ({ location: wp, stopover: true })),
            optimizeWaypoints: true,
            travelMode: window.google.maps.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: new Date(),
              trafficModel: window.google.maps.TrafficModel.BEST_GUESS
            }
          }, (result, status) => {
            if (status === 'OK') {
              resolve(result);
            } else {
              reject(new Error(`Route calculation failed: ${status}`));
            }
          });
        });

        return {
          vehicleId: vehicle.id,
          route: result,
          orders: vehicle.orders,
          dropPoints: vehicle.dropPoints || [],
          optimizedOrder: result.routes[0].waypoint_order,
          totalDistance: calculateTotalDistance(result),
          totalDuration: calculateTotalDuration(result),
          estimatedCost: calculateTotalDistance(result) * (vehicle.costPerKm || 25)
        };
      } catch (error) {
        console.error(`Route calculation failed for vehicle ${vehicle.id}:`, error);
        return null;
      }
    });

    const routes = await Promise.all(routePromises);
    const validRoutes = routes.filter(route => route !== null);

    setRouteData(validRoutes);
    displayRoutesOnMap(validRoutes);
  };

  const extractWaypoints = (orders, dropPoints = []) => {
    const waypoints = new Set();

    // Add pickup points
    orders.forEach(order => {
      if (order.pickup) waypoints.add(order.pickup);
    });

    // Use drop points if available, otherwise use delivery points
    if (dropPoints && dropPoints.length > 0) {
      dropPoints.forEach(dp => {
        if (dp.location) waypoints.add(dp.location);
      });
    } else {
      // Add delivery points
      orders.forEach(order => {
        if (order.delivery) waypoints.add(order.delivery);
      });
    }

    return Array.from(waypoints);
  };

  const displayRoutesOnMap = (routes) => {
    if (!googleMapRef.current) return;

    const map = googleMapRef.current;
    const bounds = new window.google.maps.LatLngBounds();

    // Clear existing directions renderers
    directionsRenderersRef.current.forEach(renderer => {
      if (renderer && renderer.setMap) {
        renderer.setMap(null);
      }
    });
    directionsRenderersRef.current = [];

    // Clear existing overlays
    try {
      map.data.forEach(feature => map.data.remove(feature));
    } catch (error) {
      console.warn('Error clearing map data:', error);
    }

    routes.forEach((routeInfo, index) => {
      if (!routeInfo.route) return; // Skip if no route data

      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        directions: routeInfo.route,
        routeIndex: 0,
        polylineOptions: {
          strokeColor: getVehicleColor(index),
          strokeWeight: 4,
          strokeOpacity: 0.8
        },
        markerOptions: {
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: getVehicleColor(index),
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          }
        }
      });

      // Store renderer for cleanup
      directionsRenderersRef.current.push(directionsRenderer);

      // Extend bounds to include this route
      if (routeInfo.route.routes && routeInfo.route.routes[0]) {
        routeInfo.route.routes[0].legs.forEach(leg => {
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
        });
      }
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  };

  const getVehicleColor = (index) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    return colors[index % colors.length];
  };

  const calculateTotalDistance = (directionsResult) => {
    return directionsResult.routes[0].legs.reduce((total, leg) =>
      total + leg.distance.value, 0) / 1000; // Convert to km
  };

  const calculateTotalDuration = (directionsResult) => {
    return directionsResult.routes[0].legs.reduce((total, leg) =>
      total + leg.duration.value, 0) / 3600; // Convert to hours
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDistance = (km) => {
    return `${km.toFixed(1)} km`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            <span className="text-yellow-500">Freight Tiger</span> Route Optimization
          </h2>
          <p className="text-gray-600 mt-1">
            Optimized routes for {planData?.vehicles?.length || 0} vehicles
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <Clock className="h-4 w-4 inline mr-1" />
            Real-time traffic data
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            {useStaticMap ? (
              // Static Map View (when Google Maps API is not available)
              <div className="h-96 lg:h-[500px] bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                <div className="text-center p-8">
                  <Map className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Route Visualization</h3>
                  <p className="text-gray-600 mb-4">
                    Interactive map requires Google Maps API key
                  </p>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-2">Route Summary:</p>
                    <div className="space-y-2">
                      {routeData?.map((route, index) => (
                        <div key={route.vehicleId} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: getVehicleColor(index) }}
                            ></div>
                            <span>{route.vehicleId}</span>
                          </div>
                          <span className="text-gray-600">{formatDistance(route.totalDistance)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Google Maps View
              <div className="h-96 lg:h-[500px]" ref={mapRef}>
                {!mapLoaded && !mapError && (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
                {mapError && (
                  <div className="flex items-center justify-center h-full bg-red-50">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600">{mapError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Route Summary */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Route Summary</h3>

            {routeData ? (
              <div className="space-y-4">
                {routeData.map((route, index) => (
                  <div
                    key={route.vehicleId}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedVehicle === route.vehicleId
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVehicle(route.vehicleId)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getVehicleColor(index) }}
                        ></div>
                        <span className="font-medium">{route.vehicleId}</span>
                      </div>
                      <Truck className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <Navigation className="h-3 w-3 inline mr-1" />
                        {formatDistance(route.totalDistance)}
                      </div>
                      <div>
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDuration(route.totalDuration)}
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Cost: </span>
                      <span className="font-medium text-green-600">
                        ₹{route.estimatedCost.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {route.orders.length} orders • {route.dropPoints.length > 0 ? `${route.dropPoints.length} drop points` : route.orders.map(o => o.route).join(', ')}
                    </div>

                    {route.isStatic && (
                      <div className="mt-2 text-xs text-blue-600">
                        <span>📍 Estimated route data</span>
                      </div>
                    )}

                    {route.dropPoints.length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-500">Drop Points: </span>
                        <span className="text-gray-700">
                          {route.dropPoints.map(dp => dp.location).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Route className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Calculating optimal routes...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteVisualization;

/**
 * Route Distance Service
 * Provides actual route distances and durations instead of hardcoded values
 */

import { routes } from '../data/mockData.js';

/**
 * Comprehensive distance matrix between major Indian cities (in km)
 * Based on actual road distances
 */
const CITY_DISTANCE_MATRIX = {
  // Delhi connections
  'Delhi-Mumbai': 1400,
  'Delhi-Hyderabad': 1500,
  'Delhi-Chennai': 2180,
  'Delhi-Bangalore': 2150,
  'Delhi-Kolkata': 1500,
  'Delhi-Pune': 1450,
  'Delhi-Ahmedabad': 940,
  'Delhi-Jaipur': 280,
  'Delhi-Lucknow': 555,
  'Delhi-Nagpur': 1080,
  
  // Mumbai connections
  'Mumbai-Hyderabad': 710,
  'Mumbai-Chennai': 1330,
  'Mumbai-Bangalore': 980,
  'Mumbai-Kolkata': 1960,
  'Mumbai-Pune': 150,
  'Mumbai-Ahmedabad': 530,
  'Mumbai-Nagpur': 820,
  'Mumbai-Surat': 290,
  
  // Hyderabad connections
  'Hyderabad-Chennai': 630,
  'Hyderabad-Bangalore': 570,
  'Hyderabad-Kolkata': 1490,
  'Hyderabad-Pune': 560,
  'Hyderabad-Nagpur': 510,
  'Hyderabad-Vijayawada': 275,
  
  // Chennai connections
  'Chennai-Bangalore': 350,
  'Chennai-Kolkata': 1670,
  'Chennai-Pune': 1170,
  'Chennai-Coimbatore': 500,
  'Chennai-Madurai': 460,
  
  // Bangalore connections
  'Bangalore-Kolkata': 1870,
  'Bangalore-Pune': 840,
  'Bangalore-Coimbatore': 365,
  'Bangalore-Mysore': 150,
  'Bangalore-Mangalore': 350,
  
  // Other major connections
  'Kolkata-Nagpur': 1120,
  'Pune-Nagpur': 710,
  'Ahmedabad-Surat': 265,
  'Jaipur-Ahmedabad': 660,
  'Lucknow-Kolkata': 990
};

/**
 * Route type speeds (km/h) based on road conditions
 */
const ROUTE_SPEEDS = {
  expressway: 80,      // National Expressways (Delhi-Mumbai Expressway, etc.)
  national_highway: 60, // National Highways
  state_highway: 45,    // State Highways
  urban: 25,           // Urban/City roads
  mixed: 50            // Mixed route types (default)
};

/**
 * Route metadata with speed profiles
 */
const ROUTE_METADATA = {
  'DEL-MUM': { 
    speedProfile: 'expressway', 
    tollCost: 2500,
    restStops: 3,
    fuelStations: 15
  },
  'DEL-HYD': { 
    speedProfile: 'national_highway', 
    tollCost: 2200,
    restStops: 4,
    fuelStations: 12
  },
  'DEL-CHE': { 
    speedProfile: 'mixed', 
    tollCost: 3500,
    restStops: 5,
    fuelStations: 18
  },
  'DEL-BAN': { 
    speedProfile: 'mixed', 
    tollCost: 3200,
    restStops: 5,
    fuelStations: 16
  }
};

/**
 * Get distance between two cities (order-independent)
 * @param {string} city1 - First city name
 * @param {string} city2 - Second city name
 * @returns {number|null} - Distance in km or null if not found
 */
export const getDistanceBetweenCities = (city1, city2) => {
  if (!city1 || !city2) return null;
  if (city1 === city2) return 0;

  // Normalize city names
  const c1 = normalizeCityName(city1);
  const c2 = normalizeCityName(city2);

  // Try both orderings
  const key1 = `${c1}-${c2}`;
  const key2 = `${c2}-${c1}`;

  return CITY_DISTANCE_MATRIX[key1] || CITY_DISTANCE_MATRIX[key2] || null;
};

/**
 * Normalize city name for lookup
 */
const normalizeCityName = (name) => {
  if (!name) return '';
  
  // Extract city name from location strings like "Delhi Warehouse" or "Mumbai Port"
  const cityMappings = {
    'del': 'Delhi',
    'delhi': 'Delhi',
    'mum': 'Mumbai',
    'mumbai': 'Mumbai',
    'hyd': 'Hyderabad',
    'hyderabad': 'Hyderabad',
    'che': 'Chennai',
    'chennai': 'Chennai',
    'ban': 'Bangalore',
    'bangalore': 'Bangalore',
    'bengaluru': 'Bangalore',
    'kol': 'Kolkata',
    'kolkata': 'Kolkata',
    'calcutta': 'Kolkata',
    'pune': 'Pune',
    'ahmedabad': 'Ahmedabad',
    'amd': 'Ahmedabad',
    'jaipur': 'Jaipur',
    'lucknow': 'Lucknow',
    'nagpur': 'Nagpur',
    'surat': 'Surat',
    'coimbatore': 'Coimbatore',
    'madurai': 'Madurai',
    'vijayawada': 'Vijayawada',
    'mysore': 'Mysore',
    'mangalore': 'Mangalore'
  };

  const lowerName = name.toLowerCase().trim();
  
  // Check direct mapping
  for (const [key, value] of Object.entries(cityMappings)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }

  // Return capitalized first word as fallback
  return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1).toLowerCase();
};

/**
 * Get route distance from route ID
 * @param {string} routeId - Route ID like 'DEL-MUM'
 * @returns {number} - Distance in km
 */
export const getRouteDistance = (routeId) => {
  if (!routeId) return null;

  // First, check predefined routes
  const predefinedRoute = routes.find(r => r.id === routeId);
  if (predefinedRoute && predefinedRoute.distance) {
    return predefinedRoute.distance;
  }

  // Parse route ID to extract cities (e.g., 'DEL-MUM' -> Delhi, Mumbai)
  const parts = routeId.split('-');
  if (parts.length === 2) {
    const city1 = normalizeCityName(parts[0]);
    const city2 = normalizeCityName(parts[1]);
    const distance = getDistanceBetweenCities(city1, city2);
    if (distance !== null) {
      return distance;
    }
  }

  return null;
};

/**
 * Calculate duration for a given distance and route type
 * @param {number} distance - Distance in km
 * @param {string} routeId - Optional route ID for speed profile lookup
 * @returns {number} - Duration in hours
 */
export const calculateDuration = (distance, routeId = null) => {
  if (!distance || distance <= 0) return 0;

  // Get speed profile
  let avgSpeed = ROUTE_SPEEDS.mixed;
  
  if (routeId && ROUTE_METADATA[routeId]) {
    const speedProfile = ROUTE_METADATA[routeId].speedProfile;
    avgSpeed = ROUTE_SPEEDS[speedProfile] || ROUTE_SPEEDS.mixed;
  }

  // Add time for rest stops (15 min per 300km)
  const restStopTime = Math.floor(distance / 300) * 0.25;
  
  // Add time for fuel stops (10 min per 400km)
  const fuelStopTime = Math.floor(distance / 400) * 0.17;

  // Base travel time + stops
  const baseDuration = distance / avgSpeed;
  
  return baseDuration + restStopTime + fuelStopTime;
};

/**
 * Calculate optimal route distance for multiple cities using nearest neighbor heuristic
 * @param {Array<string>} cities - Array of city names to visit
 * @param {string} startCity - Starting city (default: 'Delhi')
 * @returns {Object} - { totalDistance, orderedCities, segments }
 */
export const calculateMultiCityRouteDistance = (cities, startCity = 'Delhi') => {
  if (!cities || cities.length === 0) {
    return { totalDistance: 0, orderedCities: [], segments: [] };
  }

  if (cities.length === 1) {
    const dist = getDistanceBetweenCities(startCity, cities[0]) || 0;
    return {
      totalDistance: dist,
      orderedCities: [startCity, cities[0]],
      segments: [{ from: startCity, to: cities[0], distance: dist }]
    };
  }

  // Nearest neighbor algorithm
  const remaining = [...cities];
  const orderedCities = [startCity];
  const segments = [];
  let totalDistance = 0;
  let currentCity = startCity;

  while (remaining.length > 0) {
    let nearestCity = null;
    let nearestDistance = Infinity;
    let nearestIndex = -1;

    // Find nearest unvisited city
    for (let i = 0; i < remaining.length; i++) {
      const dist = getDistanceBetweenCities(currentCity, remaining[i]);
      if (dist !== null && dist < nearestDistance) {
        nearestDistance = dist;
        nearestCity = remaining[i];
        nearestIndex = i;
      }
    }

    if (nearestCity === null) {
      // No valid distance found, use estimate
      nearestCity = remaining[0];
      nearestDistance = 500; // Default estimate
      nearestIndex = 0;
    }

    segments.push({
      from: currentCity,
      to: nearestCity,
      distance: nearestDistance
    });

    totalDistance += nearestDistance;
    orderedCities.push(nearestCity);
    currentCity = nearestCity;
    remaining.splice(nearestIndex, 1);
  }

  return { totalDistance, orderedCities, segments };
};

/**
 * Get route information for a vehicle based on its orders and drop points
 * @param {Object} vehicle - Vehicle object with orders and dropPoints
 * @returns {Object} - { distance, duration, cost, segments }
 */
export const getVehicleRouteInfo = (vehicle) => {
  if (!vehicle) {
    return { distance: 0, duration: 0, cost: 0, segments: [] };
  }

  const costPerKm = vehicle.costPerKm || vehicle.vehicleType?.costPerKm || 25;

  // Case 1: Single predefined route
  if (vehicle.route && vehicle.route !== 'MIXED') {
    const distance = getRouteDistance(vehicle.route);
    if (distance !== null) {
      const duration = calculateDuration(distance, vehicle.route);
      return {
        distance,
        duration,
        cost: Math.round(distance * costPerKm),
        segments: [{
          from: 'Origin',
          to: 'Destination',
          distance,
          routeId: vehicle.route
        }],
        source: 'predefined'
      };
    }
  }

  // Case 2: Multi-drop route - calculate from drop points
  if (vehicle.dropPoints && vehicle.dropPoints.length > 0) {
    const cities = vehicle.dropPoints
      .map(dp => normalizeCityName(dp.location))
      .filter(Boolean);
    
    const uniqueCities = [...new Set(cities)];
    
    if (uniqueCities.length > 0) {
      const routeInfo = calculateMultiCityRouteDistance(uniqueCities);
      const duration = calculateDuration(routeInfo.totalDistance);
      
      return {
        distance: routeInfo.totalDistance,
        duration,
        cost: Math.round(routeInfo.totalDistance * costPerKm),
        segments: routeInfo.segments,
        orderedCities: routeInfo.orderedCities,
        source: 'calculated'
      };
    }
  }

  // Case 3: Extract from orders' delivery locations
  if (vehicle.orders && vehicle.orders.length > 0) {
    const deliveryLocations = vehicle.orders
      .map(o => normalizeCityName(o.delivery))
      .filter(Boolean);
    
    const uniqueDeliveries = [...new Set(deliveryLocations)];
    
    if (uniqueDeliveries.length > 0) {
      // Get pickup location
      const pickupLocations = vehicle.orders
        .map(o => normalizeCityName(o.pickup))
        .filter(Boolean);
      const startCity = pickupLocations[0] || 'Delhi';

      const routeInfo = calculateMultiCityRouteDistance(uniqueDeliveries, startCity);
      const duration = calculateDuration(routeInfo.totalDistance);
      
      return {
        distance: routeInfo.totalDistance,
        duration,
        cost: Math.round(routeInfo.totalDistance * costPerKm),
        segments: routeInfo.segments,
        orderedCities: routeInfo.orderedCities,
        source: 'calculated_from_orders'
      };
    }
  }

  // Case 4: Fallback - try to parse route ID
  if (vehicle.route) {
    const distance = getRouteDistance(vehicle.route) || estimateRouteDistance(vehicle.route);
    const duration = calculateDuration(distance);
    
    return {
      distance,
      duration,
      cost: Math.round(distance * costPerKm),
      segments: [],
      source: 'estimated'
    };
  }

  // Final fallback
  return {
    distance: 0,
    duration: 0,
    cost: 0,
    segments: [],
    source: 'unknown'
  };
};

/**
 * Estimate distance for unknown routes based on route ID pattern
 */
const estimateRouteDistance = (routeId) => {
  if (!routeId) return 500;

  // Try to extract cities from route ID
  const parts = routeId.split(/[-_]/);
  if (parts.length >= 2) {
    const dist = getDistanceBetweenCities(parts[0], parts[1]);
    if (dist !== null) return dist;
  }

  // Default estimates based on route pattern length
  if (routeId.length <= 6) return 500;  // Short routes
  if (routeId.length <= 10) return 1000; // Medium routes
  return 1500; // Long routes
};

/**
 * Get total cost for a plan based on all vehicles
 * @param {Array} vehicles - Array of vehicle objects
 * @returns {Object} - { totalCost, totalDistance, breakdown }
 */
export const calculatePlanCost = (vehicles) => {
  if (!vehicles || vehicles.length === 0) {
    return { totalCost: 0, totalDistance: 0, totalDuration: 0, breakdown: [] };
  }

  const breakdown = vehicles.map(vehicle => {
    const routeInfo = getVehicleRouteInfo(vehicle);
    return {
      vehicleId: vehicle.id,
      vehicleType: vehicle.name || vehicle.type,
      ...routeInfo
    };
  });

  const totalCost = breakdown.reduce((sum, v) => sum + v.cost, 0);
  const totalDistance = breakdown.reduce((sum, v) => sum + v.distance, 0);
  const totalDuration = Math.max(...breakdown.map(v => v.duration), 0); // Parallel execution

  return { totalCost, totalDistance, totalDuration, breakdown };
};

export default {
  getDistanceBetweenCities,
  getRouteDistance,
  calculateDuration,
  calculateMultiCityRouteDistance,
  getVehicleRouteInfo,
  calculatePlanCost,
  ROUTE_SPEEDS,
  CITY_DISTANCE_MATRIX
};


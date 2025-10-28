/**
 * Route Optimization Utilities
 * Implements algorithms for optimizing multi-city routes
 */

// Distance matrix between cities (approximate km)
const DISTANCE_MATRIX = {
  'Delhi-Mumbai': 1400,
  'Delhi-Hyderabad': 1500,
  'Delhi-Chennai': 2200,
  'Delhi-Bangalore': 2100,
  'Mumbai-Hyderabad': 700,
  'Mumbai-Chennai': 1300,
  'Mumbai-Bangalore': 980,
  'Hyderabad-Chennai': 625,
  'Hyderabad-Bangalore': 570,
  'Chennai-Bangalore': 350
};

/**
 * Get distance between two cities
 * @param {string} city1 - First city name
 * @param {string} city2 - Second city name
 * @returns {number} Distance in km
 */
export const getDistanceBetweenCities = (city1, city2) => {
  if (city1 === city2) return 0;
  const key1 = `${city1}-${city2}`;
  const key2 = `${city2}-${city1}`;
  return DISTANCE_MATRIX[key1] || DISTANCE_MATRIX[key2] || 500;
};

/**
 * Extract city name from location string
 * @param {string} location - Location string (e.g., "Mumbai Central")
 * @returns {string} City name
 */
export const extractCityName = (location) => {
  if (!location) return 'Unknown';
  const parts = location.split(' ');
  return parts[0] || 'Unknown';
};

/**
 * Calculate optimal route using nearest neighbor heuristic
 * @param {string[]} cities - Array of city names
 * @returns {number} Total distance in km
 */
export const calculateNearestNeighborRoute = (cities) => {
  if (cities.length === 0) return 0;
  if (cities.length === 1) return 0;

  let totalDistance = 0;
  let currentCity = 'Delhi';
  const remainingCities = [...cities];

  while (remainingCities.length > 0) {
    let nearestCity = remainingCities[0];
    let minDistance = getDistanceBetweenCities(currentCity, nearestCity);
    let nearestIndex = 0;

    for (let i = 1; i < remainingCities.length; i++) {
      const distance = getDistanceBetweenCities(currentCity, remainingCities[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = remainingCities[i];
        nearestIndex = i;
      }
    }

    totalDistance += minDistance;
    currentCity = nearestCity;
    remainingCities.splice(nearestIndex, 1);
  }

  return totalDistance;
};

/**
 * Calculate optimal route using 2-opt improvement
 * @param {string[]} cities - Array of city names
 * @returns {Object} Optimized route with distance and sequence
 */
export const calculate2OptRoute = (cities) => {
  if (cities.length <= 2) {
    return {
      sequence: cities,
      distance: calculateNearestNeighborRoute(cities),
      improved: false
    };
  }

  // Start with nearest neighbor solution
  let bestSequence = [...cities];
  let bestDistance = calculateNearestNeighborRoute(bestSequence);
  let improved = true;

  // 2-opt improvement iterations
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < bestSequence.length - 1; i++) {
      for (let j = i + 2; j < bestSequence.length; j++) {
        // Create new sequence by reversing segment between i and j
        const newSequence = [
          ...bestSequence.slice(0, i + 1),
          ...bestSequence.slice(i + 1, j + 1).reverse(),
          ...bestSequence.slice(j + 1)
        ];

        const newDistance = calculateNearestNeighborRoute(newSequence);

        if (newDistance < bestDistance) {
          bestSequence = newSequence;
          bestDistance = newDistance;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return {
    sequence: bestSequence,
    distance: bestDistance,
    improved: iterations > 0,
    iterations
  };
};

/**
 * Optimize drop sequence based on vehicle capacity and weight distribution
 * @param {Object[]} orders - Array of orders with dropSequence
 * @param {number} maxWeight - Maximum vehicle weight capacity
 * @returns {Object[]} Optimized orders with adjusted drop sequences
 */
export const optimizeDropSequence = (orders, maxWeight) => {
  if (!orders || orders.length === 0) return orders;

  // Group orders by current drop sequence
  const dropGroups = {};
  orders.forEach(order => {
    const dropSeq = order.dropSequence || 1;
    if (!dropGroups[dropSeq]) {
      dropGroups[dropSeq] = [];
    }
    dropGroups[dropSeq].push(order);
  });

  // Calculate weight per drop
  const dropWeights = {};
  Object.keys(dropGroups).forEach(dropSeq => {
    dropWeights[dropSeq] = dropGroups[dropSeq].reduce(
      (sum, order) => sum + (order.weight * order.quantity),
      0
    );
  });

  // Check if rebalancing is needed
  const avgWeight = Object.values(dropWeights).reduce((a, b) => a + b, 0) / Object.keys(dropGroups).length;
  const needsRebalancing = Object.values(dropWeights).some(w => w > maxWeight * 0.8);

  if (!needsRebalancing) {
    return orders;
  }

  // Rebalance drops if needed
  const optimizedOrders = [...orders];
  let currentDrop = 1;
  let currentWeight = 0;

  optimizedOrders.forEach(order => {
    const orderWeight = order.weight * order.quantity;

    if (currentWeight + orderWeight > maxWeight * 0.8 && currentDrop < 4) {
      currentDrop++;
      currentWeight = 0;
    }

    order.dropSequence = currentDrop;
    currentWeight += orderWeight;
  });

  return optimizedOrders;
};

/**
 * Calculate route efficiency score (0-100)
 * @param {number} actualDistance - Actual route distance
 * @param {number} optimalDistance - Optimal route distance
 * @returns {number} Efficiency score
 */
export const calculateRouteEfficiency = (actualDistance, optimalDistance) => {
  if (optimalDistance === 0) return 100;
  const efficiency = (optimalDistance / actualDistance) * 100;
  return Math.min(100, Math.max(0, efficiency));
};

/**
 * Suggest optimal drop sequence for orders
 * @param {Object[]} orders - Array of orders
 * @param {string[]} cities - Array of destination cities
 * @returns {Object} Optimization suggestion
 */
export const suggestOptimalSequence = (orders, cities) => {
  if (!cities || cities.length === 0) {
    return {
      suggestion: 'SINGLE_DROP',
      reason: 'Only one destination city',
      optimized: false
    };
  }

  if (cities.length === 1) {
    return {
      suggestion: 'SINGLE_DROP',
      reason: 'All orders going to same city',
      optimized: false
    };
  }

  // Calculate optimal route
  const optimalRoute = calculate2OptRoute(cities);
  const totalDistance = optimalRoute.distance;

  return {
    suggestion: 'MULTI_DROP_OPTIMIZED',
    reason: `Optimized route through ${cities.length} cities`,
    sequence: optimalRoute.sequence,
    distance: totalDistance,
    improved: optimalRoute.improved,
    iterations: optimalRoute.iterations,
    optimized: true
  };
};

/**
 * Validate route feasibility
 * @param {Object[]} orders - Array of orders
 * @param {number} maxWeight - Maximum vehicle weight
 * @param {number} maxVolume - Maximum vehicle volume
 * @returns {Object} Validation result
 */
export const validateRouteFeasibility = (orders, maxWeight, maxVolume) => {
  const totalWeight = orders.reduce((sum, order) => sum + (order.weight * order.quantity), 0);
  const totalVolume = orders.reduce((sum, order) => {
    const dims = order.dimensions;
    if (order.materialType === 'cylindrical') {
      return sum + ((Math.PI * Math.pow(dims.diameter / 2, 2) * dims.height) / 1e9) * order.quantity;
    }
    return sum + ((dims.length * dims.width * dims.height) / 1e9) * order.quantity;
  }, 0);

  return {
    feasible: totalWeight <= maxWeight && totalVolume <= maxVolume,
    weightUtilization: (totalWeight / maxWeight) * 100,
    volumeUtilization: (totalVolume / maxVolume) * 100,
    totalWeight,
    totalVolume,
    warnings: [
      totalWeight > maxWeight * 0.9 ? 'Weight capacity near limit' : null,
      totalVolume > maxVolume * 0.9 ? 'Volume capacity near limit' : null
    ].filter(Boolean)
  };
};

export default {
  getDistanceBetweenCities,
  extractCityName,
  calculateNearestNeighborRoute,
  calculate2OptRoute,
  optimizeDropSequence,
  calculateRouteEfficiency,
  suggestOptimalSequence,
  validateRouteFeasibility
};


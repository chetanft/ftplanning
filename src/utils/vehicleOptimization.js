/**
 * Vehicle Optimization Utilities
 * Provides algorithms for optimal vehicle selection and weight distribution
 */

/**
 * Calculate total weight and volume from orders
 */
export const calculateOrderTotals = (orders) => {
  const totalWeight = orders.reduce((sum, order) => sum + (order.weight * order.quantity), 0);
  const totalVolume = orders.reduce((sum, order) => {
    if (order.materialType === 'cuboidal') {
      const volume = (order.dimensions.length * order.dimensions.width * order.dimensions.height) / 1000000000; // Convert mm³ to m³ (1 m³ = 1,000,000,000 mm³)
      return sum + (volume * order.quantity);
    } else if (order.materialType === 'cylindrical') {
      const radius = order.dimensions.diameter / 2000; // Convert mm to m
      const height = order.dimensions.height / 1000; // Convert mm to m
      const volume = Math.PI * radius * radius * height;
      return sum + (volume * order.quantity);
    }
    return sum;
  }, 0);

  return { totalWeight, totalVolume };
};

/**
 * Generate optimal vehicle suggestions based on orders and available vehicle types
 */
export const generateVehicleSuggestions = (orders, vehicleTypes) => {
  const { totalWeight, totalVolume } = calculateOrderTotals(orders);

  if (totalWeight === 0) return [];

  const suggestions = [];

  // Sort vehicles by efficiency (cost per unit capacity - considering both weight and volume)
  const sortedVehicles = [...vehicleTypes].sort((a, b) => {
    const efficiencyA = a.costPerKm / Math.min(a.maxWeight / 1000, a.volume); // Cost per unit of limiting factor
    const efficiencyB = b.costPerKm / Math.min(b.maxWeight / 1000, b.volume);
    return efficiencyA - efficiencyB;
  });

  // Strategy 1: Single vehicle solutions (prioritize smaller vehicles first)
  for (const vehicle of sortedVehicles) {
    const weightUtil = (totalWeight / vehicle.maxWeight) * 100;
    const volumeUtil = (totalVolume / vehicle.volume) * 100;
    const maxUtil = Math.max(weightUtil, volumeUtil);

    if (weightUtil <= 100 && volumeUtil <= 100) {
      // Calculate efficiency score (higher is better)
      const efficiencyScore = maxUtil - (vehicle.costPerKm / 10); // Penalize higher cost

      suggestions.push({
        vehicles: [{ type: vehicle.id, quantity: 1 }],
        totalCost: vehicle.costPerKm,
        weightUtilization: weightUtil,
        volumeUtilization: volumeUtil,
        efficiency: maxUtil,
        efficiencyScore: efficiencyScore,
        description: `Single ${vehicle.name} - ${Math.round(maxUtil)}% utilization`,
        strategy: 'single'
      });
    }
  }

  // Strategy 2: Multi-vehicle solutions (same type) - only if no single vehicle fits
  if (suggestions.length === 0) {
    for (const vehicle of sortedVehicles) {
      const vehiclesNeeded = Math.ceil(Math.max(
        totalWeight / vehicle.maxWeight,
        totalVolume / vehicle.volume
      ));

      if (vehiclesNeeded > 1 && vehiclesNeeded <= 5) { // Limit to reasonable number
        const weightUtil = (totalWeight / (vehicle.maxWeight * vehiclesNeeded)) * 100;
        const volumeUtil = (totalVolume / (vehicle.volume * vehiclesNeeded)) * 100;
        const maxUtil = Math.max(weightUtil, volumeUtil);
        const efficiencyScore = maxUtil - (vehicle.costPerKm * vehiclesNeeded / 10);

        suggestions.push({
          vehicles: [{ type: vehicle.id, quantity: vehiclesNeeded }],
          totalCost: vehicle.costPerKm * vehiclesNeeded,
          weightUtilization: weightUtil,
          volumeUtilization: volumeUtil,
          efficiency: maxUtil,
          efficiencyScore: efficiencyScore,
          description: `${vehiclesNeeded}x ${vehicle.name} - ${Math.round(maxUtil)}% avg utilization`,
          strategy: 'multi-same'
        });
      }
    }
  }

  // Strategy 3: Mixed vehicle combinations
  if (totalWeight > 0 && sortedVehicles.length >= 2) {
    const largestVehicle = sortedVehicles[sortedVehicles.length - 1];
    const smallestVehicle = sortedVehicles[0];

    // Try combination of large + small vehicles
    const largeVehiclesNeeded = Math.floor(totalWeight / largestVehicle.maxWeight);
    const remainingWeight = totalWeight - (largeVehiclesNeeded * largestVehicle.maxWeight);
    const remainingVolume = totalVolume - (largeVehiclesNeeded * largestVehicle.volume);

    if (largeVehiclesNeeded > 0 && remainingWeight > 0) {
      const smallVehiclesNeeded = Math.ceil(Math.max(
        remainingWeight / smallestVehicle.maxWeight,
        remainingVolume / smallestVehicle.volume
      ));

      if (smallVehiclesNeeded <= 3) {
        const totalCost = (largestVehicle.costPerKm * largeVehiclesNeeded) +
                         (smallestVehicle.costPerKm * smallVehiclesNeeded);

        // Calculate more accurate utilization for mixed loads
        const largeVehicleUtil = Math.max(
          (largeVehiclesNeeded * largestVehicle.maxWeight) / totalWeight * 100,
          (largeVehiclesNeeded * largestVehicle.volume) / totalVolume * 100
        );

        const efficiencyScore = 85 - (totalCost / 10); // Penalize higher cost

        suggestions.push({
          vehicles: [
            { type: largestVehicle.id, quantity: largeVehiclesNeeded },
            { type: smallestVehicle.id, quantity: smallVehiclesNeeded }
          ],
          totalCost,
          weightUtilization: 85, // Estimated average
          volumeUtilization: 85, // Estimated average
          efficiency: 85,
          efficiencyScore,
          description: `Mixed: ${largeVehiclesNeeded}x ${largestVehicle.name} + ${smallVehiclesNeeded}x ${smallestVehicle.name}`,
          strategy: 'mixed'
        });
      }
    }
  }

  // Strategy 4: Cost-optimized solutions
  // Find the most cost-effective combination
  const costOptimizedSolutions = [];

  for (let i = 0; i < sortedVehicles.length; i++) {
    for (let j = i; j < sortedVehicles.length; j++) {
      const vehicle1 = sortedVehicles[i];
      const vehicle2 = sortedVehicles[j];

      // Try different combinations
      for (let qty1 = 1; qty1 <= 3; qty1++) {
        for (let qty2 = 0; qty2 <= 3; qty2++) {
          if (qty1 === 0 && qty2 === 0) continue;

          const totalCapacityWeight = (vehicle1.maxWeight * qty1) + (vehicle2.maxWeight * qty2);
          const totalCapacityVolume = (vehicle1.volume * qty1) + (vehicle2.volume * qty2);

          if (totalCapacityWeight >= totalWeight && totalCapacityVolume >= totalVolume) {
            const cost = (vehicle1.costPerKm * qty1) + (vehicle2.costPerKm * qty2);
            const weightUtil = (totalWeight / totalCapacityWeight) * 100;
            const volumeUtil = (totalVolume / totalCapacityVolume) * 100;
            const efficiency = Math.max(weightUtil, volumeUtil);

            if (efficiency >= 60) { // Only consider reasonably efficient solutions
              const vehicles = [];
              if (qty1 > 0) vehicles.push({ type: vehicle1.id, quantity: qty1 });
              if (qty2 > 0) vehicles.push({ type: vehicle2.id, quantity: qty2 });

              const efficiencyScore = efficiency - (cost / 10); // Penalize higher cost

              costOptimizedSolutions.push({
                vehicles,
                totalCost: cost,
                weightUtilization: weightUtil,
                volumeUtilization: volumeUtil,
                efficiency,
                efficiencyScore,
                description: `Cost-optimized: ${vehicles.map(v => `${v.quantity}x ${vehicleTypes.find(vt => vt.id === v.type)?.name}`).join(' + ')}`,
                strategy: 'cost-optimized'
              });
            }
          }
        }
      }
    }
  }

  // Add best cost-optimized solutions
  costOptimizedSolutions
    .sort((a, b) => a.totalCost - b.totalCost)
    .slice(0, 2)
    .forEach(solution => suggestions.push(solution));

  // Sort all suggestions by efficiency score (higher is better), then by efficiency, then by cost
  return suggestions
    .sort((a, b) => {
      // First, prioritize by efficiency score if available
      if (a.efficiencyScore !== undefined && b.efficiencyScore !== undefined) {
        const scoreDiff = b.efficiencyScore - a.efficiencyScore;
        if (Math.abs(scoreDiff) > 5) return scoreDiff;
      }

      // Then by efficiency
      const efficiencyDiff = b.efficiency - a.efficiency;
      if (Math.abs(efficiencyDiff) > 5) return efficiencyDiff;

      // Finally by cost (lower is better)
      return a.totalCost - b.totalCost;
    })
    .slice(0, 4); // Return top 4 suggestions
};

/**
 * Calculate utilization for a given vehicle selection
 */
export const calculateUtilization = (selectedVehicles, orders, vehicleTypes) => {
  const { totalWeight, totalVolume } = calculateOrderTotals(orders);

  const totalCapacityWeight = selectedVehicles.reduce((sum, sv) => {
    const vehicle = vehicleTypes.find(v => v.id === sv.type);
    return sum + (vehicle?.maxWeight * sv.quantity || 0);
  }, 0);

  const totalCapacityVolume = selectedVehicles.reduce((sum, sv) => {
    const vehicle = vehicleTypes.find(v => v.id === sv.type);
    return sum + (vehicle?.volume * sv.quantity || 0);
  }, 0);

  return {
    weight: totalCapacityWeight > 0 ? (totalWeight / totalCapacityWeight) * 100 : 0,
    volume: totalCapacityVolume > 0 ? (totalVolume / totalCapacityVolume) * 100 : 0,
    totalWeight,
    totalVolume,
    totalCapacityWeight,
    totalCapacityVolume
  };
};

/**
 * Group orders by route
 */
export const groupOrdersByRoute = (orders) => {
  const grouped = {};
  orders.forEach(order => {
    if (!grouped[order.route]) {
      grouped[order.route] = [];
    }
    grouped[order.route].push(order);
  });
  return grouped;
};

/**
 * Generate drop points for orders based on delivery locations
 */
export const generateDropPoints = (orders, maxDropPoints = 1) => {
  if (maxDropPoints === 1) {
    // Single drop point - group all orders by route destination
    const dropPointsByRoute = {};
    orders.forEach(order => {
      if (!dropPointsByRoute[order.route]) {
        dropPointsByRoute[order.route] = {
          id: `DP_${order.route}`,
          location: order.delivery || order.routeName?.split(' → ')[1] || 'Unknown',
          route: order.route,
          orders: []
        };
      }
      dropPointsByRoute[order.route].orders.push(order);
    });
    return Object.values(dropPointsByRoute);
  }

  // Multiple drop points - group by unique delivery locations
  const dropPointsMap = {};
  let dropPointCounter = 1;

  orders.forEach(order => {
    const deliveryLocation = order.delivery || order.routeName?.split(' → ')[1] || 'Unknown';
    const key = `${order.route}_${deliveryLocation}`;

    if (!dropPointsMap[key]) {
      dropPointsMap[key] = {
        id: `DP${dropPointCounter.toString().padStart(3, '0')}`,
        location: deliveryLocation,
        route: order.route,
        orders: []
      };
      dropPointCounter++;
    }
    dropPointsMap[key].orders.push(order);
  });

  // If we have more drop points than allowed, consolidate the smallest ones
  let dropPoints = Object.values(dropPointsMap);
  if (dropPoints.length > maxDropPoints) {
    // Sort by number of orders (ascending) and consolidate smallest ones
    dropPoints.sort((a, b) => a.orders.length - b.orders.length);

    while (dropPoints.length > maxDropPoints) {
      const smallest = dropPoints.shift();
      const target = dropPoints.find(dp => dp.route === smallest.route) || dropPoints[0];
      target.orders.push(...smallest.orders);
      target.location = target.location + ` & ${smallest.location}`;
    }
  }

  return dropPoints;
};

/**
 * Calculate order weight and volume
 */
export const calculateOrderWeightAndVolume = (order) => {
  const orderWeight = order.weight * order.quantity;
  let orderVolume = 0;

  if (order.materialType === 'cuboidal') {
    orderVolume = (order.dimensions.length * order.dimensions.width * order.dimensions.height * order.quantity) / 1000000000; // Convert mm³ to m³
  } else if (order.materialType === 'cylindrical') {
    const radius = order.dimensions.diameter / 2000;
    const height = order.dimensions.height / 1000;
    orderVolume = Math.PI * radius * radius * height * order.quantity;
  }

  return { orderWeight, orderVolume };
};

/**
 * Distribute orders for a single route across vehicles with LIFO arrangement
 */
export const distributeOrdersForRoute = (routeOrders, availableVehicles, loadingSequence = 'lifo') => {
  const vehicleInstances = [...availableVehicles];

  // Sort orders based on loading sequence
  let sortedOrders;
  switch (loadingSequence) {
    case 'lifo':
      // Last In, First Out - heaviest items loaded first (will be unloaded last)
      sortedOrders = [...routeOrders].sort((a, b) => (b.weight * b.quantity) - (a.weight * a.quantity));
      break;
    case 'fifo':
      // First In, First Out - lightest items loaded first
      sortedOrders = [...routeOrders].sort((a, b) => (a.weight * a.quantity) - (b.weight * b.quantity));
      break;
    case 'route':
      // Route-based sequence (maintain original order)
      sortedOrders = [...routeOrders];
      break;
    case 'weight':
      // Weight-based sequence (heaviest first)
      sortedOrders = [...routeOrders].sort((a, b) => (b.weight * b.quantity) - (a.weight * a.quantity));
      break;
    case 'priority':
      // Priority-based sequence (high priority first)
      sortedOrders = [...routeOrders].sort((a, b) => (b.priority || 0) - (a.priority || 0));
      break;
    default:
      sortedOrders = [...routeOrders];
  }

  // Distribute orders using best-fit algorithm
  sortedOrders.forEach(order => {
    const { orderWeight, orderVolume } = calculateOrderWeightAndVolume(order);

    // Find the best vehicle for this order (most utilized but still has capacity)
    let bestVehicle = null;
    let bestUtilization = -1;

    vehicleInstances.forEach(vehicle => {
      const wouldFitWeight = vehicle.currentWeight + orderWeight <= vehicle.maxWeight;
      const wouldFitVolume = vehicle.currentVolume + orderVolume <= vehicle.maxVolume;

      if (wouldFitWeight && wouldFitVolume) {
        const currentUtilization = Math.max(
          vehicle.currentWeight / vehicle.maxWeight,
          vehicle.currentVolume / vehicle.maxVolume
        );

        if (currentUtilization > bestUtilization) {
          bestUtilization = currentUtilization;
          bestVehicle = vehicle;
        }
      }
    });

    // If no vehicle can fit the order, assign to the one with most remaining capacity
    if (!bestVehicle) {
      bestVehicle = vehicleInstances.reduce((best, vehicle) => {
        const remainingCapacity = Math.min(
          vehicle.maxWeight - vehicle.currentWeight,
          vehicle.maxVolume - vehicle.currentVolume
        );
        const bestRemainingCapacity = Math.min(
          best.maxWeight - best.currentWeight,
          best.maxVolume - best.currentVolume
        );

        return remainingCapacity > bestRemainingCapacity ? vehicle : best;
      });
    }

    if (bestVehicle) {
      bestVehicle.orders.push(order);
      bestVehicle.currentWeight += orderWeight;
      bestVehicle.currentVolume += orderVolume;
      bestVehicle.route = order.route; // Assign route to vehicle
    }
  });

  return vehicleInstances.filter(vehicle => vehicle.orders.length > 0);
};

/**
 * Distribute orders optimally across multiple vehicles with route awareness
 */
export const distributeOrdersAcrossVehicles = (orders, vehicleConfig, vehicleTypes, options = {}) => {
  const {
    routeStrategy = 'separate', // 'separate' or 'consolidate'
    loadingSequence = 'lifo',
    allowMixedRoutes = false,
    dropPoints = 1
  } = options;

  let vehicleCounter = 1;
  const allVehicleInstances = [];

  // Generate drop points based on configuration
  const dropPointsData = generateDropPoints(orders, dropPoints);

  // Create vehicle instances
  const createVehicleInstances = (quantity, vehicleType) => {
    const instances = [];
    for (let i = 0; i < quantity; i++) {
      instances.push({
        id: `V${vehicleCounter.toString().padStart(3, '0')}`,
        type: vehicleType.id,
        vehicleType,
        maxWeight: vehicleType?.maxWeight || 0,
        maxVolume: vehicleType?.volume || 0,
        currentWeight: 0,
        currentVolume: 0,
        orders: [],
        route: null,
        dropPoints: []
      });
      vehicleCounter++;
    }
    return instances;
  };

  if (routeStrategy === 'separate') {
    // Strategy 1: Separate vehicles for each route
    const ordersByRoute = groupOrdersByRoute(orders);

    Object.entries(ordersByRoute).forEach(([route, routeOrders]) => {
      // Calculate requirements for this route
      const { totalWeight, totalVolume } = calculateOrderTotals(routeOrders);

      // Determine optimal vehicle allocation for this route
      const routeVehicleSuggestions = generateVehicleSuggestions(routeOrders, vehicleTypes);
      const bestSuggestion = routeVehicleSuggestions[0];

      if (bestSuggestion) {
        // Use suggested vehicles for this route
        bestSuggestion.vehicles.forEach(vc => {
          const vehicleType = vehicleTypes.find(vt => vt.id === vc.type);
          const routeVehicles = createVehicleInstances(vc.quantity, vehicleType);
          const distributedVehicles = distributeOrdersForRoute(routeOrders, routeVehicles, loadingSequence);
          allVehicleInstances.push(...distributedVehicles);
        });
      } else {
        // Fallback to user-selected vehicles
        vehicleConfig.forEach(vc => {
          const vehicleType = vehicleTypes.find(vt => vt.id === vc.type);
          const routeVehicles = createVehicleInstances(vc.quantity, vehicleType);
          const distributedVehicles = distributeOrdersForRoute(routeOrders, routeVehicles, loadingSequence);
          allVehicleInstances.push(...distributedVehicles);
        });
      }
    });
  } else {
    // Strategy 2: Consolidate orders across routes (original behavior)
    const vehicleInstances = [];
    vehicleConfig.forEach(vc => {
      const vehicleType = vehicleTypes.find(vt => vt.id === vc.type);
      vehicleInstances.push(...createVehicleInstances(vc.quantity, vehicleType));
    });

    if (allowMixedRoutes) {
      // Allow orders from different routes in the same vehicle
      const distributedVehicles = distributeOrdersForRoute(orders, vehicleInstances, loadingSequence);
      allVehicleInstances.push(...distributedVehicles);
    } else {
      // Group by route but use shared vehicle pool
      const ordersByRoute = groupOrdersByRoute(orders);
      Object.entries(ordersByRoute).forEach(([route, routeOrders]) => {
        const distributedVehicles = distributeOrdersForRoute(routeOrders, vehicleInstances, loadingSequence);
        allVehicleInstances.push(...distributedVehicles);
      });
    }
  }

  // Assign drop points to vehicles based on their orders
  allVehicleInstances.forEach(vehicle => {
    if (vehicle.orders.length > 0) {
      const vehicleDropPoints = dropPointsData.filter(dp =>
        dp.orders.some(order => vehicle.orders.some(vOrder => vOrder.id === order.id))
      );
      vehicle.dropPoints = vehicleDropPoints;
    }
  });

  // Convert to final format
  return allVehicleInstances.map(vehicle => ({
    id: vehicle.id,
    type: vehicle.type,
    name: vehicle.vehicleType?.name || 'Unknown Vehicle',
    route: vehicle.route || (vehicle.orders.length > 0 ? vehicle.orders[0].route : 'DEL-MUM'),
    utilization: {
      volume: vehicle.maxVolume > 0 ? (vehicle.currentVolume / vehicle.maxVolume) * 100 : 0,
      weight: vehicle.maxWeight > 0 ? (vehicle.currentWeight / vehicle.maxWeight) * 100 : 0
    },
    orders: vehicle.orders,
    dropPoints: vehicle.dropPoints || [],
    capacity: {
      maxWeight: vehicle.maxWeight,
      maxVolume: vehicle.maxVolume,
      currentWeight: vehicle.currentWeight,
      currentVolume: vehicle.currentVolume
    },
    loadingSequence,
    vehicleType: vehicle.vehicleType
  }));
};

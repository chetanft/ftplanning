/**
 * Test file for vehicle optimization utilities
 */

import {
  calculateOrderTotals,
  generateVehicleSuggestions,
  calculateUtilization,
  distributeOrdersAcrossVehicles,
  groupOrdersByRoute,
  distributeOrdersForRoute
} from './vehicleOptimization.js';

// Mock data for testing
const mockOrders = [
  {
    id: 'SO001',
    route: 'DEL-MUM',
    quantity: 50,
    weight: 25,
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 300 }
  },
  {
    id: 'SO002',
    route: 'DEL-MUM',
    quantity: 30,
    weight: 15, // Updated to realistic weight
    materialType: 'cylindrical',
    dimensions: { diameter: 500, height: 800 }
  }
];

// Mock orders with different routes for testing route-aware functionality
const mockOrdersMultiRoute = [
  {
    id: 'SO001',
    route: 'DEL-MUM',
    quantity: 50,
    weight: 25,
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 300 }
  },
  {
    id: 'SO002',
    route: 'DEL-MUM',
    quantity: 30,
    weight: 15,
    materialType: 'cylindrical',
    dimensions: { diameter: 500, height: 800 }
  },
  {
    id: 'SO003',
    route: 'DEL-HYD',
    quantity: 40,
    weight: 20,
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 300, height: 400 }
  },
  {
    id: 'SO004',
    route: 'DEL-HYD',
    quantity: 25,
    weight: 12,
    materialType: 'cylindrical',
    dimensions: { diameter: 400, height: 600 }
  },
  {
    id: 'SO005',
    route: 'DEL-CHE',
    quantity: 35,
    weight: 18,
    materialType: 'cuboidal',
    dimensions: { length: 700, width: 500, height: 350 }
  }
];

const mockVehicleTypes = [
  {
    id: 'TATA_ACE',
    name: 'Tata Ace',
    maxWeight: 750,
    volume: 4.6,
    costPerKm: 12
  },
  {
    id: 'SXL',
    name: 'SXL Container',
    maxWeight: 25000,
    volume: 38.5,
    costPerKm: 25
  }
];

// Test calculateOrderTotals
console.log('Testing calculateOrderTotals...');
const totals = calculateOrderTotals(mockOrders);
console.log('Order totals:', totals);
console.log('Expected weight: 1575kg (50*25 + 30*15)');
console.log('Actual weight:', totals.totalWeight);
console.log('Expected volume: ~3.6m³ (realistic cuboidal + cylindrical)');
console.log('Actual volume:', totals.totalVolume.toFixed(3), 'm³');

// Test generateVehicleSuggestions
console.log('\nTesting generateVehicleSuggestions...');
const suggestions = generateVehicleSuggestions(mockOrders, mockVehicleTypes);
console.log('Generated suggestions:', suggestions.length);
suggestions.forEach((suggestion, index) => {
  console.log(`Suggestion ${index + 1}:`, suggestion.description);
  console.log(`  - Vehicles:`, suggestion.vehicles);
  console.log(`  - Cost: ₹${suggestion.totalCost}/km`);
  console.log(`  - Efficiency: ${suggestion.efficiency.toFixed(1)}%`);
});

// Test calculateUtilization
console.log('\nTesting calculateUtilization...');
const selectedVehicles = [{ type: 'SXL', quantity: 1 }];
const utilization = calculateUtilization(selectedVehicles, mockOrders, mockVehicleTypes);
console.log('Utilization:', utilization);

// Test distributeOrdersAcrossVehicles
console.log('\nTesting distributeOrdersAcrossVehicles...');
const vehicleConfig = [{ type: 'SXL', quantity: 1 }];
const distributedVehicles = distributeOrdersAcrossVehicles(mockOrders, vehicleConfig, mockVehicleTypes);
console.log('Distributed vehicles:', distributedVehicles.length);
distributedVehicles.forEach(vehicle => {
  console.log(`Vehicle ${vehicle.id}:`, vehicle.name);
  console.log(`  - Orders: ${vehicle.orders.length}`);
  console.log(`  - Weight utilization: ${vehicle.utilization.weight.toFixed(1)}%`);
  console.log(`  - Volume utilization: ${vehicle.utilization.volume.toFixed(1)}%`);
});

// Test new route-aware functionality
console.log('\n=== TESTING ROUTE-AWARE FUNCTIONALITY ===');

// Test groupOrdersByRoute
console.log('\nTesting groupOrdersByRoute...');
const groupedOrders = groupOrdersByRoute(mockOrdersMultiRoute);
console.log('Grouped orders by route:');
Object.entries(groupedOrders).forEach(([route, orders]) => {
  console.log(`  ${route}: ${orders.length} orders`);
  orders.forEach(order => console.log(`    - ${order.id} (${order.weight}kg x ${order.quantity})`));
});

// Test separate vehicles per route strategy
console.log('\nTesting separate vehicles per route strategy...');
const separateVehicles = distributeOrdersAcrossVehicles(
  mockOrdersMultiRoute,
  [{ type: 'SXL', quantity: 1 }],
  mockVehicleTypes,
  { routeStrategy: 'separate', loadingSequence: 'lifo' }
);
console.log(`Generated ${separateVehicles.length} vehicles with separate strategy:`);
separateVehicles.forEach(vehicle => {
  console.log(`  Vehicle ${vehicle.id} (${vehicle.name}):`);
  console.log(`    - Route: ${vehicle.route}`);
  console.log(`    - Orders: ${vehicle.orders.length} (${vehicle.orders.map(o => o.id).join(', ')})`);
  console.log(`    - Weight utilization: ${vehicle.utilization.weight.toFixed(1)}%`);
  console.log(`    - Volume utilization: ${vehicle.utilization.volume.toFixed(1)}%`);
  console.log(`    - Loading sequence: ${vehicle.loadingSequence}`);
});

// Test consolidate routes strategy
console.log('\nTesting consolidate routes strategy...');
const consolidatedVehicles = distributeOrdersAcrossVehicles(
  mockOrdersMultiRoute,
  [{ type: 'SXL', quantity: 2 }],
  mockVehicleTypes,
  { routeStrategy: 'consolidate', loadingSequence: 'lifo', allowMixedRoutes: false }
);
console.log(`Generated ${consolidatedVehicles.length} vehicles with consolidate strategy:`);
consolidatedVehicles.forEach(vehicle => {
  console.log(`  Vehicle ${vehicle.id} (${vehicle.name}):`);
  console.log(`    - Route: ${vehicle.route}`);
  console.log(`    - Orders: ${vehicle.orders.length} (${vehicle.orders.map(o => o.id).join(', ')})`);
  console.log(`    - Weight utilization: ${vehicle.utilization.weight.toFixed(1)}%`);
  console.log(`    - Volume utilization: ${vehicle.utilization.volume.toFixed(1)}%`);
});

// Test mixed routes strategy
console.log('\nTesting mixed routes strategy...');
const mixedVehicles = distributeOrdersAcrossVehicles(
  mockOrdersMultiRoute,
  [{ type: 'SXL', quantity: 1 }],
  mockVehicleTypes,
  { routeStrategy: 'consolidate', loadingSequence: 'weight', allowMixedRoutes: true }
);
console.log(`Generated ${mixedVehicles.length} vehicles with mixed routes strategy:`);
mixedVehicles.forEach(vehicle => {
  console.log(`  Vehicle ${vehicle.id} (${vehicle.name}):`);
  console.log(`    - Route: ${vehicle.route}`);
  console.log(`    - Orders: ${vehicle.orders.length} (${vehicle.orders.map(o => `${o.id}[${o.route}]`).join(', ')})`);
  console.log(`    - Weight utilization: ${vehicle.utilization.weight.toFixed(1)}%`);
  console.log(`    - Volume utilization: ${vehicle.utilization.volume.toFixed(1)}%`);
});

// Test different loading sequences
console.log('\nTesting different loading sequences...');
const loadingSequences = ['lifo', 'fifo', 'weight', 'priority'];
loadingSequences.forEach(sequence => {
  console.log(`\n  Testing ${sequence.toUpperCase()} loading sequence:`);
  const vehicles = distributeOrdersAcrossVehicles(
    mockOrdersMultiRoute.slice(0, 3), // Use first 3 orders
    [{ type: 'SXL', quantity: 1 }],
    mockVehicleTypes,
    { routeStrategy: 'consolidate', loadingSequence: sequence, allowMixedRoutes: true }
  );

  if (vehicles.length > 0) {
    const vehicle = vehicles[0];
    console.log(`    Order sequence: ${vehicle.orders.map(o => `${o.id}(${o.weight}kg)`).join(' → ')}`);
  }
});

console.log('\n=== ROUTE-AWARE TESTS COMPLETED ===');
console.log('\nAll tests completed!');

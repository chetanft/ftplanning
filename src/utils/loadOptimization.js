/**
 * Advanced Load Optimization Engine
 * Combines bin packing with real-world constraints
 */

import { BinPacker } from './binPacking.js';
import { CylindricalPacker } from './cylindricalPacking.js';

export class LoadOptimizer {
  constructor(vehicleSpecs, constraints = {}) {
    this.vehicle = vehicleSpecs;
    this.constraints = {
      maxStackHeight: constraints.maxStackHeight || 2500,
      weightDistributionTolerance: constraints.weightDistributionTolerance || 0.1,
      stackingRules: constraints.stackingRules || {},
      loadingSequence: constraints.loadingSequence || 'lifo',
      ...constraints
    };
  }

  // Main optimization function
  optimizeLoad(orders) {
    // Separate orders by material type
    const cuboidalOrders = orders.filter(o => o.materialType === 'cuboidal');
    const cylindricalOrders = orders.filter(o => o.materialType === 'cylindrical');

    // Create optimized load plan
    const loadPlan = {
      vehicleId: this.vehicle.id,
      totalWeight: 0,
      totalVolume: 0,
      centerOfGravity: { x: 0, y: 0, z: 0 },
      layers: [],
      warnings: [],
      utilization: { weight: 0, volume: 0 },
      items: []
    };

    // Pack cuboidal items first (usually more structured)
    if (cuboidalOrders.length > 0) {
      const cuboidalPlan = this.packCuboidalItems(cuboidalOrders);
      this.mergePlan(loadPlan, cuboidalPlan);
    }

    // Pack cylindrical items in remaining space
    if (cylindricalOrders.length > 0) {
      const cylindricalPlan = this.packCylindricalItems(cylindricalOrders, loadPlan);
      this.mergePlan(loadPlan, cylindricalPlan);
    }

    // Validate and optimize final arrangement
    this.validateLoadPlan(loadPlan);
    this.optimizeLoadSequence(loadPlan);

    return loadPlan;
  }

  // Pack cuboidal items using 3D bin packing
  packCuboidalItems(orders) {
    const packer = new BinPacker(this.vehicle.dimensions);
    const packedItems = packer.packItems(orders);

    return {
      items: packedItems,
      utilization: this.calculateUtilization(packedItems),
      warnings: this.validateCuboidalPacking(packedItems)
    };
  }

  // Pack cylindrical items with specialized algorithm
  packCylindricalItems(orders, existingPlan = null) {
    const cylindricalPacker = new CylindricalPacker(
      this.vehicle.dimensions,
      existingPlan
    );
    
    const packedItems = cylindricalPacker.packItems(orders);

    return {
      items: packedItems,
      utilization: this.calculateUtilization(packedItems),
      warnings: this.validateCylindricalPacking(packedItems)
    };
  }

  // Merge packing plans
  mergePlan(mainPlan, subPlan) {
    mainPlan.items.push(...subPlan.items);
    mainPlan.warnings.push(...subPlan.warnings);
    
    // Recalculate totals
    const totals = this.calculateTotals(mainPlan.items);
    mainPlan.totalWeight = totals.weight;
    mainPlan.totalVolume = totals.volume;
    mainPlan.utilization = this.calculateUtilization(mainPlan.items);
    mainPlan.centerOfGravity = this.calculateCenterOfGravity(mainPlan.items);
  }

  // Calculate total weight and volume
  calculateTotals(items) {
    const weight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    const volume = items.reduce((sum, item) => {
      if (item.materialType === 'cuboidal') {
        return sum + ((item.dimensions.length * item.dimensions.width * item.dimensions.height * item.quantity) / 1000000000);
      } else if (item.materialType === 'cylindrical') {
        const radius = item.dimensions.diameter / 2000;
        const height = item.dimensions.height / 1000;
        return sum + (Math.PI * radius * radius * height * item.quantity);
      }
      return sum;
    }, 0);

    return { weight, volume };
  }

  // Validate complete load plan
  validateLoadPlan(loadPlan) {
    // Check weight distribution
    const cogCheck = this.validateCenterOfGravity(loadPlan);
    if (!cogCheck.valid) {
      loadPlan.warnings.push({
        type: 'weight_distribution',
        severity: 'high',
        message: cogCheck.message
      });
    }

    // Check axle load distribution
    const axleCheck = this.validateAxleLoads(loadPlan);
    if (!axleCheck.valid) {
      loadPlan.warnings.push({
        type: 'axle_load',
        severity: 'medium',
        message: axleCheck.message
      });
    }

    // Check stacking compliance
    const stackingCheck = this.validateStackingRules(loadPlan);
    if (!stackingCheck.valid) {
      loadPlan.warnings.push({
        type: 'stacking_violation',
        severity: 'high',
        message: stackingCheck.message
      });
    }

    // Check loading sequence feasibility
    const sequenceCheck = this.validateLoadingSequence(loadPlan);
    if (!sequenceCheck.valid) {
      loadPlan.warnings.push({
        type: 'loading_sequence',
        severity: 'medium',
        message: sequenceCheck.message
      });
    }
  }

  // Optimize loading sequence based on delivery order
  optimizeLoadSequence(loadPlan) {
    const { loadingSequence } = this.constraints;

    switch (loadingSequence) {
      case 'lifo':
        // Last In, First Out - items delivered first should be loaded last
        loadPlan.items = this.arrangeLIFO(loadPlan.items);
        break;
      case 'fifo':
        // First In, First Out - items delivered first should be loaded first
        loadPlan.items = this.arrangeFIFO(loadPlan.items);
        break;
      case 'route':
        // Route-based sequence
        loadPlan.items = this.arrangeByRoute(loadPlan.items);
        break;
      case 'weight':
        // Weight-based sequence (heaviest first)
        loadPlan.items = this.arrangeByWeight(loadPlan.items);
        break;
    }
  }

  // LIFO arrangement
  arrangeLIFO(items) {
    return items.sort((a, b) => {
      // Items to be delivered first should be loaded last (higher Y position)
      const deliveryOrderA = this.getDeliveryOrder(a);
      const deliveryOrderB = this.getDeliveryOrder(b);
      return deliveryOrderA - deliveryOrderB;
    });
  }

  // FIFO arrangement
  arrangeFIFO(items) {
    return items.sort((a, b) => {
      // Items to be delivered first should be loaded first (lower Y position)
      const deliveryOrderA = this.getDeliveryOrder(a);
      const deliveryOrderB = this.getDeliveryOrder(b);
      return deliveryOrderB - deliveryOrderA;
    });
  }

  // Route-based arrangement
  arrangeByRoute(items) {
    return items.sort((a, b) => {
      if (a.route !== b.route) {
        return a.route.localeCompare(b.route);
      }
      return this.getDeliveryOrder(a) - this.getDeliveryOrder(b);
    });
  }

  // Weight-based arrangement
  arrangeByWeight(items) {
    return items.sort((a, b) => (b.weight * b.quantity) - (a.weight * a.quantity));
  }

  // Get delivery order (simplified)
  getDeliveryOrder(item) {
    // This would be based on actual route optimization
    // For now, use a simple hash of the delivery location
    return item.delivery ? item.delivery.length : 0;
  }

  // Calculate center of gravity
  calculateCenterOfGravity(items) {
    let totalWeight = 0;
    let weightedX = 0, weightedY = 0, weightedZ = 0;

    items.forEach(item => {
      const itemWeight = item.weight * item.quantity;
      totalWeight += itemWeight;
      
      if (item.position) {
        weightedX += item.position.x * itemWeight;
        weightedY += item.position.y * itemWeight;
        weightedZ += item.position.z * itemWeight;
      }
    });

    return totalWeight > 0 ? {
      x: weightedX / totalWeight,
      y: weightedY / totalWeight,
      z: weightedZ / totalWeight
    } : { x: 0, y: 0, z: 0 };
  }

  // Validate center of gravity is within acceptable limits
  validateCenterOfGravity(loadPlan) {
    const cog = loadPlan.centerOfGravity;
    const vehicleCenter = {
      x: this.vehicle.dimensions.length / 2,
      y: this.vehicle.dimensions.height / 2,
      z: this.vehicle.dimensions.width / 2
    };

    const tolerance = this.constraints.weightDistributionTolerance;
    const maxOffsetX = this.vehicle.dimensions.length * tolerance;
    const maxOffsetZ = this.vehicle.dimensions.width * tolerance;

    const offsetX = Math.abs(cog.x - vehicleCenter.x);
    const offsetZ = Math.abs(cog.z - vehicleCenter.z);

    if (offsetX > maxOffsetX || offsetZ > maxOffsetZ) {
      return {
        valid: false,
        message: `Center of gravity offset exceeds limits. X: ${offsetX.toFixed(2)}mm (max: ${maxOffsetX.toFixed(2)}mm), Z: ${offsetZ.toFixed(2)}mm (max: ${maxOffsetZ.toFixed(2)}mm)`
      };
    }

    return { valid: true };
  }

  // Validate axle load distribution
  validateAxleLoads(loadPlan) {
    const frontAxleWeight = this.calculateAxleWeight(loadPlan.items, 'front');
    const rearAxleWeight = this.calculateAxleWeight(loadPlan.items, 'rear');
    const totalWeight = frontAxleWeight + rearAxleWeight;

    // Typical truck axle weight distribution: 30% front, 70% rear
    const frontPercentage = (frontAxleWeight / totalWeight) * 100;
    const rearPercentage = (rearAxleWeight / totalWeight) * 100;

    if (frontPercentage < 20 || frontPercentage > 40) {
      return {
        valid: false,
        message: `Front axle load ${frontPercentage.toFixed(1)}% is outside acceptable range (20-40%)`
      };
    }

    return { valid: true };
  }

  // Calculate axle weight
  calculateAxleWeight(items, axle) {
    const vehicleLength = this.vehicle.dimensions.length;
    const axlePosition = axle === 'front' ? vehicleLength * 0.2 : vehicleLength * 0.8;

    return items.reduce((weight, item) => {
      if (!item.position) return weight;
      
      const itemWeight = item.weight * item.quantity;
      const distanceFromAxle = Math.abs(item.position.x - axlePosition);
      
      // Weight distribution based on distance from axle
      const weightFactor = Math.max(0, 1 - (distanceFromAxle / vehicleLength));
      return weight + (itemWeight * weightFactor);
    }, 0);
  }

  // Validate stacking rules
  validateStackingRules(loadPlan) {
    // Check for stacking violations
    for (const item of loadPlan.items) {
      if (item.materialType === 'cuboidal' && !item.stackable && item.position?.y > 0.1) {
        return {
          valid: false,
          message: `Non-stackable item ${item.id} is placed above ground level`
        };
      }
    }

    return { valid: true };
  }

  // Validate loading sequence
  validateLoadingSequence(loadPlan) {
    // Check if loading sequence is physically possible
    // This is a simplified check
    return { valid: true };
  }

  // Validate cuboidal packing
  validateCuboidalPacking(items) {
    const warnings = [];
    
    items.forEach(item => {
      if (item.weight > 50 && item.position?.y > 1000) {
        warnings.push({
          type: 'heavy_item_high',
          severity: 'medium',
          message: `Heavy item ${item.id} (${item.weight}kg) placed at high position`
        });
      }
    });

    return warnings;
  }

  // Validate cylindrical packing
  validateCylindricalPacking(items) {
    const warnings = [];
    
    items.forEach(item => {
      if (item.orientation === 'horizontal' && item.fragile) {
        warnings.push({
          type: 'fragile_horizontal',
          severity: 'high',
          message: `Fragile cylindrical item ${item.id} placed horizontally`
        });
      }
    });

    return warnings;
  }

  // Calculate utilization metrics
  calculateUtilization(items) {
    const totals = this.calculateTotals(items);
    
    return {
      weight: (totals.weight / this.vehicle.maxWeight) * 100,
      volume: (totals.volume / this.vehicle.volume) * 100
    };
  }
}

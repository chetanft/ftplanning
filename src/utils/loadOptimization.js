/**
 * Advanced Load Optimization Engine
 * Combines bin packing with real-world constraints and fragility considerations
 */

import { BinPacker } from './binPacking.js';
import { CylindricalPacker } from './cylindricalPacking.js';
import { assessOrderFragility, checkStackingCompatibility, calculateLoadRiskScore, getHandlingInstructions } from './fragilityScoring.js';
import { checkPackagingCompatibility, getPackagingType } from './packagingTypes.js';

export class LoadOptimizer {
  constructor(vehicleSpecs, constraints = {}) {
    this.vehicle = vehicleSpecs;
    this.constraints = {
      maxStackHeight: constraints.maxStackHeight || 2500,
      weightDistributionTolerance: constraints.weightDistributionTolerance || 0.1,
      stackingRules: constraints.stackingRules || {},
      loadingSequence: constraints.loadingSequence || 'lifo',
      // Fragility-aware constraints
      enableFragilityOptimization: constraints.enableFragilityOptimization !== false,
      protectedZoneEnabled: constraints.protectedZoneEnabled !== false,
      maxRiskScore: constraints.maxRiskScore || 50,
      ...constraints
    };
  }

  // Main optimization function
  optimizeLoad(orders) {
    // Pre-process orders with fragility assessment
    const assessedOrders = this.assessOrdersFragility(orders);

    // Sort orders for optimal loading (fragility-aware)
    const sortedOrders = this.sortOrdersForLoading(assessedOrders);

    // Separate orders by material type
    const cuboidalOrders = sortedOrders.filter(o => o.materialType === 'cuboidal');
    const cylindricalOrders = sortedOrders.filter(o => o.materialType === 'cylindrical');

    // Create optimized load plan
    const loadPlan = {
      vehicleId: this.vehicle.id,
      totalWeight: 0,
      totalVolume: 0,
      centerOfGravity: { x: 0, y: 0, z: 0 },
      layers: [],
      warnings: [],
      utilization: { weight: 0, volume: 0 },
      items: [],
      // New fragility-related fields
      fragilityProfile: this.calculateFragilityProfile(assessedOrders),
      riskAssessment: null,
      loadingInstructions: []
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

    // NEW: Perform fragility validation and generate instructions
    if (this.constraints.enableFragilityOptimization) {
      this.validateFragilityArrangement(loadPlan);
      loadPlan.riskAssessment = calculateLoadRiskScore(loadPlan.items);
      loadPlan.loadingInstructions = this.generateFragilityAwareInstructions(loadPlan);
    }

    return loadPlan;
  }

  // NEW: Assess fragility for all orders
  assessOrdersFragility(orders) {
    return orders.map(order => ({
      ...order,
      fragilityAssessment: assessOrderFragility(order),
      packagingInfo: getPackagingType(order.packagingType || 'corrugated_box')
    }));
  }

  // NEW: Sort orders for optimal loading based on fragility
  sortOrdersForLoading(orders) {
    return [...orders].sort((a, b) => {
      // First priority: Delivery sequence (LIFO)
      if (this.constraints.loadingSequence === 'lifo') {
        const seqA = a.dropSequence || 999;
        const seqB = b.dropSequence || 999;
        if (seqA !== seqB) return seqB - seqA;
      }

      // Second priority: Fragility (less fragile first - goes to bottom)
      const fragA = a.fragilityAssessment?.score || 2;
      const fragB = b.fragilityAssessment?.score || 2;
      if (fragA !== fragB) return fragA - fragB;

      // Third priority: Weight (heavier first)
      const weightA = a.weight * (a.quantity || 1);
      const weightB = b.weight * (b.quantity || 1);
      return weightB - weightA;
    });
  }

  // NEW: Calculate fragility profile for the load
  calculateFragilityProfile(orders) {
    const scores = orders.map(o => o.fragilityAssessment?.score || 2);
    
    if (scores.length === 0) {
      return {
        average: 2,
        max: 2,
        min: 2,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        hasExtremelyFragile: false,
        hasFragile: false,
        requiresPremiumHandling: false
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    scores.forEach(s => distribution[s] = (distribution[s] || 0) + 1);

    return {
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      max: Math.max(...scores),
      min: Math.min(...scores),
      distribution,
      hasExtremelyFragile: scores.includes(5),
      hasFragile: scores.some(s => s >= 4),
      requiresPremiumHandling: scores.some(s => s >= 4)
    };
  }

  // NEW: Validate fragility arrangement
  validateFragilityArrangement(loadPlan) {
    const items = loadPlan.items;

    for (const item of items) {
      if (!item.position) continue;

      const fragility = item.fragilityAssessment || assessOrderFragility(item);

      // Check 1: Fragile items on top
      if (fragility.score >= 4) {
        const itemsAbove = items.filter(other => 
          other.position && 
          other.position.y > item.position.y &&
          this.hasHorizontalOverlap(item, other)
        );

        if (itemsAbove.length > 0) {
          loadPlan.warnings.push({
            type: 'fragile_stacking_warning',
            severity: fragility.score === 5 ? 'high' : 'medium',
            message: `Fragile item ${item.id} has ${itemsAbove.length} item(s) stacked above`,
            itemId: item.id,
            fragilityScore: fragility.score
          });
        }
      }

      // Check 2: Stacking compatibility
      if (item.position.y > 10) {
        const itemsBelow = items.filter(other =>
          other.position &&
          other.position.y < item.position.y &&
          this.hasHorizontalOverlap(item, other)
        );

        for (const belowItem of itemsBelow) {
          const compatibility = checkStackingCompatibility(item, belowItem);
          if (!compatibility.canStack) {
            loadPlan.warnings.push({
              type: 'stacking_incompatibility',
              severity: compatibility.riskLevel,
              message: compatibility.reason,
              itemId: item.id,
              belowItemId: belowItem.id
            });
          }

          // Check packaging compatibility
          const packCompat = checkPackagingCompatibility(
            item.packagingType || 'corrugated_box',
            belowItem.packagingType || 'corrugated_box'
          );
          if (!packCompat.compatible) {
            loadPlan.warnings.push({
              type: 'packaging_incompatibility',
              severity: 'medium',
              message: packCompat.reason,
              itemId: item.id,
              belowItemId: belowItem.id
            });
          }
        }
      }
    }
  }

  // NEW: Generate fragility-aware loading instructions
  generateFragilityAwareInstructions(loadPlan) {
    const sortedItems = [...loadPlan.items]
      .filter(item => item.position)
      .sort((a, b) => {
        // Sort by loading order or position
        if (a.loadingOrder !== undefined && b.loadingOrder !== undefined) {
          return a.loadingOrder - b.loadingOrder;
        }
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });

    return sortedItems.map((item, index) => {
      const fragility = item.fragilityAssessment || assessOrderFragility(item);
      const instructions = [];

      // Position instruction
      instructions.push(this.getPositionDescription(item.position));

      // Fragility-specific instructions
      if (fragility.score >= 4) {
        instructions.push('⚠️ FRAGILE - Handle with extreme care');
      }
      if (fragility.score === 5) {
        instructions.push('⛔ DO NOT stack anything on top of this item');
      }

      // Get handling instructions from fragility profile
      const handlingInstructions = getHandlingInstructions(
        fragility.score,
        fragility.profile ? { specialHandling: item.specialHandling } : null
      );
      instructions.push(...handlingInstructions);

      return {
        step: index + 1,
        itemId: item.id,
        seller: item.seller,
        quantity: item.quantity || 1,
        weight: item.weight * (item.quantity || 1),
        fragility: {
          score: fragility.score,
          label: fragility.label,
          color: fragility.color
        },
        instructions,
        loadingPosition: item.loadingPosition || 'MIDDLE',
        zone: this.determineLoadingZone(item)
      };
    });
  }

  // Helper: Get position description
  getPositionDescription(position) {
    if (!position) return 'Position not assigned';
    
    const xPos = position.x < this.vehicle.dimensions.length / 3 ? 'Back' :
                 position.x > (2 * this.vehicle.dimensions.length) / 3 ? 'Front' : 'Middle';
    const yPos = position.y < 500 ? 'Floor level' :
                 position.y < 1200 ? 'Mid-height' : 'Upper level';
    
    return `Place at ${xPos.toLowerCase()}, ${yPos.toLowerCase()}`;
  }

  // Helper: Determine loading zone based on fragility
  determineLoadingZone(item) {
    const fragility = item.fragilityAssessment?.score || 2;
    const weight = item.weight * (item.quantity || 1);

    if (fragility >= 4) return 'PROTECTED';
    if (fragility <= 2 && weight >= 20) return 'HEAVY_BASE';
    if (item.dropSequence === 1) return 'DOOR_ACCESSIBLE';
    return 'STANDARD';
  }

  // Helper: Check horizontal overlap between items
  hasHorizontalOverlap(item1, item2) {
    if (!item1.position || !item2.position) return false;
    
    const dims1 = this.getItemDimensions(item1);
    const dims2 = this.getItemDimensions(item2);
    
    const overlapX = Math.max(0,
      Math.min(item1.position.x + dims1.length, item2.position.x + dims2.length) -
      Math.max(item1.position.x, item2.position.x)
    );
    const overlapZ = Math.max(0,
      Math.min(item1.position.z + dims1.width, item2.position.z + dims2.width) -
      Math.max(item1.position.z, item2.position.z)
    );
    
    return overlapX > 0 && overlapZ > 0;
  }

  // Helper: Get item dimensions
  getItemDimensions(item) {
    if (item.materialType === 'cylindrical') {
      const diameter = item.dimensions?.diameter || 300;
      const height = item.dimensions?.height || 500;
      if (item.orientation === 'horizontal') {
        return { length: height, width: diameter, height: diameter };
      }
      return { length: diameter, width: diameter, height: height };
    }
    return {
      length: item.dimensions?.length || 400,
      width: item.dimensions?.width || 300,
      height: item.dimensions?.height || 200
    };
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

    // Assign loading order numbers after sorting
    loadPlan.items.forEach((item, index) => {
      item.loadingOrder = index + 1;
      item.loadingPosition = index === 0 ? 'FIRST' :
                            index === loadPlan.items.length - 1 ? 'LAST' :
                            'MIDDLE';
    });
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

  // Get delivery order for FILO sequencing
  getDeliveryOrder(item) {
    // Use dropSequence if available (1 = first drop, 2 = second drop, etc.)
    if (item.dropSequence !== undefined && item.dropSequence !== null) {
      return item.dropSequence;
    }

    // Use priority as fallback (high priority delivered first)
    if (item.priority) {
      const priorityMap = { 'high': 1, 'medium': 2, 'low': 3 };
      return priorityMap[item.priority] || 2;
    }

    // Final fallback: use hash of delivery location
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

  // Validate loading sequence - ensures LIFO/FIFO compliance and physical accessibility
  validateLoadingSequence(loadPlan) {
    const items = loadPlan.items.filter(item => item.position);
    const issues = [];
    
    if (items.length === 0) {
      return { valid: true, issues: [] };
    }

    // Sort items by their loading order
    const orderedItems = [...items].sort((a, b) => 
      (a.loadingOrder || 0) - (b.loadingOrder || 0)
    );

    // Check 1: LIFO compliance - items loaded last should be near the door (high X position)
    if (this.constraints.loadingSequence === 'lifo') {
      for (let i = 0; i < orderedItems.length - 1; i++) {
        const currentItem = orderedItems[i];
        const nextItem = orderedItems[i + 1];
        
        // Items loaded later should generally be at higher X (closer to door)
        // Allow some tolerance for items at similar X positions
        if (currentItem.position && nextItem.position) {
          const xDiff = nextItem.position.x - currentItem.position.x;
          
          // If next item is significantly further back (lower X), that's a problem
          if (xDiff < -500) { // 500mm tolerance
            issues.push({
              type: 'lifo_violation',
              severity: 'medium',
              message: `LIFO violation: Item ${nextItem.id} (loaded ${nextItem.loadingOrder}) is positioned behind item ${currentItem.id} (loaded ${currentItem.loadingOrder})`
            });
          }
        }
      }
    }

    // Check 2: Drop sequence compliance - first drop items should be near door
    const itemsWithDropSequence = items.filter(item => item.dropSequence !== undefined);
    if (itemsWithDropSequence.length > 1) {
      const sortedByDrop = [...itemsWithDropSequence].sort((a, b) => 
        (a.dropSequence || 999) - (b.dropSequence || 999)
      );

      for (let i = 0; i < sortedByDrop.length - 1; i++) {
        const firstDrop = sortedByDrop[i];
        const laterDrop = sortedByDrop[i + 1];
        
        if (firstDrop.position && laterDrop.position) {
          // First drop should be at higher X (near door)
          // Later drop should be further back (lower X)
          if (firstDrop.position.x < laterDrop.position.x - 300) {
            issues.push({
              type: 'drop_sequence_violation',
              severity: 'high',
              message: `Drop sequence issue: ${firstDrop.id} (drop ${firstDrop.dropSequence}) is behind ${laterDrop.id} (drop ${laterDrop.dropSequence}) - will be harder to unload first`
            });
          }
        }
      }
    }

    // Check 3: Accessibility - items shouldn't be completely blocked
    for (const item of items) {
      if (!item.position) continue;
      
      const itemDims = this.getItemDimensions(item);
      const blockingItems = items.filter(other => {
        if (!other.position || other.id === item.id) return false;
        
        // Check if other item is between this item and the door (higher X)
        // and overlaps in Y and Z
        const isInFront = other.position.x > item.position.x + itemDims.length;
        const yOverlap = !(other.position.y >= item.position.y + itemDims.height ||
                          other.position.y + this.getItemDimensions(other).height <= item.position.y);
        const zOverlap = !(other.position.z >= item.position.z + itemDims.width ||
                          other.position.z + this.getItemDimensions(other).width <= item.position.z);
        
        return isInFront && yOverlap && zOverlap;
      });

      if (blockingItems.length > 0) {
        // Check if blocked item is supposed to be unloaded before blocking items
        const blockedDropSeq = item.dropSequence || 999;
        const earlierBlockers = blockingItems.filter(b => 
          (b.dropSequence || 999) > blockedDropSeq
        );
        
        if (earlierBlockers.length > 0) {
          issues.push({
            type: 'accessibility_blocked',
            severity: 'high',
            message: `Item ${item.id} is blocked by ${earlierBlockers.map(b => b.id).join(', ')} but needs to be unloaded first`
          });
        }
      }
    }

    // Check 4: Heavy items at bottom for loading sequence
    const heavyItemsAboveLight = items.filter(item => {
      if (!item.position || item.position.y < 100) return false; // On ground
      
      const itemWeight = item.weight * (item.quantity || 1);
      const itemDims = this.getItemDimensions(item);
      
      // Find items directly below
      const itemsBelow = items.filter(other => {
        if (!other.position || other.id === item.id) return false;
        
        const otherDims = this.getItemDimensions(other);
        const isBelow = other.position.y + otherDims.height <= item.position.y + 50; // 50mm tolerance
        const xOverlap = !(other.position.x >= item.position.x + itemDims.length ||
                          other.position.x + otherDims.length <= item.position.x);
        const zOverlap = !(other.position.z >= item.position.z + itemDims.width ||
                          other.position.z + otherDims.width <= item.position.z);
        
        return isBelow && xOverlap && zOverlap;
      });

      // Check if any item below is significantly lighter
      return itemsBelow.some(below => {
        const belowWeight = below.weight * (below.quantity || 1);
        return itemWeight > belowWeight * 1.5; // 50% heavier is concerning
      });
    });

    if (heavyItemsAboveLight.length > 0) {
      issues.push({
        type: 'weight_distribution',
        severity: 'medium',
        message: `${heavyItemsAboveLight.length} heavy item(s) placed above lighter items - may affect stability during transport`
      });
    }

    return {
      valid: issues.filter(i => i.severity === 'high').length === 0,
      issues
    };
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

  // Calculate utilization metrics (capped at 100%)
  calculateUtilization(items) {
    const totals = this.calculateTotals(items);

    const weightUtilization = (totals.weight / this.vehicle.maxWeight) * 100;
    const volumeUtilization = (totals.volume / this.vehicle.volume) * 100;

    // Cap at 100% for display purposes
    const cappedWeight = Math.min(weightUtilization, 100);
    const cappedVolume = Math.min(volumeUtilization, 100);

    return {
      weight: cappedWeight,
      volume: cappedVolume,
      actualWeight: weightUtilization, // Keep actual value for validation
      actualVolume: volumeUtilization, // Keep actual value for validation
      isOverCapacity: weightUtilization > 100 || volumeUtilization > 100,
      isNearCapacity: weightUtilization > 95 || volumeUtilization > 95
    };
  }
}

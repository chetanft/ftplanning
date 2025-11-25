/**
 * Advanced Constraints Engine
 * Handles complex loading and safety constraints including fragility and packaging
 */

import { assessOrderFragility, checkStackingCompatibility, getMaxLoadBearing } from './fragilityScoring.js';
import { checkPackagingCompatibility, getPackagingType } from './packagingTypes.js';

export class ConstraintsEngine {
  constructor(vehicleSpecs, materialRules = {}) {
    this.vehicle = vehicleSpecs;
    this.materialRules = {
      cuboidal: {
        heavyBelowLight: true,
        fullCoverageBase: true,
        preventTipping: true,
        maxOverhang: 0.1, // 10% overhang allowed
        maxStackHeight: 2500, // mm
        stackingWeightRatio: 1.5 // heavier item can support 1.5x its weight
      },
      cylindrical: {
        interlocking: true,
        preventRolling: true,
        useWedges: true,
        avoidHorizontalStacking: true, // for fragile items
        nestingAllowed: true,
        maxNestingDepth: 3
      },
      mixed: {
        separateTypes: false, // allow mixing of types
        bufferZone: 50 // mm buffer between different types
      },
      // Fragility-based rules
      fragility: {
        enableFragilityChecks: true,
        maxFragilityOnTop: 5, // Max fragility score for top items
        protectedZoneMinHeight: 0.6, // Normalized height for protected zone
        loadBearingBuffer: 0.9 // Safety factor for load bearing
      },
      // Packaging compatibility rules
      packaging: {
        enablePackagingChecks: true,
        minCompatibilityScore: 0, // Minimum compatibility score (0 = neutral)
        requireCompatibleStacking: true
      },
      ...materialRules
    };
  }

  // Validate item placement against all constraints
  validatePlacement(item, position, existingItems = []) {
    const violations = [];
    const warnings = [];

    // Basic boundary constraints
    const boundaryCheck = this.checkBoundaryConstraints(item, position);
    if (!boundaryCheck.valid) {
      violations.push(boundaryCheck);
    }

    // Weight constraints
    const weightCheck = this.checkWeightConstraints(item, position, existingItems);
    if (!weightCheck.valid) {
      violations.push(weightCheck);
    }

    // Stacking constraints
    const stackingCheck = this.checkStackingConstraints(item, position, existingItems);
    if (!stackingCheck.valid) {
      violations.push(stackingCheck);
    }

    // Material-specific constraints
    const materialCheck = this.checkMaterialConstraints(item, position, existingItems);
    if (!materialCheck.valid) {
      violations.push(materialCheck);
    }

    // Safety constraints
    const safetyCheck = this.checkSafetyConstraints(item, position, existingItems);
    if (!safetyCheck.valid) {
      violations.push(safetyCheck);
    }

    // NEW: Fragility constraints
    if (this.materialRules.fragility?.enableFragilityChecks) {
      const fragilityCheck = this.checkFragilityConstraints(item, position, existingItems);
      if (!fragilityCheck.valid) {
        if (fragilityCheck.severity === 'warning') {
          warnings.push(fragilityCheck);
        } else {
          violations.push(fragilityCheck);
        }
      }
    }

    // NEW: Packaging compatibility constraints
    if (this.materialRules.packaging?.enablePackagingChecks) {
      const packagingCheck = this.checkPackagingConstraints(item, position, existingItems);
      if (!packagingCheck.valid) {
        if (packagingCheck.severity === 'warning') {
          warnings.push(packagingCheck);
        } else {
          violations.push(packagingCheck);
        }
      }
    }

    // NEW: Load bearing capacity constraints
    const loadBearingCheck = this.checkLoadBearingConstraints(item, position, existingItems);
    if (!loadBearingCheck.valid) {
      violations.push(loadBearingCheck);
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings,
      score: this.calculatePlacementScore(item, position, existingItems),
      fragilityAssessment: this.getItemFragilityAssessment(item)
    };
  }

  // NEW: Check fragility-based constraints
  checkFragilityConstraints(item, position, existingItems) {
    const fragility = assessOrderFragility(item);
    const rules = this.materialRules.fragility;

    // Check 1: Extremely fragile items should not have items stacked on top
    if (fragility.score === 5) {
      const itemsAbove = this.getItemsAbove(item, position, existingItems);
      if (itemsAbove.length > 0) {
        return {
          valid: false,
          type: 'fragility_stacking_violation',
          severity: 'high',
          message: `Extremely fragile item ${item.id} cannot have items stacked on top`,
          fragilityScore: fragility.score
        };
      }
    }

    // Check 2: Fragile items should be placed in protected zone (upper area)
    if (fragility.score >= 4) {
      const normalizedHeight = position.y / this.vehicle.dimensions.height;
      if (normalizedHeight < 0.3 && existingItems.length > 2) {
        return {
          valid: false,
          type: 'fragile_position_warning',
          severity: 'warning',
          message: `Fragile item ${item.id} placed low - consider protected zone placement`,
          fragilityScore: fragility.score
        };
      }
    }

    // Check 3: Fragility stacking compatibility with items below
    if (position.y > 10) {
      const itemsBelow = this.getItemsBelow(position, existingItems);
      for (const belowItem of itemsBelow) {
        const compatibility = checkStackingCompatibility(item, belowItem);
        if (!compatibility.canStack) {
          return {
            valid: false,
            type: 'fragility_compatibility_violation',
            severity: compatibility.riskLevel === 'high' ? 'high' : 'medium',
            message: compatibility.reason,
            fragilityScore: fragility.score,
            itemId: item.id,
            belowItemId: belowItem.id
          };
        }
      }
    }

    // Check 4: Heavy items should not be above fragile items
    const itemsBelow = this.getItemsBelow(position, existingItems);
    for (const belowItem of itemsBelow) {
      const belowFragility = assessOrderFragility(belowItem);
      if (belowFragility.score >= 4) {
        const itemWeight = item.weight * (item.quantity || 1);
        const maxLoad = getMaxLoadBearing(belowFragility.score, belowItem.weight);
        
        if (itemWeight > maxLoad * rules.loadBearingBuffer) {
          return {
            valid: false,
            type: 'fragile_overload_violation',
            severity: 'high',
            message: `Item ${item.id} (${itemWeight}kg) exceeds load bearing capacity of fragile item ${belowItem.id} (max: ${maxLoad.toFixed(1)}kg)`,
            fragilityScore: belowFragility.score
          };
        }
      }
    }

    return { valid: true };
  }

  // NEW: Check packaging compatibility constraints
  checkPackagingConstraints(item, position, existingItems) {
    const itemPackaging = item.packagingType || 'corrugated_box';
    const packaging = getPackagingType(itemPackaging);
    const rules = this.materialRules.packaging;

    // Check 1: Item packaging allows stacking
    if (position.y > 10 && !packaging.stackability.canBeStacked) {
      return {
        valid: false,
        type: 'packaging_stacking_violation',
        severity: 'high',
        message: `${packaging.label} packaging should not be stacked on other items`
      };
    }

    // Check 2: Items below allow stacking on top
    const itemsBelow = this.getItemsBelow(position, existingItems);
    for (const belowItem of itemsBelow) {
      const belowPackaging = belowItem.packagingType || 'corrugated_box';
      const belowPackagingType = getPackagingType(belowPackaging);

      if (!belowPackagingType.stackability.canStackOn) {
        return {
          valid: false,
          type: 'packaging_support_violation',
          severity: 'high',
          message: `Cannot stack on ${belowPackagingType.label} - it should not have items on top`
        };
      }

      // Check compatibility score
      const compatibility = checkPackagingCompatibility(itemPackaging, belowPackaging);
      if (!compatibility.compatible) {
        return {
          valid: false,
          type: 'packaging_compatibility_violation',
          severity: compatibility.score < -1 ? 'high' : 'medium',
          message: compatibility.reason
        };
      }

      if (compatibility.score < rules.minCompatibilityScore) {
        return {
          valid: false,
          type: 'packaging_low_compatibility',
          severity: 'warning',
          message: `Low packaging compatibility: ${compatibility.reason}`
        };
      }
    }

    // Check 3: Weight limits based on packaging
    if (position.y > 10) {
      const itemWeight = item.weight * (item.quantity || 1);
      for (const belowItem of itemsBelow) {
        const belowPackaging = getPackagingType(belowItem.packagingType || 'corrugated_box');
        const maxStackWeight = belowPackaging.stackability.maxStackWeight;

        if (itemWeight > maxStackWeight) {
          return {
            valid: false,
            type: 'packaging_weight_exceeded',
            severity: 'medium',
            message: `Item weight (${itemWeight}kg) exceeds ${belowPackaging.label} max stack weight (${maxStackWeight}kg)`
          };
        }
      }
    }

    return { valid: true };
  }

  // NEW: Check load bearing capacity constraints
  checkLoadBearingConstraints(item, position, existingItems) {
    if (position.y <= 10) {
      return { valid: true }; // On floor, no load bearing issues
    }

    const itemWeight = item.weight * (item.quantity || 1);
    const itemsBelow = this.getItemsBelow(position, existingItems);

    for (const belowItem of itemsBelow) {
      // Get load bearing capacity
      let loadBearingCapacity = belowItem.loadBearingCapacity;
      
      if (loadBearingCapacity === undefined) {
        const fragility = assessOrderFragility(belowItem);
        loadBearingCapacity = getMaxLoadBearing(fragility.score, belowItem.weight);
      }

      // Calculate current load on this item
      const currentLoad = this.calculateLoadOnItem(belowItem, existingItems);
      const remainingCapacity = loadBearingCapacity - currentLoad;

      if (itemWeight > remainingCapacity) {
        return {
          valid: false,
          type: 'load_bearing_exceeded',
          severity: 'high',
          message: `Item ${item.id} (${itemWeight}kg) exceeds remaining capacity of ${belowItem.id} (${remainingCapacity.toFixed(1)}kg available of ${loadBearingCapacity}kg)`
        };
      }
    }

    return { valid: true };
  }

  // Helper: Calculate current load on an item
  calculateLoadOnItem(item, existingItems) {
    if (!item.position) return 0;

    let totalLoad = 0;
    const itemDims = this.getItemDimensions(item);

    existingItems.forEach(other => {
      if (!other.position || other.id === item.id) return;
      
      // Check if other item is directly above
      if (other.position.y > item.position.y) {
        const otherDims = this.getItemDimensions(other);
        
        // Check horizontal overlap
        const overlapX = Math.max(0,
          Math.min(item.position.x + itemDims.length, other.position.x + otherDims.length) -
          Math.max(item.position.x, other.position.x)
        );
        const overlapZ = Math.max(0,
          Math.min(item.position.z + itemDims.width, other.position.z + otherDims.width) -
          Math.max(item.position.z, other.position.z)
        );

        if (overlapX > 0 && overlapZ > 0) {
          // Proportional weight based on overlap
          const overlapRatio = (overlapX * overlapZ) / (otherDims.length * otherDims.width);
          totalLoad += (other.weight * (other.quantity || 1)) * overlapRatio;
        }
      }
    });

    return totalLoad;
  }

  // Helper: Get items above a position
  getItemsAbove(item, position, existingItems) {
    const itemDims = this.getItemDimensions(item);
    
    return existingItems.filter(other => {
      if (!other.position) return false;
      
      // Check if above
      if (other.position.y <= position.y + itemDims.height) return false;
      
      // Check horizontal overlap
      const otherDims = this.getItemDimensions(other);
      const overlapX = Math.max(0,
        Math.min(position.x + itemDims.length, other.position.x + otherDims.length) -
        Math.max(position.x, other.position.x)
      );
      const overlapZ = Math.max(0,
        Math.min(position.z + itemDims.width, other.position.z + otherDims.width) -
        Math.max(position.z, other.position.z)
      );

      return overlapX > 0 && overlapZ > 0;
    });
  }

  // Helper: Get fragility assessment for item
  getItemFragilityAssessment(item) {
    return assessOrderFragility(item);
  }

  // Check if item fits within vehicle boundaries
  checkBoundaryConstraints(item, position) {
    const itemDims = this.getItemDimensions(item);
    
    const exceedsLength = position.x + itemDims.length > this.vehicle.dimensions.length;
    const exceedsWidth = position.z + itemDims.width > this.vehicle.dimensions.width;
    const exceedsHeight = position.y + itemDims.height > this.vehicle.dimensions.height;
    const belowGround = position.y < 0;

    if (exceedsLength || exceedsWidth || exceedsHeight || belowGround) {
      return {
        valid: false,
        type: 'boundary_violation',
        severity: 'high',
        message: `Item exceeds vehicle boundaries: L:${exceedsLength}, W:${exceedsWidth}, H:${exceedsHeight}`
      };
    }

    return { valid: true };
  }

  // Check weight-related constraints
  checkWeightConstraints(item, position, existingItems) {
    const itemWeight = item.weight * item.quantity;
    const totalWeight = existingItems.reduce((sum, existing) => 
      sum + (existing.weight * existing.quantity), 0) + itemWeight;

    // Check total weight limit
    if (totalWeight > this.vehicle.maxWeight) {
      return {
        valid: false,
        type: 'weight_limit_exceeded',
        severity: 'high',
        message: `Total weight ${totalWeight}kg exceeds vehicle limit ${this.vehicle.maxWeight}kg`
      };
    }

    // Check center of gravity
    const cogCheck = this.checkCenterOfGravity(item, position, existingItems);
    if (!cogCheck.valid) {
      return cogCheck;
    }

    return { valid: true };
  }

  // Check stacking constraints
  checkStackingConstraints(item, position, existingItems) {
    if (item.materialType === 'cuboidal') {
      return this.checkCuboidalStacking(item, position, existingItems);
    } else if (item.materialType === 'cylindrical') {
      return this.checkCylindricalStacking(item, position, existingItems);
    }

    return { valid: true };
  }

  // Check cuboidal stacking rules
  checkCuboidalStacking(item, position, existingItems) {
    const rules = this.materialRules.cuboidal;
    const itemWeight = item.weight * item.quantity;

    // Check if item is stackable
    if (!item.stackable && position.y > 0.1) {
      return {
        valid: false,
        type: 'non_stackable_violation',
        severity: 'high',
        message: `Non-stackable item ${item.id} cannot be placed above ground level`
      };
    }

    // Heavy below light rule
    if (rules.heavyBelowLight) {
      const itemsBelow = this.getItemsBelow(position, existingItems);
      for (const belowItem of itemsBelow) {
        const belowWeight = belowItem.weight * belowItem.quantity;
        if (itemWeight > belowWeight * rules.stackingWeightRatio) {
          return {
            valid: false,
            type: 'heavy_above_light',
            severity: 'medium',
            message: `Heavy item (${itemWeight}kg) placed above lighter item (${belowWeight}kg)`
          };
        }
      }
    }

    // Full coverage base rule
    if (rules.fullCoverageBase && position.y > 0.1) {
      const supportArea = this.calculateSupportArea(item, position, existingItems);
      const itemArea = (item.dimensions.length * item.dimensions.width) / 1000000;
      const supportRatio = supportArea / itemArea;

      if (supportRatio < 0.8) { // 80% support required
        return {
          valid: false,
          type: 'insufficient_support',
          severity: 'high',
          message: `Item has only ${(supportRatio * 100).toFixed(1)}% support (minimum 80% required)`
        };
      }
    }

    // Max stack height
    if (position.y + item.dimensions.height > rules.maxStackHeight) {
      return {
        valid: false,
        type: 'stack_height_exceeded',
        severity: 'medium',
        message: `Stack height ${position.y + item.dimensions.height}mm exceeds limit ${rules.maxStackHeight}mm`
      };
    }

    return { valid: true };
  }

  // Check cylindrical stacking rules
  checkCylindricalStacking(item, position, existingItems) {
    const rules = this.materialRules.cylindrical;

    // Prevent rolling for horizontal cylinders
    if (item.orientation === 'horizontal' && rules.preventRolling) {
      if (position.y > 0.1 && !this.hasAdequateSupport(item, position, existingItems)) {
        return {
          valid: false,
          type: 'rolling_risk',
          severity: 'high',
          message: `Horizontal cylinder at height without adequate support poses rolling risk`
        };
      }
    }

    // Fragile horizontal stacking
    if (item.fragile && item.orientation === 'horizontal' && rules.avoidHorizontalStacking) {
      return {
        valid: false,
        type: 'fragile_horizontal',
        severity: 'high',
        message: `Fragile cylindrical item should not be placed horizontally`
      };
    }

    // Nesting depth limit
    if (item.nesting && rules.nestingAllowed) {
      const nestingDepth = this.calculateNestingDepth(item, position, existingItems);
      if (nestingDepth > rules.maxNestingDepth) {
        return {
          valid: false,
          type: 'nesting_depth_exceeded',
          severity: 'medium',
          message: `Nesting depth ${nestingDepth} exceeds limit ${rules.maxNestingDepth}`
        };
      }
    }

    return { valid: true };
  }

  // Check material-specific constraints
  checkMaterialConstraints(item, position, existingItems) {
    const rules = this.materialRules.mixed;

    // Check buffer zone between different material types
    if (!rules.separateTypes && rules.bufferZone > 0) {
      const nearbyItems = this.getNearbyItems(position, rules.bufferZone, existingItems);
      const differentTypeItems = nearbyItems.filter(nearby => 
        nearby.materialType !== item.materialType
      );

      if (differentTypeItems.length > 0) {
        return {
          valid: false,
          type: 'buffer_zone_violation',
          severity: 'low',
          message: `Item too close to different material type (buffer: ${rules.bufferZone}mm required)`
        };
      }
    }

    return { valid: true };
  }

  // Check safety constraints
  checkSafetyConstraints(item, position, existingItems) {
    // Check for hazardous material separation
    if (item.hazardous) {
      const hazardousItems = existingItems.filter(existing => existing.hazardous);
      if (hazardousItems.length > 0) {
        const minDistance = 1000; // 1m minimum separation
        const tooClose = hazardousItems.some(hazItem => 
          this.calculateDistance(position, hazItem.position) < minDistance
        );

        if (tooClose) {
          return {
            valid: false,
            type: 'hazardous_separation',
            severity: 'critical',
            message: `Hazardous materials must be separated by at least ${minDistance}mm`
          };
        }
      }
    }

    // Check temperature compatibility
    if (item.temperatureControlled) {
      const incompatibleItems = existingItems.filter(existing => 
        existing.temperatureControlled && 
        Math.abs(existing.requiredTemperature - item.requiredTemperature) > 5
      );

      if (incompatibleItems.length > 0) {
        return {
          valid: false,
          type: 'temperature_incompatibility',
          severity: 'high',
          message: `Temperature-controlled items with different requirements cannot be mixed`
        };
      }
    }

    return { valid: true };
  }

  // Check center of gravity constraints
  checkCenterOfGravity(newItem, position, existingItems) {
    const allItems = [...existingItems, { ...newItem, position }];
    const cog = this.calculateCenterOfGravity(allItems);
    
    const vehicleCenter = {
      x: this.vehicle.dimensions.length / 2,
      z: this.vehicle.dimensions.width / 2
    };

    const maxOffsetX = this.vehicle.dimensions.length * 0.1; // 10% tolerance
    const maxOffsetZ = this.vehicle.dimensions.width * 0.1;

    const offsetX = Math.abs(cog.x - vehicleCenter.x);
    const offsetZ = Math.abs(cog.z - vehicleCenter.z);

    if (offsetX > maxOffsetX || offsetZ > maxOffsetZ) {
      return {
        valid: false,
        type: 'center_of_gravity_violation',
        severity: 'high',
        message: `Center of gravity offset exceeds safe limits`
      };
    }

    return { valid: true };
  }

  // Calculate placement score (higher is better)
  calculatePlacementScore(item, position, existingItems) {
    let score = 100;

    // Prefer lower positions (more stable)
    score -= position.y / 100;

    // Prefer positions closer to vehicle center
    const centerDistance = this.calculateDistanceFromCenter(position);
    score -= centerDistance / 10;

    // Bonus for good support
    if (item.materialType === 'cuboidal') {
      const supportArea = this.calculateSupportArea(item, position, existingItems);
      const itemArea = (item.dimensions.length * item.dimensions.width) / 1000000;
      const supportRatio = supportArea / itemArea;
      score += supportRatio * 20;
    }

    // Penalty for constraint violations
    const validation = this.validatePlacement(item, position, existingItems);
    score -= validation.violations.length * 10;

    return Math.max(0, score);
  }

  // Helper methods
  getItemDimensions(item) {
    if (item.materialType === 'cuboidal') {
      return {
        length: item.dimensions.length,
        width: item.dimensions.width,
        height: item.dimensions.height
      };
    } else if (item.materialType === 'cylindrical') {
      if (item.orientation === 'horizontal') {
        return {
          length: item.dimensions.height,
          width: item.dimensions.diameter,
          height: item.dimensions.diameter
        };
      } else {
        return {
          length: item.dimensions.diameter,
          width: item.dimensions.diameter,
          height: item.dimensions.height
        };
      }
    }
    return { length: 0, width: 0, height: 0 };
  }

  getItemsBelow(position, existingItems) {
    return existingItems.filter(item => 
      item.position && 
      item.position.y < position.y &&
      this.checkHorizontalOverlap(position, item.position, item)
    );
  }

  checkHorizontalOverlap(pos1, pos2, item2) {
    const dims2 = this.getItemDimensions(item2);
    return !(pos1.x > pos2.x + dims2.length ||
             pos1.x + 100 < pos2.x || // Assuming 100mm item width for simplicity
             pos1.z > pos2.z + dims2.width ||
             pos1.z + 100 < pos2.z);
  }

  calculateSupportArea(item, position, existingItems) {
    // Simplified calculation - return full area if supported
    const itemsBelow = this.getItemsBelow(position, existingItems);
    if (itemsBelow.length > 0) {
      return (item.dimensions.length * item.dimensions.width) / 1000000;
    }
    return 0;
  }

  hasAdequateSupport(item, position, existingItems) {
    const itemsBelow = this.getItemsBelow(position, existingItems);
    return itemsBelow.length >= 2; // Require at least 2 support points
  }

  calculateNestingDepth(item, position, existingItems) {
    // Count how many levels deep this nesting goes
    let depth = 0;
    let currentPos = position;
    
    while (true) {
      const containerItem = existingItems.find(existing => 
        existing.materialType === 'cylindrical' &&
        existing.nesting &&
        this.isPositionInside(currentPos, existing.position, existing.dimensions)
      );
      
      if (!containerItem) break;
      depth++;
      currentPos = containerItem.position;
    }
    
    return depth;
  }

  getNearbyItems(position, radius, existingItems) {
    return existingItems.filter(item => 
      item.position && this.calculateDistance(position, item.position) <= radius
    );
  }

  calculateDistance(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) +
      Math.pow(pos1.y - pos2.y, 2) +
      Math.pow(pos1.z - pos2.z, 2)
    );
  }

  calculateDistanceFromCenter(position) {
    const center = {
      x: this.vehicle.dimensions.length / 2,
      z: this.vehicle.dimensions.width / 2
    };
    
    return Math.sqrt(
      Math.pow(position.x - center.x, 2) +
      Math.pow(position.z - center.z, 2)
    );
  }

  calculateCenterOfGravity(items) {
    let totalWeight = 0;
    let weightedX = 0, weightedZ = 0;

    items.forEach(item => {
      if (item.position) {
        const itemWeight = item.weight * item.quantity;
        totalWeight += itemWeight;
        weightedX += item.position.x * itemWeight;
        weightedZ += item.position.z * itemWeight;
      }
    });

    return totalWeight > 0 ? {
      x: weightedX / totalWeight,
      z: weightedZ / totalWeight
    } : { x: 0, z: 0 };
  }

  isPositionInside(position, containerPos, containerDims) {
    const radius = containerDims.diameter / 2000;
    const distance = Math.sqrt(
      Math.pow(position.x - containerPos.x, 2) +
      Math.pow(position.z - containerPos.z, 2)
    );
    return distance < radius && position.y >= containerPos.y;
  }
}

/**
 * Smart Loading Engine
 * AI-powered loading algorithm considering fragility, packaging, and optimal placement
 */

import { assessOrderFragility, checkStackingCompatibility, getMaxLoadBearing, calculateLoadRiskScore } from './fragilityScoring.js';
import { checkPackagingCompatibility, getPackagingType } from './packagingTypes.js';
import { ConstraintsEngine } from './constraintsEngine.js';

// Loading zones in the vehicle
export const LOADING_ZONES = {
  PROTECTED: {
    id: 'protected',
    label: 'Protected Zone',
    description: 'Top/center area for fragile items',
    position: { yMin: 0.6, yMax: 1.0, xMin: 0.3, xMax: 0.7 }, // Normalized positions
    priority: 1,
    criteria: {
      minFragility: 4,
      maxWeight: 30,
      preferPackaging: ['foam_padded', 'bubble_wrapped', 'thermal_insulated', 'glass_carton']
    }
  },
  STANDARD: {
    id: 'standard',
    label: 'Standard Zone',
    description: 'Middle area for standard items',
    position: { yMin: 0.3, yMax: 0.7, xMin: 0.1, xMax: 0.9 },
    priority: 2,
    criteria: {
      minFragility: 2,
      maxFragility: 4,
      preferPackaging: ['corrugated_box', 'plastic_container', 'plastic_crate']
    }
  },
  HEAVY_BASE: {
    id: 'heavy_base',
    label: 'Heavy Base Zone',
    description: 'Bottom area for heavy, robust items',
    position: { yMin: 0.0, yMax: 0.4, xMin: 0.0, xMax: 1.0 },
    priority: 3,
    criteria: {
      maxFragility: 2,
      minWeight: 15,
      preferPackaging: ['wooden_crate', 'wooden_pallet', 'metal_drum', 'metal_container']
    }
  },
  DOOR_ACCESSIBLE: {
    id: 'door_accessible',
    label: 'Door Accessible Zone',
    description: 'Near door for first delivery items',
    position: { yMin: 0.0, yMax: 0.5, xMin: 0.7, xMax: 1.0 },
    priority: 4,
    criteria: {
      forFirstDelivery: true
    }
  }
};

/**
 * Smart Loading Engine class
 */
export class SmartLoadingEngine {
  constructor(vehicleSpecs, options = {}) {
    this.vehicle = vehicleSpecs;
    this.options = {
      enableFragilityOptimization: true,
      enablePackagingCompatibility: true,
      enableDeliverySequencing: true,
      safetyMargin: 50, // mm buffer between items
      maxRiskScore: 50, // Max acceptable risk score
      ...options
    };
    this.placedItems = [];
    this.zones = { ...LOADING_ZONES };
  }

  /**
   * Main optimization function - generates optimal load plan
   * @param {Array} orders - Array of orders to load
   * @returns {Object} - Optimized load plan
   */
  generateOptimalLoadPlan(orders) {
    // Reset state
    this.placedItems = [];

    // Step 1: Analyze and score all items
    const analyzedItems = this.analyzeItems(orders);

    // Step 2: Sort items for optimal loading
    const sortedItems = this.sortItemsForLoading(analyzedItems);

    // Step 3: Assign zones to items
    const zonedItems = this.assignZones(sortedItems);

    // Step 4: Generate placement positions
    const placedItems = this.generatePlacements(zonedItems);

    // Step 5: Optimize stacking sequence
    const optimizedItems = this.optimizeStackingSequence(placedItems);

    // Step 6: Calculate metrics and validate
    const loadPlan = this.finalizeLoadPlan(optimizedItems);

    return loadPlan;
  }

  /**
   * Evaluate a manually created or edited plan
   * @param {Array} itemsWithPositions - Array of items with positions
   * @returns {Object} - Evaluated plan with metrics and warnings
   */
  evaluateManualPlan(itemsWithPositions) {
    // Step 1: Analyze all items to ensure we have fragility/packaging data
    const analyzedItems = this.analyzeItems(itemsWithPositions);

    // Step 2: Validate positions and check for collisions/support
    const constraintsEngine = new ConstraintsEngine(this.vehicle, this.options);

    const validatedItems = analyzedItems.map(item => {
      if (!item.position) {
        return { ...item, isValid: false, placementWarning: 'Item has no position' };
      }

      // Use ConstraintsEngine for comprehensive validation
      const otherItems = analyzedItems.filter(i => i.id !== item.id && i.position);
      const validationResult = constraintsEngine.validatePlacement(item, item.position, otherItems);

      return {
        ...item,
        isValid: validationResult.valid,
        placementWarning: validationResult.valid ? null :
          (validationResult.violations[0]?.message || validationResult.warnings[0]?.message || 'Invalid placement'),
        validationDetails: validationResult,
        // Calculate stacking level based on Y position
        stackingLevel: Math.floor(item.position.y / 500)
      };
    });

    // Step 3: Assign zones (retroactively)
    const zonedItems = this.assignZones(validatedItems);

    // Step 4: Finalize plan (calculate metrics, etc.)
    return this.finalizeLoadPlan(zonedItems);
  }

  /**
   * Check collision with any occupied space
   */
  checkCollisionWithAny(item, position, itemDims, occupiedSpaces, margin) {
    for (const occupied of occupiedSpaces) {
      if (this.checkCollision(position, itemDims, occupied.bounds, margin)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Analyze items and add fragility/packaging assessments
   */
  analyzeItems(orders) {
    return orders.map(order => {
      const fragilityAssessment = assessOrderFragility(order);
      const packaging = getPackagingType(order.packagingType || 'corrugated_box');
      const totalWeight = order.weight * (order.quantity || 1);

      return {
        ...order,
        analysis: {
          fragility: fragilityAssessment,
          packaging: packaging,
          totalWeight: totalWeight,
          volumePerUnit: this.calculateItemVolume(order),
          loadBearingCapacity: order.loadBearingCapacity || getMaxLoadBearing(fragilityAssessment.score, order.weight),
          requiresProtectedZone: fragilityAssessment.score >= 4,
          canBeBase: fragilityAssessment.score <= 2 && totalWeight >= 15,
          handlingInstructions: fragilityAssessment.specialHandling || []
        }
      };
    });
  }

  /**
   * Sort items for optimal loading order
   * Priority: Heavy/robust items first (base), then standard, finally fragile (top)
   */
  sortItemsForLoading(items) {
    return [...items].sort((a, b) => {
      // First priority: Delivery sequence (LIFO - later deliveries loaded first)
      if (this.options.enableDeliverySequencing) {
        const seqA = a.dropSequence || 999;
        const seqB = b.dropSequence || 999;
        if (seqA !== seqB) {
          return seqB - seqA; // Higher sequence (later delivery) loaded first
        }
      }

      // Second priority: Fragility (lower fragility loaded first - forms base)
      const fragA = a.analysis.fragility.score;
      const fragB = b.analysis.fragility.score;
      if (fragA !== fragB) {
        return fragA - fragB;
      }

      // Third priority: Weight (heavier items first - forms stable base)
      return b.analysis.totalWeight - a.analysis.totalWeight;
    });
  }

  /**
   * Assign appropriate zones to each item based on characteristics
   */
  assignZones(items) {
    return items.map(item => {
      let assignedZone = 'STANDARD';
      let zoneReason = '';

      const fragility = item.analysis.fragility.score;
      const weight = item.analysis.totalWeight;

      // Check for protected zone eligibility
      if (fragility >= 4) {
        assignedZone = 'PROTECTED';
        zoneReason = `High fragility (${fragility}/5) requires protected placement`;
      }
      // Check for heavy base zone eligibility
      else if (fragility <= 2 && weight >= 15) {
        assignedZone = 'HEAVY_BASE';
        zoneReason = `Heavy (${weight}kg) and robust - suitable for base`;
      }
      // Check for door accessible zone (first delivery)
      else if (item.dropSequence === 1) {
        assignedZone = 'DOOR_ACCESSIBLE';
        zoneReason = 'First delivery point - needs door access';
      }
      // Default to standard zone
      else {
        assignedZone = 'STANDARD';
        zoneReason = 'Standard handling requirements';
      }

      return {
        ...item,
        zone: {
          id: assignedZone,
          ...this.zones[assignedZone],
          reason: zoneReason
        }
      };
    });
  }

  /**
   * Generate 3D placement positions for all items
   */
  generatePlacements(items) {
    const vehicleDims = this.vehicle.dimensions;
    const placedItems = [];
    const occupiedSpaces = [];

    // Group items by zone for systematic placement
    const itemsByZone = {
      HEAVY_BASE: items.filter(i => i.zone.id === 'HEAVY_BASE'),
      STANDARD: items.filter(i => i.zone.id === 'STANDARD'),
      PROTECTED: items.filter(i => i.zone.id === 'PROTECTED'),
      DOOR_ACCESSIBLE: items.filter(i => i.zone.id === 'DOOR_ACCESSIBLE')
    };

    // Place items zone by zone
    Object.entries(itemsByZone).forEach(([zoneId, zoneItems]) => {
      const zone = this.zones[zoneId];

      zoneItems.forEach((item, index) => {
        const position = this.findOptimalPosition(item, zone, occupiedSpaces, vehicleDims);

        if (position) {
          const placedItem = {
            ...item,
            position: position,
            loadingOrder: placedItems.length + 1,
            stackingLevel: position.level || 0
          };

          placedItems.push(placedItem);
          occupiedSpaces.push({
            item: placedItem,
            bounds: this.calculateBounds(placedItem, position)
          });
        } else {
          // Could not place item - add warning
          placedItems.push({
            ...item,
            position: null,
            loadingOrder: placedItems.length + 1,
            placementWarning: 'Could not find suitable position within zone constraints'
          });
        }
      });
    });

    return placedItems;
  }

  /**
   * Find optimal position for an item within its zone
   */
  findOptimalPosition(item, zone, occupiedSpaces, vehicleDims) {
    const itemDims = this.getItemDimensions(item);
    const margin = this.options.safetyMargin;

    // Calculate zone boundaries in actual dimensions
    const zoneBounds = {
      xMin: zone.position.xMin * vehicleDims.length,
      xMax: zone.position.xMax * vehicleDims.length,
      yMin: zone.position.yMin * vehicleDims.height,
      yMax: zone.position.yMax * vehicleDims.height,
      zMin: 0,
      zMax: vehicleDims.width
    };

    // Try to find a position using first-fit decreasing approach
    let bestPosition = null;
    let bestScore = -1;

    // Grid-based search within zone
    const stepX = Math.min(itemDims.length, 200);
    const stepY = Math.min(itemDims.height, 200);
    const stepZ = Math.min(itemDims.width, 200);

    for (let y = zoneBounds.yMin; y + itemDims.height <= zoneBounds.yMax; y += stepY) {
      for (let x = zoneBounds.xMin; x + itemDims.length <= zoneBounds.xMax; x += stepX) {
        for (let z = zoneBounds.zMin; z + itemDims.width <= zoneBounds.zMax; z += stepZ) {
          const testPosition = { x, y, z };

          // Check if position is valid
          if (this.isPositionValid(item, testPosition, itemDims, occupiedSpaces, margin)) {
            // Score the position
            const score = this.scorePosition(item, testPosition, occupiedSpaces, vehicleDims);

            if (score > bestScore) {
              bestScore = score;
              bestPosition = { ...testPosition, level: Math.floor(y / itemDims.height) };
            }
          }
        }
      }
    }

    return bestPosition;
  }

  /**
   * Check if a position is valid (no collisions, proper support)
   */
  isPositionValid(item, position, itemDims, occupiedSpaces, margin) {
    // Check vehicle boundaries
    if (position.x < 0 || position.y < 0 || position.z < 0) return false;
    if (position.x + itemDims.length > this.vehicle.dimensions.length) return false;
    if (position.y + itemDims.height > this.vehicle.dimensions.height) return false;
    if (position.z + itemDims.width > this.vehicle.dimensions.width) return false;

    // Check collisions with existing items
    for (const occupied of occupiedSpaces) {
      if (this.checkCollision(position, itemDims, occupied.bounds, margin)) {
        return false;
      }
    }

    // Check support for items not on ground
    if (position.y > 10) { // Not on ground
      const hasSupport = this.checkSupport(item, position, itemDims, occupiedSpaces);
      if (!hasSupport) return false;
    }

    return true;
  }

  /**
   * Check for collision between two items
   */
  checkCollision(pos1, dims1, bounds2, margin = 0) {
    return !(
      pos1.x + dims1.length + margin <= bounds2.xMin ||
      pos1.x >= bounds2.xMax + margin ||
      pos1.y + dims1.height + margin <= bounds2.yMin ||
      pos1.y >= bounds2.yMax + margin ||
      pos1.z + dims1.width + margin <= bounds2.zMin ||
      pos1.z >= bounds2.zMax + margin
    );
  }

  /**
   * Check if item has proper support below
   */
  checkSupport(item, position, itemDims, occupiedSpaces) {
    const supportArea = itemDims.length * itemDims.width;
    let supportedArea = 0;

    // Find items directly below
    for (const occupied of occupiedSpaces) {
      if (occupied.bounds.yMax <= position.y && occupied.bounds.yMax >= position.y - 50) {
        // Check horizontal overlap
        const overlapX = Math.max(0,
          Math.min(position.x + itemDims.length, occupied.bounds.xMax) -
          Math.max(position.x, occupied.bounds.xMin)
        );
        const overlapZ = Math.max(0,
          Math.min(position.z + itemDims.width, occupied.bounds.zMax) -
          Math.max(position.z, occupied.bounds.zMin)
        );

        supportedArea += overlapX * overlapZ;

        // Check stacking compatibility
        if (this.options.enableFragilityOptimization) {
          const compatibility = checkStackingCompatibility(item, occupied.item);
          if (!compatibility.canStack) {
            return false;
          }
        }

        // Check packaging compatibility
        if (this.options.enablePackagingCompatibility) {
          const packagingCompat = checkPackagingCompatibility(
            item.packagingType || 'corrugated_box',
            occupied.item.packagingType || 'corrugated_box'
          );
          if (!packagingCompat.compatible) {
            return false;
          }
        }
      }
    }

    // Require at least 80% support
    return supportedArea >= supportArea * 0.8;
  }

  /**
   * Score a potential position (higher is better)
   */
  scorePosition(item, position, occupiedSpaces, vehicleDims) {
    let score = 100;

    // Prefer lower positions for stability
    score -= (position.y / vehicleDims.height) * 20;

    // Prefer positions closer to center (better balance)
    const centerX = vehicleDims.length / 2;
    const centerZ = vehicleDims.width / 2;
    const distFromCenter = Math.sqrt(
      Math.pow(position.x - centerX, 2) +
      Math.pow(position.z - centerZ, 2)
    );
    score -= (distFromCenter / vehicleDims.length) * 10;

    // Bonus for fragile items being higher
    if (item.analysis.fragility.score >= 4) {
      score += (position.y / vehicleDims.height) * 30;
    }

    // Bonus for good support
    const supportingItems = occupiedSpaces.filter(o =>
      o.bounds.yMax <= position.y && o.bounds.yMax >= position.y - 50
    );
    score += supportingItems.length * 5;

    return score;
  }

  /**
   * Optimize the stacking sequence for safety and efficiency
   */
  optimizeStackingSequence(placedItems) {
    // Sort by loading order (position in truck)
    const sorted = [...placedItems].sort((a, b) => {
      if (!a.position || !b.position) return 0;
      // Load from back to front, bottom to top
      if (Math.abs(a.position.y - b.position.y) > 100) {
        return a.position.y - b.position.y; // Lower items first
      }
      return a.position.x - b.position.x; // Back items first
    });

    // Assign final loading sequence
    return sorted.map((item, index) => ({
      ...item,
      loadingOrder: index + 1,
      loadingPosition: this.getLoadingPositionLabel(index, sorted.length)
    }));
  }

  /**
   * Get loading position label
   */
  getLoadingPositionLabel(index, total) {
    if (index === 0) return 'FIRST';
    if (index === total - 1) return 'LAST';
    if (index < total / 3) return 'EARLY';
    if (index > (2 * total) / 3) return 'LATE';
    return 'MIDDLE';
  }

  /**
   * Finalize load plan with metrics and validations
   */
  finalizeLoadPlan(items) {
    const validItems = items.filter(i => i.position);
    const invalidItems = items.filter(i => !i.position);

    // Calculate totals
    const totalWeight = items.reduce((sum, i) => sum + i.analysis.totalWeight, 0);
    const totalVolume = items.reduce((sum, i) => sum + i.analysis.volumePerUnit * (i.quantity || 1), 0);

    // Calculate center of gravity
    const cog = this.calculateCenterOfGravity(validItems);

    // Calculate risk score
    const riskAssessment = calculateLoadRiskScore(validItems);

    // Generate warnings
    const warnings = this.generateWarnings(validItems, invalidItems, cog, riskAssessment);

    // Generate loading instructions
    const loadingInstructions = this.generateLoadingInstructions(validItems);

    return {
      items: items,
      validPlacements: validItems.length,
      invalidPlacements: invalidItems.length,
      metrics: {
        totalWeight,
        totalVolume,
        weightUtilization: (totalWeight / this.vehicle.maxWeight) * 100,
        volumeUtilization: (totalVolume / this.vehicle.volume) * 100,
        centerOfGravity: cog,
        riskScore: riskAssessment.score,
        riskLevel: riskAssessment.level
      },
      zones: this.getZoneSummary(validItems),
      warnings,
      loadingInstructions,
      stackingLayers: this.getStackingLayers(validItems)
    };
  }

  /**
   * Calculate center of gravity
   */
  calculateCenterOfGravity(items) {
    let totalWeight = 0;
    let weightedX = 0, weightedY = 0, weightedZ = 0;

    items.forEach(item => {
      if (!item.position) return;
      const weight = item.analysis.totalWeight;
      const dims = this.getItemDimensions(item);

      totalWeight += weight;
      weightedX += (item.position.x + dims.length / 2) * weight;
      weightedY += (item.position.y + dims.height / 2) * weight;
      weightedZ += (item.position.z + dims.width / 2) * weight;
    });

    if (totalWeight === 0) return { x: 0, y: 0, z: 0 };

    return {
      x: weightedX / totalWeight,
      y: weightedY / totalWeight,
      z: weightedZ / totalWeight
    };
  }

  /**
   * Generate warnings for the load plan
   */
  generateWarnings(validItems, invalidItems, cog, riskAssessment) {
    const warnings = [];

    // Check for unplaced items
    if (invalidItems.length > 0) {
      warnings.push({
        type: 'placement_failure',
        severity: 'high',
        message: `${invalidItems.length} items could not be placed within constraints`,
        items: invalidItems.map(i => i.id)
      });
    }

    // Check center of gravity
    const vehicleCenter = {
      x: this.vehicle.dimensions.length / 2,
      z: this.vehicle.dimensions.width / 2
    };
    const cogOffset = Math.sqrt(
      Math.pow(cog.x - vehicleCenter.x, 2) +
      Math.pow(cog.z - vehicleCenter.z, 2)
    );
    const maxOffset = this.vehicle.dimensions.length * 0.15;

    if (cogOffset > maxOffset) {
      warnings.push({
        type: 'cog_imbalance',
        severity: 'medium',
        message: `Center of gravity offset (${cogOffset.toFixed(0)}mm) exceeds recommended limit`
      });
    }

    // Check risk score
    if (riskAssessment.score > this.options.maxRiskScore) {
      warnings.push({
        type: 'high_risk',
        severity: 'high',
        message: `Load risk score (${riskAssessment.score}) is above acceptable threshold`,
        issues: riskAssessment.issues
      });
    }

    // Add fragility-specific warnings
    riskAssessment.issues.forEach(issue => {
      if (!warnings.find(w => w.message === issue.message)) {
        warnings.push({
          type: issue.type,
          severity: issue.type.includes('violation') ? 'high' : 'medium',
          message: issue.message,
          itemId: issue.itemId
        });
      }
    });

    return warnings;
  }

  /**
   * Generate step-by-step loading instructions
   */
  generateLoadingInstructions(items) {
    const sortedItems = [...items].sort((a, b) => a.loadingOrder - b.loadingOrder);

    return sortedItems.map((item, index) => ({
      step: index + 1,
      itemId: item.id,
      action: `Load ${item.quantity || 1}x ${item.seller || item.id}`,
      zone: item.zone.label,
      position: item.position ? {
        description: this.getPositionDescription(item.position),
        coordinates: item.position
      } : null,
      fragilityWarning: item.analysis.fragility.score >= 4
        ? `⚠️ FRAGILE (${item.analysis.fragility.label}) - Handle with care`
        : null,
      specialHandling: item.analysis.handlingInstructions,
      stackingInfo: item.stackingLevel > 0
        ? `Stack on level ${item.stackingLevel}`
        : 'Place on floor'
    }));
  }

  /**
   * Get human-readable position description
   */
  getPositionDescription(position) {
    const xPos = position.x < this.vehicle.dimensions.length / 3 ? 'back' :
      position.x > (2 * this.vehicle.dimensions.length) / 3 ? 'front' : 'middle';
    const zPos = position.z < this.vehicle.dimensions.width / 2 ? 'left' : 'right';
    const yPos = position.y < 500 ? 'floor level' :
      position.y < 1000 ? 'mid-height' : 'upper level';

    return `${xPos.charAt(0).toUpperCase() + xPos.slice(1)}-${zPos}, ${yPos}`;
  }

  /**
   * Get zone summary
   */
  getZoneSummary(items) {
    const summary = {};

    Object.keys(LOADING_ZONES).forEach(zoneId => {
      const zoneItems = items.filter(i => i.zone?.id === zoneId);
      summary[zoneId] = {
        ...LOADING_ZONES[zoneId],
        itemCount: zoneItems.length,
        totalWeight: zoneItems.reduce((sum, i) => sum + i.analysis.totalWeight, 0),
        avgFragility: zoneItems.length > 0
          ? zoneItems.reduce((sum, i) => sum + i.analysis.fragility.score, 0) / zoneItems.length
          : 0
      };
    });

    return summary;
  }

  /**
   * Get stacking layers visualization data
   */
  getStackingLayers(items) {
    const layers = {};

    items.forEach(item => {
      if (!item.position) return;
      const level = Math.floor(item.position.y / 500); // 500mm per layer

      if (!layers[level]) {
        layers[level] = {
          level,
          height: level * 500,
          items: [],
          totalWeight: 0,
          avgFragility: 0
        };
      }

      layers[level].items.push({
        id: item.id,
        fragility: item.analysis.fragility.score,
        weight: item.analysis.totalWeight,
        position: item.position
      });
      layers[level].totalWeight += item.analysis.totalWeight;
    });

    // Calculate average fragility per layer
    Object.values(layers).forEach(layer => {
      if (layer.items.length > 0) {
        layer.avgFragility = layer.items.reduce((sum, i) => sum + i.fragility, 0) / layer.items.length;
      }
    });

    return Object.values(layers).sort((a, b) => a.level - b.level);
  }

  // Helper methods

  calculateItemVolume(item) {
    if (item.materialType === 'cylindrical') {
      const radius = (item.dimensions.diameter || 0) / 2000;
      const height = (item.dimensions.height || 0) / 1000;
      return Math.PI * radius * radius * height;
    }
    return ((item.dimensions.length || 0) * (item.dimensions.width || 0) * (item.dimensions.height || 0)) / 1000000000;
  }

  getItemDimensions(item) {
    if (item.materialType === 'cylindrical') {
      const diameter = item.dimensions.diameter || 300;
      const height = item.dimensions.height || 500;
      if (item.orientation === 'horizontal') {
        return { length: height, width: diameter, height: diameter };
      }
      return { length: diameter, width: diameter, height: height };
    }
    return {
      length: item.dimensions.length || 400,
      width: item.dimensions.width || 300,
      height: item.dimensions.height || 200
    };
  }

  calculateBounds(item, position) {
    const dims = this.getItemDimensions(item);
    return {
      xMin: position.x,
      xMax: position.x + dims.length,
      yMin: position.y,
      yMax: position.y + dims.height,
      zMin: position.z,
      zMax: position.z + dims.width
    };
  }
}

/**
 * Quick function to generate optimal load plan
 */
export const generateSmartLoadPlan = (orders, vehicleSpecs, options = {}) => {
  const engine = new SmartLoadingEngine(vehicleSpecs, options);
  return engine.generateOptimalLoadPlan(orders);
};

/**
 * Evaluate a manual plan
 */
export const evaluateManualPlan = (itemsWithPositions, vehicleSpecs, options = {}) => {
  const engine = new SmartLoadingEngine(vehicleSpecs, options);
  return engine.evaluateManualPlan(itemsWithPositions);
};

export default SmartLoadingEngine;




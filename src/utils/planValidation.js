/**
 * Plan Validation Utility
 * Performs comprehensive validation checks on orders before plan generation
 * Includes fragility, packaging, and AI-powered risk detection
 */

import { calculateOrderTotals, groupOrdersByRoute } from './vehicleOptimization.js';
import { vehicleTypes, routes } from '../data/mockData.js';
import { assessOrderFragility, checkStackingCompatibility, FRAGILITY_DESCRIPTIONS } from './fragilityScoring.js';
import { getPackagingType, checkPackagingCompatibility, PACKAGING_TYPES } from './packagingTypes.js';

/**
 * Validation check types with their weights for progress calculation
 */
const VALIDATION_STAGES = [
  { id: 'data_completeness', label: 'Data Completeness Check', weight: 15 },
  { id: 'fragility_packaging', label: 'Fragility & Packaging Validation', weight: 20 },
  { id: 'duplication', label: 'Duplication Checks (DO/SO)', weight: 15 },
  { id: 'capacity', label: 'Capacity & Constraints', weight: 20 },
  { id: 'route_feasibility', label: 'Route Feasibility', weight: 15 },
  { id: 'ai_risk_analysis', label: 'AI Risk Analysis', weight: 15 }
];

/**
 * Main validation function - runs all checks asynchronously
 * @param {Array} orders - Array of orders to validate
 * @param {Object} options - Validation options
 * @param {Function} onProgress - Callback for progress updates (0-100)
 * @returns {Promise<Object>} - Validation result with status, errors, and warnings
 */
export const validateOrders = async (orders, options = {}, onProgress = () => {}) => {
  const result = {
    status: 'success', // 'success', 'error', 'warning'
    errors: [],
    warnings: [],
    stageResults: {},
    summary: {},
    aiHints: []
  };

  if (!orders || orders.length === 0) {
    result.status = 'error';
    result.errors.push('No orders provided for validation');
    onProgress(100);
    return result;
  }

  let currentProgress = 0;

  // Run each validation stage
  for (const stage of VALIDATION_STAGES) {
    const stageResult = await runValidationStage(stage.id, orders, options);
    result.stageResults[stage.id] = stageResult;

    // Collect errors, warnings, and AI hints
    if (stageResult.errors.length > 0) {
      result.errors.push(...stageResult.errors);
    }
    if (stageResult.warnings.length > 0) {
      result.warnings.push(...stageResult.warnings);
    }
    if (stageResult.aiHints && stageResult.aiHints.length > 0) {
      result.aiHints.push(...stageResult.aiHints);
    }

    // Update progress
    currentProgress += stage.weight;
    onProgress(currentProgress);

    // Small delay to allow UI updates and simulate async processing
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Determine final status
  if (result.errors.length > 0) {
    result.status = 'error';
  } else if (result.warnings.length > 0) {
    result.status = 'warning';
  }

  // Generate summary
  result.summary = generateValidationSummary(orders, result);

  return result;
};

/**
 * Run a specific validation stage
 */
const runValidationStage = async (stageId, orders, options) => {
  switch (stageId) {
    case 'data_completeness':
      return validateDataCompleteness(orders);
    case 'fragility_packaging':
      return validateFragilityAndPackaging(orders, options);
    case 'duplication':
      return validateDuplication(orders);
    case 'capacity':
      return validateCapacity(orders, options);
    case 'route_feasibility':
      return validateRouteFeasibility(orders);
    case 'ai_risk_analysis':
      return performAIRiskAnalysis(orders, options);
    default:
      return { passed: true, errors: [], warnings: [], aiHints: [] };
  }
};

/**
 * Stage 1: Data Completeness Validation
 * Checks if all required fields are present and valid
 */
const validateDataCompleteness = (orders) => {
  const result = { passed: true, errors: [], warnings: [], aiHints: [] };
  const requiredFields = ['id', 'route', 'quantity', 'weight', 'dimensions', 'materialType'];
  const recommendedFields = ['pickup', 'delivery', 'seller', 'priority'];

  orders.forEach((order, index) => {
    // Check required fields
    requiredFields.forEach(field => {
      if (!order[field]) {
        result.errors.push(`Order ${order.id || `#${index + 1}`}: Missing required field "${field}"`);
        result.passed = false;
      }
    });

    // Check dimension validity
    if (order.dimensions) {
      if (order.materialType === 'cuboidal') {
        if (!order.dimensions.length || !order.dimensions.width || !order.dimensions.height) {
          result.errors.push(`Order ${order.id}: Incomplete cuboidal dimensions`);
          result.passed = false;
        }
        if (order.dimensions.length <= 0 || order.dimensions.width <= 0 || order.dimensions.height <= 0) {
          result.errors.push(`Order ${order.id}: Invalid dimensions (must be positive)`);
          result.passed = false;
        }
      } else if (order.materialType === 'cylindrical') {
        if (!order.dimensions.diameter || !order.dimensions.height) {
          result.errors.push(`Order ${order.id}: Incomplete cylindrical dimensions`);
          result.passed = false;
        }
      }
    }

    // Check numeric values
    if (order.quantity <= 0) {
      result.errors.push(`Order ${order.id}: Invalid quantity (must be positive)`);
      result.passed = false;
    }
    if (order.weight <= 0) {
      result.errors.push(`Order ${order.id}: Invalid weight (must be positive)`);
      result.passed = false;
    }

    // Check recommended fields (warnings only)
    recommendedFields.forEach(field => {
      if (!order[field]) {
        result.warnings.push(`Order ${order.id}: Missing recommended field "${field}"`);
      }
    });
  });

  return result;
};

/**
 * Stage 2: Fragility & Packaging Validation
 * NEW: Comprehensive fragility and packaging checks
 */
const validateFragilityAndPackaging = (orders, options = {}) => {
  const result = { passed: true, errors: [], warnings: [], aiHints: [] };

  // Track orders missing fragility scores
  const missingFragility = [];
  const missingPackaging = [];
  const fragilityPackagingMismatch = [];
  const highFragilityOrders = [];

  orders.forEach((order) => {
    // Check for missing fragility scores
    if (order.fragilityScore === undefined || order.fragilityScore === null) {
      missingFragility.push(order.id);
    }

    // Check for missing packaging type
    if (!order.packagingType) {
      missingPackaging.push(order.id);
    }

    // Assess fragility
    const fragility = assessOrderFragility(order);
    
    // Check fragility/packaging mismatch
    if (order.packagingType) {
      const packaging = getPackagingType(order.packagingType);
      
      // High fragility items need protective packaging
      if (fragility.score >= 4 && packaging) {
        const protectionScore = (packaging.protection.crush + packaging.protection.shock) / 2;
        if (protectionScore < 3) {
          fragilityPackagingMismatch.push({
            orderId: order.id,
            fragility: fragility.score,
            packaging: packaging.label,
            issue: `Fragile item (${fragility.score}/5) has insufficient packaging protection (${protectionScore.toFixed(1)}/5)`
          });
        }
      }

      // Check if packaging can be stacked on for non-stackable items
      if (order.stackable === false && packaging.stackability.canStackOn) {
        result.warnings.push(
          `Order ${order.id}: Marked as non-stackable but packaging (${packaging.label}) allows stacking`
        );
      }
    }

    // Track high fragility orders for AI hints
    if (fragility.score >= 4) {
      highFragilityOrders.push({
        id: order.id,
        score: fragility.score,
        label: fragility.label
      });
    }
  });

  // Report missing fragility scores
  if (missingFragility.length > 0) {
    if (missingFragility.length > 5) {
      result.warnings.push(
        `${missingFragility.length} orders missing fragility scores: ${missingFragility.slice(0, 3).join(', ')} and ${missingFragility.length - 3} more. Default scores will be applied.`
      );
    } else {
      result.warnings.push(
        `Orders missing fragility scores: ${missingFragility.join(', ')}. Default scores will be applied.`
      );
    }
    result.aiHints.push({
      type: 'missing_fragility',
      severity: 'info',
      message: 'Some orders lack fragility scores. AI will estimate based on material type.',
      affectedOrders: missingFragility
    });
  }

  // Report missing packaging
  if (missingPackaging.length > 0) {
    if (missingPackaging.length > 5) {
      result.warnings.push(
        `${missingPackaging.length} orders missing packaging type: ${missingPackaging.slice(0, 3).join(', ')} and ${missingPackaging.length - 3} more.`
      );
    } else {
      result.warnings.push(
        `Orders missing packaging type: ${missingPackaging.join(', ')}. Default packaging will be assumed.`
      );
    }
  }

  // Report fragility/packaging mismatches (these are errors, not warnings)
  if (fragilityPackagingMismatch.length > 0) {
    fragilityPackagingMismatch.forEach(mismatch => {
      result.errors.push(
        `Order ${mismatch.orderId}: ${mismatch.issue}`
      );
    });
    result.passed = false;

    result.aiHints.push({
      type: 'packaging_mismatch',
      severity: 'high',
      message: 'Fragile items detected with inadequate packaging. Upgrade packaging or mark for protected zone.',
      affectedOrders: fragilityPackagingMismatch.map(m => m.orderId)
    });
  }

  // AI hints for high fragility items
  if (highFragilityOrders.length > 0) {
    result.aiHints.push({
      type: 'high_fragility',
      severity: 'warning',
      message: `${highFragilityOrders.length} highly fragile item(s) detected. These will be assigned protected zones.`,
      affectedOrders: highFragilityOrders.map(o => o.id),
      details: highFragilityOrders
    });
  }

  // Check for temperature control requirements
  const tempControlled = orders.filter(o => o.temperatureControlled);
  if (tempControlled.length > 0) {
    const withoutThermalPackaging = tempControlled.filter(o => 
      o.packagingType && o.packagingType !== 'thermal_insulated'
    );
    if (withoutThermalPackaging.length > 0) {
      result.warnings.push(
        `${withoutThermalPackaging.length} temperature-controlled item(s) without thermal packaging. Vehicle climate control required.`
      );
      result.aiHints.push({
        type: 'temperature_requirement',
        severity: 'warning',
        message: 'Temperature-controlled items require refrigerated/climate-controlled vehicle.',
        affectedOrders: withoutThermalPackaging.map(o => o.id)
      });
    }
  }

  return result;
};

/**
 * Stage 3: Duplication Validation
 * Checks for duplicate order IDs and delivery order IDs
 */
const validateDuplication = (orders) => {
  const result = { passed: true, errors: [], warnings: [], aiHints: [] };
  
  // Check for duplicate order IDs
  const orderIds = orders.map(o => o.id);
  const duplicateIds = orderIds.filter((id, index) => orderIds.indexOf(id) !== index);
  
  if (duplicateIds.length > 0) {
    const uniqueDuplicates = [...new Set(duplicateIds)];
    uniqueDuplicates.forEach(id => {
      result.errors.push(`Duplicate order ID found: ${id}`);
    });
    result.passed = false;
  }

  // Check for duplicate DO IDs
  const doIds = orders.map(o => o.doId).filter(Boolean);
  const duplicateDoIds = doIds.filter((id, index) => doIds.indexOf(id) !== index);
  
  if (duplicateDoIds.length > 0) {
    const uniqueDuplicates = [...new Set(duplicateDoIds)];
    uniqueDuplicates.forEach(id => {
      result.warnings.push(`Duplicate delivery order ID found: ${id} (may be intentional for split orders)`);
    });
  }

  // Check for duplicate SO IDs (if present)
  const soIds = orders.map(o => o.soId).filter(Boolean);
  const duplicateSoIds = soIds.filter((id, index) => soIds.indexOf(id) !== index);
  
  if (duplicateSoIds.length > 0) {
    const uniqueDuplicates = [...new Set(duplicateSoIds)];
    uniqueDuplicates.forEach(id => {
      result.warnings.push(`Duplicate sales order ID found: ${id}`);
    });
  }

  return result;
};

/**
 * Stage 4: Capacity Validation
 * Checks if orders can fit within available vehicle capacity
 */
const validateCapacity = (orders, options = {}) => {
  const result = { passed: true, errors: [], warnings: [], aiHints: [] };
  const { totalWeight, totalVolume } = calculateOrderTotals(orders);

  // Find the largest available vehicle
  const largestVehicle = vehicleTypes.reduce((max, v) => 
    v.maxWeight > max.maxWeight ? v : max, vehicleTypes[0]);

  // Check if any single order exceeds max vehicle capacity
  orders.forEach(order => {
    const orderWeight = order.weight * order.quantity;
    const orderVolume = calculateOrderVolume(order);

    if (orderWeight > largestVehicle.maxWeight) {
      result.errors.push(
        `Order ${order.id}: Total weight (${orderWeight}kg) exceeds maximum vehicle capacity (${largestVehicle.maxWeight}kg)`
      );
      result.passed = false;
    }

    if (orderVolume > largestVehicle.volume) {
      result.errors.push(
        `Order ${order.id}: Total volume (${orderVolume.toFixed(2)}m³) exceeds maximum vehicle capacity (${largestVehicle.volume}m³)`
      );
      result.passed = false;
    }

    // Check individual item dimensions against vehicle dimensions
    if (order.materialType === 'cuboidal') {
      const itemLength = order.dimensions.length;
      const itemWidth = order.dimensions.width;
      const itemHeight = order.dimensions.height;

      if (itemLength > largestVehicle.dimensions.length ||
          itemWidth > largestVehicle.dimensions.width ||
          itemHeight > largestVehicle.dimensions.height) {
        result.errors.push(
          `Order ${order.id}: Item dimensions exceed vehicle interior size`
        );
        result.passed = false;
      }
    }

    // Check crush pressure for fragile items
    if (order.packagingType) {
      const packaging = getPackagingType(order.packagingType);
      const fragility = assessOrderFragility(order);
      
      if (fragility.score >= 4 && packaging) {
        // Calculate approximate pressure if items are stacked
        const surfaceArea = order.materialType === 'cuboidal' 
          ? (order.dimensions.length * order.dimensions.width) / 1000000 // m²
          : (Math.PI * Math.pow(order.dimensions.diameter / 2000, 2)); // m²
        
        const maxPressure = orderWeight / surfaceArea; // kg/m²
        const crushLimit = options.maxCrushPressure || 500;
        
        if (maxPressure > crushLimit) {
          result.warnings.push(
            `Order ${order.id}: High crush pressure risk (${maxPressure.toFixed(0)} kg/m²). Avoid stacking heavy items on top.`
          );
          result.aiHints.push({
            type: 'crush_pressure',
            severity: 'warning',
            message: `Order ${order.id} has high crush pressure risk. Recommend protected zone placement.`,
            affectedOrders: [order.id]
          });
        }
      }
    }
  });

  // Calculate total capacity needed
  const minVehiclesNeeded = Math.ceil(Math.max(
    totalWeight / largestVehicle.maxWeight,
    totalVolume / largestVehicle.volume
  ));

  if (minVehiclesNeeded > 10) {
    result.warnings.push(
      `Large shipment: Requires minimum ${minVehiclesNeeded} vehicles. Consider splitting into multiple plans.`
    );
  }

  // Check weight distribution
  const avgWeightPerOrder = totalWeight / orders.length;
  const heavyOrders = orders.filter(o => (o.weight * o.quantity) > avgWeightPerOrder * 3);
  if (heavyOrders.length > 0) {
    result.warnings.push(
      `${heavyOrders.length} order(s) are significantly heavier than average - may affect load balancing`
    );
  }

  return result;
};

/**
 * Stage 5: Route Feasibility Validation
 * Checks if routes are valid and can be served
 */
const validateRouteFeasibility = (orders) => {
  const result = { passed: true, errors: [], warnings: [], aiHints: [] };
  const ordersByRoute = groupOrdersByRoute(orders);
  const availableRoutes = routes.map(r => r.id);

  Object.keys(ordersByRoute).forEach(routeId => {
    // Check if route exists in our system
    if (!availableRoutes.includes(routeId)) {
      result.warnings.push(
        `Route "${routeId}" is not in the predefined routes. Distance will be estimated.`
      );
    }

    // Check pickup/delivery locations consistency
    const routeOrders = ordersByRoute[routeId];
    const pickupLocations = [...new Set(routeOrders.map(o => o.pickup).filter(Boolean))];
    const deliveryLocations = [...new Set(routeOrders.map(o => o.delivery).filter(Boolean))];

    if (pickupLocations.length > 1) {
      result.warnings.push(
        `Route ${routeId}: Multiple pickup locations (${pickupLocations.join(', ')}). Consider consolidation.`
      );
    }

    // Check for conflicting drop sequences
    const dropSequences = routeOrders.map(o => o.dropSequence).filter(Boolean);
    const duplicateSequences = dropSequences.filter((s, i) => dropSequences.indexOf(s) !== i);
    if (duplicateSequences.length > 0) {
      result.warnings.push(
        `Route ${routeId}: Duplicate drop sequence numbers found. Loading order may be ambiguous.`
      );
    }
  });

  // Check for very long multi-route combinations
  const routeCount = Object.keys(ordersByRoute).length;
  if (routeCount > 4) {
    result.warnings.push(
      `${routeCount} different routes detected. Complex routing may increase costs significantly.`
    );
  }

  return result;
};

/**
 * Stage 6: AI Risk Analysis
 * NEW: Advanced AI-powered risk detection and hints
 */
const performAIRiskAnalysis = (orders, options = {}) => {
  const result = { passed: true, errors: [], warnings: [], aiHints: [] };

  // Analyze fragile + heavy mix
  const fragileOrders = [];
  const heavyOrders = [];
  const totalWeight = orders.reduce((sum, o) => sum + (o.weight * o.quantity), 0);
  const avgWeight = totalWeight / orders.length;

  orders.forEach(order => {
    const fragility = assessOrderFragility(order);
    const orderWeight = order.weight * order.quantity;
    
    if (fragility.score >= 4) {
      fragileOrders.push({ ...order, fragility });
    }
    if (orderWeight > avgWeight * 2) {
      heavyOrders.push({ ...order, orderWeight });
    }
  });

  // High-risk stacking detection
  if (fragileOrders.length > 0 && heavyOrders.length > 0) {
    result.aiHints.push({
      type: 'high_risk_stacking',
      severity: 'high',
      message: `High-risk stacking detected: ${fragileOrders.length} fragile item(s) and ${heavyOrders.length} heavy item(s) in same plan. AI will ensure proper separation.`,
      affectedOrders: [...fragileOrders.map(o => o.id), ...heavyOrders.map(o => o.id)]
    });
    result.warnings.push(
      `AI Alert: High-risk mix detected - ${fragileOrders.length} fragile + ${heavyOrders.length} heavy items require careful load planning`
    );
  }

  // Protected zone requirements
  const needsProtectedZone = orders.filter(o => {
    const fragility = assessOrderFragility(o);
    return fragility.score >= 4 || o.temperatureControlled || o.hazardous;
  });

  if (needsProtectedZone.length > 0) {
    result.aiHints.push({
      type: 'needs_protected_zone',
      severity: 'warning',
      message: `${needsProtectedZone.length} item(s) require protected zone placement (fragile, temperature-controlled, or hazardous)`,
      affectedOrders: needsProtectedZone.map(o => o.id)
    });
  }

  // Packaging compatibility analysis
  const packagingTypes = [...new Set(orders.map(o => o.packagingType).filter(Boolean))];
  const incompatiblePairs = [];

  for (let i = 0; i < packagingTypes.length; i++) {
    for (let j = i + 1; j < packagingTypes.length; j++) {
      const compatibility = checkPackagingCompatibility(packagingTypes[i], packagingTypes[j]);
      if (!compatibility.compatible) {
        incompatiblePairs.push({
          type1: packagingTypes[i],
          type2: packagingTypes[j],
          reason: compatibility.reason
        });
      }
    }
  }

  if (incompatiblePairs.length > 0) {
    result.aiHints.push({
      type: 'packaging_incompatibility',
      severity: 'warning',
      message: `${incompatiblePairs.length} packaging incompatibility detected. AI will avoid stacking incompatible types.`,
      details: incompatiblePairs
    });
    result.warnings.push(
      `AI Alert: Packaging incompatibilities found - ${incompatiblePairs.map(p => `${p.type1}/${p.type2}`).join(', ')}`
    );
  }

  // Load stability analysis
  const cylindricalItems = orders.filter(o => o.materialType === 'cylindrical');
  if (cylindricalItems.length > orders.length * 0.3) {
    result.aiHints.push({
      type: 'stability_concern',
      severity: 'info',
      message: `High proportion of cylindrical items (${cylindricalItems.length}/${orders.length}). AI will use interlocking patterns for stability.`,
      affectedOrders: cylindricalItems.map(o => o.id)
    });
  }

  // Weight distribution concern
  const heavyItemCount = orders.filter(o => o.weight * o.quantity > 500).length;
  const lightItemCount = orders.filter(o => o.weight * o.quantity < 50).length;
  
  if (heavyItemCount > 0 && lightItemCount > 0) {
    const ratio = heavyItemCount / lightItemCount;
    if (ratio > 0.5 || ratio < 0.1) {
      result.aiHints.push({
        type: 'weight_imbalance',
        severity: 'info',
        message: `Uneven weight distribution detected. AI will optimize for center of gravity and axle loading.`
      });
    }
  }

  // Warehouse constraint detection
  const warehouseGroups = {};
  orders.forEach(o => {
    const warehouse = o.warehouse || o.pickup || 'default';
    if (!warehouseGroups[warehouse]) warehouseGroups[warehouse] = [];
    warehouseGroups[warehouse].push(o);
  });

  if (Object.keys(warehouseGroups).length > 2) {
    result.warnings.push(
      `Multi-warehouse order: ${Object.keys(warehouseGroups).length} pickup locations may require vehicle routing optimization`
    );
    result.aiHints.push({
      type: 'warehouse_constraint',
      severity: 'info',
      message: `Orders from ${Object.keys(warehouseGroups).length} warehouses. Consider consolidation strategy.`
    });
  }

  return result;
};

/**
 * Helper: Calculate order volume
 */
const calculateOrderVolume = (order) => {
  if (order.materialType === 'cuboidal') {
    return (order.dimensions.length * order.dimensions.width * order.dimensions.height * order.quantity) / 1000000000;
  } else if (order.materialType === 'cylindrical') {
    const radius = order.dimensions.diameter / 2000;
    const height = order.dimensions.height / 1000;
    return Math.PI * radius * radius * height * order.quantity;
  }
  return 0;
};

/**
 * Generate validation summary
 */
const generateValidationSummary = (orders, result) => {
  const { totalWeight, totalVolume } = calculateOrderTotals(orders);
  const ordersByRoute = groupOrdersByRoute(orders);

  // Calculate fragility distribution
  const fragilityDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  orders.forEach(order => {
    const fragility = assessOrderFragility(order);
    fragilityDistribution[fragility.score] = (fragilityDistribution[fragility.score] || 0) + 1;
  });

  return {
    totalOrders: orders.length,
    totalWeight: totalWeight,
    totalVolume: totalVolume.toFixed(2),
    uniqueRoutes: Object.keys(ordersByRoute).length,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    aiHintCount: result.aiHints.length,
    passedStages: Object.values(result.stageResults).filter(s => s.passed).length,
    totalStages: VALIDATION_STAGES.length,
    fragilityDistribution,
    hasHighFragility: fragilityDistribution[4] + fragilityDistribution[5] > 0,
    temperatureControlled: orders.filter(o => o.temperatureControlled).length,
    hazardous: orders.filter(o => o.hazardous).length
  };
};

/**
 * Validate Excel template format
 * NEW: Check for wrong Excel template
 */
export const validateExcelTemplate = (headers, expectedHeaders) => {
  const result = { valid: true, errors: [], warnings: [] };
  
  const normalizedHeaders = headers.map(h => h?.toLowerCase().trim());
  const normalizedExpected = expectedHeaders.map(h => h.toLowerCase().trim());
  
  // Check for required headers
  const missingHeaders = normalizedExpected.filter(h => !normalizedHeaders.includes(h));
  
  if (missingHeaders.length > 0) {
    result.valid = false;
    result.errors.push(`Wrong Excel template: Missing required columns - ${missingHeaders.join(', ')}`);
  }

  // Check for unexpected headers (might indicate wrong template)
  const unexpectedHeaders = normalizedHeaders.filter(h => h && !normalizedExpected.includes(h));
  if (unexpectedHeaders.length > 3) {
    result.warnings.push(`Template may be incorrect: ${unexpectedHeaders.length} unexpected columns found`);
  }

  return result;
};

/**
 * Get validation stages for UI display
 */
export const getValidationStages = () => VALIDATION_STAGES;

/**
 * Get AI hint severity color
 */
export const getAIHintSeverityColor = (severity) => {
  const colors = {
    high: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
    warning: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
    info: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' }
  };
  return colors[severity] || colors.info;
};

export default {
  validateOrders,
  getValidationStages,
  validateExcelTemplate,
  getAIHintSeverityColor
};

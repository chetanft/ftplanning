/**
 * Fragility Scoring System
 * Comprehensive system for assessing SKU fragility and handling requirements
 */

// Fragility levels (1-5 scale)
export const FRAGILITY_LEVELS = {
  ROBUST: 1,        // Can withstand rough handling, heavy stacking
  DURABLE: 2,       // Normal handling, moderate stacking
  MODERATE: 3,      // Standard care required
  FRAGILE: 4,       // Careful handling, limited stacking
  EXTREMELY_FRAGILE: 5  // Special handling, no stacking on top
};

// Fragility level descriptions
// Colors match Tailwind's color palette: green-500, lime-500, yellow-500, orange-500, red-500
export const FRAGILITY_DESCRIPTIONS = {
  1: { label: 'Robust', description: 'Heavy-duty items that can withstand rough handling', color: '#22c55e', bgColor: '#dcfce7' }, // green-500, green-50
  2: { label: 'Durable', description: 'Standard items with good structural integrity', color: '#84cc16', bgColor: '#ecfccb' }, // lime-500, lime-50
  3: { label: 'Moderate', description: 'Items requiring standard care during handling', color: '#eab308', bgColor: '#fef9c3' }, // yellow-500, yellow-50
  4: { label: 'Fragile', description: 'Delicate items requiring careful handling', color: '#f97316', bgColor: '#ffedd5' }, // orange-500, orange-50
  5: { label: 'Extremely Fragile', description: 'Very delicate items requiring special handling', color: '#ef4444', bgColor: '#fee2e2' } // red-500, red-50
};

// Fragility factors that contribute to overall score
export const FRAGILITY_FACTORS = {
  CRUSH_RESISTANCE: {
    id: 'crushResistance',
    label: 'Crush Resistance',
    description: 'Ability to withstand vertical pressure',
    weight: 0.35
  },
  SHOCK_SENSITIVITY: {
    id: 'shockSensitivity',
    label: 'Shock Sensitivity',
    description: 'Sensitivity to drops and impacts',
    weight: 0.30
  },
  VIBRATION_SENSITIVITY: {
    id: 'vibrationSensitivity',
    label: 'Vibration Sensitivity',
    description: 'Sensitivity to continuous vibration during transport',
    weight: 0.15
  },
  TEMPERATURE_SENSITIVITY: {
    id: 'temperatureSensitivity',
    label: 'Temperature Sensitivity',
    description: 'Sensitivity to temperature changes',
    weight: 0.10
  },
  MOISTURE_SENSITIVITY: {
    id: 'moistureSensitivity',
    label: 'Moisture Sensitivity',
    description: 'Sensitivity to humidity and moisture',
    weight: 0.10
  }
};

// Material-specific fragility profiles
export const MATERIAL_PROFILES = {
  // Electronics & Technology
  ELECTRONICS_CONSUMER: {
    id: 'electronics_consumer',
    label: 'Consumer Electronics',
    examples: ['Smartphones', 'Tablets', 'Laptops', 'Cameras'],
    baseFragility: 4,
    factors: {
      crushResistance: 4,
      shockSensitivity: 5,
      vibrationSensitivity: 3,
      temperatureSensitivity: 3,
      moistureSensitivity: 4
    },
    specialHandling: ['anti-static', 'shock-absorbing']
  },
  ELECTRONICS_HEAVY: {
    id: 'electronics_heavy',
    label: 'Heavy Electronics',
    examples: ['Refrigerators', 'Washing Machines', 'AC Units'],
    baseFragility: 3,
    factors: {
      crushResistance: 2,
      shockSensitivity: 4,
      vibrationSensitivity: 3,
      temperatureSensitivity: 2,
      moistureSensitivity: 3
    },
    specialHandling: ['upright-only', 'no-tilt']
  },

  // Glass & Ceramics
  GLASS_CONTAINERS: {
    id: 'glass_containers',
    label: 'Glass Containers',
    examples: ['Bottles', 'Jars', 'Glass Bowls'],
    baseFragility: 5,
    factors: {
      crushResistance: 5,
      shockSensitivity: 5,
      vibrationSensitivity: 3,
      temperatureSensitivity: 4,
      moistureSensitivity: 1
    },
    specialHandling: ['fragile-label', 'vertical-only']
  },
  CERAMICS: {
    id: 'ceramics',
    label: 'Ceramics & Pottery',
    examples: ['Tiles', 'Pottery', 'Ceramic Items'],
    baseFragility: 5,
    factors: {
      crushResistance: 5,
      shockSensitivity: 5,
      vibrationSensitivity: 4,
      temperatureSensitivity: 3,
      moistureSensitivity: 2
    },
    specialHandling: ['fragile-label', 'cushioning-required']
  },

  // Liquids
  LIQUID_STANDARD: {
    id: 'liquid_standard',
    label: 'Standard Liquids',
    examples: ['Water', 'Oils', 'Beverages'],
    baseFragility: 3,
    factors: {
      crushResistance: 3,
      shockSensitivity: 2,
      vibrationSensitivity: 2,
      temperatureSensitivity: 2,
      moistureSensitivity: 1
    },
    specialHandling: ['leak-proof', 'upright-preferred']
  },
  LIQUID_HAZARDOUS: {
    id: 'liquid_hazardous',
    label: 'Hazardous Liquids',
    examples: ['Chemicals', 'Solvents', 'Acids'],
    baseFragility: 4,
    factors: {
      crushResistance: 4,
      shockSensitivity: 4,
      vibrationSensitivity: 3,
      temperatureSensitivity: 4,
      moistureSensitivity: 2
    },
    specialHandling: ['hazmat', 'leak-proof', 'segregated']
  },

  // Food & Perishables
  FOOD_DRY: {
    id: 'food_dry',
    label: 'Dry Food Products',
    examples: ['Rice', 'Flour', 'Biscuits', 'Snacks'],
    baseFragility: 2,
    factors: {
      crushResistance: 3,
      shockSensitivity: 2,
      vibrationSensitivity: 1,
      temperatureSensitivity: 2,
      moistureSensitivity: 4
    },
    specialHandling: ['moisture-protected']
  },
  FOOD_PERISHABLE: {
    id: 'food_perishable',
    label: 'Perishable Foods',
    examples: ['Dairy', 'Meat', 'Vegetables'],
    baseFragility: 4,
    factors: {
      crushResistance: 4,
      shockSensitivity: 3,
      vibrationSensitivity: 2,
      temperatureSensitivity: 5,
      moistureSensitivity: 4
    },
    specialHandling: ['refrigerated', 'time-sensitive']
  },

  // Pharmaceuticals
  PHARMA_STANDARD: {
    id: 'pharma_standard',
    label: 'Standard Pharmaceuticals',
    examples: ['Pills', 'Tablets', 'Capsules'],
    baseFragility: 3,
    factors: {
      crushResistance: 3,
      shockSensitivity: 2,
      vibrationSensitivity: 2,
      temperatureSensitivity: 4,
      moistureSensitivity: 4
    },
    specialHandling: ['temperature-controlled', 'sealed']
  },
  PHARMA_SENSITIVE: {
    id: 'pharma_sensitive',
    label: 'Sensitive Pharmaceuticals',
    examples: ['Vaccines', 'Biologics', 'Injectable'],
    baseFragility: 5,
    factors: {
      crushResistance: 4,
      shockSensitivity: 4,
      vibrationSensitivity: 4,
      temperatureSensitivity: 5,
      moistureSensitivity: 5
    },
    specialHandling: ['cold-chain', 'monitoring-required', 'time-sensitive']
  },

  // Industrial & Heavy
  METAL_PARTS: {
    id: 'metal_parts',
    label: 'Metal Parts & Components',
    examples: ['Steel Rods', 'Pipes', 'Machinery Parts'],
    baseFragility: 1,
    factors: {
      crushResistance: 1,
      shockSensitivity: 1,
      vibrationSensitivity: 1,
      temperatureSensitivity: 1,
      moistureSensitivity: 2
    },
    specialHandling: ['rust-protection']
  },
  MACHINERY: {
    id: 'machinery',
    label: 'Industrial Machinery',
    examples: ['Generators', 'Pumps', 'Motors'],
    baseFragility: 2,
    factors: {
      crushResistance: 2,
      shockSensitivity: 3,
      vibrationSensitivity: 2,
      temperatureSensitivity: 2,
      moistureSensitivity: 3
    },
    specialHandling: ['heavy-equipment', 'secured-loading']
  },

  // Textiles & Soft Goods
  TEXTILES: {
    id: 'textiles',
    label: 'Textiles & Fabrics',
    examples: ['Clothing', 'Fabrics', 'Linens'],
    baseFragility: 1,
    factors: {
      crushResistance: 1,
      shockSensitivity: 1,
      vibrationSensitivity: 1,
      temperatureSensitivity: 2,
      moistureSensitivity: 3
    },
    specialHandling: ['moisture-protected', 'clean-environment']
  },

  // Paper & Print
  PAPER_PRODUCTS: {
    id: 'paper_products',
    label: 'Paper Products',
    examples: ['Books', 'Documents', 'Packaging'],
    baseFragility: 2,
    factors: {
      crushResistance: 3,
      shockSensitivity: 1,
      vibrationSensitivity: 1,
      temperatureSensitivity: 2,
      moistureSensitivity: 5
    },
    specialHandling: ['moisture-protected', 'flat-storage']
  },

  // Furniture
  FURNITURE_WOOD: {
    id: 'furniture_wood',
    label: 'Wooden Furniture',
    examples: ['Tables', 'Chairs', 'Cabinets'],
    baseFragility: 3,
    factors: {
      crushResistance: 3,
      shockSensitivity: 3,
      vibrationSensitivity: 2,
      temperatureSensitivity: 2,
      moistureSensitivity: 4
    },
    specialHandling: ['scratch-protection', 'padded']
  },

  // Cosmetics & Personal Care
  COSMETICS: {
    id: 'cosmetics',
    label: 'Cosmetics & Personal Care',
    examples: ['Perfumes', 'Skincare', 'Makeup'],
    baseFragility: 4,
    factors: {
      crushResistance: 4,
      shockSensitivity: 4,
      vibrationSensitivity: 2,
      temperatureSensitivity: 4,
      moistureSensitivity: 3
    },
    specialHandling: ['upright-only', 'temperature-controlled']
  },

  // Gas Cylinders
  GAS_CYLINDERS: {
    id: 'gas_cylinders',
    label: 'Gas Cylinders',
    examples: ['LPG', 'Oxygen', 'Industrial Gas'],
    baseFragility: 3,
    factors: {
      crushResistance: 2,
      shockSensitivity: 4,
      vibrationSensitivity: 2,
      temperatureSensitivity: 4,
      moistureSensitivity: 1
    },
    specialHandling: ['upright-secured', 'ventilated', 'no-heat']
  },

  // Default
  GENERAL: {
    id: 'general',
    label: 'General Goods',
    examples: ['Mixed Items', 'General Cargo'],
    baseFragility: 2,
    factors: {
      crushResistance: 2,
      shockSensitivity: 2,
      vibrationSensitivity: 2,
      temperatureSensitivity: 2,
      moistureSensitivity: 2
    },
    specialHandling: []
  }
};

/**
 * Calculate overall fragility score from individual factors
 * @param {Object} factors - Object with factor values (1-5)
 * @returns {number} - Weighted fragility score (1-5)
 */
export const calculateFragilityScore = (factors) => {
  const weights = {
    crushResistance: FRAGILITY_FACTORS.CRUSH_RESISTANCE.weight,
    shockSensitivity: FRAGILITY_FACTORS.SHOCK_SENSITIVITY.weight,
    vibrationSensitivity: FRAGILITY_FACTORS.VIBRATION_SENSITIVITY.weight,
    temperatureSensitivity: FRAGILITY_FACTORS.TEMPERATURE_SENSITIVITY.weight,
    moistureSensitivity: FRAGILITY_FACTORS.MOISTURE_SENSITIVITY.weight
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.keys(weights).forEach(factor => {
    if (factors[factor] !== undefined && factors[factor] !== null) {
      totalScore += factors[factor] * weights[factor];
      totalWeight += weights[factor];
    }
  });

  // Ensure proper rounding: totalScore is weighted sum, divide by totalWeight to get average
  // Then round to nearest integer, clamping between 1 and 5
  if (totalWeight > 0) {
    const rawScore = totalScore / totalWeight;
    return Math.max(1, Math.min(5, Math.round(rawScore)));
  }
  return 2; // Default to durable
};

/**
 * Get fragility profile based on material type or product category
 * @param {string} materialProfileId - ID of the material profile
 * @returns {Object} - Material profile with fragility factors
 */
export const getMaterialProfile = (materialProfileId) => {
  return MATERIAL_PROFILES[materialProfileId] || MATERIAL_PROFILES.GENERAL;
};

/**
 * Assess fragility from order properties
 * @param {Object} order - Order object with properties
 * @returns {Object} - Fragility assessment
 */
export const assessOrderFragility = (order) => {
  // If order already has fragility score, use it
  if (order.fragilityScore && order.fragilityScore >= 1 && order.fragilityScore <= 5) {
    return {
      score: order.fragilityScore,
      factors: order.fragilityFactors || null,
      profile: order.materialProfile || 'GENERAL',
      ...FRAGILITY_DESCRIPTIONS[order.fragilityScore]
    };
  }

  // Determine material profile from order properties
  let profile = MATERIAL_PROFILES.GENERAL;

  // Check for explicit material profile
  if (order.materialProfile && MATERIAL_PROFILES[order.materialProfile]) {
    profile = MATERIAL_PROFILES[order.materialProfile];
  }
  // Infer from product type or seller
  else if (order.seller) {
    const sellerLower = order.seller.toLowerCase();
    if (sellerLower.includes('pharma') || sellerLower.includes('medical')) {
      profile = MATERIAL_PROFILES.PHARMA_STANDARD;
    } else if (sellerLower.includes('glass') || sellerLower.includes('bottle')) {
      profile = MATERIAL_PROFILES.GLASS_CONTAINERS;
    } else if (sellerLower.includes('electronic') || sellerLower.includes('tech')) {
      profile = MATERIAL_PROFILES.ELECTRONICS_CONSUMER;
    } else if (sellerLower.includes('chemical') || sellerLower.includes('paint')) {
      profile = MATERIAL_PROFILES.LIQUID_HAZARDOUS;
    } else if (sellerLower.includes('textile') || sellerLower.includes('garment')) {
      profile = MATERIAL_PROFILES.TEXTILES;
    } else if (sellerLower.includes('food') || sellerLower.includes('fresh')) {
      profile = MATERIAL_PROFILES.FOOD_DRY;
    } else if (sellerLower.includes('furniture')) {
      profile = MATERIAL_PROFILES.FURNITURE_WOOD;
    } else if (sellerLower.includes('steel') || sellerLower.includes('metal') || sellerLower.includes('pipe')) {
      profile = MATERIAL_PROFILES.METAL_PARTS;
    } else if (sellerLower.includes('cosmetic') || sellerLower.includes('perfume') || sellerLower.includes('beauty')) {
      profile = MATERIAL_PROFILES.COSMETICS;
    } else if (sellerLower.includes('gas') || sellerLower.includes('cylinder') || sellerLower.includes('lpg') || sellerLower.includes('oxygen')) {
      profile = MATERIAL_PROFILES.GAS_CYLINDERS;
    }
  }

  // Check for explicit fragile flag (legacy support)
  if (order.fragile === true) {
    // Increase fragility if marked as fragile
    const adjustedScore = Math.min(profile.baseFragility + 1, 5);
    return {
      score: adjustedScore,
      factors: profile.factors,
      profile: profile.id,
      ...FRAGILITY_DESCRIPTIONS[adjustedScore]
    };
  }

  return {
    score: profile.baseFragility,
    factors: profile.factors,
    profile: profile.id,
    specialHandling: profile.specialHandling,
    ...FRAGILITY_DESCRIPTIONS[profile.baseFragility]
  };
};

/**
 * Get maximum load bearing capacity based on fragility
 * @param {number} fragilityScore - Fragility score (1-5)
 * @param {number} itemWeight - Weight of single item in kg
 * @returns {number} - Maximum weight that can be stacked on top (kg)
 */
export const getMaxLoadBearing = (fragilityScore, itemWeight) => {
  // Load bearing multipliers based on fragility
  const multipliers = {
    1: 5.0,   // Robust: can bear 5x its weight
    2: 3.0,   // Durable: can bear 3x its weight
    3: 1.5,   // Moderate: can bear 1.5x its weight
    4: 0.5,   // Fragile: can bear 0.5x its weight
    5: 0.0    // Extremely fragile: nothing on top
  };

  return itemWeight * (multipliers[fragilityScore] || 1.0);
};

/**
 * Check if item A can be stacked on top of item B
 * @param {Object} itemA - Item to be placed on top
 * @param {Object} itemB - Item below
 * @returns {Object} - { canStack: boolean, reason: string, riskLevel: string }
 */
export const checkStackingCompatibility = (itemA, itemB) => {
  const fragilityA = assessOrderFragility(itemA);
  const fragilityB = assessOrderFragility(itemB);

  const weightA = itemA.weight * (itemA.quantity || 1);
  const weightB = itemB.weight * (itemB.quantity || 1);
  const maxLoadBearing = getMaxLoadBearing(fragilityB.score, itemB.weight);

  // Check if bottom item can support top item
  if (weightA > maxLoadBearing) {
    return {
      canStack: false,
      reason: `Bottom item (${itemB.id}) cannot support ${weightA}kg. Max capacity: ${maxLoadBearing.toFixed(1)}kg`,
      riskLevel: 'high'
    };
  }

  // Check fragility compatibility
  if (fragilityA.score < fragilityB.score) {
    // Heavier/less fragile item on fragile item
    const riskLevel = fragilityB.score >= 4 ? 'high' : 'medium';
    return {
      canStack: fragilityB.score < 5,
      reason: fragilityB.score >= 5 
        ? `Cannot stack on extremely fragile item (${itemB.id})`
        : `Warning: Less fragile item on top of fragile item`,
      riskLevel
    };
  }

  // Safe stacking
  return {
    canStack: true,
    reason: 'Compatible for stacking',
    riskLevel: 'low'
  };
};

/**
 * Get handling instructions based on fragility
 * @param {number} fragilityScore - Fragility score (1-5)
 * @param {Object} profile - Material profile
 * @returns {Array} - Array of handling instructions
 */
export const getHandlingInstructions = (fragilityScore, profile = null) => {
  const instructions = [];

  // Base instructions from fragility level
  if (fragilityScore >= 4) {
    instructions.push('Handle with care - Fragile contents');
    instructions.push('Do not drop or throw');
    instructions.push('Keep upright if marked');
  }

  if (fragilityScore === 5) {
    instructions.push('EXTREMELY FRAGILE - Special handling required');
    instructions.push('No stacking allowed on top of this item');
    instructions.push('Use cushioning materials');
  }

  // Add profile-specific instructions
  if (profile && profile.specialHandling) {
    profile.specialHandling.forEach(handling => {
      switch (handling) {
        case 'anti-static':
          instructions.push('Anti-static handling required');
          break;
        case 'shock-absorbing':
          instructions.push('Use shock-absorbing packaging');
          break;
        case 'upright-only':
          instructions.push('Keep upright - Do not lay flat');
          break;
        case 'no-tilt':
          instructions.push('Do not tilt more than 30 degrees');
          break;
        case 'refrigerated':
          instructions.push('Requires refrigerated transport');
          break;
        case 'cold-chain':
          instructions.push('Maintain cold chain - Monitor temperature');
          break;
        case 'hazmat':
          instructions.push('Hazardous material - Follow safety protocols');
          break;
        case 'leak-proof':
          instructions.push('Ensure leak-proof packaging');
          break;
        case 'moisture-protected':
          instructions.push('Protect from moisture and humidity');
          break;
        case 'time-sensitive':
          instructions.push('Time-sensitive delivery required');
          break;
        default:
          instructions.push(handling);
      }
    });
  }

  return instructions;
};

/**
 * Calculate risk score for a load configuration
 * @param {Array} items - Array of items in the load
 * @returns {Object} - { score: number (0-100), level: string, issues: Array }
 */
export const calculateLoadRiskScore = (items) => {
  if (!items || items.length === 0) {
    return { score: 0, level: 'none', issues: [] };
  }

  const issues = [];
  let riskPoints = 0;

  // Assess each item
  items.forEach((item, index) => {
    const fragility = assessOrderFragility(item);

    // High fragility items add risk
    if (fragility.score >= 4) {
      riskPoints += (fragility.score - 3) * 10;
      if (fragility.score === 5) {
        issues.push({
          type: 'extremely_fragile',
          itemId: item.id,
          message: `Item ${item.id} is extremely fragile and requires special handling`
        });
      }
    }

    // Check stacking with item below (if positions available)
    if (item.position && item.position.y > 0) {
      const itemsBelow = items.filter(other => 
        other.position && 
        other.position.y < item.position.y &&
        Math.abs(other.position.x - item.position.x) < 500 &&
        Math.abs(other.position.z - item.position.z) < 500
      );

      itemsBelow.forEach(belowItem => {
        const compatibility = checkStackingCompatibility(item, belowItem);
        if (!compatibility.canStack) {
          riskPoints += 25;
          issues.push({
            type: 'stacking_violation',
            itemId: item.id,
            belowItemId: belowItem.id,
            message: compatibility.reason
          });
        } else if (compatibility.riskLevel === 'medium') {
          riskPoints += 10;
          issues.push({
            type: 'stacking_warning',
            itemId: item.id,
            belowItemId: belowItem.id,
            message: compatibility.reason
          });
        }
      });
    }
  });

  // Calculate final score (0-100, higher = more risk)
  const score = Math.min(100, riskPoints);
  const level = score < 20 ? 'low' : score < 50 ? 'medium' : score < 75 ? 'high' : 'critical';

  return { score, level, issues };
};

/**
 * Fragility Scoring Configuration
 * Admin-level configuration for fragility assessment system
 */
export const FRAGILITY_SCORING_CONFIG = {
  // Scoring scale options
  scales: {
    simple: { min: 1, max: 3, label: '1-3 Scale (Simple)', description: 'Basic: Robust, Moderate, Fragile' },
    standard: { min: 1, max: 5, label: '1-5 Scale (Standard)', description: 'Standard industry scale' },
    detailed: { min: 1, max: 10, label: '1-10 Scale (Detailed)', description: 'Granular fragility assessment' }
  },
  
  // Default scoring scale
  defaultScale: 'standard',
  
  // Default protection scores by packaging type
  defaultProtectionScores: {
    corrugated_box: 3,
    corrugated_box_heavy: 4,
    wooden_crate: 5,
    wooden_pallet: 4,
    plastic_container: 4,
    plastic_crate: 4,
    metal_drum: 5,
    metal_container: 5,
    foam_padded: 5,
    bubble_wrapped: 4,
    shrink_wrap: 2,
    thermal_insulated: 4,
    woven_sack: 2,
    paper_sack: 1,
    glass_carton: 4,
    cylinder_cage: 5,
    unpackaged: 0
  },
  
  // Crush pressure limits (kg/m²) by fragility level
  crushPressureLimits: {
    1: 1000, // Robust items
    2: 750,  // Durable items
    3: 500,  // Moderate items
    4: 250,  // Fragile items
    5: 100   // Extremely fragile items
  },
  
  // Safety margin buffers (%) for fragility calculations
  safetyMargins: {
    conservative: 20,
    standard: 10,
    aggressive: 5
  },
  
  // Alert thresholds for fragile+heavy mix
  mixAlertThresholds: {
    low: 1,    // Alert if fragility difference > 1
    medium: 2, // Alert if fragility difference > 2
    high: 3,   // Alert if fragility difference > 3
    off: 999   // No alerts
  }
};

/**
 * Convert fragility score between different scales
 * @param {number} score - Score in current scale
 * @param {string} fromScale - Source scale (simple/standard/detailed)
 * @param {string} toScale - Target scale
 * @returns {number} - Converted score
 */
export const convertFragilityScale = (score, fromScale = 'standard', toScale = 'standard') => {
  if (fromScale === toScale) return score;
  
  const scales = FRAGILITY_SCORING_CONFIG.scales;
  const fromRange = scales[fromScale].max - scales[fromScale].min;
  const toRange = scales[toScale].max - scales[toScale].min;
  
  // Normalize to 0-1 range
  const normalized = (score - scales[fromScale].min) / fromRange;
  
  // Convert to target scale
  const converted = normalized * toRange + scales[toScale].min;
  
  return Math.round(converted);
};

/**
 * Get fragility description for any scale
 * @param {number} score - Fragility score
 * @param {string} scale - Scale type (simple/standard/detailed)
 * @returns {Object} - Description object
 */
export const getFragilityDescription = (score, scale = 'standard') => {
  // Convert to standard scale for description
  const standardScore = convertFragilityScale(score, scale, 'standard');
  return FRAGILITY_DESCRIPTIONS[standardScore] || FRAGILITY_DESCRIPTIONS[3];
};

/**
 * Apply safety margin to fragility calculations
 * @param {number} value - Base value
 * @param {string} marginType - Margin type (conservative/standard/aggressive)
 * @returns {number} - Value with safety margin applied
 */
export const applySafetyMargin = (value, marginType = 'standard') => {
  const margin = FRAGILITY_SCORING_CONFIG.safetyMargins[marginType] || 10;
  return value * (1 + margin / 100);
};

/**
 * Check if fragile/heavy mix alert should be triggered
 * @param {number} fragility1 - First item fragility
 * @param {number} fragility2 - Second item fragility
 * @param {string} threshold - Alert threshold (low/medium/high/off)
 * @returns {boolean} - True if alert should be triggered
 */
export const shouldAlertFragileHeavyMix = (fragility1, fragility2, threshold = 'medium') => {
  const thresholdValue = FRAGILITY_SCORING_CONFIG.mixAlertThresholds[threshold];
  const difference = Math.abs(fragility1 - fragility2);
  return difference > thresholdValue;
};

/**
 * Get crush pressure limit for fragility level
 * @param {number} fragilityScore - Fragility score (1-5)
 * @param {string} safetyMargin - Safety margin type
 * @returns {number} - Maximum allowed crush pressure (kg/m²)
 */
export const getCrushPressureLimit = (fragilityScore, safetyMargin = 'standard') => {
  const baseLimit = FRAGILITY_SCORING_CONFIG.crushPressureLimits[fragilityScore] || 500;
  
  // Apply safety margin (reduce limit for safety)
  const margin = FRAGILITY_SCORING_CONFIG.safetyMargins[safetyMargin] || 10;
  return baseLimit * (1 - margin / 100);
};

/**
 * Validate fragility configuration
 * @param {Object} config - Configuration object
 * @returns {Object} - Validation result
 */
export const validateFragilityConfig = (config) => {
  const result = { valid: true, errors: [], warnings: [] };
  
  // Check if scale is valid
  if (config.scale && !FRAGILITY_SCORING_CONFIG.scales[config.scale]) {
    result.errors.push(`Invalid scale: ${config.scale}`);
    result.valid = false;
  }
  
  // Check if safety margin is reasonable
  if (config.safetyMargin !== undefined) {
    if (config.safetyMargin < 0 || config.safetyMargin > 50) {
      result.warnings.push(`Safety margin ${config.safetyMargin}% is outside typical range (0-50%)`);
    }
  }
  
  // Check if crush pressure limits are reasonable
  if (config.maxCrushPressure !== undefined) {
    if (config.maxCrushPressure < 50 || config.maxCrushPressure > 2000) {
      result.warnings.push(`Max crush pressure ${config.maxCrushPressure} kg/m² is outside typical range (50-2000)`);
    }
  }
  
  return result;
};

/**
 * Get default configuration
 * @returns {Object} - Default fragility configuration
 */
export const getDefaultFragilityConfig = () => {
  return {
    scale: FRAGILITY_SCORING_CONFIG.defaultScale,
    safetyMargin: 10,
    maxCrushPressure: 500,
    mixAlertThreshold: 'medium',
    enforcePackagingCompatibility: true,
    enableProtectedZones: true
  };
};

/**
 * Recommend fragility score based on item characteristics
 * @param {Object} itemCharacteristics - Item characteristics
 * @returns {Object} - Recommended fragility assessment
 */
export const recommendFragilityScore = (itemCharacteristics) => {
  const {
    material,
    weight,
    value,
    hasGlass,
    hasElectronics,
    isLiquid,
    isPerishable,
    customFactors
  } = itemCharacteristics;
  
  let recommendedScore = 2; // Default to Durable
  const reasons = [];
  
  // Material-based recommendations
  if (hasGlass) {
    recommendedScore = Math.max(recommendedScore, 5);
    reasons.push('Contains glass - highly fragile');
  }
  
  if (hasElectronics) {
    recommendedScore = Math.max(recommendedScore, 4);
    reasons.push('Contains electronics - fragile');
  }
  
  if (isLiquid) {
    recommendedScore = Math.max(recommendedScore, 3);
    reasons.push('Liquid contents - moderate care required');
  }
  
  if (isPerishable) {
    recommendedScore = Math.max(recommendedScore, 4);
    reasons.push('Perishable goods - special handling required');
  }
  
  // Weight considerations (very heavy items can be robust)
  if (weight > 1000) {
    recommendedScore = Math.min(recommendedScore, 2);
    reasons.push('Heavy item - structurally robust');
  }
  
  // Value considerations (high value = higher caution)
  if (value && value > 10000) {
    recommendedScore = Math.max(recommendedScore, 4);
    reasons.push('High-value item - requires extra care');
  }
  
  // Apply custom factors if provided
  if (customFactors) {
    const customScore = calculateFragilityScore(customFactors);
    if (customScore > recommendedScore) {
      recommendedScore = customScore;
      reasons.push('Custom fragility factors applied');
    }
  }
  
  return {
    recommendedScore,
    reasons,
    description: FRAGILITY_DESCRIPTIONS[recommendedScore],
    confidence: reasons.length > 2 ? 'high' : reasons.length > 0 ? 'medium' : 'low'
  };
};

/**
 * Bulk assess fragility for multiple orders
 * @param {Array} orders - Array of orders
 * @param {Object} config - Configuration options
 * @returns {Object} - Bulk assessment results
 */
export const bulkAssessFragility = (orders, config = {}) => {
  const results = {
    assessed: [],
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    highRiskOrders: [],
    recommendProtectedZones: [],
    warnings: []
  };
  
  orders.forEach(order => {
    try {
      const fragility = assessOrderFragility(order);
      
      results.assessed.push({
        orderId: order.id,
        fragility: fragility.score,
        label: fragility.label,
        profile: fragility.profile
      });
      
      results.distribution[fragility.score]++;
      
      // Identify high-risk orders
      if (fragility.score >= 4) {
        results.highRiskOrders.push(order.id);
        results.recommendProtectedZones.push(order.id);
      }
      
      // Check for missing packaging
      if (!order.packagingType && fragility.score >= 3) {
        results.warnings.push(`Order ${order.id}: No packaging specified for fragility ${fragility.score}/5`);
      }
      
    } catch (error) {
      results.warnings.push(`Order ${order.id}: Failed to assess fragility - ${error.message}`);
    }
  });
  
  // Add summary statistics
  results.summary = {
    total: orders.length,
    assessed: results.assessed.length,
    highRisk: results.highRiskOrders.length,
    needsProtectedZone: results.recommendProtectedZones.length,
    averageFragility: (
      Object.entries(results.distribution)
        .reduce((sum, [score, count]) => sum + (parseInt(score) * count), 0) / orders.length
    ).toFixed(2)
  };
  
  return results;
};

export default {
  FRAGILITY_LEVELS,
  FRAGILITY_DESCRIPTIONS,
  FRAGILITY_FACTORS,
  MATERIAL_PROFILES,
  FRAGILITY_SCORING_CONFIG,
  calculateFragilityScore,
  getMaterialProfile,
  assessOrderFragility,
  getMaxLoadBearing,
  checkStackingCompatibility,
  getHandlingInstructions,
  calculateLoadRiskScore,
  convertFragilityScale,
  getFragilityDescription,
  applySafetyMargin,
  shouldAlertFragileHeavyMix,
  getCrushPressureLimit,
  validateFragilityConfig,
  getDefaultFragilityConfig,
  recommendFragilityScore,
  bulkAssessFragility
};



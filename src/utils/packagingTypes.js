/**
 * Packaging Type Classification System
 * Defines packaging categories, protection levels, and stacking compatibility
 */

// Packaging categories with protection characteristics
export const PACKAGING_TYPES = {
  // Standard Boxes
  CORRUGATED_BOX: {
    id: 'corrugated_box',
    label: 'Corrugated Box',
    description: 'Standard corrugated cardboard box',
    protection: {
      crush: 3,      // 1-5 scale, 5 = best protection
      shock: 2,
      moisture: 2,
      temperature: 1
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 50,  // kg per layer
      maxStackLayers: 4
    },
    weight: 0.5,  // kg (empty packaging weight)
    costFactor: 1.0,
    icon: '📦'
  },

  CORRUGATED_BOX_HEAVY: {
    id: 'corrugated_box_heavy',
    label: 'Heavy-Duty Corrugated Box',
    description: 'Double-wall corrugated box for heavy items',
    protection: {
      crush: 4,
      shock: 3,
      moisture: 2,
      temperature: 1
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 100,
      maxStackLayers: 5
    },
    weight: 1.0,
    costFactor: 1.5,
    icon: '📦'
  },

  // Wooden Packaging
  WOODEN_CRATE: {
    id: 'wooden_crate',
    label: 'Wooden Crate',
    description: 'Solid wooden crate for heavy/valuable items',
    protection: {
      crush: 5,
      shock: 4,
      moisture: 3,
      temperature: 2
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 500,
      maxStackLayers: 3
    },
    weight: 5.0,
    costFactor: 3.0,
    icon: '🪵'
  },

  WOODEN_PALLET: {
    id: 'wooden_pallet',
    label: 'Wooden Pallet',
    description: 'Standard pallet for forklift handling',
    protection: {
      crush: 4,
      shock: 3,
      moisture: 2,
      temperature: 1
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 1000,
      maxStackLayers: 3
    },
    weight: 15.0,
    costFactor: 2.0,
    icon: '🪵'
  },

  // Plastic Containers
  PLASTIC_CONTAINER: {
    id: 'plastic_container',
    label: 'Plastic Container',
    description: 'Rigid plastic container',
    protection: {
      crush: 4,
      shock: 4,
      moisture: 5,
      temperature: 3
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 75,
      maxStackLayers: 5
    },
    weight: 1.5,
    costFactor: 2.0,
    icon: '🧊'
  },

  PLASTIC_CRATE: {
    id: 'plastic_crate',
    label: 'Plastic Crate',
    description: 'Reusable plastic crate',
    protection: {
      crush: 4,
      shock: 4,
      moisture: 5,
      temperature: 3
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 150,
      maxStackLayers: 6
    },
    weight: 3.0,
    costFactor: 2.5,
    icon: '🧊'
  },

  // Metal Containers
  METAL_DRUM: {
    id: 'metal_drum',
    label: 'Metal Drum',
    description: 'Steel drum for liquids and chemicals',
    protection: {
      crush: 5,
      shock: 4,
      moisture: 5,
      temperature: 4
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 300,
      maxStackLayers: 2
    },
    weight: 8.0,
    costFactor: 4.0,
    icon: '🛢️'
  },

  METAL_CONTAINER: {
    id: 'metal_container',
    label: 'Metal Container',
    description: 'Heavy-duty metal container',
    protection: {
      crush: 5,
      shock: 5,
      moisture: 5,
      temperature: 4
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 500,
      maxStackLayers: 3
    },
    weight: 10.0,
    costFactor: 5.0,
    icon: '🗃️'
  },

  // Protective Packaging
  FOAM_PADDED: {
    id: 'foam_padded',
    label: 'Foam-Padded Box',
    description: 'Box with foam cushioning for fragile items',
    protection: {
      crush: 3,
      shock: 5,
      moisture: 2,
      temperature: 2
    },
    stackability: {
      canBeStacked: true,
      canStackOn: false,  // Should not have heavy items on top
      maxStackWeight: 20,
      maxStackLayers: 3
    },
    weight: 1.0,
    costFactor: 2.5,
    icon: '🧽'
  },

  BUBBLE_WRAPPED: {
    id: 'bubble_wrapped',
    label: 'Bubble Wrapped',
    description: 'Items wrapped in bubble wrap',
    protection: {
      crush: 2,
      shock: 4,
      moisture: 1,
      temperature: 1
    },
    stackability: {
      canBeStacked: true,
      canStackOn: false,
      maxStackWeight: 10,
      maxStackLayers: 2
    },
    weight: 0.2,
    costFactor: 1.5,
    icon: '🫧'
  },

  // Specialty Packaging
  SHRINK_WRAP: {
    id: 'shrink_wrap',
    label: 'Shrink Wrapped',
    description: 'Items shrink-wrapped to pallet',
    protection: {
      crush: 1,
      shock: 1,
      moisture: 4,
      temperature: 1
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 200,
      maxStackLayers: 3
    },
    weight: 0.3,
    costFactor: 0.5,
    icon: '🎁'
  },

  THERMAL_INSULATED: {
    id: 'thermal_insulated',
    label: 'Thermal Insulated',
    description: 'Temperature-controlled packaging',
    protection: {
      crush: 3,
      shock: 3,
      moisture: 4,
      temperature: 5
    },
    stackability: {
      canBeStacked: true,
      canStackOn: false,
      maxStackWeight: 30,
      maxStackLayers: 2
    },
    weight: 2.0,
    costFactor: 4.0,
    icon: '❄️'
  },

  // Bags & Sacks
  WOVEN_SACK: {
    id: 'woven_sack',
    label: 'Woven Sack',
    description: 'PP woven sack for bulk items',
    protection: {
      crush: 1,
      shock: 1,
      moisture: 3,
      temperature: 1
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 100,
      maxStackLayers: 10
    },
    weight: 0.2,
    costFactor: 0.3,
    icon: '👜'
  },

  PAPER_SACK: {
    id: 'paper_sack',
    label: 'Paper Sack',
    description: 'Multi-layer paper sack',
    protection: {
      crush: 1,
      shock: 1,
      moisture: 1,
      temperature: 1
    },
    stackability: {
      canBeStacked: true,
      canStackOn: true,
      maxStackWeight: 50,
      maxStackLayers: 8
    },
    weight: 0.1,
    costFactor: 0.2,
    icon: '📄'
  },

  // Specialized
  GLASS_CARTON: {
    id: 'glass_carton',
    label: 'Glass Carton',
    description: 'Partitioned carton for glass items',
    protection: {
      crush: 3,
      shock: 4,
      moisture: 2,
      temperature: 1
    },
    stackability: {
      canBeStacked: false,  // Never stack on glass
      canStackOn: false,
      maxStackWeight: 0,
      maxStackLayers: 1
    },
    weight: 1.0,
    costFactor: 2.0,
    icon: '🍾'
  },

  CYLINDER_CAGE: {
    id: 'cylinder_cage',
    label: 'Cylinder Cage',
    description: 'Metal cage for gas cylinders',
    protection: {
      crush: 5,
      shock: 4,
      moisture: 5,
      temperature: 3
    },
    stackability: {
      canBeStacked: false,
      canStackOn: true,
      maxStackWeight: 0,
      maxStackLayers: 1
    },
    weight: 15.0,
    costFactor: 5.0,
    icon: '🔒'
  },

  // No Packaging
  UNPACKAGED: {
    id: 'unpackaged',
    label: 'Unpackaged',
    description: 'Item shipped without packaging',
    protection: {
      crush: 0,
      shock: 0,
      moisture: 0,
      temperature: 0
    },
    stackability: {
      canBeStacked: false,
      canStackOn: false,
      maxStackWeight: 0,
      maxStackLayers: 1
    },
    weight: 0,
    costFactor: 0,
    icon: '📋'
  }
};

// Packaging compatibility matrix
// -1 = incompatible, 0 = neutral, 1 = good, 2 = excellent
export const PACKAGING_COMPATIBILITY = {
  corrugated_box: {
    corrugated_box: 2,
    corrugated_box_heavy: 2,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 1,
    plastic_crate: 1,
    metal_drum: 0,
    metal_container: 0,
    foam_padded: -1,  // Don't stack on foam
    bubble_wrapped: -1,
    shrink_wrap: 1,
    thermal_insulated: -1,
    woven_sack: 1,
    paper_sack: 1,
    glass_carton: -1,
    cylinder_cage: 0,
    unpackaged: -1
  },
  corrugated_box_heavy: {
    corrugated_box: 1,
    corrugated_box_heavy: 2,
    wooden_crate: 2,
    wooden_pallet: 2,
    plastic_container: 1,
    plastic_crate: 1,
    metal_drum: 1,
    metal_container: 1,
    foam_padded: -1,
    bubble_wrapped: -1,
    shrink_wrap: 1,
    thermal_insulated: -1,
    woven_sack: 1,
    paper_sack: 0,
    glass_carton: -1,
    cylinder_cage: 0,
    unpackaged: -1
  },
  wooden_crate: {
    corrugated_box: 0,
    corrugated_box_heavy: 1,
    wooden_crate: 2,
    wooden_pallet: 2,
    plastic_container: 1,
    plastic_crate: 1,
    metal_drum: 1,
    metal_container: 1,
    foam_padded: -1,
    bubble_wrapped: -1,
    shrink_wrap: 1,
    thermal_insulated: 0,
    woven_sack: 0,
    paper_sack: 0,
    glass_carton: -1,
    cylinder_cage: 1,
    unpackaged: -1
  },
  wooden_pallet: {
    corrugated_box: 1,
    corrugated_box_heavy: 2,
    wooden_crate: 2,
    wooden_pallet: 2,
    plastic_container: 1,
    plastic_crate: 2,
    metal_drum: 2,
    metal_container: 2,
    foam_padded: 0,
    bubble_wrapped: 0,
    shrink_wrap: 2,
    thermal_insulated: 1,
    woven_sack: 2,
    paper_sack: 1,
    glass_carton: 0,
    cylinder_cage: 2,
    unpackaged: 0
  },
  plastic_container: {
    corrugated_box: 1,
    corrugated_box_heavy: 1,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 2,
    plastic_crate: 2,
    metal_drum: 1,
    metal_container: 1,
    foam_padded: -1,
    bubble_wrapped: -1,
    shrink_wrap: 1,
    thermal_insulated: 0,
    woven_sack: 1,
    paper_sack: 0,
    glass_carton: -1,
    cylinder_cage: 0,
    unpackaged: -1
  },
  plastic_crate: {
    corrugated_box: 1,
    corrugated_box_heavy: 1,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 2,
    plastic_crate: 2,
    metal_drum: 1,
    metal_container: 1,
    foam_padded: -1,
    bubble_wrapped: -1,
    shrink_wrap: 1,
    thermal_insulated: 0,
    woven_sack: 1,
    paper_sack: 0,
    glass_carton: -1,
    cylinder_cage: 1,
    unpackaged: -1
  },
  metal_drum: {
    corrugated_box: -1,
    corrugated_box_heavy: 0,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 0,
    plastic_crate: 0,
    metal_drum: 2,
    metal_container: 2,
    foam_padded: -1,
    bubble_wrapped: -1,
    shrink_wrap: 0,
    thermal_insulated: -1,
    woven_sack: -1,
    paper_sack: -1,
    glass_carton: -1,
    cylinder_cage: 0,
    unpackaged: -1
  },
  metal_container: {
    corrugated_box: 0,
    corrugated_box_heavy: 1,
    wooden_crate: 2,
    wooden_pallet: 2,
    plastic_container: 1,
    plastic_crate: 1,
    metal_drum: 2,
    metal_container: 2,
    foam_padded: -1,
    bubble_wrapped: -1,
    shrink_wrap: 1,
    thermal_insulated: 0,
    woven_sack: 0,
    paper_sack: 0,
    glass_carton: -1,
    cylinder_cage: 1,
    unpackaged: -1
  },
  foam_padded: {
    corrugated_box: 2,
    corrugated_box_heavy: 2,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 2,
    plastic_crate: 2,
    metal_drum: 0,
    metal_container: 1,
    foam_padded: 1,
    bubble_wrapped: 1,
    shrink_wrap: 2,
    thermal_insulated: 1,
    woven_sack: 1,
    paper_sack: 1,
    glass_carton: 1,
    cylinder_cage: 0,
    unpackaged: 0
  },
  bubble_wrapped: {
    corrugated_box: 2,
    corrugated_box_heavy: 2,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 2,
    plastic_crate: 2,
    metal_drum: 0,
    metal_container: 1,
    foam_padded: 1,
    bubble_wrapped: 1,
    shrink_wrap: 2,
    thermal_insulated: 1,
    woven_sack: 1,
    paper_sack: 1,
    glass_carton: 1,
    cylinder_cage: 0,
    unpackaged: 0
  },
  shrink_wrap: {
    corrugated_box: 1,
    corrugated_box_heavy: 1,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 1,
    plastic_crate: 1,
    metal_drum: 1,
    metal_container: 1,
    foam_padded: 0,
    bubble_wrapped: 0,
    shrink_wrap: 2,
    thermal_insulated: 0,
    woven_sack: 1,
    paper_sack: 1,
    glass_carton: 0,
    cylinder_cage: 0,
    unpackaged: 0
  },
  thermal_insulated: {
    corrugated_box: 2,
    corrugated_box_heavy: 2,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 2,
    plastic_crate: 2,
    metal_drum: 0,
    metal_container: 1,
    foam_padded: 1,
    bubble_wrapped: 1,
    shrink_wrap: 2,
    thermal_insulated: 2,
    woven_sack: 1,
    paper_sack: 1,
    glass_carton: 1,
    cylinder_cage: 0,
    unpackaged: 0
  },
  woven_sack: {
    corrugated_box: 1,
    corrugated_box_heavy: 1,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 1,
    plastic_crate: 1,
    metal_drum: 0,
    metal_container: 0,
    foam_padded: -1,
    bubble_wrapped: -1,
    shrink_wrap: 1,
    thermal_insulated: 0,
    woven_sack: 2,
    paper_sack: 1,
    glass_carton: -1,
    cylinder_cage: 0,
    unpackaged: -1
  },
  paper_sack: {
    corrugated_box: 1,
    corrugated_box_heavy: 1,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 1,
    plastic_crate: 1,
    metal_drum: -1,
    metal_container: 0,
    foam_padded: -1,
    bubble_wrapped: -1,
    shrink_wrap: 1,
    thermal_insulated: 0,
    woven_sack: 2,
    paper_sack: 2,
    glass_carton: -1,
    cylinder_cage: 0,
    unpackaged: -1
  },
  glass_carton: {
    corrugated_box: 2,
    corrugated_box_heavy: 2,
    wooden_crate: 2,
    wooden_pallet: 2,
    plastic_container: 2,
    plastic_crate: 2,
    metal_drum: 0,
    metal_container: 1,
    foam_padded: 2,
    bubble_wrapped: 2,
    shrink_wrap: 2,
    thermal_insulated: 2,
    woven_sack: 1,
    paper_sack: 1,
    glass_carton: 0,
    cylinder_cage: 0,
    unpackaged: 0
  },
  cylinder_cage: {
    corrugated_box: 0,
    corrugated_box_heavy: 1,
    wooden_crate: 2,
    wooden_pallet: 2,
    plastic_container: 1,
    plastic_crate: 1,
    metal_drum: 1,
    metal_container: 2,
    foam_padded: 0,
    bubble_wrapped: 0,
    shrink_wrap: 1,
    thermal_insulated: 0,
    woven_sack: 0,
    paper_sack: 0,
    glass_carton: 0,
    cylinder_cage: 1,
    unpackaged: 0
  },
  unpackaged: {
    corrugated_box: 0,
    corrugated_box_heavy: 0,
    wooden_crate: 1,
    wooden_pallet: 2,
    plastic_container: 0,
    plastic_crate: 0,
    metal_drum: 0,
    metal_container: 1,
    foam_padded: 0,
    bubble_wrapped: 0,
    shrink_wrap: 0,
    thermal_insulated: 0,
    woven_sack: 0,
    paper_sack: 0,
    glass_carton: 0,
    cylinder_cage: 0,
    unpackaged: 0
  }
};

/**
 * Get packaging type by ID
 * @param {string} packagingId - Packaging type ID
 * @returns {Object} - Packaging type details
 */
export const getPackagingType = (packagingId) => {
  const type = Object.values(PACKAGING_TYPES).find(p => p.id === packagingId);
  return type || PACKAGING_TYPES.CORRUGATED_BOX;
};

/**
 * Get all packaging types as array
 * @returns {Array} - Array of packaging types
 */
export const getAllPackagingTypes = () => {
  return Object.values(PACKAGING_TYPES);
};

/**
 * Check if two packaging types are compatible for stacking
 * @param {string} topPackagingId - ID of packaging on top
 * @param {string} bottomPackagingId - ID of packaging on bottom
 * @returns {Object} - { compatible: boolean, score: number, reason: string }
 */
export const checkPackagingCompatibility = (topPackagingId, bottomPackagingId) => {
  const topPackaging = getPackagingType(topPackagingId);
  const bottomPackaging = getPackagingType(bottomPackagingId);

  // Check if bottom packaging allows stacking on top
  if (!bottomPackaging.stackability.canStackOn) {
    return {
      compatible: false,
      score: -1,
      reason: `${bottomPackaging.label} should not have items stacked on top`
    };
  }

  // Check if top packaging can be stacked
  if (!topPackaging.stackability.canBeStacked) {
    return {
      compatible: false,
      score: -1,
      reason: `${topPackaging.label} should not be stacked on other items`
    };
  }

  // Get compatibility score from matrix
  const compatibilityScore = PACKAGING_COMPATIBILITY[topPackagingId]?.[bottomPackagingId] ?? 0;

  if (compatibilityScore < 0) {
    return {
      compatible: false,
      score: compatibilityScore,
      reason: `${topPackaging.label} is not compatible with ${bottomPackaging.label} for stacking`
    };
  }

  const reasons = {
    0: 'Neutral compatibility - use with caution',
    1: 'Good compatibility for stacking',
    2: 'Excellent compatibility for stacking'
  };

  return {
    compatible: true,
    score: compatibilityScore,
    reason: reasons[compatibilityScore] || 'Compatible'
  };
};

/**
 * Calculate overall protection score for a packaging type
 * @param {string} packagingId - Packaging type ID
 * @returns {number} - Overall protection score (0-5)
 */
export const calculateProtectionScore = (packagingId) => {
  const packaging = getPackagingType(packagingId);
  const protection = packaging.protection;

  // Weighted average of protection factors
  const weights = {
    crush: 0.35,
    shock: 0.30,
    moisture: 0.20,
    temperature: 0.15
  };

  let totalScore = 0;
  Object.keys(weights).forEach(factor => {
    totalScore += (protection[factor] || 0) * weights[factor];
  });

  return Math.round(totalScore * 10) / 10;
};

/**
 * Recommend packaging type based on fragility and requirements
 * @param {number} fragilityScore - Item fragility score (1-5)
 * @param {Object} requirements - Special requirements
 * @returns {Array} - Array of recommended packaging types sorted by suitability
 */
export const recommendPackaging = (fragilityScore, requirements = {}) => {
  const recommendations = [];

  Object.values(PACKAGING_TYPES).forEach(packaging => {
    let suitabilityScore = 0;
    const reasons = [];

    // Match fragility to crush/shock protection
    const neededProtection = fragilityScore;
    const crushMatch = Math.max(0, 5 - Math.abs(packaging.protection.crush - neededProtection));
    const shockMatch = Math.max(0, 5 - Math.abs(packaging.protection.shock - neededProtection));
    suitabilityScore += crushMatch * 2 + shockMatch * 2;

    // Check specific requirements
    if (requirements.moistureProtection && packaging.protection.moisture >= 4) {
      suitabilityScore += 3;
      reasons.push('Good moisture protection');
    }

    if (requirements.temperatureControl && packaging.protection.temperature >= 4) {
      suitabilityScore += 3;
      reasons.push('Good temperature protection');
    }

    if (requirements.heavyDuty && packaging.stackability.maxStackWeight >= 100) {
      suitabilityScore += 2;
      reasons.push('Heavy-duty capacity');
    }

    if (requirements.reusable && (packaging.id.includes('plastic') || packaging.id.includes('metal'))) {
      suitabilityScore += 1;
      reasons.push('Reusable');
    }

    // Penalty for over-packaging (cost efficiency)
    if (fragilityScore <= 2 && calculateProtectionScore(packaging.id) > 4) {
      suitabilityScore -= 2;
      reasons.push('May be over-protected for this item');
    }

    // Don't recommend unpackaged for fragile items
    if (packaging.id === 'unpackaged' && fragilityScore >= 3) {
      suitabilityScore = 0;
    }

    recommendations.push({
      packaging,
      suitabilityScore,
      reasons,
      protectionScore: calculateProtectionScore(packaging.id)
    });
  });

  // Sort by suitability score descending
  return recommendations
    .filter(r => r.suitabilityScore > 0)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 5);
};

/**
 * Calculate effective stack height based on packaging
 * @param {Array} items - Array of items with packaging info
 * @returns {Object} - { totalHeight: number, maxLayers: number, warnings: Array }
 */
export const calculateStackingLimits = (items) => {
  if (!items || items.length === 0) {
    return { totalHeight: 0, maxLayers: 0, warnings: [] };
  }

  const warnings = [];
  let currentHeight = 0;
  let layerCount = 0;

  // Group items by layer (simplified)
  items.forEach((item, index) => {
    const packaging = getPackagingType(item.packagingType || 'corrugated_box');
    const itemHeight = item.dimensions?.height || 300; // mm

    // Check layer limits
    if (layerCount >= packaging.stackability.maxStackLayers) {
      warnings.push({
        itemId: item.id,
        message: `${packaging.label} exceeds maximum stack layers (${packaging.stackability.maxStackLayers})`
      });
    }

    currentHeight += itemHeight;
    layerCount++;
  });

  return {
    totalHeight: currentHeight,
    maxLayers: layerCount,
    warnings
  };
};

/**
 * Get packaging icon
 * @param {string} packagingId - Packaging type ID
 * @returns {string} - Icon emoji
 */
export const getPackagingIcon = (packagingId) => {
  const packaging = getPackagingType(packagingId);
  return packaging.icon || '📦';
};

export default {
  PACKAGING_TYPES,
  PACKAGING_COMPATIBILITY,
  getPackagingType,
  getAllPackagingTypes,
  checkPackagingCompatibility,
  calculateProtectionScore,
  recommendPackaging,
  calculateStackingLimits,
  getPackagingIcon
};



/**
 * Stacking Sequence Optimizer
 * Generates optimal layer-by-layer stacking sequences considering fragility and packaging
 */

import { assessOrderFragility, checkStackingCompatibility, getMaxLoadBearing } from './fragilityScoring.js';
import { checkPackagingCompatibility, getPackagingType } from './packagingTypes.js';

/**
 * Stacking layer configuration
 */
const LAYER_CONFIG = {
  MAX_HEIGHT: 2200, // mm - maximum stacking height
  LAYER_HEIGHT: 400, // mm - average layer height
  MIN_STABILITY_RATIO: 0.7, // Minimum support coverage required
  MAX_WEIGHT_PER_LAYER: 1500 // kg - maximum weight per layer
};

/**
 * Stacking Sequence Optimizer class
 */
export class StackingOptimizer {
  constructor(vehicleSpecs, options = {}) {
    this.vehicle = vehicleSpecs;
    this.options = {
      enableFragilityOptimization: true,
      enableWeightBalancing: true,
      enableDeliverySequencing: true,
      layerHeight: options.layerHeight || LAYER_CONFIG.LAYER_HEIGHT,
      maxHeight: options.maxHeight || Math.min(vehicleSpecs.dimensions.height, LAYER_CONFIG.MAX_HEIGHT),
      ...options
    };
  }

  /**
   * Generate optimal stacking sequence for items
   * @param {Array} items - Array of items to stack
   * @returns {Object} - Stacking plan with layers and sequence
   */
  generateStackingPlan(items) {
    // Step 1: Analyze and categorize items
    const analyzedItems = this.analyzeItems(items);

    // Step 2: Sort items for optimal stacking order
    const sortedItems = this.sortForStacking(analyzedItems);

    // Step 3: Generate layers
    const layers = this.generateLayers(sortedItems);

    // Step 4: Optimize layer arrangement
    const optimizedLayers = this.optimizeLayers(layers);

    // Step 5: Generate stacking sequence (loading order)
    const stackingSequence = this.generateStackingSequence(optimizedLayers);

    // Step 6: Calculate stability and safety scores
    const stabilityAnalysis = this.analyzeStability(optimizedLayers);

    return {
      layers: optimizedLayers,
      sequence: stackingSequence,
      stability: stabilityAnalysis,
      summary: this.generateSummary(optimizedLayers, stabilityAnalysis),
      visualizationData: this.generateVisualizationData(optimizedLayers)
    };
  }

  /**
   * Analyze items and add stacking-relevant properties
   */
  analyzeItems(items) {
    return items.map(item => {
      const fragility = assessOrderFragility(item);
      const packaging = getPackagingType(item.packagingType || 'corrugated_box');
      const dims = this.getItemDimensions(item);
      const totalWeight = item.weight * (item.quantity || 1);
      const footprint = dims.length * dims.width; // mm²

      return {
        ...item,
        stackingAnalysis: {
          fragility: fragility,
          packaging: packaging,
          dimensions: dims,
          totalWeight: totalWeight,
          footprint: footprint,
          loadBearingCapacity: item.loadBearingCapacity || getMaxLoadBearing(fragility.score, item.weight),
          canBeBase: fragility.score <= 2 && totalWeight >= 10,
          canBeStacked: fragility.score < 5 && packaging.stackability.canBeStacked,
          canHaveItemsOnTop: fragility.score <= 4 && packaging.stackability.canStackOn,
          maxItemsOnTop: fragility.score <= 2 ? 3 : fragility.score <= 3 ? 2 : fragility.score <= 4 ? 1 : 0,
          preferredPosition: this.determinePreferredPosition(fragility.score, totalWeight)
        }
      };
    });
  }

  /**
   * Determine preferred position based on fragility and weight
   */
  determinePreferredPosition(fragilityScore, weight) {
    if (fragilityScore >= 4) return 'TOP';
    if (fragilityScore <= 2 && weight >= 20) return 'BOTTOM';
    return 'MIDDLE';
  }

  /**
   * Sort items for optimal stacking
   * Heavy/robust items first (base), fragile items last (top)
   */
  sortForStacking(items) {
    return [...items].sort((a, b) => {
      const analysisA = a.stackingAnalysis;
      const analysisB = b.stackingAnalysis;

      // First: Delivery sequence (LIFO - later deliveries go to back/bottom)
      if (this.options.enableDeliverySequencing) {
        const seqA = a.dropSequence || 999;
        const seqB = b.dropSequence || 999;
        if (seqA !== seqB) {
          return seqB - seqA;
        }
      }

      // Second: Fragility (lower fragility = load first = goes to bottom)
      const fragDiff = analysisA.fragility.score - analysisB.fragility.score;
      if (fragDiff !== 0) return fragDiff;

      // Third: Weight (heavier items first = bottom)
      const weightDiff = analysisB.totalWeight - analysisA.totalWeight;
      if (Math.abs(weightDiff) > 5) return weightDiff;

      // Fourth: Footprint (larger footprint = better base)
      return analysisB.footprint - analysisA.footprint;
    });
  }

  /**
   * Generate stacking layers
   */
  generateLayers(sortedItems) {
    const layers = [];
    const vehicleFloorArea = this.vehicle.dimensions.length * this.vehicle.dimensions.width;
    let currentLayerHeight = 0;

    // Initialize first layer
    let currentLayer = this.createNewLayer(0, layers.length);

    for (const item of sortedItems) {
      const dims = item.stackingAnalysis.dimensions;
      const itemHeight = dims.height;

      // Check if item fits in current layer height-wise
      if (currentLayerHeight + itemHeight > this.options.maxHeight) {
        // Can't add more layers - item doesn't fit
        currentLayer.overflow.push(item);
        continue;
      }

      // Check if item fits in current layer area-wise
      const currentLayerArea = currentLayer.items.reduce(
        (sum, i) => sum + i.stackingAnalysis.footprint,
        0
      );
      
      if (currentLayerArea + item.stackingAnalysis.footprint <= vehicleFloorArea * 0.85) {
        // Item fits in current layer
        currentLayer.items.push(item);
        currentLayer.totalWeight += item.stackingAnalysis.totalWeight;
        currentLayer.maxHeight = Math.max(currentLayer.maxHeight, itemHeight);
      } else {
        // Start new layer
        layers.push(currentLayer);
        currentLayerHeight += currentLayer.maxHeight;
        currentLayer = this.createNewLayer(currentLayerHeight, layers.length);
        currentLayer.items.push(item);
        currentLayer.totalWeight = item.stackingAnalysis.totalWeight;
        currentLayer.maxHeight = itemHeight;
      }

      // Check stacking compatibility with items in layer below
      if (layers.length > 0) {
        const belowLayer = layers[layers.length - 1];
        for (const belowItem of belowLayer.items) {
          const compatibility = checkStackingCompatibility(item, belowItem);
          if (!compatibility.canStack) {
            currentLayer.warnings.push({
              type: 'stacking_incompatibility',
              itemId: item.id,
              belowItemId: belowItem.id,
              message: compatibility.reason
            });
          }
        }
      }
    }

    // Don't forget the last layer
    if (currentLayer.items.length > 0) {
      layers.push(currentLayer);
    }

    return layers;
  }

  /**
   * Create a new layer object
   */
  createNewLayer(startHeight, layerIndex) {
    return {
      index: layerIndex,
      startHeight: startHeight,
      maxHeight: 0,
      items: [],
      totalWeight: 0,
      avgFragility: 0,
      warnings: [],
      overflow: []
    };
  }

  /**
   * Optimize layer arrangement
   */
  optimizeLayers(layers) {
    return layers.map((layer, index) => {
      // Calculate average fragility for the layer
      if (layer.items.length > 0) {
        layer.avgFragility = layer.items.reduce(
          (sum, item) => sum + item.stackingAnalysis.fragility.score,
          0
        ) / layer.items.length;
      }

      // Check layer weight limits
      if (layer.totalWeight > LAYER_CONFIG.MAX_WEIGHT_PER_LAYER) {
        layer.warnings.push({
          type: 'weight_exceeded',
          message: `Layer ${index + 1} weight (${layer.totalWeight}kg) exceeds recommended limit`
        });
      }

      // Check fragility progression (higher layers should have higher fragility)
      if (index > 0) {
        const prevLayer = layers[index - 1];
        if (layer.avgFragility < prevLayer.avgFragility - 0.5) {
          layer.warnings.push({
            type: 'fragility_order',
            message: `Layer ${index + 1} has lower fragility than layer below - consider reordering`
          });
        }
      }

      // Optimize item placement within layer for balance
      layer.items = this.optimizeLayerBalance(layer.items);

      // Generate layer summary
      layer.summary = {
        itemCount: layer.items.length,
        weightRange: {
          min: Math.min(...layer.items.map(i => i.stackingAnalysis.totalWeight)),
          max: Math.max(...layer.items.map(i => i.stackingAnalysis.totalWeight))
        },
        fragilityRange: {
          min: Math.min(...layer.items.map(i => i.stackingAnalysis.fragility.score)),
          max: Math.max(...layer.items.map(i => i.stackingAnalysis.fragility.score))
        }
      };

      return layer;
    });
  }

  /**
   * Optimize item placement within a layer for balance
   */
  optimizeLayerBalance(items) {
    if (items.length <= 1) return items;

    // Sort items by weight for balanced placement
    const sortedByWeight = [...items].sort(
      (a, b) => b.stackingAnalysis.totalWeight - a.stackingAnalysis.totalWeight
    );

    // Alternate heavy items left and right for balance
    const balanced = [];
    let leftSide = true;

    sortedByWeight.forEach(item => {
      if (leftSide) {
        balanced.push(item);
      } else {
        balanced.unshift(item);
      }
      leftSide = !leftSide;
    });

    return balanced;
  }

  /**
   * Generate the stacking sequence (loading order)
   */
  generateStackingSequence(layers) {
    const sequence = [];
    let loadingOrder = 1;

    // Process layers from bottom to top
    layers.forEach((layer, layerIndex) => {
      layer.items.forEach((item, itemIndex) => {
        sequence.push({
          loadingOrder: loadingOrder++,
          itemId: item.id,
          seller: item.seller,
          quantity: item.quantity || 1,
          layer: layerIndex + 1,
          positionInLayer: itemIndex + 1,
          fragility: item.stackingAnalysis.fragility,
          weight: item.stackingAnalysis.totalWeight,
          instructions: this.generateLoadingInstructions(item, layerIndex, layer),
          warnings: this.getItemWarnings(item, layer)
        });
      });
    });

    return sequence;
  }

  /**
   * Generate loading instructions for an item
   */
  generateLoadingInstructions(item, layerIndex, layer) {
    const instructions = [];
    const analysis = item.stackingAnalysis;

    // Position instruction
    if (layerIndex === 0) {
      instructions.push('Place on vehicle floor');
    } else {
      instructions.push(`Stack on layer ${layerIndex}`);
    }

    // Fragility instructions
    if (analysis.fragility.score >= 4) {
      instructions.push('⚠️ FRAGILE - Handle with care');
    }
    if (analysis.fragility.score === 5) {
      instructions.push('⛔ Do NOT place any items on top');
    }

    // Packaging instructions
    if (item.packagingType === 'glass_carton') {
      instructions.push('Keep upright - Glass contents');
    }
    if (item.orientation === 'vertical') {
      instructions.push('Maintain vertical orientation');
    }

    // Special handling
    if (item.specialHandling && item.specialHandling.length > 0) {
      instructions.push(...item.specialHandling);
    }

    return instructions;
  }

  /**
   * Get warnings for an item
   */
  getItemWarnings(item, layer) {
    const warnings = [];
    const analysis = item.stackingAnalysis;

    // Check if fragile item is in a low layer
    if (analysis.fragility.score >= 4 && layer.index < 1) {
      warnings.push('Fragile item placed in lower layer - ensure nothing heavy is stacked above');
    }

    // Check load bearing
    if (analysis.loadBearingCapacity < 20 && layer.items.length > 1) {
      warnings.push(`Limited load bearing (${analysis.loadBearingCapacity}kg) - careful stacking required`);
    }

    return warnings;
  }

  /**
   * Analyze overall stability of the stacking plan
   */
  analyzeStability(layers) {
    const analysis = {
      overallScore: 100,
      weightDistribution: this.analyzeWeightDistribution(layers),
      fragilityProgression: this.analyzeFragilityProgression(layers),
      stackingCompatibility: this.analyzeStackingCompatibility(layers),
      centerOfGravity: this.estimateCenterOfGravity(layers),
      warnings: [],
      recommendations: []
    };

    // Calculate overall score
    let deductions = 0;

    // Weight distribution issues
    if (analysis.weightDistribution.score < 70) {
      deductions += (70 - analysis.weightDistribution.score) / 2;
      analysis.warnings.push('Weight distribution could be improved');
    }

    // Fragility progression issues
    if (analysis.fragilityProgression.score < 80) {
      deductions += (80 - analysis.fragilityProgression.score) / 3;
      analysis.warnings.push('Fragile items should be placed higher');
    }

    // Stacking compatibility issues
    if (analysis.stackingCompatibility.issues.length > 0) {
      deductions += analysis.stackingCompatibility.issues.length * 5;
      analysis.warnings.push(`${analysis.stackingCompatibility.issues.length} stacking compatibility issues found`);
    }

    // Center of gravity issues
    if (analysis.centerOfGravity.offset > 0.2) {
      deductions += analysis.centerOfGravity.offset * 20;
      analysis.warnings.push('Load is not well-balanced');
      analysis.recommendations.push('Redistribute heavy items for better balance');
    }

    analysis.overallScore = Math.max(0, 100 - deductions);
    analysis.rating = this.getStabilityRating(analysis.overallScore);

    return analysis;
  }

  /**
   * Analyze weight distribution across layers
   */
  analyzeWeightDistribution(layers) {
    if (layers.length === 0) return { score: 100, details: 'No items' };

    const weights = layers.map(l => l.totalWeight);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    // Ideal: heavier layers at bottom
    let properOrder = true;
    for (let i = 1; i < weights.length; i++) {
      if (weights[i] > weights[i - 1] * 1.2) {
        properOrder = false;
        break;
      }
    }

    const score = properOrder ? 100 : 60;

    return {
      score,
      totalWeight,
      layerWeights: weights,
      isProperlyDistributed: properOrder,
      details: properOrder 
        ? 'Weight properly distributed (heavier at bottom)'
        : 'Consider redistributing - some upper layers are heavier'
    };
  }

  /**
   * Analyze fragility progression across layers
   */
  analyzeFragilityProgression(layers) {
    if (layers.length === 0) return { score: 100, details: 'No items' };

    const avgFragilities = layers.map(l => l.avgFragility);
    
    // Ideal: higher fragility items in higher layers
    let properProgression = true;
    for (let i = 1; i < avgFragilities.length; i++) {
      if (avgFragilities[i] < avgFragilities[i - 1] - 0.5) {
        properProgression = false;
        break;
      }
    }

    const score = properProgression ? 100 : 65;

    return {
      score,
      layerFragilities: avgFragilities,
      isProperProgression: properProgression,
      details: properProgression
        ? 'Fragility properly progresses (fragile items on top)'
        : 'Some fragile items are lower than robust items'
    };
  }

  /**
   * Analyze stacking compatibility between layers
   */
  analyzeStackingCompatibility(layers) {
    const issues = [];

    for (let i = 1; i < layers.length; i++) {
      const upperLayer = layers[i];
      const lowerLayer = layers[i - 1];

      for (const upperItem of upperLayer.items) {
        for (const lowerItem of lowerLayer.items) {
          const fragCompatibility = checkStackingCompatibility(upperItem, lowerItem);
          if (!fragCompatibility.canStack) {
            issues.push({
              type: 'fragility',
              upperItem: upperItem.id,
              lowerItem: lowerItem.id,
              message: fragCompatibility.reason
            });
          }

          const packCompatibility = checkPackagingCompatibility(
            upperItem.packagingType || 'corrugated_box',
            lowerItem.packagingType || 'corrugated_box'
          );
          if (!packCompatibility.compatible) {
            issues.push({
              type: 'packaging',
              upperItem: upperItem.id,
              lowerItem: lowerItem.id,
              message: packCompatibility.reason
            });
          }
        }
      }
    }

    return {
      score: Math.max(0, 100 - issues.length * 10),
      issues,
      isFullyCompatible: issues.length === 0
    };
  }

  /**
   * Estimate center of gravity
   */
  estimateCenterOfGravity(layers) {
    let totalWeight = 0;
    let weightedHeight = 0;

    layers.forEach(layer => {
      const layerCenterHeight = layer.startHeight + layer.maxHeight / 2;
      totalWeight += layer.totalWeight;
      weightedHeight += layer.totalWeight * layerCenterHeight;
    });

    if (totalWeight === 0) {
      return { height: 0, offset: 0, isStable: true };
    }

    const cogHeight = weightedHeight / totalWeight;
    const vehicleHeight = this.vehicle.dimensions.height;
    const idealCogHeight = vehicleHeight * 0.35; // Ideal COG at 35% of height

    const offset = Math.abs(cogHeight - idealCogHeight) / vehicleHeight;

    return {
      height: cogHeight,
      offset,
      isStable: offset < 0.15,
      details: offset < 0.1 
        ? 'Center of gravity is well-positioned'
        : offset < 0.2
          ? 'Center of gravity is acceptable'
          : 'Center of gravity is high - consider redistributing'
    };
  }

  /**
   * Get stability rating
   * Note: icon field is kept for backward compatibility but should use Lucide icons in components
   */
  getStabilityRating(score) {
    // Colors match Tailwind: green-500, lime-500, yellow-500, red-500
    if (score >= 90) return { label: 'Excellent', color: '#22c55e', iconName: 'CheckCircle' };
    if (score >= 75) return { label: 'Good', color: '#84cc16', iconName: 'ThumbsUp' };
    if (score >= 60) return { label: 'Fair', color: '#eab308', iconName: 'AlertTriangle' };
    return { label: 'Poor', color: '#ef4444', iconName: 'XCircle' };
  }

  /**
   * Generate summary of the stacking plan
   */
  generateSummary(layers, stability) {
    const totalItems = layers.reduce((sum, l) => sum + l.items.length, 0);
    const totalWeight = layers.reduce((sum, l) => sum + l.totalWeight, 0);
    const totalWarnings = layers.reduce((sum, l) => sum + l.warnings.length, 0);
    const overflowItems = layers.reduce((sum, l) => sum + l.overflow.length, 0);

    return {
      totalLayers: layers.length,
      totalItems,
      totalWeight,
      stabilityScore: stability.overallScore,
      stabilityRating: stability.rating,
      warningCount: totalWarnings + stability.warnings.length,
      overflowItems,
      maxHeight: layers.reduce((max, l) => Math.max(max, l.startHeight + l.maxHeight), 0),
      utilizationEstimate: (totalItems / (layers.length * 10)) * 100 // Rough estimate
    };
  }

  /**
   * Generate visualization data for UI rendering
   */
  generateVisualizationData(layers) {
    return layers.map((layer, index) => ({
      layerIndex: index,
      layerLabel: `Layer ${index + 1}`,
      height: layer.startHeight,
      maxHeight: layer.maxHeight,
      items: layer.items.map(item => ({
        id: item.id,
        name: item.seller || item.id,
        quantity: item.quantity || 1,
        weight: item.stackingAnalysis.totalWeight,
        fragility: {
          score: item.stackingAnalysis.fragility.score,
          label: item.stackingAnalysis.fragility.label,
          color: item.stackingAnalysis.fragility.color
        },
        dimensions: item.stackingAnalysis.dimensions,
        packagingIcon: item.stackingAnalysis.packaging.icon
      })),
      stats: {
        itemCount: layer.items.length,
        totalWeight: layer.totalWeight,
        avgFragility: layer.avgFragility.toFixed(1)
      },
      warnings: layer.warnings,
      color: this.getLayerColor(layer.avgFragility)
    }));
  }

  /**
   * Get layer color based on average fragility
   */
  getLayerColor(avgFragility) {
    // Colors match Tailwind: red-50, yellow-50, lime-50, green-50
    if (avgFragility >= 4) return '#fee2e2'; // red-50 - Red tint for fragile
    if (avgFragility >= 3) return '#fef9c3'; // yellow-50 - Yellow tint for moderate
    if (avgFragility >= 2) return '#ecfccb'; // lime-50 - Light green for durable
    return '#dcfce7'; // green-50 - Green for robust
  }

  // Helper methods

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
      length: item.dimensions?.length || 400,
      width: item.dimensions?.width || 300,
      height: item.dimensions?.height || 200
    };
  }
}

/**
 * Quick function to generate stacking plan
 */
export const generateStackingPlan = (items, vehicleSpecs, options = {}) => {
  const optimizer = new StackingOptimizer(vehicleSpecs, options);
  return optimizer.generateStackingPlan(items);
};

export default StackingOptimizer;



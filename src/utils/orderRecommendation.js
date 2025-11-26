import { assessOrderFragility } from './fragilityScoring.js';
import { getPackagingType } from './packagingTypes.js';

/**
 * Score and rank unplanned orders for recommendation
 * @param {Array} unplannedOrders - Orders available to add
 * @param {Array} selectedOrders - Currently selected orders
 * @param {Object} currentUtilization - Current weight/volume utilization
 * @param {Object} vehicleSpecs - Selected vehicle specifications
 * @returns {Array} Scored and sorted orders with recommendation data
 */
export const scoreUnplannedOrders = (
    unplannedOrders,
    selectedOrders,
    currentUtilization,
    vehicleSpecs
) => {
    if (!unplannedOrders || unplannedOrders.length === 0) return [];
    if (!vehicleSpecs) return unplannedOrders.map(order => ({ ...order, score: 0 }));

    // Calculate remaining capacity
    const remainingWeightCapacity = vehicleSpecs.maxWeight * (100 - (currentUtilization.weightUtilization || currentUtilization.weight || 0)) / 100;
    const remainingVolumeCapacity = vehicleSpecs.volume * (100 - (currentUtilization.volumeUtilization || currentUtilization.volume || 0)) / 100;

    // Analyze existing fragility profile
    const existingFragilityScores = selectedOrders.map(o => assessOrderFragility(o).score);
    const avgFragility = existingFragilityScores.length > 0
        ? existingFragilityScores.reduce((a, b) => a + b, 0) / existingFragilityScores.length
        : 3;
    const maxFragility = existingFragilityScores.length > 0
        ? Math.max(...existingFragilityScores)
        : 5;

    // Score each unplanned order
    const scoredOrders = unplannedOrders.map(order => {
        const orderWeight = order.weight * (order.quantity || 1);
        const orderVolume = calculateOrderVolume(order);
        const orderFragility = assessOrderFragility(order);
        const orderPackaging = getPackagingType(order.packagingType || 'corrugated_box');

        // 1. Capacity Fit Score (0-100)
        // Perfect if fills 70-90% of remaining capacity
        const weightFitRatio = orderWeight / remainingWeightCapacity;
        const volumeFitRatio = orderVolume / remainingVolumeCapacity;

        const capacityFitScore = calculateCapacityFitScore(weightFitRatio, volumeFitRatio);

        // 2. Fragility Compatibility Score (0-100)
        const fragilityScore = calculateFragilityCompatibilityScore(
            orderFragility.score,
            avgFragility,
            maxFragility
        );

        // 3. Cost Efficiency Score (0-100)
        // Lower weight-to-cost ratio is better
        const costPerKg = order.weight > 0 ? (order.value || 0) / order.weight : 0;
        const costEfficiencyScore = calculateCostEfficiencyScore(costPerKg);

        // 4. Packaging Compatibility Score (0-100)
        const packagingScore = calculatePackagingCompatibilityScore(
            orderPackaging,
            selectedOrders
        );

        // 5. Size Consistency Score (0-100)
        const sizeConsistencyScore = calculateSizeConsistencyScore(order, selectedOrders);

        // Calculate weighted total score
        const weights = {
            capacityFit: 0.35,      // 35% - Most important
            fragility: 0.25,        // 25% - Safety critical
            costEfficiency: 0.15,   // 15% - Economic factor
            packaging: 0.15,        // 15% - Operational efficiency
            sizeConsistency: 0.10   // 10% - Loading optimization
        };

        const totalScore =
            capacityFitScore * weights.capacityFit +
            fragilityScore * weights.fragility +
            costEfficiencyScore * weights.costEfficiency +
            packagingScore * weights.packaging +
            sizeConsistencyScore * weights.sizeConsistency;

        // Determine recommendation quality
        const quality = getRecommendationQuality(totalScore);

        return {
            ...order,
            recommendation: {
                totalScore: Math.round(totalScore),
                quality,
                breakdown: {
                    capacityFit: Math.round(capacityFitScore),
                    fragility: Math.round(fragilityScore),
                    costEfficiency: Math.round(costEfficiencyScore),
                    packaging: Math.round(packagingScore),
                    sizeConsistency: Math.round(sizeConsistencyScore)
                },
                metrics: {
                    weightFit: Math.round(weightFitRatio * 100),
                    volumeFit: Math.round(volumeFitRatio * 100),
                    fragilityLevel: orderFragility.level,
                    costPerKg: costPerKg.toFixed(2)
                },
                canFit: weightFitRatio <= 1 && volumeFitRatio <= 1,
                reasons: generateRecommendationReasons(
                    capacityFitScore,
                    fragilityScore,
                    costEfficiencyScore,
                    packagingScore,
                    order,
                    orderFragility
                )
            }
        };
    });

    // Sort by score (highest first)
    return scoredOrders.sort((a, b) => b.recommendation.totalScore - a.recommendation.totalScore);
};

// Helper functions
const calculateOrderVolume = (order) => {
    if (order.materialType === 'cuboidal' && order.dimensions) {
        return (order.dimensions.length * order.dimensions.width * order.dimensions.height) / 1e9 * (order.quantity || 1);
    } else if (order.materialType === 'cylindrical' && order.dimensions) {
        const r = (order.dimensions.diameter || 0) / 2000;
        const h = (order.dimensions.height || 0) / 1000;
        return Math.PI * r * r * h * (order.quantity || 1);
    }
    return 0;
};

const calculateCapacityFitScore = (weightRatio, volumeRatio) => {
    // Can't fit at all
    if (weightRatio > 1 || volumeRatio > 1) return 0;

    // Perfect fit: 70-90% utilization
    const maxRatio = Math.max(weightRatio, volumeRatio);

    if (maxRatio >= 0.7 && maxRatio <= 0.9) {
        return 100;
    } else if (maxRatio >= 0.5 && maxRatio < 0.7) {
        // Good fit: 50-70%
        return 70 + (maxRatio - 0.5) * 150; // 70-100
    } else if (maxRatio >= 0.9 && maxRatio <= 1.0) {
        // Tight fit: 90-100%
        return 100 - (maxRatio - 0.9) * 200; // 80-100
    } else {
        // Too small: <50%
        return maxRatio * 100; // 0-50
    }
};

const calculateFragilityCompatibilityScore = (orderFragility, avgFragility, maxFragility) => {
    // Lower or equal fragility is better
    if (orderFragility <= avgFragility) {
        return 100;
    } else if (orderFragility === maxFragility) {
        return 70; // Same as highest existing
    } else if (orderFragility > maxFragility) {
        // Adding more fragile items
        const diff = orderFragility - avgFragility;
        return Math.max(0, 100 - diff * 20);
    }
    return 80;
};

const calculateCostEfficiencyScore = (costPerKg) => {
    // Lower cost per kg is better (more efficient use of capacity)
    // Normalize: 0-100 rupees per kg
    if (costPerKg === 0) return 50; // Neutral if no value

    const normalizedCost = Math.min(costPerKg / 100, 1);
    return Math.round((1 - normalizedCost) * 100);
};

const calculatePackagingCompatibilityScore = (orderPackaging, selectedOrders) => {
    if (selectedOrders.length === 0) return 100;

    // Check if packaging type matches existing orders
    const existingPackaging = selectedOrders.map(o => o.packagingType || 'corrugated_box');
    const matchCount = existingPackaging.filter(p => p === orderPackaging.id).length;

    if (matchCount > 0) {
        return 100; // Same packaging type exists
    }

    // Check stackability
    if (orderPackaging.stackability?.canBeStacked && orderPackaging.stackability?.canStackOn) {
        return 80;
    }

    return 60;
};

const calculateSizeConsistencyScore = (order, selectedOrders) => {
    if (selectedOrders.length === 0) return 100;

    const orderWeight = order.weight * (order.quantity || 1);
    const avgWeight = selectedOrders.reduce((sum, o) => sum + (o.weight * (o.quantity || 1)), 0) / selectedOrders.length;

    const weightRatio = orderWeight / avgWeight;

    // Similar size is better (0.7x - 1.3x)
    if (weightRatio >= 0.7 && weightRatio <= 1.3) {
        return 100;
    } else if (weightRatio >= 0.5 && weightRatio <= 1.5) {
        return 80;
    } else {
        return 60;
    }
};

const getRecommendationQuality = (score) => {
    if (score >= 85) {
        return {
            label: 'Excellent Fit',
            color: '#22c55e',
            icon: 'CheckCircle'
        };
    } else if (score >= 70) {
        return {
            label: 'Good Fit',
            color: '#84cc16',
            icon: 'ThumbsUp'
        };
    } else if (score >= 50) {
        return {
            label: 'Fair Fit',
            color: '#eab308',
            icon: 'Info'
        };
    } else {
        return {
            label: 'Poor Fit',
            color: '#ef4444',
            icon: 'AlertTriangle'
        };
    }
};

const generateRecommendationReasons = (
    capacityScore,
    fragilityScore,
    costScore,
    packagingScore,
    order,
    fragility
) => {
    const reasons = [];

    if (capacityScore >= 80) {
        reasons.push('Optimal capacity utilization');
    }
    if (fragilityScore >= 90) {
        reasons.push('Compatible fragility level');
    }
    if (costScore >= 80) {
        reasons.push('Cost-efficient addition');
    }
    if (packagingScore >= 90) {
        reasons.push('Matching packaging type');
    }
    if (fragility.score <= 2) {
        reasons.push('Durable item - easy to handle');
    }

    if (reasons.length === 0) {
        reasons.push('Can fit in remaining capacity');
    }

    return reasons;
};

/**
 * Breakage Risk Calculation Utility
 * Calculates dynamic breakage risk based on fragility, packaging, and material properties
 */

import { PACKAGING_TYPES } from './packagingTypes';
import { FRAGILITY_DESCRIPTIONS } from './fragilityScoring';

/**
 * Calculate breakage risk percentage based on fragility and packaging
 * @param {number} fragilityScore - Fragility score (1-5)
 * @param {string} packagingType - Packaging type ID
 * @param {Object} options - Additional options
 * @returns {number} - Breakage risk percentage (0-100)
 */
export const calculateBreakageRisk = (fragilityScore, packagingType = 'corrugated_box', options = {}) => {
    // Base risk from fragility (higher fragility = higher base risk)
    const baseRiskMap = {
        1: 5,   // Robust: 5% base risk
        2: 15,  // Durable: 15% base risk
        3: 35,  // Moderate: 35% base risk
        4: 60,  // Fragile: 60% base risk
        5: 85   // Extremely Fragile: 85% base risk
    };

    const baseRisk = baseRiskMap[fragilityScore] || 35;

    // Get packaging protection level
    const packaging = PACKAGING_TYPES[packagingType.toUpperCase()] ||
        Object.values(PACKAGING_TYPES).find(p => p.id === packagingType) ||
        PACKAGING_TYPES.CORRUGATED_BOX;

    // Calculate protection factor (average of crush and shock protection)
    const protectionLevel = (packaging.protection.crush + packaging.protection.shock) / 2;

    // Protection reduces risk (5 = best protection, 1 = minimal protection)
    // Protection factor: 0.2 to 1.0 (higher protection = lower multiplier)
    const protectionFactor = 1 - ((protectionLevel - 1) / 4) * 0.6; // Maps 1-5 to 1.0-0.4

    // Calculate final risk
    let finalRisk = baseRisk * protectionFactor;

    // Apply additional modifiers
    if (options.routeRisk === 'High') {
        finalRisk *= 1.15; // 15% increase for high-risk routes
    } else if (options.routeRisk === 'Low') {
        finalRisk *= 0.9; // 10% decrease for low-risk routes
    }

    // Handle special cases
    if (fragilityScore === 5 && protectionLevel >= 4) {
        // Even extremely fragile items benefit significantly from good packaging
        finalRisk = Math.max(finalRisk, 25); // Cap at 25% minimum for extremely fragile with good packaging
    }

    // Clamp between 0 and 100
    return Math.round(Math.max(0, Math.min(100, finalRisk)));
};

/**
 * Get packaging recommendations sorted by risk reduction
 * @param {number} fragilityScore - Current fragility score
 * @param {string} currentPackaging - Current packaging type
 * @param {Object} options - Additional options
 * @returns {Array} - Array of recommendations with risk calculations
 */
export const getPackagingRecommendations = (fragilityScore, currentPackaging, options = {}) => {
    const currentRisk = calculateBreakageRisk(fragilityScore, currentPackaging, options);

    const recommendations = [];

    // Evaluate all packaging types
    Object.values(PACKAGING_TYPES).forEach(packaging => {
        if (packaging.id === currentPackaging) return; // Skip current packaging

        const projectedRisk = calculateBreakageRisk(fragilityScore, packaging.id, options);
        const riskReduction = currentRisk - projectedRisk;
        const improvementPercent = currentRisk > 0 ? Math.round((riskReduction / currentRisk) * 100) : 0;

        // Calculate suitability score (0-100)
        const protectionScore = ((packaging.protection.crush + packaging.protection.shock) / 2) * 20; // 0-100
        const costFactor = (1 / packaging.costFactor) * 20; // Lower cost = higher score
        const suitabilityScore = Math.round(
            protectionScore * 0.7 + // 70% weight on protection
            costFactor * 0.2 +      // 20% weight on cost
            (riskReduction > 0 ? 10 : 0) // 10% bonus if it reduces risk
        );

        recommendations.push({
            packaging,
            currentRisk,
            projectedRisk,
            riskReduction,
            improvementPercent,
            suitabilityScore,
            isBetter: riskReduction > 0
        });
    });

    // Sort by risk reduction (best first)
    return recommendations
        .filter(r => r.isBetter) // Only show improvements
        .sort((a, b) => b.riskReduction - a.riskReduction)
        .slice(0, 5); // Top 5 recommendations
};

/**
 * Get risk level category
 * @param {number} riskPercent - Risk percentage
 * @returns {Object} - Risk level info
 */
export const getRiskLevel = (riskPercent) => {
    if (riskPercent < 20) {
        return { level: 'low', label: 'Low Risk', color: '#22c55e', bgColor: '#dcfce7' };
    } else if (riskPercent < 40) {
        return { level: 'moderate', label: 'Moderate Risk', color: '#eab308', bgColor: '#fef9c3' };
    } else if (riskPercent < 70) {
        return { level: 'high', label: 'High Risk', color: '#f97316', bgColor: '#ffedd5' };
    } else {
        return { level: 'critical', label: 'Critical Risk', color: '#ef4444', bgColor: '#fee2e2' };
    }
};

/**
 * Calculate risk for an order object
 * @param {Object} order - Order object
 * @returns {number} - Breakage risk percentage
 */
export const calculateOrderBreakageRisk = (order) => {
    return calculateBreakageRisk(
        order.fragilityScore || 3,
        order.packagingType || 'corrugated_box',
        {
            routeRisk: order.routeRiskLevel
        }
    );
};

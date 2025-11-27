/**
 * Vehicle Recommendation Service
 * AI-powered vehicle selection based on cargo characteristics, fragility, and requirements
 */

import { assessOrderFragility, FRAGILITY_LEVELS } from '../utils/fragilityScoring.js';
import { calculateOrderTotals, groupOrdersByRoute } from '../utils/vehicleOptimization.js';
import { getRouteDistance, calculateMultiCityRouteDistance } from './routeDistanceService.js';

/**
 * Vehicle scoring weights for different criteria
 */
const SCORING_WEIGHTS = {
  CAPACITY_FIT: 0.25,        // How well the cargo fits the vehicle capacity
  FRAGILITY_MATCH: 0.25,     // How well the vehicle handles fragile goods
  COST_EFFICIENCY: 0.20,     // Cost per unit of cargo
  SECURITY_FEATURES: 0.15,   // Load securing and protection features
  SPECIAL_REQUIREMENTS: 0.15 // Temperature control, hazmat, etc.
};

/**
 * Vehicle Recommendation Engine
 */
export class VehicleRecommendationEngine {
  constructor(vehicleTypes) {
    this.vehicleTypes = vehicleTypes;
  }

  /**
   * Generate vehicle recommendations for a set of orders
   * @param {Array} orders - Array of orders to analyze
   * @param {Object} options - Recommendation options
   * @returns {Array} - Ranked vehicle recommendations
   */
  generateRecommendations(orders, options = {}) {
    if (!orders || orders.length === 0) {
      return [];
    }

    // Analyze cargo profile
    const cargoProfile = this.analyzeCargoProfile(orders);

    // Score each vehicle type
    const vehicleScores = this.vehicleTypes.map(vehicle => {
      const scores = this.scoreVehicle(vehicle, cargoProfile, options);
      return {
        vehicle,
        scores,
        totalScore: this.calculateTotalScore(scores, options),
        recommendation: this.generateRecommendationDetails(vehicle, scores, cargoProfile)
      };
    });

    // Sort by total score (descending) and filter viable options
    const viableRecommendations = vehicleScores
      .filter(vs => vs.totalScore > 30) // Minimum viability threshold
      .sort((a, b) => b.totalScore - a.totalScore);

    // Enhance top recommendations with detailed reasoning
    return viableRecommendations.map((rec, index) => ({
      ...rec,
      rank: index + 1,
      isTopChoice: index === 0,
      vehicleCount: this.calculateRequiredVehicles(rec.vehicle, cargoProfile),
      estimatedCost: this.calculateEstimatedCost(rec.vehicle, cargoProfile),
      matchQuality: this.getMatchQuality(rec.totalScore)
    }));
  }

  /**
   * Analyze the cargo profile from orders
   */
  analyzeCargoProfile(orders) {
    const fragilityScores = orders.map(order => {
      const assessment = assessOrderFragility(order);
      return assessment.score;
    });

    const { totalWeight, totalVolume } = calculateOrderTotals(orders);

    // Analyze fragility distribution
    const fragilityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    fragilityScores.forEach(score => {
      fragilityCounts[score] = (fragilityCounts[score] || 0) + 1;
    });

    const avgFragility = fragilityScores.reduce((a, b) => a + b, 0) / fragilityScores.length;
    const maxFragility = Math.max(...fragilityScores);
    const hasExtremelyFragile = fragilityScores.includes(5);
    const hasFragile = fragilityScores.some(s => s >= 4);

    // Analyze special requirements
    const requiresTemperatureControl = orders.some(o => o.temperatureControlled);
    const hasHazardous = orders.some(o => o.hazardous);
    const requiresPremiumHandling = hasExtremelyFragile || avgFragility >= 4;

    // Analyze material types
    const materialProfiles = orders.map(o => o.materialProfile || 'GENERAL');
    const uniqueProfiles = [...new Set(materialProfiles)];

    // Get packaging types
    const packagingTypes = orders.map(o => o.packagingType || 'corrugated_box');
    const uniquePackaging = [...new Set(packagingTypes)];

    // Calculate actual estimated distance based on routes in orders
    const ordersByRoute = groupOrdersByRoute(orders);
    const routeIds = Object.keys(ordersByRoute);
    let estimatedDistance = 0;

    if (routeIds.length > 0) {
      // Calculate total distance across all routes
      routeIds.forEach(routeId => {
        const dist = getRouteDistance(routeId);
        estimatedDistance += dist || 1000; // Fallback only for unknown routes
      });
      // Average if multiple routes (assuming parallel delivery)
      // or use max if sequential
      estimatedDistance = Math.max(...routeIds.map(r => getRouteDistance(r) || 1000));
    } else {
      estimatedDistance = 1000; // Fallback for orders without route info
    }

    return {
      orderCount: orders.length,
      totalWeight,
      totalVolume,
      fragility: {
        average: avgFragility,
        max: maxFragility,
        distribution: fragilityCounts,
        hasExtremelyFragile,
        hasFragile
      },
      requirements: {
        temperatureControl: requiresTemperatureControl,
        hazardous: hasHazardous,
        premiumHandling: requiresPremiumHandling
      },
      materials: uniqueProfiles,
      packaging: uniquePackaging,
      estimatedDistance: estimatedDistance,
      routeCount: routeIds.length
    };
  }

  /**
   * Score a vehicle against the cargo profile
   */
  scoreVehicle(vehicle, cargoProfile, options = {}) {
    const scores = {
      capacityFit: this.scoreCapacityFit(vehicle, cargoProfile),
      fragilityMatch: this.scoreFragilityMatch(vehicle, cargoProfile),
      costEfficiency: this.scoreCostEfficiency(vehicle, cargoProfile),
      securityFeatures: this.scoreSecurityFeatures(vehicle, cargoProfile),
      specialRequirements: this.scoreSpecialRequirements(vehicle, cargoProfile)
    };

    return scores;
  }

  /**
   * Score how well cargo fits the vehicle capacity
   */
  scoreCapacityFit(vehicle, cargoProfile) {
    const weightUtilization = (cargoProfile.totalWeight / vehicle.maxWeight) * 100;
    const volumeUtilization = (cargoProfile.totalVolume / vehicle.volume) * 100;
    const maxUtilization = Math.max(weightUtilization, volumeUtilization);

    // Ideal utilization is 70-90%
    if (maxUtilization > 100) {
      // Over capacity - need multiple vehicles
      const vehiclesNeeded = Math.ceil(maxUtilization / 85);
      const adjustedUtilization = maxUtilization / vehiclesNeeded;
      return Math.max(0, 60 - (vehiclesNeeded - 1) * 10 + (adjustedUtilization * 0.3));
    }

    if (maxUtilization >= 70 && maxUtilization <= 90) {
      return 100; // Optimal fit
    }

    if (maxUtilization > 90) {
      return 100 - (maxUtilization - 90) * 2; // Slightly too full
    }

    // Under-utilized
    return Math.max(30, maxUtilization + 10);
  }

  /**
   * Score how well vehicle handles fragile cargo
   */
  scoreFragilityMatch(vehicle, cargoProfile) {
    const avgFragility = cargoProfile.fragility.average;
    const suspensionQuality = vehicle.suspensionQuality || 3;
    const shockAbsorption = vehicle.shockAbsorption || 3;

    // For fragile cargo, need high suspension and shock absorption
    if (avgFragility >= 4) {
      // Highly fragile cargo needs premium vehicles
      if (suspensionQuality >= 4 && shockAbsorption >= 4) {
        return 100;
      }
      if (suspensionQuality >= 3) {
        return 70 - (avgFragility - 4) * 20;
      }
      return 30; // Poor match for fragile goods
    }

    if (avgFragility >= 3) {
      // Moderate fragility
      if (suspensionQuality >= 3) {
        return 90;
      }
      return 60;
    }

    // Robust cargo - any vehicle works
    return 80 + suspensionQuality * 4;
  }

  /**
   * Score cost efficiency
   */
  scoreCostEfficiency(vehicle, cargoProfile) {
    const estimatedDistance = cargoProfile.estimatedDistance;
    const totalCost = vehicle.costPerKm * estimatedDistance;

    // Calculate cost per kg
    const costPerKg = totalCost / Math.max(cargoProfile.totalWeight, 100);

    // Lower cost per kg is better
    // Assuming baseline of 50 INR/kg as expensive
    const efficiency = Math.max(0, 100 - (costPerKg - 10) * 5);

    // Adjust for premium features (worth the extra cost for fragile goods)
    if (cargoProfile.fragility.hasExtremelyFragile && vehicle.suspensionQuality >= 4) {
      return Math.min(100, efficiency + 20);
    }

    return Math.min(100, efficiency);
  }

  /**
   * Score vehicle security features
   */
  scoreSecurityFeatures(vehicle, cargoProfile) {
    const loadSecuring = vehicle.loadSecuring || [];
    let score = 40; // Base score

    // Score based on securing options
    if (loadSecuring.includes('straps')) score += 10;
    if (loadSecuring.includes('corner_protectors')) score += 10;
    if (loadSecuring.includes('load_bars')) score += 15;
    if (loadSecuring.includes('lashing_rings')) score += 10;
    if (loadSecuring.includes('air_bags')) score += 15;

    // Bonus for fragile cargo compatibility
    if (cargoProfile.fragility.hasFragile) {
      if (loadSecuring.includes('air_bags') || loadSecuring.includes('load_bars')) {
        score += 10;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Score special requirements match
   */
  scoreSpecialRequirements(vehicle, cargoProfile) {
    let score = 100;
    const requirements = cargoProfile.requirements;

    // Temperature control requirement
    if (requirements.temperatureControl) {
      if (vehicle.climateControl) {
        score = 100;
      } else {
        score = 20; // Major penalty for missing temperature control
      }
    }

    // Hazardous materials
    if (requirements.hazardous) {
      // Check if vehicle is suitable
      if (vehicle.notSuitableFor?.includes('hazmat')) {
        score = Math.min(score, 30);
      }
    }

    // Premium handling requirement
    if (requirements.premiumHandling) {
      if (vehicle.suspensionQuality >= 4) {
        score = Math.min(score, 100);
      } else if (vehicle.suspensionQuality >= 3) {
        score = Math.min(score, 70);
      } else {
        score = Math.min(score, 40);
      }
    }

    // Check suitability lists
    if (vehicle.suitableFor) {
      const matches = cargoProfile.materials.filter(m =>
        vehicle.suitableFor.some(s => m.toLowerCase().includes(s.toLowerCase()))
      );
      if (matches.length > 0) {
        score = Math.min(score + 10, 100);
      }
    }

    if (vehicle.notSuitableFor) {
      const conflicts = cargoProfile.materials.filter(m =>
        vehicle.notSuitableFor.some(s => m.toLowerCase().includes(s.toLowerCase()))
      );
      if (conflicts.length > 0) {
        score = Math.min(score, 50 - conflicts.length * 10);
      }
    }

    return Math.max(0, score);
  }

  /**
   * Calculate total weighted score
   */
  /**
   * Calculate total weighted score
   */
  calculateTotalScore(scores, options = {}) {
    let weights = { ...SCORING_WEIGHTS };

    // Adjust weights based on strategy
    if (options.strategy) {
      switch (options.strategy) {
        case 'cost':
          weights = {
            CAPACITY_FIT: 0.20,
            FRAGILITY_MATCH: 0.10,
            COST_EFFICIENCY: 0.50,
            SECURITY_FEATURES: 0.10,
            SPECIAL_REQUIREMENTS: 0.10
          };
          break;
        case 'fragility':
          weights = {
            CAPACITY_FIT: 0.10,
            FRAGILITY_MATCH: 0.40,
            COST_EFFICIENCY: 0.10,
            SECURITY_FEATURES: 0.30,
            SPECIAL_REQUIREMENTS: 0.10
          };
          break;
        case 'weight':
        case 'volume':
          weights = {
            CAPACITY_FIT: 0.60,
            FRAGILITY_MATCH: 0.10,
            COST_EFFICIENCY: 0.10,
            SECURITY_FEATURES: 0.10,
            SPECIAL_REQUIREMENTS: 0.10
          };
          break;
        default:
          break;
      }
    }

    return (
      scores.capacityFit * weights.CAPACITY_FIT +
      scores.fragilityMatch * weights.FRAGILITY_MATCH +
      scores.costEfficiency * weights.COST_EFFICIENCY +
      scores.securityFeatures * weights.SECURITY_FEATURES +
      scores.specialRequirements * weights.SPECIAL_REQUIREMENTS
    );
  }

  /**
   * Generate detailed recommendation explanation
   */
  generateRecommendationDetails(vehicle, scores, cargoProfile) {
    const reasons = [];
    const warnings = [];
    const features = [];

    // Capacity fit reasoning
    if (scores.capacityFit >= 90) {
      reasons.push('Optimal capacity utilization');
    } else if (scores.capacityFit >= 70) {
      reasons.push('Good capacity match');
    } else if (scores.capacityFit < 50) {
      warnings.push('May require multiple trips or vehicles');
    }

    // Fragility match reasoning
    if (scores.fragilityMatch >= 90) {
      reasons.push('Excellent handling for fragile goods');
      if (vehicle.suspensionQuality >= 4) {
        features.push('Air-ride suspension for minimal vibration');
      }
    } else if (scores.fragilityMatch >= 70) {
      reasons.push('Suitable for your cargo fragility level');
    } else if (scores.fragilityMatch < 50 && cargoProfile.fragility.hasFragile) {
      warnings.push('Limited protection for fragile items');
    }

    // Cost efficiency reasoning
    if (scores.costEfficiency >= 80) {
      reasons.push('Cost-effective for this cargo');
    } else if (scores.costEfficiency < 50) {
      warnings.push('Higher relative transportation cost');
    }

    // Special requirements
    if (vehicle.climateControl) {
      features.push('Temperature-controlled environment');
    }
    if (vehicle.shockAbsorption >= 4) {
      features.push('Enhanced shock absorption');
    }
    if (vehicle.loadSecuring?.includes('air_bags')) {
      features.push('Air bag load securing');
    }

    return {
      summary: this.generateSummary(vehicle, scores, cargoProfile),
      reasons,
      warnings,
      features,
      scoreBreakdown: {
        'Capacity Fit': Math.round(scores.capacityFit),
        'Fragility Match': Math.round(scores.fragilityMatch),
        'Cost Efficiency': Math.round(scores.costEfficiency),
        'Security Features': Math.round(scores.securityFeatures),
        'Special Requirements': Math.round(scores.specialRequirements)
      }
    };
  }

  /**
   * Generate a summary statement
   */
  generateSummary(vehicle, scores, cargoProfile) {
    const totalScore = this.calculateTotalScore(scores);

    if (totalScore >= 85) {
      return `${vehicle.name} is highly recommended for your cargo with excellent overall compatibility.`;
    }
    if (totalScore >= 70) {
      return `${vehicle.name} is a good choice that meets most of your requirements.`;
    }
    if (totalScore >= 50) {
      return `${vehicle.name} can handle your cargo but may not be optimal for all items.`;
    }
    return `${vehicle.name} is not recommended for this cargo profile.`;
  }

  /**
   * Calculate number of vehicles required
   */
  calculateRequiredVehicles(vehicle, cargoProfile) {
    const weightRatio = cargoProfile.totalWeight / vehicle.maxWeight;
    const volumeRatio = cargoProfile.totalVolume / vehicle.volume;
    const maxRatio = Math.max(weightRatio, volumeRatio);

    // Target 85% utilization for optimal loading
    return Math.max(1, Math.ceil(maxRatio / 0.85));
  }

  /**
   * Calculate estimated cost
   */
  calculateEstimatedCost(vehicle, cargoProfile) {
    const vehicleCount = this.calculateRequiredVehicles(vehicle, cargoProfile);
    const distance = cargoProfile.estimatedDistance;
    const baseCost = vehicle.costPerKm * distance * vehicleCount;

    // Add premium for special requirements
    let multiplier = 1.0;
    if (cargoProfile.requirements.temperatureControl && vehicle.climateControl) {
      multiplier *= 1.2;
    }
    if (cargoProfile.requirements.premiumHandling && vehicle.suspensionQuality >= 4) {
      multiplier *= 1.1;
    }

    return Math.round(baseCost * multiplier);
  }

  /**
   * Get match quality label
   */
  getMatchQuality(score) {
    // Colors match Tailwind: green-500, lime-500, yellow-500, red-500
    if (score >= 85) return { label: 'Excellent', color: '#22c55e' };
    if (score >= 70) return { label: 'Good', color: '#84cc16' };
    if (score >= 50) return { label: 'Fair', color: '#eab308' };
    return { label: 'Poor', color: '#ef4444' };
  }
}

/**
 * Quick function to get vehicle recommendations
 */
export const getVehicleRecommendations = (orders, vehicleTypes, options = {}) => {
  const engine = new VehicleRecommendationEngine(vehicleTypes);
  return engine.generateRecommendations(orders, options);
};

/**
 * Get the best vehicle recommendation
 */
export const getBestVehicleRecommendation = (orders, vehicleTypes, options = {}) => {
  const recommendations = getVehicleRecommendations(orders, vehicleTypes, options);
  return recommendations.length > 0 ? recommendations[0] : null;
};

/**
 * Analyze why a vehicle is or isn't suitable
 */
export const analyzeVehicleSuitability = (vehicle, orders) => {
  const engine = new VehicleRecommendationEngine([vehicle]);
  const cargoProfile = engine.analyzeCargoProfile(orders);
  const scores = engine.scoreVehicle(vehicle, cargoProfile);

  return {
    vehicle,
    cargoProfile,
    scores,
    totalScore: engine.calculateTotalScore(scores),
    recommendation: engine.generateRecommendationDetails(vehicle, scores, cargoProfile),
    isSuitable: engine.calculateTotalScore(scores) >= 50
  };
};

export default VehicleRecommendationEngine;


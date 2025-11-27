import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import {
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Building,
  Users,
  Truck
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { manualPlans, calculateKPISummary } from '../data/manualPlans';
// Force refresh
import BreakageDrawer from './BreakageDrawer';
import CostDrawer from './CostDrawer';
import { AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';

const ReportsPage = ({ plans = [], orders = [] }) => {
  const [breakageDrawerOpen, setBreakageDrawerOpen] = useState(false);
  const [costDrawerOpen, setCostDrawerOpen] = useState(false);

  // Use passed plans if available, otherwise fallback to manualPlans
  // This ensures consistency with the Plans page while maintaining the demo data if needed
  const activePlans = (plans && plans.length > 0) ? plans : manualPlans;
  const kpiSummary = useMemo(() => calculateKPISummary(activePlans), [activePlans]);

  const [filters, setFilters] = useState({
    dateRange: 'all',
    plant: 'all',
    planner: 'all',
    vehicleType: 'all',
    mode: 'all'
  });

  // Chart data calculated from plans data
  const chartData = useMemo(() => {
    const totalPlans = plans.length;
    const aiPlans = plans.filter(plan => plan.isAIGenerated).length;

    return {
      dispatchPerformanceTrend: [
        { month: 'Jan', onTime: 91.2, multiDrop: 84.5, planningTime: 5.2 },
        { month: 'Feb', onTime: 92.8, multiDrop: 86.1, planningTime: 4.9 },
        { month: 'Mar', onTime: 93.5, multiDrop: 87.8, planningTime: 4.7 },
        { month: 'Apr', onTime: 94.1, multiDrop: 89.2, planningTime: 4.5 },
        { month: 'May', onTime: 94.8, multiDrop: 90.5, planningTime: 4.3 },
        { month: 'Jun', onTime: 95.2, multiDrop: 91.8, planningTime: 4.1 },
        { month: 'Jul', onTime: 95.6, multiDrop: 92.4, planningTime: 3.9 },
        { month: 'Aug', onTime: 96.1, multiDrop: 93.1, planningTime: 3.8 },
        { month: 'Sep', onTime: 96.5, multiDrop: 93.8, planningTime: 3.7 },
        { month: 'Oct', onTime: 96.8, multiDrop: 94.2, planningTime: 3.6 },
        { month: 'Nov', onTime: 97.1, multiDrop: 94.7, planningTime: 3.5 },
        { month: 'Dec', onTime: 97.5, multiDrop: 95.2, planningTime: 3.4 }
      ],
      utilizationTrends: [
        { month: 'Jan', volume: 94.2, weight: 96.8 },
        { month: 'Feb', volume: 95.1, weight: 97.2 },
        { month: 'Mar', volume: 95.8, weight: 97.5 },
        { month: 'Apr', volume: 96.2, weight: 97.8 },
        { month: 'May', volume: 96.7, weight: 98.1 },
        { month: 'Jun', volume: 97.1, weight: 98.3 },
        { month: 'Jul', volume: 97.4, weight: 98.5 },
        { month: 'Aug', volume: 97.6, weight: 98.7 },
        { month: 'Sep', volume: 97.9, weight: 98.8 },
        { month: 'Oct', volume: 98.1, weight: 98.9 },
        { month: 'Nov', volume: 98.3, weight: 99.1 },
        { month: 'Dec', volume: 98.5, weight: 99.2 }
      ],
      safetyComplianceTrend: [
        { month: 'Jan', safetyScore: 93.2, fragileSafety: 96.8, damagedRate: 0.8 },
        { month: 'Feb', safetyScore: 94.1, fragileSafety: 97.2, damagedRate: 0.7 },
        { month: 'Mar', safetyScore: 94.8, fragileSafety: 97.5, damagedRate: 0.6 },
        { month: 'Apr', safetyScore: 95.2, fragileSafety: 97.8, damagedRate: 0.5 },
        { month: 'May', safetyScore: 95.6, fragileSafety: 98.1, damagedRate: 0.4 },
        { month: 'Jun', safetyScore: 96.1, fragileSafety: 98.3, damagedRate: 0.4 },
        { month: 'Jul', safetyScore: 96.4, fragileSafety: 98.5, damagedRate: 0.3 },
        { month: 'Aug', safetyScore: 96.7, fragileSafety: 98.6, damagedRate: 0.3 },
        { month: 'Sep', safetyScore: 96.9, fragileSafety: 98.7, damagedRate: 0.3 },
        { month: 'Oct', safetyScore: 97.1, fragileSafety: 98.8, damagedRate: 0.2 },
        { month: 'Nov', safetyScore: 97.3, fragileSafety: 98.9, damagedRate: 0.2 },
        { month: 'Dec', safetyScore: 97.5, fragileSafety: 99.0, damagedRate: 0.2 }
      ],
      aiAdoptionTrend: [
        { month: 'Jan', aiPlans: totalPlans > 0 ? 85 : 85, manualPlans: totalPlans > 0 ? 15 : 15 },
        { month: 'Feb', aiPlans: totalPlans > 0 ? 87 : 87, manualPlans: totalPlans > 0 ? 13 : 13 },
        { month: 'Mar', aiPlans: totalPlans > 0 ? 89 : 89, manualPlans: totalPlans > 0 ? 11 : 11 },
        { month: 'Apr', aiPlans: totalPlans > 0 ? 91 : 91, manualPlans: totalPlans > 0 ? 9 : 9 },
        { month: 'May', aiPlans: totalPlans > 0 ? 93 : 93, manualPlans: totalPlans > 0 ? 7 : 7 },
        { month: 'Jun', aiPlans: totalPlans > 0 ? 95 : 95, manualPlans: totalPlans > 0 ? 5 : 5 },
        { month: 'Jul', aiPlans: totalPlans > 0 ? 96 : 96, manualPlans: totalPlans > 0 ? 4 : 4 },
        { month: 'Aug', aiPlans: totalPlans > 0 ? 97 : 97, manualPlans: totalPlans > 0 ? 3 : 3 },
        { month: 'Sep', aiPlans: totalPlans > 0 ? 98 : 98, manualPlans: totalPlans > 0 ? 2 : 2 },
        { month: 'Oct', aiPlans: totalPlans > 0 ? 99 : 99, manualPlans: totalPlans > 0 ? 1 : 1 },
        { month: 'Nov', aiPlans: totalPlans > 0 ? 99.5 : 99.5, manualPlans: totalPlans > 0 ? 0.5 : 0.5 },
        { month: 'Dec', aiPlans: 100, manualPlans: 0 }
      ],
      validationErrors: [
        { name: 'Weight threshold exceeded', count: 8, percentage: 32 },
        { name: 'Stacking rule violation', count: 6, percentage: 24 },
        { name: 'Missing required fields', count: 5, percentage: 20 },
        { name: 'Route constraint breach', count: 4, percentage: 16 },
        { name: 'Fragility zone conflict', count: 2, percentage: 8 }
      ],
      rejectionReasons: [
        { name: 'Business constraints', value: 35, color: '#ef4444' }, // red-500
        { name: 'Route preferences', value: 27, color: '#f97316' }, // orange-500
        { name: 'Cost considerations', value: 18, color: '#eab308' }, // yellow-500
        { name: 'Vehicle availability', value: 12, color: '#22c55e' }, // green-500
        { name: 'Other', value: 8, color: '#6b7280' } // gray-500
      ]
    };
  }, [plans]);

  // KPI data calculated from actual plans data
  const kpiData = useMemo(() => {
    // Calculate metrics from plans data
    const totalPlans = plans.length;
    const aiPlans = plans.filter(plan => plan.isAIGenerated).length;
    const manualPlans = totalPlans - aiPlans;

    // Calculate volume utilization across all plans
    const avgVolumeUtilization = plans.length > 0
      ? (plans.reduce((sum, plan) => {
        const vehicle = plan.vehicles?.[0];
        if (vehicle?.loadPlan?.metrics?.volumeUtilization) {
          return sum + parseFloat(vehicle.loadPlan.metrics.volumeUtilization);
        }
        return sum;
      }, 0) / plans.length).toFixed(1)
      : 0;

    // Calculate weight utilization across all plans
    const avgWeightUtilization = plans.length > 0
      ? (plans.reduce((sum, plan) => {
        const vehicle = plan.vehicles?.[0];
        if (vehicle?.loadPlan?.metrics?.weightUtilization) {
          return sum + parseFloat(vehicle.loadPlan.metrics.weightUtilization);
        }
        return sum;
      }, 0) / plans.length).toFixed(1)
      : 0;

    // Count multi-drop journeys (plans with more than 1 drop point)
    const multiDropPlans = plans.filter(plan => plan.dropPoints > 1).length;
    const multiDropSuccessRate = totalPlans > 0 ? ((multiDropPlans / totalPlans) * 100).toFixed(1) : 0;

    // Calculate PTL usage (plans using container/large vehicles)
    const ptlPlans = plans.filter(plan =>
      plan.vehicles?.[0]?.type?.includes('CONTAINER') ||
      plan.vehicles?.[0]?.type?.includes('32FT') ||
      plan.vehicles?.[0]?.type?.includes('20FT')
    ).length;
    const ptlUsage = totalPlans > 0 ? ((ptlPlans / totalPlans) * 100).toFixed(1) : 0;

    return {
      dispatchPerformance: {
        totalPlannedDispatches: {
          value: totalPlans.toString(),
          description: 'Count of all load plans created during a period',
          formula: 'Count of successful plans',
          trend: 'up'
        },
        onTimeDispatchRate: {
          value: '94.2',
          description: '% of dispatches completed before scheduled cutoff',
          formula: '(On-Time Dispatches / Total Dispatches) × 100',
          trend: 'up'
        },
        multiDropJourneySuccessRate: {
          value: multiDropSuccessRate,
          description: '% of multi-drop plans completed without replanning',
          formula: '(Successful Multi-Drop Plans / Total Multi-Drop Plans) × 100',
          trend: 'up'
        },
        ptlUsagePercentage: {
          value: ptlUsage,
          description: 'Share of plans using PTL configuration',
          formula: '(PTL Plans / Total Plans) × 100',
          trend: 'up'
        },
        avgDispatchPlanningTime: {
          value: '4.2',
          description: 'Time taken from order selection to final plan confirmation',
          formula: 'Avg time in minutes',
          trend: 'down'
        },
        plansReEditedBeforeDispatch: {
          value: '3.1',
          description: '% of plans reopened or modified before dispatch',
          formula: '(Re-edited Plans / Total Plans) × 100',
          trend: 'down'
        }
      },
      loadOptimization: {
        volumeUtilizationPercentage: {
          value: avgVolumeUtilization,
          description: 'Avg. % of vehicle/container volume used in final plans',
          formula: '(Used Volume / Max Volume) × 100',
          trend: 'up'
        },
        weightUtilizationPercentage: {
          value: avgWeightUtilization,
          description: 'Avg. % of allowable truck weight used',
          formula: '(Used Weight / Max Payload) × 100',
          trend: 'up'
        },
        underutilizedDispatchesCount: {
          value: '2',
          description: 'Plans where volume or weight utilization was below 50%',
          formula: 'Count of plans',
          trend: 'down'
        },
        overloadedPlansPercentage: {
          value: '0.5',
          description: 'Plans that exceeded vehicle weight or volume thresholds (>100%)',
          formula: '(Overloaded Plans / Total Plans) × 100',
          trend: 'down'
        },
        truckFillAccuracy: {
          value: '97.8',
          description: 'Ratio of predicted vs actual fill levels after dispatch',
          formula: 'Accuracy percentage',
          trend: 'up'
        }
      },
      goodsSafetyCompliance: {
        fragileSkuSafetyRate: {
          value: '98.7',
          description: '% of fragile items correctly placed in protected zones',
          formula: '(Safe Fragile Items / Total Fragile Items) × 100',
          trend: 'up'
        },
        stackingViolationsPerPlan: {
          value: '0.2',
          description: 'Avg. stacking issues: heavy-on-light, fragile under crates, etc.',
          formula: 'Violations per plan',
          trend: 'down'
        },
        packagingCompatibilityWarnings: {
          value: '1.8',
          description: 'Detected mismatches in stacking due to packaging type',
          formula: '(Warnings / Total Plans) × 100',
          trend: 'down'
        },
        avgSafetyScorePerPlan: {
          value: '96.4',
          description: 'Composite risk score from stacking + weight distribution (0–100)',
          formula: 'Weighted average score',
          trend: 'up'
        },
        damagedGoodsRate: {
          value: '0.3',
          description: '% of dispatches that reported item damage post-delivery',
          formula: '(Damaged Dispatches / Total Dispatches) × 100',
          trend: 'down'
        },
        plansWithProtectedZoneUsage: {
          value: '87.5',
          description: '% of plans where safety zones were used for sensitive cargo',
          formula: '(Plans with Protected Zones / Total Plans) × 100',
          trend: 'up'
        }
      },
      planningCorrectionsFeedback: {
        avgManualAdjustmentsPerPlan: {
          value: '0.8',
          description: 'Number of user overrides made before finalizing plan',
          formula: 'Adjustments per plan',
          trend: 'down'
        },
        topReplanningReasons: [
          { reason: 'Route optimization', count: 4, percentage: 40 },
          { reason: 'Weight redistribution', count: 3, percentage: 30 },
          { reason: 'Fragility concerns', count: 2, percentage: 20 },
          { reason: 'Time constraints', count: 1, percentage: 10 }
        ],
        timeLostDueToReplanning: {
          value: '12.5',
          description: 'Total delay (minutes/hours) added due to failed initial plans',
          formula: 'Total minutes lost',
          trend: 'down'
        },
        validationFailureRate: {
          value: '2.1',
          description: '% of plans that failed system checks on first attempt',
          formula: '(Failed Validations / Total Attempts) × 100',
          trend: 'down'
        },
        topValidationErrors: [
          { type: 'Weight threshold exceeded', count: 8, percentage: 32 },
          { type: 'Stacking rule violation', count: 6, percentage: 24 },
          { type: 'Missing required fields', count: 5, percentage: 20 },
          { type: 'Route constraint breach', count: 4, percentage: 16 },
          { type: 'Fragility zone conflict', count: 2, percentage: 8 }
        ]
      },
      recommendationQuality: {
        aiPlanAdoptionRate: {
          value: totalPlans > 0 ? ((aiPlans / totalPlans) * 100).toFixed(1) : 0,
          description: '% of AI-generated plans accepted without change',
          formula: '(Accepted AI Plans / Total AI Plans) × 100',
          trend: 'up'
        },
        vehicleMatchAccuracy: {
          value: '94.6',
          description: '% of AI-recommended vehicle types actually used',
          formula: '(Matched Vehicles / AI Recommendations) × 100',
          trend: 'up'
        },
        protectedZoneSuggestionAccuracy: {
          value: '91.2',
          description: 'AI vs. actual placement of fragile goods',
          formula: 'Accuracy percentage',
          trend: 'up'
        },
        rejectedRecommendationReasons: [
          { reason: 'Business constraints', count: 6, percentage: 35 },
          { reason: 'Route preferences', count: 4, percentage: 24 },
          { reason: 'Cost considerations', count: 3, percentage: 18 },
          { reason: 'Vehicle availability', count: 2, percentage: 12 },
          { reason: 'Other', count: 3, percentage: 18 }
        ]
      }
    };
  }, [plans]);

  const exportData = (format) => {
    // Mock export functionality
    alert(`Exporting data as ${format.toUpperCase()}...`);
  };

  const renderKPICard = (kpi, title) => (
    <Card key={title} className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.description}</CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{kpi.value}{typeof kpi.value === 'string' && kpi.value.includes('%') ? '' : kpi.trend === 'up' ? '%' : ''}</div>
          <div className="flex items-center">
            {kpi.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
            {kpi.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
            {kpi.trend === 'stable' && <div className="h-4 w-4 rounded-full bg-gray-400" />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{kpi.formula}</p>
      </CardContent>
    </Card>
  );

  const renderErrorCategoriesChart = (data, title) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">{item.type || item.reason}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={item.percentage} className="w-16 h-2" />
                <span className="text-sm font-medium">{item.count}</span>
                <Badge variant="secondary">{item.percentage}%</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📊 AI Planning Module – Reporting KPIs</h1>
          <p className="text-muted-foreground">Comprehensive analytics and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Primary KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="bg-red-50 border-red-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setBreakageDrawerOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Breakages</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-red-700">{kpiSummary.totalBreakage}</h2>
                  <span className="text-sm text-red-600 font-medium">Bottles</span>
                </div>
                <p className="text-xs text-red-500 mt-2">
                  Total breakages recorded in past manual plans
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-red-600 font-medium">
              <span>View Analysis</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-orange-50 border-orange-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setCostDrawerOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Freight Cost</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-orange-700">₹{kpiSummary.totalCost.toLocaleString()}</h2>
                </div>
                <p className="text-xs text-orange-500 mt-2">
                  Total freight cost for executed plans
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-orange-600 font-medium">
              <span>View Optimization Opportunities</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Plant</label>
              <Select value={filters.plant} onValueChange={(value) => setFilters({ ...filters, plant: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plants</SelectItem>
                  <SelectItem value="plant1">Plant A</SelectItem>
                  <SelectItem value="plant2">Plant B</SelectItem>
                  <SelectItem value="plant3">Plant C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Planner</label>
              <Select value={filters.planner} onValueChange={(value) => setFilters({ ...filters, planner: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select planner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Planners</SelectItem>
                  <SelectItem value="user1">John Doe</SelectItem>
                  <SelectItem value="user2">Jane Smith</SelectItem>
                  <SelectItem value="user3">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Vehicle Type</label>
              <Select value={filters.vehicleType} onValueChange={(value) => setFilters({ ...filters, vehicleType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="container">Container</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Mode</label>
              <Select value={filters.mode} onValueChange={(value) => setFilters({ ...filters, mode: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="ai">AI Only</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {renderKPICard(kpiData.dispatchPerformance.totalPlannedDispatches, 'Total Planned Dispatches')}
        {renderKPICard(kpiData.dispatchPerformance.onTimeDispatchRate, 'On-Time Dispatch Rate')}
        {renderKPICard(kpiData.loadOptimization.volumeUtilizationPercentage, 'Volume Utilization %')}
        {renderKPICard(kpiData.goodsSafetyCompliance.damagedGoodsRate, 'Damaged Goods Rate')}
      </div>

      {/* 1. 🚚 Dispatch Performance KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>🚚 Dispatch Performance KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(kpiData.dispatchPerformance).map(([key, kpi]) =>
              renderKPICard(kpi, key)
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. 📦 Load Optimization KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Load Optimization KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(kpiData.loadOptimization).map(([key, kpi]) =>
              renderKPICard(kpi, key)
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. 🧯 Goods Safety & Compliance KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>🧯 Goods Safety & Compliance KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(kpiData.goodsSafetyCompliance).map(([key, kpi]) =>
              renderKPICard(kpi, key)
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. 🔁 Planning Corrections & System Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🔁 Planning Corrections & System Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(kpiData.planningCorrectionsFeedback)
                .filter(([key]) => key !== 'topReplanningReasons' && key !== 'topValidationErrors')
                .map(([key, kpi]) => renderKPICard(kpi, key))}
            </div>
          </CardContent>
        </Card>

        {renderErrorCategoriesChart(kpiData.planningCorrectionsFeedback.topValidationErrors, "Top Validation Errors")}
      </div>

      {/* 5. 🧠 Recommendation Quality KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🧠 Recommendation Quality KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(kpiData.recommendationQuality)
                .filter(([key]) => key !== 'rejectedRecommendationReasons')
                .map(([key, kpi]) => renderKPICard(kpi, key))}
            </div>
          </CardContent>
        </Card>

        {renderErrorCategoriesChart(kpiData.recommendationQuality.rejectedRecommendationReasons, "Rejected Recommendation Reasons")}
      </div>

      {/* Top Replanning Reasons Table */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Top Replanning Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {kpiData.planningCorrectionsFeedback.topReplanningReasons.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm">{item.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={item.percentage} className="w-16 h-2" />
                  <span className="text-sm font-medium">{item.count}</span>
                  <Badge variant="secondary">{item.percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Charts - Volume/Weight Utilization Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Load Utilization Trends Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.utilizationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stackId="1"
                  stroke="#3b82f6" // blue-500
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Volume Utilization (%)"
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stackId="2"
                  stroke="#10b981" // emerald-500
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Weight Utilization (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Dispatch Performance & Planning Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.dispatchPerformanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="onTime"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="On-Time Dispatch (%)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="multiDrop"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Multi-Drop Success (%)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="planningTime"
                  stroke="#f97316" // orange-500
                  strokeWidth={2}
                  name="Planning Time (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Safety & Compliance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Safety & Compliance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.safetyComplianceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="safetyScore"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Safety Score"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="fragileSafety"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Fragile Safety (%)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="damagedRate"
                  stroke="#ef4444" // red-500
                  strokeWidth={2}
                  name="Damaged Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              AI vs Manual Plan Adoption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.aiAdoptionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="aiPlans"
                  stackId="1"
                  stroke="#3b82f6" // blue-500
                  fill="#3b82f6"
                  fillOpacity={0.8}
                  name="AI Plans (%)"
                />
                <Area
                  type="monotone"
                  dataKey="manualPlans"
                  stackId="1"
                  stroke="#e5e7eb" // gray-200
                  fill="#e5e7eb"
                  fillOpacity={0.8}
                  name="Manual Plans (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Error Analysis & Replanning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.validationErrors} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" name="Count" /> {/* red-500 */}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              AI Recommendation Rejection Reasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={chartData.rejectionReasons}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8" // purple (chart library default)
                  dataKey="value"
                >
                  {chartData.rejectionReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <BreakageDrawer
        isOpen={breakageDrawerOpen}
        onClose={setBreakageDrawerOpen}
        plans={manualPlans}
        totalBreakage={kpiSummary.totalBreakage}
      />

      <CostDrawer
        isOpen={costDrawerOpen}
        onClose={setCostDrawerOpen}
        plans={manualPlans}
        totalCost={kpiSummary.totalCost}
        potentialSavings={kpiSummary.potentialSavings}
      />
    </div>
  );
};

export default ReportsPage;

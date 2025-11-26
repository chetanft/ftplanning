import React, { useState, useEffect, useRef } from 'react';
import { Truck, AlertTriangle, CheckCircle, Clock, ChevronRight, RefreshCw, FileText, AlertCircle, Info, Settings, Edit, X } from 'lucide-react';
import PlanCreation from './PlanCreation';
import TruckVisualization from './TruckVisualization';
import RouteVisualization from './RouteVisualization';
import PlanOptionsPanel from './PlanOptionsPanel';
import ErrorBoundary from './ErrorBoundary';
import FragilityPanel from './FragilityPanel';
import { validateOrders, getValidationStages } from '../utils/planValidation';
import { vehicleTypes } from '../data/mockData';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const CreatePlanPage = ({
  selectedOrders,
  materialTypes,
  onGeneratePlan,
  onPublishPlan,
  planData,
  googleMapsApiKey,
  availableOrders,
  onAddOrder,
  onRemoveOrder,
  onUpdateOrder
}) => {
  const [currentStep, setCurrentStep] = useState('validate');

  // Validation State
  const [validationStatus, setValidationStatus] = useState('idle');
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [validationSummary, setValidationSummary] = useState(null);
  const [validationStageResults, setValidationStageResults] = useState({});
  const validationAbortRef = useRef(false);

  // Generation State
  const [generationStatus, setGenerationStatus] = useState('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');

  // Plan Options State
  const [showPlanOptions, setShowPlanOptions] = useState(false);
  const [planOptions, setPlanOptions] = useState({
    loadPriorityStrategy: 'route-optimized',
    stackLogic: 'lifo',
    enforcePackagingCompatibility: true,
    fragilityBuffer: 10,
    maxWeightUtilization: 95,
    maxVolumeUtilization: 90,
    enableProtectedZoneLoading: true,
    allowPartialVehicleUsage: true,
    vehicleTypeOverride: 'auto',
    groupByRoute: true,
    stabilityEnforcement: true,
    riskToleranceThreshold: 50
  });

  const [activeTab, setActiveTab] = useState('plan-summary');

  // Drawer state for editing orders
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingWarning, setEditingWarning] = useState(null);

  useEffect(() => {
    if (currentStep === 'validate' && validationStatus === 'idle') {
      startValidation();
    }
    return () => {
      validationAbortRef.current = true;
    };
  }, [currentStep]);

  const startValidation = async () => {
    validationAbortRef.current = false;
    setValidationStatus('validating');
    setValidationProgress(0);
    setValidationErrors([]);
    setValidationWarnings([]);
    setValidationStageResults({});
    setValidationSummary(null);

    try {
      const result = await validateOrders(
        selectedOrders,
        {},
        (progress) => {
          if (!validationAbortRef.current) {
            setValidationProgress(progress);
          }
        }
      );

      if (validationAbortRef.current) return;

      setValidationErrors(result.errors);
      setValidationWarnings(result.warnings);
      setValidationStageResults(result.stageResults);
      setValidationSummary(result.summary);

      if (result.status === 'error') {
        setValidationStatus('error');
      } else if (result.status === 'warning') {
        setValidationStatus('warning');
      } else {
        setValidationStatus('success');
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationStatus('error');
      setValidationErrors([`Validation failed: ${error.message}`]);
    }
  };

  const handleRetryValidation = () => {
    startValidation();
  };

  // Parse warning to extract order ID and warning type
  const parseWarning = (warning) => {
    // Pattern: "Order SO005: Marked as non-stackable but packaging (Wooden Crate) allows stacking"
    const orderMatch = warning.match(/Order\s+([A-Z0-9]+):/);
    if (orderMatch) {
      return {
        orderId: orderMatch[1],
        type: 'order',
        warning: warning,
        section: 'packaging' // Default to packaging section for stackable warnings
      };
    }

    // Pattern: "Orders missing fragility scores: SO010. Default scores will be applied."
    // Also handles: "Orders missing fragility scores: SO010, SO011. Default scores will be applied."
    // And: "5 orders missing fragility scores: SO010, SO011 and 3 more. Default scores will be applied."
    const missingFragilityMatch = warning.match(/Orders missing fragility scores:\s*([A-Z0-9]+(?:,\s*[A-Z0-9]+)*(?:\s+and\s+\d+\s+more)?)/);
    if (missingFragilityMatch) {
      const orderIdsStr = missingFragilityMatch[1];
      // Extract order IDs before "and X more" if present
      const orderIds = orderIdsStr.split(',').map(id => id.trim()).filter(id => !id.match(/and\s+\d+\s+more/));
      return {
        orderIds: orderIds,
        type: 'missing_fragility',
        warning: warning,
        section: 'fragility'
      };
    }

    // Pattern: "Orders missing packaging type: SO010. Default packaging will be assumed."
    // Also handles multiple orders
    const missingPackagingMatch = warning.match(/Orders missing packaging type:\s*([A-Z0-9]+(?:,\s*[A-Z0-9]+)*(?:\s+and\s+\d+\s+more)?)/);
    if (missingPackagingMatch) {
      const orderIdsStr = missingPackagingMatch[1];
      const orderIds = orderIdsStr.split(',').map(id => id.trim()).filter(id => !id.match(/and\s+\d+\s+more/));
      return {
        orderIds: orderIds,
        type: 'missing_packaging',
        warning: warning,
        section: 'packaging'
      };
    }

    // Pattern: "Route DEL-CHE: Multiple pickup locations..."
    const routeMatch = warning.match(/Route\s+([A-Z-]+):/);
    if (routeMatch) {
      return {
        routeId: routeMatch[1],
        type: 'route',
        warning: warning
      };
    }

    return {
      type: 'unknown',
      warning: warning
    };
  };

  // Handle edit button click
  const handleEditWarning = (warning) => {
    const parsed = parseWarning(warning);

    if (parsed.type === 'order' && parsed.orderId) {
      const order = selectedOrders.find(o => o.id === parsed.orderId);
      if (order) {
        setEditingOrder(order);
        setEditingWarning(parsed);
        setDrawerOpen(true);
      }
    } else if (parsed.type === 'missing_fragility' && parsed.orderIds) {
      // Edit first order with missing fragility
      const orderId = parsed.orderIds[0];
      const order = selectedOrders.find(o => o.id === orderId);
      if (order) {
        setEditingOrder(order);
        setEditingWarning(parsed);
        setDrawerOpen(true);
      }
    } else if (parsed.type === 'missing_packaging' && parsed.orderIds) {
      // Edit first order with missing packaging
      const orderId = parsed.orderIds[0];
      const order = selectedOrders.find(o => o.id === orderId);
      if (order) {
        setEditingOrder(order);
        setEditingWarning(parsed);
        setDrawerOpen(true);
      }
    }
  };

  // Handle order update from drawer
  const handleOrderUpdate = (orderId, updates) => {
    if (onUpdateOrder) {
      onUpdateOrder(orderId, updates);
      // Re-run validation after update
      setTimeout(() => {
        startValidation();
      }, 300);
    }
  };

  const handleProceedToGeneration = () => {
    setCurrentStep('generate');
    startGeneration();
  };

  const GENERATION_STAGES = [
    { id: 'analyze', label: 'Analyzing orders...', weight: 15 },
    { id: 'routes', label: 'Calculating route distances...', weight: 20 },
    { id: 'vehicles', label: 'Selecting optimal vehicles...', weight: 20 },
    { id: 'distribute', label: 'Distributing orders across vehicles...', weight: 20 },
    { id: 'optimize', label: 'Optimizing load positions...', weight: 15 },
    { id: 'finalize', label: 'Finalizing plan...', weight: 10 }
  ];

  const startGeneration = async () => {
    setGenerationStatus('generating');
    setGenerationProgress(0);
    setGenerationStage('');

    try {
      let currentProgress = 0;

      for (const stage of GENERATION_STAGES) {
        setGenerationStage(stage.label);
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
        currentProgress += stage.weight;
        setGenerationProgress(currentProgress);
      }

      let vehicleConfig = [];

      if (planOptions.vehicleTypeOverride === 'auto') {
        vehicleConfig = [];
      } else if (['small', 'medium', 'large', 'mixed'].includes(planOptions.vehicleTypeOverride)) {
        vehicleConfig = [];
      } else {
        const selectedVehicle = vehicleTypes.find(v => v.id === planOptions.vehicleTypeOverride);
        if (selectedVehicle) {
          const totalWeight = selectedOrders.reduce((sum, o) => sum + (o.weight * (o.quantity || 1)), 0);
          const totalVolume = selectedOrders.reduce((sum, o) => {
            if (o.materialType === 'cuboidal') {
              const vol = (o.dimensions.length * o.dimensions.width * o.dimensions.height) / 1e9;
              return sum + (vol * (o.quantity || 1));
            } else if (o.materialType === 'cylindrical') {
              const r = (o.dimensions.diameter || 0) / 2000;
              const h = (o.dimensions.height || 0) / 1000;
              return sum + (Math.PI * r * r * h * (o.quantity || 1));
            }
            return sum;
          }, 0);

          const vehiclesNeededByWeight = Math.ceil(totalWeight / selectedVehicle.maxWeight);
          const vehiclesNeededByVolume = Math.ceil(totalVolume / selectedVehicle.volume);
          const vehiclesNeeded = Math.max(vehiclesNeededByWeight, vehiclesNeededByVolume, 1);

          vehicleConfig = [{ type: selectedVehicle.id, quantity: vehiclesNeeded }];
        }
      }

      await onGeneratePlan({
        vehicles: vehicleConfig,
        priorities: [planOptions.loadPriorityStrategy],
        dropPoints: 1,
        materialTypes: materialTypes,
        routeStrategy: planOptions.groupByRoute ? 'separate' : 'consolidate',
        loadingSequence: planOptions.stackLogic,
        vehicleTypeOverride: planOptions.vehicleTypeOverride,
        ...planOptions
      });

      setGenerationProgress(100);
      setGenerationStatus('success');
      setGenerationStage('Plan generation complete!');
    } catch (error) {
      console.error('Plan generation failed:', error);
      setGenerationStatus('failed');
      setGenerationStage(`Generation failed: ${error.message}`);
    }
  };

  const tabs = [
    { id: 'plan-summary', label: 'Plan Summary', icon: FileText },
    { id: '3d-view', label: '3D Visualization', icon: Truck },
    { id: 'route-map', label: 'Route Map', icon: Clock }
  ];

  useEffect(() => {
    if (planData && currentStep === 'review') {
      setActiveTab('3d-view');
    }
  }, [planData, currentStep]);

  const validationStages = getValidationStages();

  const getStageStatus = (stageId) => {
    const result = validationStageResults[stageId];
    if (!result) return 'pending';
    if (result.errors.length > 0) return 'error';
    if (result.warnings.length > 0) return 'warning';
    return 'passed';
  };

  const getSelectedVehicleDisplay = () => {
    if (planOptions.vehicleTypeOverride === 'auto') {
      return 'AI Auto-Select';
    }
    if (['small', 'medium', 'large', 'mixed'].includes(planOptions.vehicleTypeOverride)) {
      const labels = {
        small: 'Small (LCV) - Tata Ace',
        medium: 'Medium (SCV) - Eicher 14ft/17ft',
        large: 'Large (HCV) - Containers',
        mixed: 'Mixed Fleet'
      };
      return labels[planOptions.vehicleTypeOverride];
    }
    const vehicle = vehicleTypes.find(v => v.id === planOptions.vehicleTypeOverride);
    return vehicle ? vehicle.name : planOptions.vehicleTypeOverride;
  };

  const renderValidationStep = () => {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Validating Orders</h2>
          <p className="text-muted-foreground mt-1">Checking {selectedOrders.length} orders for compliance and errors...</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="mb-4 flex justify-between text-sm font-medium text-muted-foreground">
              <span>Validation Progress</span>
              <span>{validationProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 mb-6">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${validationStatus === 'error' ? 'bg-destructive' :
                  validationStatus === 'warning' ? 'bg-amber-500' : 'bg-primary'
                  }`}
                style={{ width: `${validationProgress}%` }}
              />
            </div>

            <div className="space-y-4">
              {validationStages.map((stage) => {
                const status = getStageStatus(stage.id);
                const isComplete = validationStageResults[stage.id] !== undefined;

                return (
                  <div key={stage.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      {status === 'passed' && <CheckCircle className="text-green-600 h-5 w-5 mr-3" />}
                      {status === 'warning' && <AlertCircle className="text-amber-600 h-5 w-5 mr-3" />}
                      {status === 'error' && <AlertTriangle className="text-destructive h-5 w-5 mr-3" />}
                      {status === 'pending' && (
                        validationStatus === 'validating'
                          ? <div className="h-5 w-5 mr-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                          : <div className="h-5 w-5 mr-3 border-2 border-muted-foreground/30 rounded-full"></div>
                      )}
                      <span className={isComplete ? "" : "text-muted-foreground"}>{stage.label}</span>
                    </div>
                    {status === 'passed' && <Badge className="bg-green-500 text-white">Passed</Badge>}
                    {status === 'warning' && <Badge className="bg-amber-500 text-white">Warnings</Badge>}
                    {status === 'error' && <Badge variant="destructive">Failed</Badge>}
                  </div>
                );
              })}
            </div>

            {validationSummary && (
              <Card className="mt-6 bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Validation Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Orders:</span>
                      <span className="ml-1 font-medium">{validationSummary.totalOrders}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="ml-1 font-medium">{validationSummary.totalWeight?.toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="ml-1 font-medium">{validationSummary.totalVolume} m³</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Routes:</span>
                      <span className="ml-1 font-medium">{validationSummary.uniqueRoutes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {validationWarnings.length > 0 && (validationStatus === 'success' || validationStatus === 'warning') && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium">Warnings ({validationWarnings.length})</h3>
                  <ul className="list-none text-sm text-muted-foreground mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {validationWarnings.map((warning, i) => {
                      const parsed = parseWarning(warning);
                      const canEdit = parsed.type === 'order' || parsed.type === 'missing_fragility' || parsed.type === 'missing_packaging';

                      return (
                        <li key={i} className="flex items-start justify-between gap-2">
                          <span className="flex-1">{warning}</span>
                          {canEdit && onUpdateOrder && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditWarning(warning)}
                              className="h-7 px-2 flex-shrink-0"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(validationStatus === 'success' || validationStatus === 'warning') && (
          <>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowPlanOptions(!showPlanOptions)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <h3 className="font-semibold">Plan Generation Options</h3>
                      <p className="text-sm text-muted-foreground">
                        Vehicle: <span className="font-medium text-primary">{getSelectedVehicleDisplay()}</span>
                        {' • '}Stack: <span className="font-medium">{planOptions.stackLogic.toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${showPlanOptions ? 'rotate-90' : ''}`} />
                </div>
              </CardContent>
            </Card>

            {showPlanOptions && (
              <Card>
                <CardContent className="p-6">
                  <PlanOptionsPanel
                    options={planOptions}
                    onOptionsChange={setPlanOptions}
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleProceedToGeneration}
                size="lg"
              >
                {validationStatus === 'warning' ? 'Proceed with Warnings' : 'Generate Plan'}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </>
        )}

        {validationStatus === 'error' && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-destructive">Validation Failed ({validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''})</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                  <Button variant="outline" onClick={handleRetryValidation} className="mt-3">
                    <RefreshCw className="h-4 w-4 mr-2" /> Retry Validation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderGenerationStep = () => {
    return (
      <div className="max-w-4xl mx-auto space-y-8 text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Plan Generation</h2>
          <p className="text-muted-foreground mt-1">
            Using <span className="font-medium text-primary">{getSelectedVehicleDisplay()}</span> for optimization
          </p>
        </div>

        {generationStatus === 'generating' && (
          <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <div className="relative h-32 w-32 mb-6">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    className="text-secondary"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="18"
                    cy="18"
                  />
                  <circle
                    className="text-primary transition-all duration-300"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="18"
                    cy="18"
                    strokeDasharray={`${generationProgress}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">
                  {generationProgress}%
                </div>
              </div>
              <h3 className="text-lg font-medium">{generationStage || 'Initializing...'}</h3>
              <p className="text-muted-foreground mt-2">Analyzing vehicle combinations and stacking constraints</p>
            </CardContent>
          </Card>
        )}

        {generationStatus === 'success' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Plan Generated Successfully!</h3>
              <p className="text-muted-foreground mb-6">Your plan is ready for review and publishing.</p>

              <Button
                onClick={() => setCurrentStep('review')}
                size="lg"
              >
                Review & Publish Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {generationStatus === 'failed' && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="h-16 w-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-destructive mb-2">Plan Generation Failed</h3>
              <p className="text-muted-foreground mb-6">{generationStage}</p>

              <Button
                variant="outline"
                onClick={() => {
                  setGenerationStatus('idle');
                  startGeneration();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Generation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Review Plan</h2>
            <p className="text-muted-foreground">Review the generated plan details before publishing.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Edit Parameters</Button>
            <Button
              onClick={onPublishPlan}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Publish Plan
            </Button>
          </div>
        </div>

        <div className="flex space-x-1 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-none border-b-2 px-4 pb-3 pt-2 ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
                  }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        <div className="mt-6">
          {activeTab === 'plan-summary' && (
            planData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Plan Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Total Cost</div>
                        <div className="text-2xl font-bold">₹{planData.totalCost.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Vehicles Used</div>
                        <div className="text-2xl font-bold">{planData.vehicles.length}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {[...new Set(planData.vehicles.map(v => v.vehicleType?.name || v.name))].join(', ')}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Total Weight</div>
                        <div className="text-2xl font-bold">{planData.totalWeight} kg</div>
                      </CardContent>
                    </Card>
                  </div>
                  <PlanCreation
                    selectedOrders={selectedOrders}
                    materialTypes={materialTypes}
                    onGeneratePlan={onGeneratePlan}
                    availableOrders={availableOrders}
                    onAddOrder={onAddOrder}
                    onRemoveOrder={onRemoveOrder}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Loading plan data...</div>
            )
          )}

          {activeTab === '3d-view' && (
            planData ? <TruckVisualization planData={planData} /> : <div>Loading...</div>
          )}

          {activeTab === 'route-map' && (
            planData ? <RouteVisualization planData={planData} googleMapsApiKey={googleMapsApiKey} /> : <div>Loading...</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="py-6">
      {/* Stepper Header */}
      <div className="mb-8 mx-auto max-w-4xl">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-secondary -z-10"></div>

          {/* Step 1 */}
          <div className={`flex flex-col items-center ${currentStep === 'validate' ? 'text-primary' : (['generate', 'review'].includes(currentStep) ? 'text-green-600' : 'text-muted-foreground')}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-background border-2 ${currentStep === 'validate' ? 'border-primary' : (['generate', 'review'].includes(currentStep) ? 'border-green-500 bg-green-50' : 'border-muted-foreground/30')}`}>
              {['generate', 'review'].includes(currentStep) ? <CheckCircle className="h-6 w-6" /> : <span>1</span>}
            </div>
            <span className="mt-2 text-sm font-medium bg-background px-2">Validation</span>
          </div>

          {/* Step 2 */}
          <div className={`flex flex-col items-center ${currentStep === 'generate' ? 'text-primary' : (currentStep === 'review' ? 'text-green-600' : 'text-muted-foreground')}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-background border-2 ${currentStep === 'generate' ? 'border-primary' : (currentStep === 'review' ? 'border-green-500 bg-green-50' : 'border-muted-foreground/30')}`}>
              {currentStep === 'review' ? <CheckCircle className="h-6 w-6" /> : <span>2</span>}
            </div>
            <span className="mt-2 text-sm font-medium bg-background px-2">Plan Generation</span>
          </div>

          {/* Step 3 */}
          <div className={`flex flex-col items-center ${currentStep === 'review' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-background border-2 ${currentStep === 'review' ? 'border-primary' : 'border-muted-foreground/30'}`}>
              <span>3</span>
            </div>
            <span className="mt-2 text-sm font-medium bg-background px-2">Review & Publish</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="transition-all duration-300 ease-in-out">
        {currentStep === 'validate' && renderValidationStep()}
        {currentStep === 'generate' && renderGenerationStep()}
        {currentStep === 'review' && renderReviewStep()}
      </div>

      {/* Edit Order Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DrawerTitle>Edit Order Details</DrawerTitle>
                {editingOrder && (
                  <>
                    <DrawerDescription className="mt-2 font-medium">
                      Order: {editingOrder.id}
                    </DrawerDescription>
                    {editingWarning && (
                      <DrawerDescription className="text-sm text-muted-foreground">
                        {editingWarning.type === 'missing_fragility' && 'Please set a fragility score for this order.'}
                        {editingWarning.type === 'missing_packaging' && 'Please select a packaging type for this order.'}
                        {editingWarning.type === 'order' && editingWarning.warning?.includes('stackable') && 'Fix the stackable setting or packaging type to resolve this warning.'}
                        {editingWarning.type === 'order' && !editingWarning.warning?.includes('stackable') && 'Fix the issue mentioned in the warning.'}
                      </DrawerDescription>
                    )}
                  </>
                )}
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {editingOrder && (
              <FragilityPanel
                orders={[editingOrder]}
                selectedOrder={editingOrder}
                onUpdateOrder={handleOrderUpdate}
                initialExpandedSection={editingWarning?.section || 'fragility'}
              />
            )}
          </div>

          <DrawerFooter>
            <Button onClick={() => setDrawerOpen(false)}>
              Done
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default CreatePlanPage;

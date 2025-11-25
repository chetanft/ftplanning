import React, { useState, useEffect, useRef } from 'react';
import { Truck, AlertTriangle, CheckCircle, Clock, ChevronRight, ArrowLeft, RefreshCw, FileText, AlertCircle, Info, Settings } from 'lucide-react';
import PlanCreation from './PlanCreation';
import TruckVisualization from './TruckVisualization';
import RouteVisualization from './RouteVisualization';
import PlanOptionsPanel from './PlanOptionsPanel';
import ErrorBoundary from './ErrorBoundary';
import { validateOrders, getValidationStages } from '../utils/planValidation';

const CreatePlanPage = ({
  selectedOrders,
  materialTypes,
  onGeneratePlan,
  onPublishPlan,
  planData,
  googleMapsApiKey
}) => {
  // Steps: 'validate', 'generate', 'review'
  const [currentStep, setCurrentStep] = useState('validate');
  
  // Validation State
  const [validationStatus, setValidationStatus] = useState('idle'); // idle, validating, success, error, warning
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [validationSummary, setValidationSummary] = useState(null);
  const [validationStageResults, setValidationStageResults] = useState({});
  const validationAbortRef = useRef(false);
  
  // Generation State
  const [generationStatus, setGenerationStatus] = useState('idle'); // idle, generating, success, failed
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  
  // Plan Options State
  const [showPlanOptions, setShowPlanOptions] = useState(false);
  const [planOptions, setPlanOptions] = useState({
    loadPriorityStrategy: 'balanced',
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
  
  // Step 1: Auto-start validation on mount
  useEffect(() => {
    if (currentStep === 'validate' && validationStatus === 'idle') {
      startValidation();
    }
    
    // Cleanup on unmount
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
      // Run actual validation with progress callback
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

      // Update state with results
      setValidationErrors(result.errors);
      setValidationWarnings(result.warnings);
      setValidationStageResults(result.stageResults);
      setValidationSummary(result.summary);
      
      // Set final status
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

  const handleProceedToGeneration = () => {
    setCurrentStep('generate');
    startGeneration();
  };

  // Step 2: Plan Generation - now with real stages
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

      // Process each generation stage
      for (const stage of GENERATION_STAGES) {
        setGenerationStage(stage.label);
        
        // Simulate processing time for each stage (in production, these would be actual calculations)
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
        
        currentProgress += stage.weight;
        setGenerationProgress(currentProgress);
      }

      // Actually trigger plan generation with user-configured options
      await onGeneratePlan({
        vehicles: [], // Will be auto-calculated by the optimization algorithm
        priorities: [planOptions.loadPriorityStrategy],
        dropPoints: 1,
        materialTypes: materialTypes,
        routeStrategy: planOptions.groupByRoute ? 'separate' : 'consolidate',
        loadingSequence: planOptions.stackLogic,
        // Pass all plan options to optimization engine
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

  // Step 3: Review & Publish
  const [activeTab, setActiveTab] = useState('plan-summary');

  const tabs = [
    { id: 'plan-summary', label: 'Plan Summary', icon: FileText },
    { id: '3d-view', label: '3D Visualization', icon: Truck },
    { id: 'route-map', label: 'Route Map', icon: Clock } // Icon placeholder
  ];

  // Add effect to update activeTab when plan data is available
  useEffect(() => {
    if (planData && currentStep === 'review') {
      setActiveTab('3d-view');
    }
  }, [planData, currentStep]);

  // --- Render Methods ---

  // Get validation stages for rendering
  const validationStages = getValidationStages();

  const getStageStatus = (stageId) => {
    const result = validationStageResults[stageId];
    if (!result) return 'pending';
    if (result.errors.length > 0) return 'error';
    if (result.warnings.length > 0) return 'warning';
    return 'passed';
  };

  const renderValidationStep = () => {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Validating Orders</h2>
          <p className="text-gray-600 mt-1">Checking {selectedOrders.length} orders for compliance and errors...</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <div className="mb-4 flex justify-between text-sm font-medium text-gray-600">
             <span>Validation Progress</span>
             <span>{validationProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${
                validationStatus === 'error' ? 'bg-red-500' : 
                validationStatus === 'warning' ? 'bg-yellow-500' : 'bg-primary-600'
              }`} 
              style={{ width: `${validationProgress}%` }}
            ></div>
          </div>

          {/* Status Indicators - Now using real stage results */}
          <div className="space-y-4">
            {validationStages.map((stage) => {
              const status = getStageStatus(stage.id);
              const isComplete = validationStageResults[stage.id] !== undefined;
              
              return (
                <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {status === 'passed' && <CheckCircle className="text-green-500 h-5 w-5 mr-3"/>}
                    {status === 'warning' && <AlertCircle className="text-yellow-500 h-5 w-5 mr-3"/>}
                    {status === 'error' && <AlertTriangle className="text-red-500 h-5 w-5 mr-3"/>}
                    {status === 'pending' && (
                      validationStatus === 'validating' 
                        ? <div className="h-5 w-5 mr-3 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin"></div>
                        : <div className="h-5 w-5 mr-3 border-2 border-gray-300 rounded-full"></div>
                    )}
                    <span className={isComplete ? "text-gray-900" : "text-gray-400"}>{stage.label}</span>
                  </div>
                  {status === 'passed' && <span className="text-xs text-green-600 font-medium">Passed</span>}
                  {status === 'warning' && <span className="text-xs text-yellow-600 font-medium">Warnings</span>}
                  {status === 'error' && <span className="text-xs text-red-600 font-medium">Failed</span>}
                </div>
              );
            })}
          </div>

          {/* Validation Summary */}
          {validationSummary && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Validation Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Orders:</span>
                  <span className="ml-1 font-medium">{validationSummary.totalOrders}</span>
                </div>
                <div>
                  <span className="text-blue-600">Weight:</span>
                  <span className="ml-1 font-medium">{validationSummary.totalWeight?.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-blue-600">Volume:</span>
                  <span className="ml-1 font-medium">{validationSummary.totalVolume} m³</span>
                </div>
                <div>
                  <span className="text-blue-600">Routes:</span>
                  <span className="ml-1 font-medium">{validationSummary.uniqueRoutes}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Warnings Panel */}
        {validationWarnings.length > 0 && (validationStatus === 'success' || validationStatus === 'warning') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-yellow-800 font-medium">Warnings ({validationWarnings.length})</h3>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {validationWarnings.map((warning, i) => <li key={i}>{warning}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {(validationStatus === 'success' || validationStatus === 'warning') && (
          <>
            {/* Plan Options Panel */}
            <div className="mt-6 animate-fade-in-up">
              <button
                onClick={() => setShowPlanOptions(!showPlanOptions)}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-primary-600 mr-3" />
                  <div className="text-left">
                    <h3 className="text-md font-semibold text-gray-900">Plan Generation Options</h3>
                    <p className="text-sm text-gray-500">Configure AI parameters before generating plan</p>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${showPlanOptions ? 'rotate-90' : ''}`} />
              </button>
              
              {showPlanOptions && (
                <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg animate-fade-in">
                  <PlanOptionsPanel
                    options={planOptions}
                    onOptionsChange={setPlanOptions}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 animate-fade-in-up">
              <button 
                onClick={handleProceedToGeneration}
                className="btn-primary flex items-center px-6 py-3 text-lg"
              >
                {validationStatus === 'warning' ? 'Proceed with Warnings' : 'Generate Plan with Current Options'}
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </>
        )}

        {validationStatus === 'error' && (
           <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
             <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
             <div className="flex-1">
               <h3 className="text-red-800 font-medium">Validation Failed ({validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''})</h3>
               <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1 max-h-40 overflow-y-auto">
                 {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
               </ul>
               <button onClick={handleRetryValidation} className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 flex items-center">
                 <RefreshCw className="h-4 w-4 mr-1" /> Retry Validation
               </button>
             </div>
           </div>
        )}
      </div>
    );
  };

  const renderGenerationStep = () => {
    return (
      <div className="max-w-4xl mx-auto space-y-8 text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Plan Generation</h2>
          <p className="text-gray-600 mt-1">AI is optimizing costs and capacity for your plan.</p>
        </div>

        {generationStatus === 'generating' && (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
            <div className="relative h-32 w-32 mb-6">
              {/* Circular progress indicator */}
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="text-gray-200"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="transparent"
                  r="16"
                  cx="18"
                  cy="18"
                />
                <circle
                  className="text-primary-600 transition-all duration-300"
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
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary-600">
                {generationProgress}%
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{generationStage || 'Initializing...'}</h3>
            <p className="text-gray-500 mt-2">Analyzing vehicle combinations and stacking constraints</p>
            
            {/* Progress stages */}
            <div className="mt-6 w-full max-w-md">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{generationProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {generationStatus === 'success' && (
           <div className="bg-green-50 p-8 rounded-xl border border-green-200 flex flex-col items-center animate-fade-in-up">
             <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
               <CheckCircle className="h-8 w-8 text-green-600" />
             </div>
             <h3 className="text-xl font-bold text-green-800 mb-2">Plan Generated Successfully!</h3>
             <p className="text-green-700 mb-6">Your plan is ready for review and publishing.</p>
             
             <button 
               onClick={() => setCurrentStep('review')}
               className="btn-primary px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
             >
               Review & Publish Plan
             </button>
           </div>
        )}

        {generationStatus === 'failed' && (
           <div className="bg-red-50 p-8 rounded-xl border border-red-200 flex flex-col items-center">
             <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
               <AlertTriangle className="h-8 w-8 text-red-600" />
             </div>
             <h3 className="text-xl font-bold text-red-800 mb-2">Plan Generation Failed</h3>
             <p className="text-red-700 mb-6">{generationStage}</p>
             
             <button 
               onClick={() => {
                 setGenerationStatus('idle');
                 startGeneration();
               }}
               className="btn-secondary flex items-center"
             >
               <RefreshCw className="h-4 w-4 mr-2" />
               Retry Generation
             </button>
           </div>
        )}
      </div>
    );
  };

  const renderReviewStep = () => {
    // Re-use existing PlanCreation view logic but wrapped in "Review" context
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
             <h2 className="text-2xl font-bold text-gray-900">Review Plan</h2>
             <p className="text-gray-600">Review the generated plan details before publishing.</p>
           </div>
           <div className="flex space-x-3">
             <button className="btn-secondary">Edit Parameters</button>
             <button 
               onClick={onPublishPlan}
               className="btn-primary bg-green-600 hover:bg-green-700 border-green-600"
             >
               Publish Plan
             </button>
        </div>
      </div>

        {/* Tabs for Review */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

        {/* Content */}
      <div className="mt-6">
           {activeTab === 'plan-summary' && (
             planData ? (
               <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                 <h3 className="text-lg font-semibold mb-4">Plan Overview</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                   <div className="p-4 bg-gray-50 rounded-lg">
                     <div className="text-sm text-gray-500">Total Cost</div>
                     <div className="text-2xl font-bold">₹{planData.totalCost.toLocaleString()}</div>
                   </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                     <div className="text-sm text-gray-500">Vehicles Used</div>
                     <div className="text-2xl font-bold">{planData.vehicles.length}</div>
                   </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                     <div className="text-sm text-gray-500">Total Weight</div>
                     <div className="text-2xl font-bold">{planData.totalWeight} kg</div>
                   </div>
                 </div>
                 {/* Re-using the plan visualization details would go here */}
          <PlanCreation
            selectedOrders={selectedOrders}
            materialTypes={materialTypes}
                    onGeneratePlan={onGeneratePlan} // Allow regeneration
                 />
               </div>
             ) : (
               <div className="text-center py-8 text-gray-500">Loading plan data...</div>
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
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
            
            {/* Step 1 */}
            <div className={`flex flex-col items-center ${currentStep === 'validate' ? 'text-primary-600' : (['generate','review'].includes(currentStep) ? 'text-green-600' : 'text-gray-500')}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 ${currentStep === 'validate' ? 'border-primary-600 text-primary-600' : (['generate','review'].includes(currentStep) ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-300')}`}>
                  {['generate','review'].includes(currentStep) ? <CheckCircle className="h-6 w-6" /> : <span>1</span>}
               </div>
               <span className="mt-2 text-sm font-medium bg-gray-50 px-2">Validation</span>
            </div>

             {/* Step 2 */}
             <div className={`flex flex-col items-center ${currentStep === 'generate' ? 'text-primary-600' : (currentStep === 'review' ? 'text-green-600' : 'text-gray-500')}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 ${currentStep === 'generate' ? 'border-primary-600 text-primary-600' : (currentStep === 'review' ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-300')}`}>
                  {currentStep === 'review' ? <CheckCircle className="h-6 w-6" /> : <span>2</span>}
               </div>
               <span className="mt-2 text-sm font-medium bg-gray-50 px-2">Plan Generation</span>
            </div>

             {/* Step 3 */}
             <div className={`flex flex-col items-center ${currentStep === 'review' ? 'text-primary-600' : 'text-gray-500'}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 ${currentStep === 'review' ? 'border-primary-600 text-primary-600' : 'border-gray-300'}`}>
                  <span>3</span>
               </div>
               <span className="mt-2 text-sm font-medium bg-gray-50 px-2">Review & Publish</span>
            </div>
         </div>
      </div>

      {/* Step Content */}
      <div className="transition-all duration-300 ease-in-out">
         {currentStep === 'validate' && renderValidationStep()}
         {currentStep === 'generate' && renderGenerationStep()}
         {currentStep === 'review' && renderReviewStep()}
      </div>
    </div>
  );
};

export default CreatePlanPage;

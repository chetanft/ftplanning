import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StackingEditor from './StackingEditor';
import { evaluateManualPlan } from '../utils/smartLoadingEngine';

const PlanEditModal = ({ isOpen, onClose, onSave, currentPlan, allOrders, vehicleSpecs }) => {
    const [placedItems, setPlacedItems] = useState([]);
    const [unplannedItems, setUnplannedItems] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [warnings, setWarnings] = useState([]);

    // Initialize state when modal opens or plan changes
    useEffect(() => {
        if (isOpen && currentPlan && allOrders) {
            // If currentPlan has items with positions, use them
            // Otherwise, if it's a new plan, all items might be unplanned
            const planItems = currentPlan.items || [];
            const placed = planItems.filter(i => i.position);

            // Find items that are not in the placed list
            const placedIds = new Set(placed.map(i => i.id));
            const unplanned = allOrders.filter(i => !placedIds.has(i.id));

            // Enrich items with drop sequence if available
            // Assuming allOrders are sorted by drop sequence or have route info
            // If not, we can try to derive it from route order
            const enrichedPlaced = placed.map((item, idx) => ({ ...item, dropSequence: item.dropSequence || idx + 1 }));
            const enrichedUnplanned = unplanned.map((item, idx) => ({ ...item, dropSequence: item.dropSequence || placed.length + idx + 1 }));

            setPlacedItems(enrichedPlaced);
            setUnplannedItems(enrichedUnplanned);

            // Initial evaluation
            updateMetrics(enrichedPlaced);
        }
    }, [isOpen, currentPlan, allOrders]);

    const updateMetrics = (items) => {
        if (!vehicleSpecs) return;
        const result = evaluateManualPlan(items, vehicleSpecs);
        setMetrics(result.metrics);
        setWarnings(result.warnings || []);
    };

    const handleItemMove = (itemId, targetLayerIndex) => {
        let newPlaced = [...placedItems];
        let newUnplanned = [...unplannedItems];

        // Find item in either list
        const placedIndex = newPlaced.findIndex(i => i.id === itemId);
        const unplannedIndex = newUnplanned.findIndex(i => i.id === itemId);

        let item;

        if (placedIndex >= 0) {
            item = newPlaced[placedIndex];
            // Remove from placed temporarily
            newPlaced.splice(placedIndex, 1);
        } else if (unplannedIndex >= 0) {
            item = newUnplanned[unplannedIndex];
            // Remove from unplanned
            newUnplanned.splice(unplannedIndex, 1);
        }

        if (!item) return;

        if (targetLayerIndex !== null) {
            // Moving to a layer
            // Assign new position based on layer
            // For simplicity, we assign a valid Y range. X and Z are kept if existing, or defaulted.
            // In a real app, we'd find the best spot. Here we just set the Y.
            const layerHeight = 500; // mm
            const yMin = targetLayerIndex * layerHeight;

            const newItem = {
                ...item,
                position: {
                    x: item.position?.x || 0,
                    y: yMin + 10, // Slight offset
                    z: item.position?.z || 0
                },
                stackingLevel: targetLayerIndex
            };

            newPlaced.push(newItem);
        } else {
            // Moving to unplanned
            const newItem = { ...item, position: null, stackingLevel: null };
            newUnplanned.push(newItem);
        }

        setPlacedItems(newPlaced);
        setUnplannedItems(newUnplanned);
        updateMetrics(newPlaced);
    };

    const handleSave = () => {
        onSave({
            items: [...placedItems, ...unplannedItems],
            metrics,
            warnings
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-white">
                    <div>
                        <h2 className="text-xl font-semibold">Edit Load Plan</h2>
                        <p className="text-sm text-muted-foreground">
                            Drag items to arrange the load.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {metrics && (
                            <div className="flex gap-4 text-sm">
                                <div className="flex flex-col items-end">
                                    <span className="text-muted-foreground">Weight Util</span>
                                    <span className={`font-medium ${metrics.weightUtilization > 90 ? 'text-green-600' : 'text-gray-900'}`}>
                                        {Math.round(metrics.weightUtilization)}%
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-muted-foreground">Volume Util</span>
                                    <span className={`font-medium ${metrics.volumeUtilization > 90 ? 'text-green-600' : 'text-gray-900'}`}>
                                        {Math.round(metrics.volumeUtilization)}%
                                    </span>
                                </div>
                            </div>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-4 bg-gray-50">
                    {warnings.length > 0 && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-orange-700">
                                <div className="font-medium">Plan Warnings</div>
                                <ul className="list-disc list-inside">
                                    {warnings.slice(0, 3).map((w, i) => (
                                        <li key={i}>{w.message}</li>
                                    ))}
                                    {warnings.length > 3 && <li>+{warnings.length - 3} more warnings</li>}
                                </ul>
                            </div>
                        </div>
                    )}

                    <StackingEditor
                        unplannedItems={unplannedItems}
                        placedItems={placedItems}
                        vehicleSpecs={vehicleSpecs}
                        onItemMove={handleItemMove}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t bg-white">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default PlanEditModal;

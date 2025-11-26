import React, { useState, useMemo } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Layers, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { getPackagingIcon } from '../utils/packagingTypes';
import { FRAGILITY_DESCRIPTIONS } from '../utils/fragilityScoring';

// Draggable Item Component
const DraggableItem = ({ item, isOverlay = false }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
        data: { item }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        touchAction: 'none',
    };

    const IconComponent = getPackagingIcon(item.packagingType || 'corrugated_box');
    const fragilityColor = FRAGILITY_DESCRIPTIONS[item.fragilityScore || item.analysis?.fragility?.score || 1]?.color || '#6b7280';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`p-2 border rounded-md bg-white shadow-sm flex items-center gap-2 ${isOverlay ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}
        >
            <div className="p-1 rounded bg-gray-50">
                <IconComponent className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.name || item.id}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{item.weight}kg</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span style={{ color: fragilityColor }}>
                        {FRAGILITY_DESCRIPTIONS[item.fragilityScore || item.analysis?.fragility?.score || 1]?.label}
                    </span>
                    {item.dropSequence && (
                        <span className="ml-auto text-xs font-bold bg-gray-200 px-1.5 rounded text-gray-700" title="Drop Sequence">
                            #{item.dropSequence}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Droppable Layer Component
const DroppableLayer = ({ layerIndex, items, vehicleSpecs, height, isOver }) => {
    const { setNodeRef } = useDroppable({
        id: `layer-${layerIndex}`,
        data: { layerIndex }
    });

    return (
        <div
            ref={setNodeRef}
            className={`border-2 border-dashed rounded-lg p-3 transition-colors min-h-[100px] ${isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
        >
            <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Layer {layerIndex + 1}
                    <span className="text-xs font-normal text-gray-500">
                        ({layerIndex * 500}mm - {(layerIndex + 1) * 500}mm)
                    </span>
                </div>
                <div className="text-xs text-gray-500">
                    {items.length} items
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {items.map(item => (
                    <DraggableItem key={item.id} item={item} />
                ))}
                {items.length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-gray-400 italic">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    );
};

const StackingEditor = ({
    unplannedItems = [],
    placedItems = [],
    vehicleSpecs,
    onItemMove
}) => {
    const [activeId, setActiveId] = useState(null);

    // Group placed items by layer
    const layers = useMemo(() => {
        const grouped = {};
        // Initialize 4 layers (assuming 2m height / 500mm)
        for (let i = 0; i < 4; i++) grouped[i] = [];

        placedItems.forEach(item => {
            const layerIndex = item.stackingLevel || Math.floor((item.position?.y || 0) / 500);
            if (!grouped[layerIndex]) grouped[layerIndex] = [];
            grouped[layerIndex].push(item);
        });

        return grouped;
    }, [placedItems]);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (over) {
            const itemId = active.id;
            const targetLayerIndex = over.data.current?.layerIndex;

            if (targetLayerIndex !== undefined) {
                // Moved to a layer
                onItemMove(itemId, targetLayerIndex);
            } else if (over.id === 'unplanned-list') {
                // Moved back to unplanned
                onItemMove(itemId, null);
            }
        }
    };

    const activeItem = useMemo(() => {
        if (!activeId) return null;
        return [...unplannedItems, ...placedItems].find(i => i.id === activeId);
    }, [activeId, unplannedItems, placedItems]);

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex h-[600px] gap-4">
                {/* Left Panel: Unplanned Items */}
                <div className="w-1/3 flex flex-col border rounded-lg bg-white overflow-hidden">
                    <div className="p-3 border-b bg-gray-50 font-medium text-sm flex justify-between items-center">
                        <span>Unplanned Items</span>
                        <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs">{unplannedItems.length}</span>
                    </div>
                    <UnplannedList items={unplannedItems} />
                </div>

                {/* Right Panel: Truck Layers */}
                <div className="flex-1 flex flex-col border rounded-lg bg-white overflow-hidden">
                    <div className="p-3 border-b bg-gray-50 font-medium text-sm">
                        Truck Loading Plan ({vehicleSpecs?.name})
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {Object.keys(layers).map(layerIndex => (
                            <DroppableLayer
                                key={layerIndex}
                                layerIndex={parseInt(layerIndex)}
                                items={layers[layerIndex]}
                                vehicleSpecs={vehicleSpecs}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeItem ? <DraggableItem item={activeItem} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
};

// Droppable Unplanned List
const UnplannedList = ({ items }) => {
    const { setNodeRef } = useDroppable({
        id: 'unplanned-list'
    });

    return (
        <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {items.map(item => (
                <DraggableItem key={item.id} item={item} />
            ))}
            {items.length === 0 && (
                <div className="text-center text-sm text-gray-400 mt-10">
                    All items placed
                </div>
            )}
        </div>
    );
};

export default StackingEditor;

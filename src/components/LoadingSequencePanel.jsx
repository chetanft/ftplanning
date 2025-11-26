import React from 'react';
import { Package, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

/**
 * LoadingSequencePanel - Displays FILO loading sequence
 * Shows which items should be loaded first based on drop sequence
 */
const LoadingSequencePanel = ({ planData, selectedItem, onItemSelect }) => {
  if (!planData || !planData.items || planData.items.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Loading Sequence (FILO)</h3>
        <p className="text-sm text-gray-500">No items to display</p>
      </div>
    );
  }

  // Sort items by loading order
  const sortedItems = [...planData.items].sort((a, b) => {
    const orderA = a.loadingOrder || 0;
    const orderB = b.loadingOrder || 0;
    return orderA - orderB;
  });

  // Get color based on loading position
  const getPositionColor = (position) => {
    switch (position) {
      case 'FIRST':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'LAST':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get drop sequence badge color
  const getDropSequenceColor = (dropSeq) => {
    if (!dropSeq) return 'bg-gray-200 text-gray-600';
    if (dropSeq === 1) return 'bg-red-200 text-red-700';
    if (dropSeq === 2) return 'bg-orange-200 text-orange-700';
    if (dropSeq === 3) return 'bg-yellow-200 text-yellow-700';
    return 'bg-blue-200 text-blue-700';
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Loading Sequence (FILO)</h3>
        <p className="text-xs text-gray-600">
          First-In-Last-Out: Items delivered first are loaded last (near door)
        </p>
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-xs font-medium text-blue-900 mb-2">How FILO Works:</div>
        <div className="space-y-1 text-xs text-blue-700">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
            <span>Drop 1 (First delivery) → Load LAST</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
            <span>Drop 2 (Second delivery) → Load MIDDLE</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
            <span>Drop 3+ (Later delivery) → Load FIRST</span>
          </div>
        </div>
      </div>

      {/* Loading sequence list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedItems.map((item, index) => {
          const isSelected = selectedItem?.id === item.id;
          const loadingOrder = item.loadingOrder || index + 1;
          const dropSequence = item.dropSequence || 0;
          const position = item.loadingPosition || 'MIDDLE';

          return (
            <div
              key={`${item.id}-${index}-${loadingOrder}`}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onItemSelect && onItemSelect(item)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-sm">
                    {loadingOrder}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{item.id}</div>
                    <div className="text-xs text-gray-500">{item.seller}</div>
                  </div>
                </div>
                
                {/* Position badge */}
                <div className={`px-2 py-1 rounded text-xs font-medium border ${getPositionColor(position)}`}>
                  {position}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center text-gray-600">
                  <Package className="h-3 w-3 mr-1" />
                  <span>{item.quantity} units</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">{item.weight * item.quantity} kg</span>
                </div>
              </div>

              {/* Drop sequence indicator */}
              {dropSequence > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Drop Sequence:</span>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${getDropSequenceColor(dropSequence)}`}>
                      Drop #{dropSequence}
                      {dropSequence === 1 && ' (First - Load Last)'}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading direction indicator */}
              <div className="mt-2 flex items-center text-xs text-gray-500">
                {loadingOrder === 1 ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
                    <span>Load FIRST (at back of truck)</span>
                  </>
                ) : loadingOrder === sortedItems.length ? (
                  <>
                    <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                    <span>Load LAST (near door)</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-3 w-3 mr-1 text-gray-400" />
                    <span>Load in middle</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{sortedItems.length}</div>
            <div className="text-xs text-gray-500">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.max(...sortedItems.map(item => item.dropSequence || 0))}
            </div>
            <div className="text-xs text-gray-500">Drop Points</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSequencePanel;


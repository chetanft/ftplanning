import React, { useState, useEffect } from 'react';
import { X, Package, Circle, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const MaterialTypeModal = ({ isOpen, onClose, onSelect, preSelectedTypes = [] }) => {
  const [selectedTypes, setSelectedTypes] = useState(preSelectedTypes);

  useEffect(() => {
    setSelectedTypes(preSelectedTypes);
  }, [preSelectedTypes]);

  if (!isOpen) return null;

  const materialOptions = [
    {
      id: 'cuboidal',
      name: 'Cuboidal',
      description: 'Rectangular boxes, cartons, pallets',
      icon: Package,
      color: 'border-blue-500 bg-blue-50',
      examples: ['Cartons', 'Boxes', 'Pallets', 'Crates'],
      dimensions: ['Length', 'Width', 'Height'],
      constraints: ['Stackable', 'Max Stack Height', 'Orientation']
    },
    {
      id: 'cylindrical',
      name: 'Cylindrical',
      description: 'Drums, rolls, pipes, cylinders',
      icon: Circle,
      color: 'border-green-500 bg-green-50',
      examples: ['Drums', 'Rolls', 'Pipes', 'Cylinders'],
      dimensions: ['Diameter', 'Height'],
      constraints: ['Orientation (V/H)', 'Nesting', 'Fragility']
    },
    {
      id: 'both',
      name: 'Mixed Load',
      description: 'Combination of cuboidal and cylindrical items',
      icon: Layers,
      color: 'border-purple-500 bg-purple-50',
      examples: ['Mixed shipments', 'Complex loads'],
      dimensions: ['Variable based on items'],
      constraints: ['Combined optimization rules']
    }
  ];

  const handleTypeToggle = (typeId) => {
    if (typeId === 'both') {
      setSelectedTypes(['both']);
    } else {
      const newSelection = selectedTypes.includes(typeId)
        ? selectedTypes.filter(id => id !== typeId && id !== 'both')
        : [...selectedTypes.filter(id => id !== 'both'), typeId];

      if (newSelection.includes('cuboidal') && newSelection.includes('cylindrical')) {
        setSelectedTypes(['both']);
      } else {
        setSelectedTypes(newSelection);
      }
    }
  };

  const handleContinue = () => {
    if (selectedTypes.length === 0) {
      alert('Please select at least one material type');
      return;
    }
    onSelect(selectedTypes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              Select Material Types for Planning
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the type of materials you want to plan for optimal loading
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {materialOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedTypes.includes(option.id) ||
                (selectedTypes.includes('both') && option.id !== 'both');

              return (
                <div
                  key={option.id}
                  onClick={() => handleTypeToggle(option.id)}
                  className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? `${option.color} border-opacity-100 shadow-md`
                      : 'bg-card border-border hover:border-muted-foreground/50'
                  }`}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-semibold mb-2">
                    {option.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {option.description}
                  </p>

                  {/* Examples */}
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Examples
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {option.examples.map((example, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Dimensions
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      {Array.isArray(option.dimensions)
                        ? option.dimensions.join(', ')
                        : option.dimensions
                      }
                    </div>
                  </div>

                  {/* Constraints */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Key Constraints
                    </h4>
                    <div className="space-y-1">
                      {option.constraints.map((constraint, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-center">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full mr-2"></div>
                          {constraint}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Types Summary */}
          {selectedTypes.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Selected Material Types:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTypes.map((typeId) => {
                  const option = materialOptions.find(opt => opt.id === typeId);
                  return (
                    <Badge key={typeId} variant="default">
                      {option?.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedTypes.length === 0}
          >
            Continue to Planning
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MaterialTypeModal;

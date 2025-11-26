import React, { useState, useMemo } from 'react';
import { AlertTriangle, Package, Shield, Thermometer, Droplets, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { FRAGILITY_DESCRIPTIONS, MATERIAL_PROFILES, assessOrderFragility } from '../utils/fragilityScoring';
import { getPackagingType, recommendPackaging, getPackagingIcon } from '../utils/packagingTypes';
import { fragilityLevels, materialProfileOptions, packagingTypeOptions } from '../data/mockData';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/**
 * FragilityPanel - Component for viewing and editing fragility/packaging settings
 */
const FragilityPanel = ({ 
  orders = [], 
  selectedOrder = null, 
  onUpdateOrder = null,
  onBulkUpdate = null,
  readOnly = false 
}) => {
  const [expandedSection, setExpandedSection] = useState('fragility');
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Calculate fragility summary for all orders
  const fragilitySummary = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    const scores = orders.map(o => {
      const assessment = assessOrderFragility(o);
      return assessment.score;
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    scores.forEach(s => distribution[s] = (distribution[s] || 0) + 1);

    return {
      average: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      max: Math.max(...scores),
      distribution,
      hasFragile: scores.some(s => s >= 4),
      hasExtremelyFragile: scores.includes(5),
      totalOrders: orders.length
    };
  }, [orders]);

  // Get current order's fragility assessment
  const currentAssessment = useMemo(() => {
    if (!selectedOrder) return null;
    return assessOrderFragility(selectedOrder);
  }, [selectedOrder]);

  // Get packaging recommendations
  const packagingRecommendations = useMemo(() => {
    if (!selectedOrder) return [];
    const fragility = currentAssessment?.score || 2;
    return recommendPackaging(fragility, {
      moistureProtection: selectedOrder.moistureSensitive,
      temperatureControl: selectedOrder.temperatureControlled,
      heavyDuty: (selectedOrder.weight * (selectedOrder.quantity || 1)) > 50
    });
  }, [selectedOrder, currentAssessment]);

  // Handle fragility score change
  const handleFragilityChange = (score) => {
    if (readOnly || !onUpdateOrder || !selectedOrder) return;
    onUpdateOrder(selectedOrder.id, { fragilityScore: score });
  };

  // Handle packaging type change
  const handlePackagingChange = (packagingType) => {
    if (readOnly || !onUpdateOrder || !selectedOrder) return;
    onUpdateOrder(selectedOrder.id, { packagingType });
  };

  // Handle material profile change
  const handleProfileChange = (materialProfile) => {
    if (readOnly || !onUpdateOrder || !selectedOrder) return;
    const profile = MATERIAL_PROFILES[materialProfile];
    onUpdateOrder(selectedOrder.id, { 
      materialProfile,
      fragilityScore: profile?.baseFragility || 2
    });
  };

  // Render fragility level selector
  const renderFragilitySelector = () => (
    <div className="space-y-3">
      <Label>Fragility Level</Label>
      <div className="grid grid-cols-5 gap-2">
        {fragilityLevels.map(level => {
          const isSelected = currentAssessment?.score === level.score;
          return (
            <Button
              key={level.score}
              variant={isSelected ? "default" : "outline"}
              onClick={() => handleFragilityChange(level.score)}
              disabled={readOnly}
              className="flex flex-col h-auto py-2"
              style={{ 
                borderColor: isSelected ? level.color : undefined,
                backgroundColor: isSelected ? `${level.color}15` : undefined
              }}
            >
              <span 
                className="text-xl font-bold"
                style={{ color: level.color }}
              >
                {level.score}
              </span>
              <span className="text-xs truncate">
                {level.label}
              </span>
            </Button>
          );
        })}
      </div>
      
      {currentAssessment && (
        <Card className="mt-2" style={{ backgroundColor: `${currentAssessment.color}15` }}>
          <CardContent className="p-3">
          <div className="flex items-center">
            <Shield 
              className="h-5 w-5 mr-2" 
              style={{ color: currentAssessment.color }}
            />
            <span className="font-medium" style={{ color: currentAssessment.color }}>
              {currentAssessment.label}
            </span>
          </div>
            <p className="text-sm text-muted-foreground mt-1">
            {currentAssessment.description}
          </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render packaging selector
  const renderPackagingSelector = () => {
    const currentPackaging = selectedOrder?.packagingType || 'corrugated_box';
    const packagingInfo = getPackagingType(currentPackaging);

    return (
      <div className="space-y-3">
        <Label>Packaging Type</Label>
        
        <Select
            value={currentPackaging}
          onValueChange={handlePackagingChange}
            disabled={readOnly}
          >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {packagingTypeOptions.map(opt => {
              const IconComponent = getPackagingIcon(opt.id);
              return (
                <SelectItem key={opt.id} value={opt.id}>
            <div className="flex items-center">
                    <IconComponent className="h-4 w-4 mr-2" />
                    {opt.label}
            </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {packagingInfo && (
          <Card>
            <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
                {(() => {
                  const IconComponent = getPackagingIcon(currentPackaging);
                  return <IconComponent className="h-6 w-6 text-muted-foreground" />;
                })()}
                <span className="text-sm text-muted-foreground">{packagingInfo.description}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                  <Package className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>Crush: {packagingInfo.protection.crush}/5</span>
              </div>
              <div className="flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>Shock: {packagingInfo.protection.shock}/5</span>
              </div>
              <div className="flex items-center">
                  <Droplets className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>Moisture: {packagingInfo.protection.moisture}/5</span>
              </div>
              <div className="flex items-center">
                  <Thermometer className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>Temp: {packagingInfo.protection.temperature}/5</span>
              </div>
            </div>
              <div className="mt-2 text-xs text-muted-foreground">
              Max stack: {packagingInfo.stackability.maxStackWeight}kg, {packagingInfo.stackability.maxStackLayers} layers
            </div>
            </CardContent>
          </Card>
        )}

        {/* Packaging recommendations */}
        {showRecommendations && packagingRecommendations.length > 0 && (
          <div className="mt-3 space-y-2">
            <Label className="text-sm">Recommended Packaging:</Label>
            {packagingRecommendations.slice(0, 3).map((rec, idx) => {
              const IconComponent = getPackagingIcon(rec.packaging.id);
              return (
                <Button
                  key={rec.packaging.id}
                  variant="outline"
                  onClick={() => handlePackagingChange(rec.packaging.id)}
                  disabled={readOnly}
                  className="w-full justify-between h-auto py-2"
                >
                  <span className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {rec.packaging.label}
                    </span>
                  <Badge variant="success" className="text-xs">
                      {rec.suitabilityScore}% match
                  </Badge>
                </Button>
              );
            })}
          </div>
        )}

        <Button
          variant="link"
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="p-0 h-auto"
        >
          {showRecommendations ? 'Hide recommendations' : 'Show recommendations'}
        </Button>
      </div>
    );
  };

  // Render material profile selector
  const renderProfileSelector = () => {
    const currentProfile = selectedOrder?.materialProfile || 'GENERAL';

    return (
      <div className="space-y-3">
        <Label>Material Profile</Label>
        <Select
          value={currentProfile}
          onValueChange={handleProfileChange}
          disabled={readOnly}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
          {materialProfileOptions.map(opt => (
              <SelectItem key={opt.id} value={opt.id}>
              {opt.label} (Fragility: {opt.fragilityScore})
              </SelectItem>
          ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Render summary for all orders
  const renderSummary = () => {
    if (!fragilitySummary) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Load Fragility Summary</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
              <div className="text-2xl font-bold">{fragilitySummary.average}</div>
              <div className="text-xs text-muted-foreground">Avg Fragility</div>
          </div>
          <div className="text-center">
              <div className="text-2xl font-bold">{fragilitySummary.totalOrders}</div>
              <div className="text-xs text-muted-foreground">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: FRAGILITY_DESCRIPTIONS[fragilitySummary.max]?.color }}>
              {fragilitySummary.max}
            </div>
              <div className="text-xs text-muted-foreground">Max Fragility</div>
          </div>
        </div>

        {/* Distribution bar */}
        <div className="space-y-1">
            <div className="text-xs text-muted-foreground mb-1">Distribution:</div>
          <div className="flex h-6 rounded-lg overflow-hidden">
            {[1, 2, 3, 4, 5].map(level => {
              const count = fragilitySummary.distribution[level] || 0;
              const percentage = (count / fragilitySummary.totalOrders) * 100;
              if (percentage === 0) return null;
              
              return (
                <div
                  key={level}
                  className="flex items-center justify-center text-xs text-white font-medium"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: fragilityLevels.find(l => l.score === level)?.color,
                    minWidth: percentage > 0 ? '20px' : 0
                  }}
                  title={`Level ${level}: ${count} orders (${percentage.toFixed(1)}%)`}
                >
                  {percentage >= 10 ? count : ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warnings */}
        {fragilitySummary.hasExtremelyFragile && (
            <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center">
              <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
              <span className="text-sm text-destructive">
              Contains extremely fragile items - special handling required
            </span>
          </div>
        )}

        {fragilitySummary.hasFragile && !fragilitySummary.hasExtremelyFragile && (
            <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded-lg flex items-center">
              <AlertTriangle className="h-4 w-4 text-warning mr-2" />
              <span className="text-sm text-warning">
              Contains fragile items - careful handling required
            </span>
          </div>
        )}
        </CardContent>
      </Card>
    );
  };

  // Collapsible section component
  const Section = ({ id, title, icon: Icon, children }) => {
    const isExpanded = expandedSection === id;
    
    return (
      <Card>
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg"
        >
          <div className="flex items-center">
            <Icon className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="font-medium">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <CardContent className="pt-0">
            {children}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fragility & Packaging</h3>
        {!readOnly && selectedOrder && (
          <span className="text-sm text-muted-foreground">
            Editing: {selectedOrder.id}
          </span>
        )}
      </div>

      {/* Summary for all orders */}
      {renderSummary()}

      {/* No order selected message */}
      {!selectedOrder && (
        <div className="text-center py-8 text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select an order to view and edit fragility settings</p>
        </div>
      )}

      {/* Order-specific settings */}
      {selectedOrder && (
        <div className="space-y-3">
          <Section id="fragility" title="Fragility Level" icon={Shield}>
            {renderFragilitySelector()}
          </Section>

          <Section id="packaging" title="Packaging Type" icon={Package}>
            {renderPackagingSelector()}
          </Section>

          <Section id="profile" title="Material Profile" icon={Info}>
            {renderProfileSelector()}
          </Section>
        </div>
      )}
    </div>
  );
};

export default FragilityPanel;

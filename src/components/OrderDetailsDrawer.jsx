import React from 'react';
import { X, Package, Truck, MapPin, User, Calendar, AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

/**
 * OrderDetailsDrawer - Displays complete order metadata in a drawer
 */
const OrderDetailsDrawer = ({ order, isOpen, onClose }) => {
    if (!order) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRiskBadgeColor = (risk) => {
        if (risk < 20) return 'bg-green-500 text-white';
        if (risk < 40) return 'bg-yellow-500 text-white';
        if (risk < 70) return 'bg-orange-500 text-white';
        return 'bg-red-500 text-white';
    };

    const getPriorityBadgeColor = (priority) => {
        const p = priority?.toLowerCase();
        if (p === 'urgent' || p === 'high') return 'destructive';
        if (p === 'delayed' || p === 'low') return 'secondary';
        return 'default';
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold">Order Details</SheetTitle>
                    <SheetDescription>
                        Complete information for {order.id}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {/* Order Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                                <Package className="h-4 w-4 mr-2 text-primary" />
                                Order Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Order ID:</span>
                                <span className="font-medium">{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">DO ID:</span>
                                <span className="font-medium">{order.doId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant="outline">{order.status || 'N/A'}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Priority:</span>
                                <Badge variant={getPriorityBadgeColor(order.priority)}>
                                    {order.priority || 'N/A'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Route Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-primary" />
                                Route Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Route:</span>
                                <span className="font-medium">{order.routeName || order.route}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Origin:</span>
                                <span className="font-medium">{order.pickup || order.plantOrigin}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Destination:</span>
                                <span className="font-medium">{order.delivery || order.destination}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dispatch Date:</span>
                                <span className="font-medium">{formatDate(order.dispatchDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Route Risk:</span>
                                <Badge className={
                                    order.routeRiskLevel === 'High' ? 'bg-red-500 text-white' :
                                        order.routeRiskLevel === 'Medium' ? 'bg-yellow-500 text-white' :
                                            'bg-green-500 text-white'
                                }>
                                    {order.routeRiskLevel || 'N/A'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parties */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                                <User className="h-4 w-4 mr-2 text-primary" />
                                Parties
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Seller/Consignor:</span>
                                <span className="font-medium">{order.seller}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Customer/Consignee:</span>
                                <span className="font-medium">{order.customer}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                                <Package className="h-4 w-4 mr-2 text-primary" />
                                Product Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">SKU Type:</span>
                                <span className="font-medium">{order.skuType || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Bottle Size:</span>
                                <span className="font-medium">{order.bottleSize ? `${order.bottleSize} ml` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="font-medium">{order.quantity} units</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Packaging:</span>
                                <span className="font-medium">{order.packagingType || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Material Profile:</span>
                                <span className="font-medium text-xs">{order.materialProfile || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Physical Specifications */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                                Physical Specifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dimensions (L×W×H):</span>
                                <span className="font-medium">
                                    {order.dimensions ?
                                        `${order.dimensions.length}×${order.dimensions.width}×${order.dimensions.height} mm` :
                                        'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Weight:</span>
                                <span className="font-medium">{order.weight} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Weight:</span>
                                <span className="font-medium">{(order.weight * order.quantity).toFixed(2)} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Stackable:</span>
                                <Badge variant={order.stackable ? "default" : "secondary"}>
                                    {order.stackable ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            {order.stackable && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Max Stack Height:</span>
                                    <span className="font-medium">{order.maxStackHeight} mm</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Risk Assessment */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-primary" />
                                Risk Assessment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fragility Score:</span>
                                <Badge className={
                                    order.fragilityScore >= 4 ? 'bg-red-500 text-white' :
                                        order.fragilityScore === 3 ? 'bg-yellow-500 text-white' :
                                            'bg-green-500 text-white'
                                }>
                                    {order.fragilityScore}/5
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Breakage Risk:</span>
                                <Badge className={getRiskBadgeColor(order.breakageRisk)}>
                                    {order.breakageRisk}%
                                </Badge>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Loading Instructions:</span>
                                <div className="flex flex-wrap gap-1">
                                    {order.loadingInstructions?.map((instruction, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {instruction}
                                        </Badge>
                                    )) || <span className="text-sm">N/A</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logistics */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                                <Truck className="h-4 w-4 mr-2 text-primary" />
                                Logistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Vehicle Recommendation:</span>
                                <span className="font-medium text-xs">{order.vehicleRecommendation || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">AI Plan Status:</span>
                                <Badge className={
                                    order.aiPlanStatus === 'AI Recommended' ? 'bg-green-500 text-white' :
                                        order.aiPlanStatus === 'Failed' ? 'bg-red-500 text-white' :
                                            order.aiPlanStatus === 'Manual Override' ? 'bg-blue-500 text-white' :
                                                'bg-gray-500 text-white'
                                }>
                                    {order.aiPlanStatus || 'N/A'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default OrderDetailsDrawer;

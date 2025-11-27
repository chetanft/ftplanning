import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Package, ArrowRight, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const BreakageDrawer = ({ isOpen, onClose, plans = [], totalBreakage = 0 }) => {
    // Filter orders with breakage
    const brokenOrders = plans.flatMap(plan =>
        plan.orders
            .filter(order => order.breakageCount > 0)
            .map(order => ({ ...order, planId: plan.id, date: plan.date }))
    );

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="h-screen">
                <DrawerHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DrawerTitle className="text-xl flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                                Breakage Analysis
                            </DrawerTitle>
                            <DrawerDescription className="mt-1">
                                {totalBreakage} bottles broken in past manual plans
                            </DrawerDescription>
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon">
                                <X className="h-5 w-5" />
                            </Button>
                        </DrawerClose>
                    </div>
                </DrawerHeader>

                <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    {/* Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-800">Optimization Opportunity</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                If the right packaging is chosen, we can significantly reduce the breakage.
                                See below for past orders where suboptimal packaging led to high risk.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">High Risk Orders</h3>

                        {brokenOrders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No breakage records found.</div>
                        ) : (
                            <div className="grid gap-4">
                                {brokenOrders.map((order, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-lg">{order.id}</span>
                                                    <span className="text-xs text-gray-500">({order.date})</span>
                                                </div>
                                                <div className="text-sm text-gray-500">{order.sku}</div>
                                            </div>
                                            <Badge variant="destructive" className="text-sm px-3 py-1">
                                                {order.breakageCount} Broken
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Packaging Comparison */}
                                            <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                                                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Packaging Analysis</div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Chosen:</span>
                                                        <span className="text-sm font-medium text-red-600 flex items-center gap-1">
                                                            {order.packaging}
                                                            <AlertTriangle className="h-3 w-3" />
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Recommended:</span>
                                                        <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                                            {order.recommendedPackaging}
                                                            <Package className="h-3 w-3" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Risk Score */}
                                            <div className="flex flex-col justify-center items-center bg-red-50 p-3 rounded-md border border-red-100">
                                                <div className="text-xs font-semibold text-red-600 uppercase mb-1">Risk Score</div>
                                                <div className="text-2xl font-bold text-red-700">{order.riskScore}%</div>
                                                <div className="text-xs text-red-500 mt-1">High Probability of Damage</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default BreakageDrawer;

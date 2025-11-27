import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, DollarSign, ArrowRight, Lightbulb } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

const CostDrawer = ({ isOpen, onClose, plans = [], totalCost = 0, potentialSavings = 0 }) => {

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="h-screen">
                <DrawerHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DrawerTitle className="text-xl flex items-center gap-2 text-orange-600">
                                <DollarSign className="h-6 w-6" />
                                Freight Cost Analysis
                            </DrawerTitle>
                            <DrawerDescription className="mt-1">
                                Total freight cost: ₹{totalCost.toLocaleString()}
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
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-green-800">Cost Reduction Opportunity</h4>
                            <p className="text-sm text-green-700 mt-1">
                                If weight, volume, route, or distance were optimised better,
                                <span className="font-bold"> ₹{potentialSavings.toLocaleString()} </span>
                                could have been saved.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Inefficiency Breakdown by Plan</h3>

                        <div className="grid gap-4">
                            {plans.map((plan, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-medium text-lg">{plan.id}</div>
                                            <div className="text-sm text-gray-500">{plan.date} • {plan.mode}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">Cost: ₹{plan.totalCost.toLocaleString()}</div>
                                            {plan.inefficiency && (
                                                <div className="text-xs text-red-600 font-medium">
                                                    Potential Saving: ₹{plan.inefficiency.potentialSavings.toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {plan.inefficiency && (
                                        <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
                                            <div className="flex items-start gap-2">
                                                <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                                                <div>
                                                    <div className="text-sm font-semibold text-orange-800 mb-1">
                                                        {plan.inefficiency.type}
                                                    </div>
                                                    <p className="text-sm text-orange-700">
                                                        {plan.inefficiency.details}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Utilization Bars */}
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        {plan.vehicles.map((v, i) => (
                                            <div key={i} className="col-span-2 space-y-2">
                                                <div className="text-xs font-medium text-gray-500">{v.type} Utilization</div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Weight</span>
                                                        <span>{v.utilization.weight}%</span>
                                                    </div>
                                                    <Progress value={v.utilization.weight} className="h-1.5" indicatorClassName={v.utilization.weight < 70 ? 'bg-red-500' : 'bg-green-500'} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Volume</span>
                                                        <span>{v.utilization.volume}%</span>
                                                    </div>
                                                    <Progress value={v.utilization.volume} className="h-1.5" indicatorClassName={v.utilization.volume < 70 ? 'bg-red-500' : 'bg-green-500'} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default CostDrawer;

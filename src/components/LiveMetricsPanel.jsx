import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    DollarSign,
    Weight,
    Truck,
    Box,
    AlertTriangle,
    TrendingUp,
    Activity
} from 'lucide-react';

const LiveMetricsPanel = ({
    metrics = {
        totalCost: 0,
        totalWeight: 0,
        vehicleCount: 0,
        weightUtilization: 0,
        volumeUtilization: 0,
        fragilityRisk: 0
    }
}) => {

    const getUtilizationColor = (value) => {
        if (value > 100) return 'bg-red-500';
        if (value >= 90) return 'bg-green-500';
        if (value >= 70) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const getRiskColor = (value) => {
        if (value > 50) return 'text-red-600';
        if (value > 20) return 'text-orange-600';
        return 'text-green-600';
    };

    return (
        <Card className="border-t-4 border-t-blue-500 shadow-lg">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Live Plan Metrics
                    </h3>
                    <div className="text-xs text-gray-400">Updates in real-time</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 divide-x divide-gray-100">

                    {/* Total Cost */}
                    <div className="px-2">
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                            <DollarSign className="h-3 w-3" />
                            Total Cost
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            ₹{metrics.totalCost.toLocaleString()}
                        </div>
                    </div>

                    {/* Total Weight */}
                    <div className="px-2 pl-4">
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                            <Weight className="h-3 w-3" />
                            Total Weight
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            {metrics.totalWeight.toLocaleString()} kg
                        </div>
                    </div>

                    {/* Vehicles Used */}
                    <div className="px-2 pl-4">
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                            <Truck className="h-3 w-3" />
                            Vehicles
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            {metrics.vehicleCount}
                        </div>
                    </div>

                    {/* Weight Utilization */}
                    <div className="px-2 pl-4">
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                            <TrendingUp className="h-3 w-3" />
                            Weight Util.
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="text-xl font-bold text-gray-900">
                                {metrics.weightUtilization.toFixed(1)}%
                            </div>
                        </div>
                        <Progress
                            value={Math.min(metrics.weightUtilization, 100)}
                            className="h-1.5 mt-2"
                            indicatorClassName={getUtilizationColor(metrics.weightUtilization)}
                        />
                    </div>

                    {/* Volume Utilization */}
                    <div className="px-2 pl-4">
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                            <Box className="h-3 w-3" />
                            Volume Util.
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="text-xl font-bold text-gray-900">
                                {metrics.volumeUtilization.toFixed(1)}%
                            </div>
                        </div>
                        <Progress
                            value={Math.min(metrics.volumeUtilization, 100)}
                            className="h-1.5 mt-2"
                            indicatorClassName={getUtilizationColor(metrics.volumeUtilization)}
                        />
                    </div>

                    {/* Fragility Risk */}
                    <div className="px-2 pl-4">
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                            <AlertTriangle className="h-3 w-3" />
                            Fragility Risk
                        </div>
                        <div className={`text-xl font-bold ${getRiskColor(metrics.fragilityRisk)}`}>
                            {metrics.fragilityRisk}%
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {metrics.fragilityRisk > 50 ? 'High Risk' : metrics.fragilityRisk > 20 ? 'Moderate' : 'Low Risk'}
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};

export default LiveMetricsPanel;

export const manualPlans = [
    {
        id: 'PLN-2023-001',
        date: '2023-10-25',
        status: 'Completed',
        mode: 'Manual',
        totalCost: 45000,
        vehicles: [
            { type: 'Truck', count: 2, utilization: { weight: 65, volume: 50 } }
        ],
        orders: [
            {
                id: "ORD-001",
                sku: "Glass Bottle 750ml",
                quantity: 1200,
                packaging: "Shrink Wrap", // Poor choice
                recommendedPackaging: "Corrugated Box",
                breakageCount: 45,
                riskScore: 85,
                weight: 1200,
                volume: 2000
            },
            {
                id: "ORD-002",
                sku: "Plastic Bottle 500ml",
                quantity: 2000,
                packaging: "Carton",
                recommendedPackaging: "Carton",
                breakageCount: 0,
                riskScore: 10,
                weight: 1000,
                volume: 1500
            }
        ],
        inefficiency: {
            type: 'Underutilization',
            potentialSavings: 12000,
            details: "Weight utilization at 65%, could be 90% with better route planning."
        }
    },
    {
        id: 'PLN-2023-002',
        date: '2023-10-26',
        status: 'Completed',
        mode: 'Manual',
        totalCost: 28000,
        vehicles: [
            { type: 'Lcv', count: 1, utilization: { weight: 95, volume: 40 } }
        ],
        orders: [
            {
                id: "ORD-003",
                sku: "Ceramic Vase",
                quantity: 50,
                packaging: "None",
                recommendedPackaging: "Bubble Wrap + Box",
                breakageCount: 12,
                riskScore: 95,
                weight: 500,
                volume: 800
            }
        ],
        inefficiency: {
            type: 'Volume Mismatch',
            potentialSavings: 5000,
            details: "Volume utilization only 40%, larger vehicle chosen unnecessarily."
        }
    },
    {
        id: 'PLN-2023-003',
        date: '2023-10-27',
        status: 'Completed',
        mode: 'Manual',
        totalCost: 62000,
        vehicles: [
            { type: 'Truck', count: 3, utilization: { weight: 55, volume: 55 } }
        ],
        orders: [
            {
                id: "ORD-004",
                sku: "Electronics",
                quantity: 100,
                packaging: "Cardboard",
                recommendedPackaging: "Anti-static Box",
                breakageCount: 2,
                riskScore: 40,
                weight: 800,
                volume: 1200
            }
        ],
        inefficiency: {
            type: 'Route Optimization',
            potentialSavings: 15000,
            details: "3 vehicles used for a load that fits in 2. Route overlap detected."
        }
    },
    {
        id: 'PLN-2023-004',
        date: '2023-10-28',
        status: 'Completed',
        mode: 'Manual',
        totalCost: 35000,
        vehicles: [
            { type: 'Truck', count: 1, utilization: { weight: 80, volume: 45 } }
        ],
        orders: [
            {
                id: "ORD-005",
                sku: "Ceramic Plates Set",
                quantity: 200,
                packaging: "Paper Wrap",
                recommendedPackaging: "Bubble Wrap + Box",
                breakageCount: 15,
                riskScore: 90,
                weight: 800,
                volume: 600
            },
            {
                id: "ORD-006",
                sku: "Cutlery Set",
                quantity: 500,
                packaging: "Box",
                recommendedPackaging: "Box",
                breakageCount: 0,
                riskScore: 5,
                weight: 1000,
                volume: 400
            }
        ],
        inefficiency: {
            type: 'Volume Mismatch',
            potentialSavings: 8000,
            details: "Volume utilization 45%, could have used a smaller vehicle."
        }
    },
    {
        id: 'PLN-2023-005',
        date: '2023-10-29',
        status: 'Completed',
        mode: 'Manual',
        totalCost: 55000,
        vehicles: [
            { type: 'Truck', count: 2, utilization: { weight: 60, volume: 60 } }
        ],
        orders: [
            {
                id: "ORD-007",
                sku: "Laptop Monitors",
                quantity: 50,
                packaging: "Cardboard",
                recommendedPackaging: "Foam + Box",
                breakageCount: 5,
                riskScore: 75,
                weight: 400,
                volume: 800
            }
        ],
        inefficiency: {
            type: 'Route Optimization',
            potentialSavings: 10000,
            details: "Route overlap between two vehicles. Could be consolidated."
        }
    },
    {
        id: 'PLN-2023-006',
        date: '2023-10-30',
        status: 'Completed',
        mode: 'Manual',
        totalCost: 42000,
        vehicles: [
            { type: 'Truck', count: 1, utilization: { weight: 90, volume: 85 } }
        ],
        orders: [
            {
                id: "ORD-008",
                sku: "Wine Glasses",
                quantity: 300,
                packaging: "Divider Box",
                recommendedPackaging: "Divider Box + Bubble",
                breakageCount: 8,
                riskScore: 65,
                weight: 300,
                volume: 500
            }
        ],
        inefficiency: {
            type: 'Packaging Cost', // Not strictly freight, but adds to total cost context if we tracked it
            potentialSavings: 2000,
            details: "Slightly inefficient route sequence."
        }
    },
    {
        id: 'PLN-2023-007',
        date: '2023-11-01',
        status: 'Completed',
        mode: 'Manual',
        totalCost: 38000,
        vehicles: [
            { type: 'Truck', count: 1, utilization: { weight: 75, volume: 55 } }
        ],
        orders: [
            {
                id: "ORD-009",
                sku: "Porcelain Figurines",
                quantity: 150,
                packaging: "Newspaper",
                recommendedPackaging: "Foam Inserts",
                breakageCount: 20,
                riskScore: 92,
                weight: 300,
                volume: 400
            }
        ],
        inefficiency: {
            type: 'Packaging Risk',
            potentialSavings: 3000,
            details: "High breakage risk due to improper packaging."
        }
    },
    {
        id: 'PLN-2023-008',
        date: '2023-11-02',
        status: 'Completed',
        mode: 'Manual',
        totalCost: 48000,
        vehicles: [
            { type: 'Truck', count: 2, utilization: { weight: 50, volume: 45 } }
        ],
        orders: [
            {
                id: "ORD-010",
                sku: "Glass Vases",
                quantity: 100,
                packaging: "Cardboard Box",
                recommendedPackaging: "Double-walled Box",
                breakageCount: 5,
                riskScore: 60,
                weight: 500,
                volume: 800
            }
        ],
        inefficiency: {
            type: 'Underutilization',
            potentialSavings: 12000,
            details: "Two trucks used for a load that could fit in one."
        }
    }
];

// Helper to calculate totals dynamically
export const calculateKPISummary = (plans) => {
    return plans.reduce((acc, plan) => {
        acc.totalBreakage += plan.orders.reduce((sum, o) => sum + (o.breakageCount || 0), 0);
        acc.totalCost += plan.totalCost;
        acc.potentialSavings += plan.inefficiency?.potentialSavings || 0;
        return acc;
    }, { totalBreakage: 0, totalCost: 0, potentialSavings: 0 });
};

export const kpiSummary = calculateKPISummary(manualPlans);

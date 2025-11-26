// Mock data for SmartDispatch Planner

export const routes = [
  {
    id: 'DEL-MUM',
    name: 'Delhi → Mumbai',
    origin: 'Delhi',
    destination: 'Mumbai',
    via: 'Jaipur',
    distance: 1400,
    estimatedTime: '18 hours'
  },
  {
    id: 'DEL-HYD',
    name: 'Delhi → Hyderabad',
    origin: 'Delhi',
    destination: 'Hyderabad',
    via: 'Nagpur',
    distance: 1500,
    estimatedTime: '20 hours'
  },
  {
    id: 'DEL-CHE',
    name: 'Delhi → Chennai',
    origin: 'Delhi',
    destination: 'Chennai',
    via: 'Bangalore',
    distance: 2200,
    estimatedTime: '28 hours'
  },
  {
    id: 'DEL-BAN',
    name: 'Delhi → Bangalore',
    origin: 'Delhi',
    destination: 'Bangalore',
    via: 'Hyderabad',
    distance: 2100,
    estimatedTime: '26 hours'
  }
];

// Vehicle type configurations with specifications for different cargo needs
// Includes fragility-handling capabilities for AI recommendations
export const vehicleTypes = [
  {
    id: 'TATA_ACE',
    name: 'Tata Ace',
    category: 'mini',
    maxWeight: 750, // kg
    dimensions: {
      length: 2100, // mm - 7 feet
      width: 1520, // mm - 5 feet
      height: 1520 // mm - 5 feet
    },
    volume: 4.9, // cubic meters
    costPerKm: 8, // INR per kilometer
    // Fragility handling capabilities
    suspensionQuality: 2, // 1-5 scale (1=rough, 5=air-ride)
    climateControl: false,
    shockAbsorption: 2,
    loadSecuring: ['straps', 'ropes'],
    suitableFor: ['general', 'textiles', 'dry_food'],
    notSuitableFor: ['glass', 'electronics_sensitive', 'pharma_sensitive'],
    features: ['Quick delivery', 'Urban areas', 'Last mile']
  },
  {
    id: 'EICHER_14FT',
    name: 'Eicher 14ft',
    category: 'medium',
    maxWeight: 4500, // kg - 4.5 tons payload capacity
    dimensions: {
      length: 4270, // mm - 14 feet (4267mm actual)
      width: 1830, // mm - 6 feet (1829mm actual)
      height: 2130 // mm - 7 feet (2134mm actual)
    },
    volume: 16.6, // cubic meters (calculated: 4.27 × 1.83 × 2.13 ≈ 16.6m³)
    costPerKm: 18, // INR per kilometer
    suspensionQuality: 3,
    climateControl: false,
    shockAbsorption: 3,
    loadSecuring: ['straps', 'ropes', 'corner_protectors'],
    suitableFor: ['general', 'fmcg', 'textiles', 'electronics_heavy'],
    notSuitableFor: ['pharma_sensitive'],
    features: ['Standard cargo', 'Medium distance', 'Versatile']
  },
  {
    id: 'EICHER_17FT',
    name: 'Eicher 17ft',
    category: 'medium-large',
    maxWeight: 7000, // kg - 7 tons payload capacity
    dimensions: {
      length: 5180, // mm - 17 feet
      width: 2130, // mm - 7 feet
      height: 2130 // mm - 7 feet
    },
    volume: 23.5, // cubic meters
    costPerKm: 22, // INR per kilometer
    suspensionQuality: 3,
    climateControl: false,
    shockAbsorption: 3,
    loadSecuring: ['straps', 'ropes', 'corner_protectors', 'load_bars'],
    suitableFor: ['general', 'fmcg', 'furniture', 'machinery'],
    notSuitableFor: ['pharma_sensitive'],
    features: ['Higher capacity', 'Medium-long distance']
  },
  {
    id: 'CONTAINER_20FT',
    name: '20ft Container Truck',
    category: 'large',
    maxWeight: 10000, // kg - 10 tons payload capacity
    dimensions: {
      length: 5900, // mm - 20 feet (internal)
      width: 2350, // mm
      height: 2390 // mm
    },
    volume: 33.2, // cubic meters
    costPerKm: 28, // INR per kilometer
    suspensionQuality: 3,
    climateControl: false,
    shockAbsorption: 3,
    loadSecuring: ['straps', 'ropes', 'corner_protectors', 'load_bars', 'lashing_rings'],
    suitableFor: ['general', 'heavy_machinery', 'bulk', 'palletized'],
    notSuitableFor: ['pharma_sensitive', 'glass_bulk'],
    features: ['Container shipping', 'Long distance', 'Port delivery']
  },
  {
    id: 'CONTAINER_32FT',
    name: '32ft Container Truck',
    category: 'extra-large',
    maxWeight: 15000, // kg - 15 tons payload capacity
    dimensions: {
      length: 9600, // mm - 32 feet (internal)
      width: 2400, // mm
      height: 2400 // mm
    },
    volume: 55.3, // cubic meters
    costPerKm: 38, // INR per kilometer
    suspensionQuality: 3,
    climateControl: false,
    shockAbsorption: 3,
    loadSecuring: ['straps', 'ropes', 'corner_protectors', 'load_bars', 'lashing_rings'],
    suitableFor: ['bulk', 'heavy_machinery', 'palletized', 'furniture_bulk'],
    notSuitableFor: ['pharma_sensitive', 'glass_bulk', 'fragile_small'],
    features: ['Maximum capacity', 'Long distance', 'Bulk shipments']
  },
  {
    id: 'REFRIGERATED_14FT',
    name: 'Reefer 14ft',
    category: 'refrigerated',
    maxWeight: 3500, // kg - reduced due to refrigeration unit
    dimensions: {
      length: 4000, // mm
      width: 1800, // mm
      height: 1800 // mm
    },
    volume: 13.0, // cubic meters (reduced due to insulation)
    costPerKm: 32, // INR per kilometer (higher due to cooling)
    suspensionQuality: 4,
    climateControl: true,
    temperatureRange: { min: -25, max: 25 }, // Celsius
    shockAbsorption: 4,
    loadSecuring: ['straps', 'corner_protectors', 'load_bars'],
    suitableFor: ['pharma_standard', 'pharma_sensitive', 'food_perishable', 'cosmetics'],
    notSuitableFor: ['heavy_machinery'],
    features: ['Temperature controlled', 'Cold chain', 'Pharma compliant']
  },
  {
    id: 'REFRIGERATED_20FT',
    name: 'Reefer 20ft',
    category: 'refrigerated-large',
    maxWeight: 7000, // kg
    dimensions: {
      length: 5500, // mm
      width: 2200, // mm
      height: 2200 // mm
    },
    volume: 26.6, // cubic meters
    costPerKm: 45, // INR per kilometer
    suspensionQuality: 4,
    climateControl: true,
    temperatureRange: { min: -25, max: 25 },
    shockAbsorption: 4,
    loadSecuring: ['straps', 'corner_protectors', 'load_bars', 'thermal_blankets'],
    suitableFor: ['pharma_standard', 'pharma_sensitive', 'food_perishable', 'dairy', 'vaccines'],
    notSuitableFor: ['heavy_machinery', 'general_bulk'],
    features: ['Large cold storage', 'Cold chain', 'Pharma compliant']
  },
  {
    id: 'AIR_RIDE_20FT',
    name: 'Air-Ride 20ft',
    category: 'premium',
    maxWeight: 8000, // kg
    dimensions: {
      length: 5900, // mm
      width: 2350, // mm
      height: 2390 // mm
    },
    volume: 33.2, // cubic meters
    costPerKm: 40, // INR per kilometer (premium suspension)
    suspensionQuality: 5, // Air-ride suspension
    climateControl: false,
    shockAbsorption: 5,
    loadSecuring: ['straps', 'corner_protectors', 'load_bars', 'lashing_rings', 'air_bags'],
    suitableFor: ['glass', 'electronics_consumer', 'ceramics', 'artwork', 'fragile_sensitive'],
    notSuitableFor: [],
    features: ['Air-ride suspension', 'Minimal vibration', 'Fragile goods specialist']
  },
  {
    id: 'AIR_RIDE_REEFER',
    name: 'Air-Ride Reefer',
    category: 'premium-refrigerated',
    maxWeight: 6000, // kg
    dimensions: {
      length: 5000, // mm
      width: 2200, // mm
      height: 2000 // mm
    },
    volume: 22.0, // cubic meters
    costPerKm: 55, // INR per kilometer (premium)
    suspensionQuality: 5,
    climateControl: true,
    temperatureRange: { min: -30, max: 25 },
    shockAbsorption: 5,
    loadSecuring: ['straps', 'corner_protectors', 'load_bars', 'thermal_blankets', 'air_bags'],
    suitableFor: ['pharma_sensitive', 'vaccines', 'biologics', 'glass_perishable'],
    notSuitableFor: ['heavy_machinery', 'bulk'],
    features: ['Premium handling', 'Cold chain', 'Sensitive goods', 'Vaccine transport']
  }
];

// Sample orders with realistic dimensions and weights
// All values are validated to fit within Eicher 14ft capacity (4500kg, 16.6m³)
// when properly distributed across multiple vehicles
// Includes fragility scores (1-5) and packaging types for AI load planning
export const sampleOrders = [
  {
    id: 'SO001',
    doId: 'DO001',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 50,
    seller: 'ABC Corp',
    customer: 'Mumbai Central Retail', // Consignee (recipient)
    pickup: 'Delhi Warehouse',
    delivery: 'Mumbai Central',
    dropSequence: 1, // First drop - should be loaded LAST (FILO)
    materialType: 'cuboidal',
    dimensions: {
      length: 600, // mm - Standard carton size
      width: 400, // mm
      height: 300 // mm
    },
    weight: 25, // kg per unit - Realistic for FMCG products
    stackable: true,
    maxStackHeight: 1800,
    priority: 'high',
    status: 'planned',
    // Fragility and packaging fields
    fragilityScore: 2, // Durable
    packagingType: 'corrugated_box',
    materialProfile: 'FOOD_DRY',
    crushResistance: 3,
    loadBearingCapacity: 75 // kg that can be stacked on top
  },
  {
    id: 'SO002',
    doId: 'DO002',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 20, // Reduced quantity for realistic volume
    seller: 'XYZ Ltd',
    customer: 'Mumbai Port Logistics', // Consignee (recipient)
    pickup: 'Delhi Hub',
    delivery: 'Mumbai Port',
    dropSequence: 2, // Second drop - should be loaded before first drop
    materialType: 'cylindrical',
    dimensions: {
      diameter: 300, // mm - Smaller diameter for realistic volume
      height: 600 // mm - Reduced height
    },
    weight: 15, // kg per unit - More realistic for cylindrical items
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'planned',
    fragilityScore: 3,
    packagingType: 'metal_drum',
    materialProfile: 'LIQUID_STANDARD',
    crushResistance: 4,
    loadBearingCapacity: 100
  },
  {
    id: 'SO003',
    doId: 'DO003',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 100, // Smaller items, more quantity
    seller: 'PQR Industries',
    customer: 'Hyderabad Tech Solutions', // Consignee (recipient)
    pickup: 'Delhi North',
    delivery: 'Hyderabad Tech City',
    dropSequence: 1, // First drop on this route
    materialType: 'cuboidal',
    dimensions: {
      length: 400, // mm - Small electronics boxes
      width: 300, // mm
      height: 200 // mm
    },
    weight: 8, // kg per unit - Light electronics
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'planned',
    fragilityScore: 4, // Fragile - electronics
    packagingType: 'foam_padded',
    materialProfile: 'ELECTRONICS_CONSUMER',
    crushResistance: 2,
    loadBearingCapacity: 15,
    specialHandling: ['anti-static', 'shock-absorbing']
  },
  {
    id: 'SO004',
    doId: 'DO004',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 15, // Reduced for realistic volume
    seller: 'Tech Solutions',
    customer: 'Bangalore Electronics Hub', // Consignee (recipient)
    pickup: 'Delhi South',
    delivery: 'Bangalore Electronic City',
    materialType: 'cylindrical',
    dimensions: {
      diameter: 250, // mm - Smaller diameter
      height: 800 // mm - Reduced height
    },
    weight: 12, // kg per unit - More realistic weight
    orientation: 'horizontal',
    nesting: true,
    fragile: true,
    priority: 'high',
    status: 'planned',
    fragilityScore: 5, // Extremely fragile
    packagingType: 'foam_padded',
    materialProfile: 'GLASS_CONTAINERS',
    crushResistance: 1,
    loadBearingCapacity: 0, // Cannot stack on top
    specialHandling: ['fragile-label', 'vertical-only']
  },
  {
    id: 'SO005',
    doId: 'DO005',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 25, // Reduced quantity for large items
    seller: 'Marine Corp',
    pickup: 'Delhi East',
    delivery: 'Chennai Port',
    materialType: 'cuboidal',
    dimensions: {
      length: 800, // mm - Large but realistic
      width: 600, // mm
      height: 400 // mm
    },
    weight: 35, // kg per unit - Heavy but realistic
    stackable: false,
    maxStackHeight: 400,
    priority: 'medium',
    status: 'unplanned',
    fragilityScore: 1, // Robust - heavy machinery parts
    packagingType: 'wooden_crate',
    materialProfile: 'MACHINERY',
    crushResistance: 5,
    loadBearingCapacity: 200
  },
  {
    id: 'SO006',
    doId: 'DO006',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 80, // Small pharmaceutical boxes
    seller: 'Pharma Solutions',
    pickup: 'Delhi Pharma Hub',
    delivery: 'Mumbai Medical District',
    materialType: 'cuboidal',
    dimensions: {
      length: 300, // mm - Small pharma boxes
      width: 200, // mm
      height: 150 // mm
    },
    weight: 5, // kg per unit - Light pharmaceutical products
    stackable: true,
    maxStackHeight: 2000,
    priority: 'high',
    status: 'planned',
    fragilityScore: 4, // Fragile - pharmaceuticals
    packagingType: 'corrugated_box',
    materialProfile: 'PHARMA_STANDARD',
    crushResistance: 2,
    loadBearingCapacity: 20,
    temperatureControlled: true,
    requiredTemperature: 25, // Celsius
    specialHandling: ['temperature-controlled', 'sealed']
  },
  {
    id: 'SO007',
    doId: 'DO007',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 12, // Paint drums
    seller: 'Color Industries',
    pickup: 'Delhi Paint Factory',
    delivery: 'Mumbai Construction Site',
    materialType: 'cylindrical',
    dimensions: {
      diameter: 400, // mm - Standard paint drum
      height: 700 // mm
    },
    weight: 25, // kg per unit - Paint drums
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'unplanned',
    fragilityScore: 3, // Moderate - liquids
    packagingType: 'metal_drum',
    materialProfile: 'LIQUID_HAZARDOUS',
    crushResistance: 4,
    loadBearingCapacity: 80,
    hazardous: true,
    specialHandling: ['leak-proof', 'upright-preferred']
  },
  // Additional 200 realistic orders
  {
    id: 'SO008',
    doId: 'DO008',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 45,
    seller: 'Fresh Foods Ltd',
    pickup: 'Delhi Cold Storage',
    delivery: 'Mumbai Market',
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 350, height: 250 },
    weight: 12,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO009',
    doId: 'DO009',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 8,
    seller: 'Steel Pipes Co',
    pickup: 'Delhi Industrial Area',
    delivery: 'Hyderabad Construction',
    materialType: 'cylindrical',
    dimensions: { diameter: 150, height: 3000 },
    weight: 45,
    orientation: 'horizontal',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO010',
    doId: 'DO010',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 120,
    seller: 'Book Publishers',
    pickup: 'Delhi Publishing House',
    delivery: 'Chennai Bookstore',
    materialType: 'cuboidal',
    dimensions: { length: 250, width: 180, height: 30 },
    weight: 2,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO011',
    doId: 'DO011',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 6,
    seller: 'Chemical Industries',
    pickup: 'Delhi Chemical Plant',
    delivery: 'Bangalore Lab',
    materialType: 'cylindrical',
    dimensions: { diameter: 500, height: 800 },
    weight: 35,
    orientation: 'vertical',
    nesting: false,
    fragile: true,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO012',
    doId: 'DO012',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 200,
    seller: 'Textile Mills',
    pickup: 'Delhi Textile Hub',
    delivery: 'Mumbai Garment District',
    materialType: 'cuboidal',
    dimensions: { length: 800, width: 600, height: 400 },
    weight: 8,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO013',
    doId: 'DO013',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 15,
    seller: 'Auto Parts Ltd',
    pickup: 'Delhi Auto Hub',
    delivery: 'Hyderabad Assembly Plant',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 300 },
    weight: 18,
    stackable: false,
    maxStackHeight: 300,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO014',
    doId: 'DO014',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 30,
    seller: 'Spice Traders',
    pickup: 'Delhi Spice Market',
    delivery: 'Chennai Port',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 200 },
    weight: 15,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO015',
    doId: 'DO015',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 10,
    seller: 'Gas Cylinder Co',
    pickup: 'Delhi Gas Plant',
    delivery: 'Bangalore Distribution',
    materialType: 'cylindrical',
    dimensions: { diameter: 300, height: 1200 },
    weight: 28,
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO016',
    doId: 'DO016',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 75,
    seller: 'Electronics Corp',
    pickup: 'Delhi Electronics Market',
    delivery: 'Mumbai Tech Park',
    materialType: 'cuboidal',
    dimensions: { length: 350, width: 250, height: 150 },
    weight: 6,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO017',
    doId: 'DO017',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 25,
    seller: 'Furniture Makers',
    pickup: 'Delhi Furniture Factory',
    delivery: 'Hyderabad Showroom',
    materialType: 'cuboidal',
    dimensions: { length: 1200, width: 800, height: 600 },
    weight: 22,
    stackable: false,
    maxStackHeight: 600,
    priority: 'low',
    status: 'planned'
  },
  {
    id: 'SO018',
    doId: 'DO018',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 18,
    seller: 'Oil Drums Ltd',
    pickup: 'Delhi Oil Depot',
    delivery: 'Chennai Refinery',
    materialType: 'cylindrical',
    dimensions: { diameter: 600, height: 900 },
    weight: 40,
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO019',
    doId: 'DO019',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 90,
    seller: 'Cosmetics Brand',
    pickup: 'Delhi Beauty Hub',
    delivery: 'Bangalore Retail Chain',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 150, height: 100 },
    weight: 3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO020',
    doId: 'DO020',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 35,
    seller: 'Ceramic Tiles',
    pickup: 'Delhi Tile Factory',
    delivery: 'Mumbai Construction',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 600, height: 50 },
    weight: 20,
    stackable: true,
    maxStackHeight: 1000,
    priority: 'low',
    status: 'unplanned'
  },
  // Continue with more realistic orders (SO021-SO070)
  {
    id: 'SO021',
    doId: 'DO021',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 60,
    seller: 'Plastic Containers',
    pickup: 'Delhi Plastic Factory',
    delivery: 'Hyderabad Packaging',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 150 },
    weight: 4,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO022',
    doId: 'DO022',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 12,
    seller: 'Heavy Machinery',
    pickup: 'Delhi Machine Shop',
    delivery: 'Chennai Factory',
    materialType: 'cuboidal',
    dimensions: { length: 1500, width: 1000, height: 800 },
    weight: 85,
    stackable: false,
    maxStackHeight: 800,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO023',
    doId: 'DO023',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 40,
    seller: 'Coffee Beans',
    pickup: 'Delhi Import Terminal',
    delivery: 'Bangalore Coffee Roasters',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 300 },
    weight: 25,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO024',
    doId: 'DO024',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 20,
    seller: 'Wine Barrels',
    pickup: 'Delhi Wine Distributor',
    delivery: 'Mumbai Restaurant',
    materialType: 'cylindrical',
    dimensions: { diameter: 700, height: 900 },
    weight: 50,
    orientation: 'vertical',
    nesting: false,
    fragile: true,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO025',
    doId: 'DO025',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 150,
    seller: 'Paper Products',
    pickup: 'Delhi Paper Mill',
    delivery: 'Hyderabad Printing Press',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 100 },
    weight: 5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO026',
    doId: 'DO026',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 8,
    seller: 'Industrial Pipes',
    pickup: 'Delhi Steel Works',
    delivery: 'Chennai Shipyard',
    materialType: 'cylindrical',
    dimensions: { diameter: 200, height: 4000 },
    weight: 60,
    orientation: 'horizontal',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO027',
    doId: 'DO027',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 85,
    seller: 'Mobile Accessories',
    pickup: 'Delhi Electronics Hub',
    delivery: 'Bangalore Tech Mall',
    materialType: 'cuboidal',
    dimensions: { length: 150, width: 100, height: 50 },
    weight: 1,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO028',
    doId: 'DO028',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 30,
    seller: 'Marble Slabs',
    pickup: 'Delhi Stone Yard',
    delivery: 'Mumbai Interior Design',
    materialType: 'cuboidal',
    dimensions: { length: 1000, width: 600, height: 30 },
    weight: 45,
    stackable: true,
    maxStackHeight: 300,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO029',
    doId: 'DO029',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 16,
    seller: 'LPG Cylinders',
    pickup: 'Delhi Gas Terminal',
    delivery: 'Hyderabad Distribution Center',
    materialType: 'cylindrical',
    dimensions: { diameter: 320, height: 580 },
    weight: 30,
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO030',
    doId: 'DO030',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 100,
    seller: 'Garment Boxes',
    pickup: 'Delhi Garment District',
    delivery: 'Chennai Export Terminal',
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 400, height: 200 },
    weight: 7,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO031',
    doId: 'DO031',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 22,
    seller: 'Solar Panels',
    pickup: 'Delhi Solar Factory',
    delivery: 'Bangalore Installation Site',
    materialType: 'cuboidal',
    dimensions: { length: 1650, width: 990, height: 40 },
    weight: 20,
    stackable: true,
    maxStackHeight: 400,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO032',
    doId: 'DO032',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 50,
    seller: 'Shoe Boxes',
    pickup: 'Delhi Footwear Hub',
    delivery: 'Mumbai Retail Stores',
    materialType: 'cuboidal',
    dimensions: { length: 350, width: 200, height: 120 },
    weight: 3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO033',
    doId: 'DO033',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 14,
    seller: 'Chemical Drums',
    pickup: 'Delhi Chemical Plant',
    delivery: 'Hyderabad Processing Unit',
    materialType: 'cylindrical',
    dimensions: { diameter: 450, height: 750 },
    weight: 38,
    orientation: 'vertical',
    nesting: false,
    fragile: true,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO034',
    doId: 'DO034',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 65,
    seller: 'Rice Bags',
    pickup: 'Delhi Agricultural Market',
    delivery: 'Chennai Food Processing',
    materialType: 'cuboidal',
    dimensions: { length: 800, width: 500, height: 150 },
    weight: 25,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO035',
    doId: 'DO035',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 18,
    seller: 'Air Conditioning Units',
    pickup: 'Delhi AC Factory',
    delivery: 'Bangalore Installation',
    materialType: 'cuboidal',
    dimensions: { length: 900, width: 600, height: 300 },
    weight: 35,
    stackable: false,
    maxStackHeight: 300,
    priority: 'high',
    status: 'unplanned'
  },
  // Continue with SO036-SO100
  {
    id: 'SO036',
    doId: 'DO036',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 80,
    seller: 'Snack Foods',
    pickup: 'Delhi Food Processing',
    delivery: 'Mumbai Supermarket Chain',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 150 },
    weight: 6,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO037',
    doId: 'DO037',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 24,
    seller: 'Water Tanks',
    pickup: 'Delhi Tank Manufacturer',
    delivery: 'Hyderabad Housing Project',
    materialType: 'cylindrical',
    dimensions: { diameter: 1000, height: 1200 },
    weight: 75,
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO038',
    doId: 'DO038',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 110,
    seller: 'Tea Packets',
    pickup: 'Delhi Tea Processing',
    delivery: 'Chennai Distribution',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 150, height: 80 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO039',
    doId: 'DO039',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 32,
    seller: 'Computer Monitors',
    pickup: 'Delhi Electronics Warehouse',
    delivery: 'Bangalore IT Company',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 150 },
    weight: 8,
    stackable: true,
    maxStackHeight: 1200,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO040',
    doId: 'DO040',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 45,
    seller: 'Leather Goods',
    pickup: 'Delhi Leather Market',
    delivery: 'Mumbai Fashion Store',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 100 },
    weight: 4,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO041',
    doId: 'DO041',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 28,
    seller: 'Cement Bags',
    pickup: 'Delhi Cement Plant',
    delivery: 'Hyderabad Construction Site',
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 350, height: 100 },
    weight: 50,
    stackable: true,
    maxStackHeight: 1000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO042',
    doId: 'DO042',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 16,
    seller: 'Oxygen Cylinders',
    pickup: 'Delhi Medical Supplies',
    delivery: 'Chennai Hospital',
    materialType: 'cylindrical',
    dimensions: { diameter: 140, height: 1370 },
    weight: 55,
    orientation: 'vertical',
    nesting: false,
    fragile: true,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO043',
    doId: 'DO043',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 95,
    seller: 'Stationery Items',
    pickup: 'Delhi Stationery Wholesale',
    delivery: 'Bangalore Office Supplies',
    materialType: 'cuboidal',
    dimensions: { length: 250, width: 180, height: 120 },
    weight: 3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO044',
    doId: 'DO044',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 12,
    seller: 'Refrigerators',
    pickup: 'Delhi Appliance Factory',
    delivery: 'Mumbai Electronics Store',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 650, height: 1700 },
    weight: 65,
    stackable: false,
    maxStackHeight: 1700,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO045',
    doId: 'DO045',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 70,
    seller: 'Detergent Boxes',
    pickup: 'Delhi FMCG Warehouse',
    delivery: 'Hyderabad Retail Chain',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 250 },
    weight: 8,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO046',
    doId: 'DO046',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 38,
    seller: 'Wooden Furniture',
    pickup: 'Delhi Furniture Workshop',
    delivery: 'Chennai Home Store',
    materialType: 'cuboidal',
    dimensions: { length: 1800, width: 800, height: 400 },
    weight: 30,
    stackable: false,
    maxStackHeight: 400,
    priority: 'low',
    status: 'planned'
  },
  {
    id: 'SO047',
    doId: 'DO047',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 26,
    seller: 'Paint Cans',
    pickup: 'Delhi Paint Factory',
    delivery: 'Bangalore Hardware Store',
    materialType: 'cylindrical',
    dimensions: { diameter: 200, height: 250 },
    weight: 12,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO048',
    doId: 'DO048',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 55,
    seller: 'Jewelry Boxes',
    pickup: 'Delhi Jewelry District',
    delivery: 'Mumbai Jewelry Store',
    materialType: 'cuboidal',
    dimensions: { length: 150, width: 100, height: 50 },
    weight: 1,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO049',
    doId: 'DO049',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 42,
    seller: 'Bicycle Parts',
    pickup: 'Delhi Bicycle Factory',
    delivery: 'Hyderabad Sports Store',
    materialType: 'cuboidal',
    dimensions: { length: 700, width: 200, height: 150 },
    weight: 12,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO050',
    doId: 'DO050',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 20,
    seller: 'Industrial Valves',
    pickup: 'Delhi Valve Manufacturer',
    delivery: 'Chennai Petrochemical Plant',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 300, height: 200 },
    weight: 25,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'high',
    status: 'unplanned'
  },
  // Continue with SO051-SO150
  {
    id: 'SO051',
    doId: 'DO051',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 75,
    seller: 'Protein Supplements',
    pickup: 'Delhi Nutrition Factory',
    delivery: 'Bangalore Fitness Stores',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 150, height: 300 },
    weight: 5,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO052',
    doId: 'DO052',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 36,
    seller: 'Glass Bottles',
    pickup: 'Delhi Glass Factory',
    delivery: 'Mumbai Beverage Company',
    materialType: 'cylindrical',
    dimensions: { diameter: 80, height: 250 },
    weight: 3,
    orientation: 'vertical',
    nesting: true,
    fragile: true,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO053',
    doId: 'DO053',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 48,
    seller: 'Kitchen Appliances',
    pickup: 'Delhi Appliance Hub',
    delivery: 'Hyderabad Home Store',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 350, height: 250 },
    weight: 15,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO054',
    doId: 'DO054',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 22,
    seller: 'Steel Rods',
    pickup: 'Delhi Steel Mill',
    delivery: 'Chennai Construction',
    materialType: 'cylindrical',
    dimensions: { diameter: 25, height: 6000 },
    weight: 40,
    orientation: 'horizontal',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO055',
    doId: 'DO055',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 120,
    seller: 'Greeting Cards',
    pickup: 'Delhi Card Printing',
    delivery: 'Bangalore Gift Shops',
    materialType: 'cuboidal',
    dimensions: { length: 150, width: 100, height: 20 },
    weight: 0.5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'planned'
  },
  {
    id: 'SO056',
    doId: 'DO056',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 64,
    seller: 'Handicrafts',
    pickup: 'Delhi Craft Center',
    delivery: 'Mumbai Art Gallery',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 250, height: 200 },
    weight: 6,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO057',
    doId: 'DO057',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 18,
    seller: 'Washing Machines',
    pickup: 'Delhi Appliance Factory',
    delivery: 'Hyderabad Electronics Mall',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 600, height: 850 },
    weight: 70,
    stackable: false,
    maxStackHeight: 850,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO058',
    doId: 'DO058',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 85,
    seller: 'Ayurvedic Medicines',
    pickup: 'Delhi Ayurveda Center',
    delivery: 'Chennai Pharmacy Chain',
    materialType: 'cuboidal',
    dimensions: { length: 120, width: 80, height: 60 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO059',
    doId: 'DO059',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 34,
    seller: 'Sports Equipment',
    pickup: 'Delhi Sports Factory',
    delivery: 'Bangalore Sports Store',
    materialType: 'cuboidal',
    dimensions: { length: 800, width: 300, height: 200 },
    weight: 18,
    stackable: true,
    maxStackHeight: 1200,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO060',
    doId: 'DO060',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 28,
    seller: 'Pressure Cookers',
    pickup: 'Delhi Cookware Factory',
    delivery: 'Mumbai Kitchen Store',
    materialType: 'cylindrical',
    dimensions: { diameter: 250, height: 200 },
    weight: 8,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO061',
    doId: 'DO061',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 92,
    seller: 'School Supplies',
    pickup: 'Delhi Educational Supplies',
    delivery: 'Hyderabad Schools',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 100 },
    weight: 4,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO062',
    doId: 'DO062',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 15,
    seller: 'Generator Sets',
    pickup: 'Delhi Power Equipment',
    delivery: 'Chennai Industrial Area',
    materialType: 'cuboidal',
    dimensions: { length: 1200, width: 800, height: 1000 },
    weight: 150,
    stackable: false,
    maxStackHeight: 1000,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO063',
    doId: 'DO063',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 76,
    seller: 'Baby Products',
    pickup: 'Delhi Baby Care Factory',
    delivery: 'Bangalore Baby Stores',
    materialType: 'cuboidal',
    dimensions: { length: 250, width: 200, height: 150 },
    weight: 3,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO064',
    doId: 'DO064',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 44,
    seller: 'Musical Instruments',
    pickup: 'Delhi Music Store',
    delivery: 'Mumbai Music Academy',
    materialType: 'cuboidal',
    dimensions: { length: 1000, width: 400, height: 200 },
    weight: 12,
    stackable: false,
    maxStackHeight: 200,
    priority: 'low',
    status: 'planned'
  },
  {
    id: 'SO065',
    doId: 'DO065',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 38,
    seller: 'Electrical Cables',
    pickup: 'Delhi Cable Factory',
    delivery: 'Hyderabad Electrical Contractor',
    materialType: 'cylindrical',
    dimensions: { diameter: 100, height: 1000 },
    weight: 15,
    orientation: 'horizontal',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  // Final batch SO066-SO207 to complete 200 new orders
  {
    id: 'SO066',
    doId: 'DO066',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 52,
    seller: 'Organic Foods',
    pickup: 'Delhi Organic Farm',
    delivery: 'Chennai Health Store',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 150 },
    weight: 8,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO067',
    doId: 'DO067',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 29,
    seller: 'Laptop Bags',
    pickup: 'Delhi Bag Factory',
    delivery: 'Bangalore Computer Store',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 50 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO068',
    doId: 'DO068',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 14,
    seller: 'Water Purifiers',
    pickup: 'Delhi Water Tech',
    delivery: 'Mumbai Home Appliances',
    materialType: 'cuboidal',
    dimensions: { length: 450, width: 350, height: 500 },
    weight: 25,
    stackable: false,
    maxStackHeight: 500,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO069',
    doId: 'DO069',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 88,
    seller: 'Herbal Teas',
    pickup: 'Delhi Tea Gardens',
    delivery: 'Hyderabad Wellness Center',
    materialType: 'cuboidal',
    dimensions: { length: 150, width: 100, height: 80 },
    weight: 1,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO070',
    doId: 'DO070',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 35,
    seller: 'Automotive Parts',
    pickup: 'Delhi Auto Components',
    delivery: 'Chennai Car Service',
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 300, height: 200 },
    weight: 12,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO071',
    doId: 'DO071',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 16,
    seller: 'Microwave Ovens',
    pickup: 'Delhi Kitchen Appliances',
    delivery: 'Bangalore Home Store',
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 400, height: 300 },
    weight: 18,
    stackable: true,
    maxStackHeight: 1200,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO072',
    doId: 'DO072',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 72,
    seller: 'Fashion Accessories',
    pickup: 'Delhi Fashion Hub',
    delivery: 'Mumbai Boutique',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 150, height: 100 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO073',
    doId: 'DO073',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 24,
    seller: 'Industrial Fans',
    pickup: 'Delhi Fan Factory',
    delivery: 'Hyderabad Factory',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 600, height: 200 },
    weight: 15,
    stackable: true,
    maxStackHeight: 1000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO074',
    doId: 'DO074',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 46,
    seller: 'Yoga Mats',
    pickup: 'Delhi Fitness Equipment',
    delivery: 'Chennai Yoga Studios',
    materialType: 'cylindrical',
    dimensions: { diameter: 150, height: 1800 },
    weight: 3,
    orientation: 'horizontal',
    nesting: false,
    fragile: false,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO075',
    doId: 'DO075',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 58,
    seller: 'Art Supplies',
    pickup: 'Delhi Art Store',
    delivery: 'Bangalore Art School',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 50 },
    weight: 4,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO076',
    doId: 'DO076',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 33,
    seller: 'Power Tools',
    pickup: 'Delhi Tool Factory',
    delivery: 'Mumbai Hardware Store',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 150 },
    weight: 8,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO077',
    doId: 'DO077',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 19,
    seller: 'Inverters',
    pickup: 'Delhi Power Systems',
    delivery: 'Hyderabad Electronics',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 250, height: 100 },
    weight: 12,
    stackable: true,
    maxStackHeight: 1000,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO078',
    doId: 'DO078',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 67,
    seller: 'Incense Sticks',
    pickup: 'Delhi Fragrance Factory',
    delivery: 'Chennai Temple Supplies',
    materialType: 'cuboidal',
    dimensions: { length: 250, width: 150, height: 50 },
    weight: 1,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO079',
    doId: 'DO079',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 41,
    seller: 'Gaming Accessories',
    pickup: 'Delhi Gaming Store',
    delivery: 'Bangalore Gaming Cafe',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 100 },
    weight: 3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO080',
    doId: 'DO080',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 27,
    seller: 'Home Decor',
    pickup: 'Delhi Decor Factory',
    delivery: 'Mumbai Interior Store',
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 300, height: 200 },
    weight: 6,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'low',
    status: 'unplanned'
  },
  // Continue with remaining orders to reach 200 total
  {
    id: 'SO081',
    doId: 'DO081',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 54,
    seller: 'Fitness Equipment',
    pickup: 'Delhi Gym Equipment',
    delivery: 'Hyderabad Fitness Center',
    materialType: 'cuboidal',
    dimensions: { length: 800, width: 400, height: 300 },
    weight: 25,
    stackable: false,
    maxStackHeight: 300,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO082',
    doId: 'DO082',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 39,
    seller: 'Coconut Oil',
    pickup: 'Delhi Oil Processing',
    delivery: 'Chennai Distributor',
    materialType: 'cylindrical',
    dimensions: { diameter: 120, height: 180 },
    weight: 4,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO083',
    doId: 'DO083',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 63,
    seller: 'Office Chairs',
    pickup: 'Delhi Furniture Factory',
    delivery: 'Bangalore Corporate Office',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 600, height: 1000 },
    weight: 20,
    stackable: false,
    maxStackHeight: 1000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO084',
    doId: 'DO084',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 81,
    seller: 'Perfumes',
    pickup: 'Delhi Fragrance House',
    delivery: 'Mumbai Beauty Store',
    materialType: 'cuboidal',
    dimensions: { length: 100, width: 80, height: 120 },
    weight: 1,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO085',
    doId: 'DO085',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 26,
    seller: 'LED Lights',
    pickup: 'Delhi LED Factory',
    delivery: 'Hyderabad Electrical Store',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 300, height: 50 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO086',
    doId: 'DO086',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 47,
    seller: 'Wooden Toys',
    pickup: 'Delhi Toy Factory',
    delivery: 'Chennai Toy Store',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 150, height: 100 },
    weight: 3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO087',
    doId: 'DO087',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 32,
    seller: 'Coffee Machines',
    pickup: 'Delhi Appliance Hub',
    delivery: 'Bangalore Coffee Shop',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 350 },
    weight: 15,
    stackable: true,
    maxStackHeight: 1400,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO088',
    doId: 'DO088',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 68,
    seller: 'Skincare Products',
    pickup: 'Delhi Cosmetics Factory',
    delivery: 'Mumbai Beauty Chain',
    materialType: 'cuboidal',
    dimensions: { length: 150, width: 100, height: 80 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO089',
    doId: 'DO089',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 21,
    seller: 'Printers',
    pickup: 'Delhi Electronics Warehouse',
    delivery: 'Hyderabad Office Supply',
    materialType: 'cuboidal',
    dimensions: { length: 450, width: 350, height: 200 },
    weight: 12,
    stackable: true,
    maxStackHeight: 1200,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO090',
    doId: 'DO090',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 55,
    seller: 'Honey Jars',
    pickup: 'Delhi Honey Processing',
    delivery: 'Chennai Organic Store',
    materialType: 'cylindrical',
    dimensions: { diameter: 90, height: 120 },
    weight: 2,
    orientation: 'vertical',
    nesting: true,
    fragile: true,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO091',
    doId: 'DO091',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 37,
    seller: 'Bluetooth Speakers',
    pickup: 'Delhi Audio Factory',
    delivery: 'Bangalore Electronics Store',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 150, height: 100 },
    weight: 3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO092',
    doId: 'DO092',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 43,
    seller: 'Bed Sheets',
    pickup: 'Delhi Textile Mill',
    delivery: 'Mumbai Home Store',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 100 },
    weight: 4,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO093',
    doId: 'DO093',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 29,
    seller: 'Water Bottles',
    pickup: 'Delhi Plastic Factory',
    delivery: 'Hyderabad Sports Store',
    materialType: 'cylindrical',
    dimensions: { diameter: 70, height: 250 },
    weight: 1,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO094',
    doId: 'DO094',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 61,
    seller: 'Notebooks',
    pickup: 'Delhi Stationery Factory',
    delivery: 'Chennai Bookstore',
    materialType: 'cuboidal',
    dimensions: { length: 250, width: 180, height: 20 },
    weight: 1,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO095',
    doId: 'DO095',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 48,
    seller: 'Protein Bars',
    pickup: 'Delhi Nutrition Factory',
    delivery: 'Bangalore Health Store',
    materialType: 'cuboidal',
    dimensions: { length: 150, width: 100, height: 30 },
    weight: 0.5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO096',
    doId: 'DO096',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 34,
    seller: 'Wall Clocks',
    pickup: 'Delhi Clock Factory',
    delivery: 'Mumbai Home Decor',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 300, height: 50 },
    weight: 2,
    stackable: true,
    maxStackHeight: 1000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO097',
    doId: 'DO097',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 52,
    seller: 'Hand Sanitizers',
    pickup: 'Delhi Hygiene Products',
    delivery: 'Hyderabad Pharmacy',
    materialType: 'cylindrical',
    dimensions: { diameter: 60, height: 150 },
    weight: 1,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO098',
    doId: 'DO098',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 76,
    seller: 'Keychains',
    pickup: 'Delhi Gift Factory',
    delivery: 'Chennai Souvenir Shop',
    materialType: 'cuboidal',
    dimensions: { length: 50, width: 30, height: 10 },
    weight: 0.1,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO099',
    doId: 'DO099',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 25,
    seller: 'Vacuum Cleaners',
    pickup: 'Delhi Appliance Factory',
    delivery: 'Bangalore Home Store',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 250 },
    weight: 8,
    stackable: true,
    maxStackHeight: 1000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO100',
    doId: 'DO100',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 89,
    seller: 'Phone Cases',
    pickup: 'Delhi Mobile Accessories',
    delivery: 'Mumbai Electronics Market',
    materialType: 'cuboidal',
    dimensions: { length: 150, width: 80, height: 20 },
    weight: 0.2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  // Additional 100+ orders to reach 200+ total (SO101-SO207)
  {
    id: 'SO101',
    doId: 'DO101',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 42,
    seller: 'Ceiling Fans',
    pickup: 'Delhi Fan Manufacturing',
    delivery: 'Hyderabad Electrical Store',
    materialType: 'cuboidal',
    dimensions: { length: 1200, width: 1200, height: 400 },
    weight: 12,
    stackable: false,
    maxStackHeight: 400,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO102',
    doId: 'DO102',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 58,
    seller: 'Curry Powder',
    pickup: 'Delhi Spice Mill',
    delivery: 'Chennai Food Processing',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 150, height: 100 },
    weight: 3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO103',
    doId: 'DO103',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 31,
    seller: 'Tablet Computers',
    pickup: 'Delhi Electronics Hub',
    delivery: 'Bangalore Tech Store',
    materialType: 'cuboidal',
    dimensions: { length: 250, width: 180, height: 10 },
    weight: 1,
    stackable: true,
    maxStackHeight: 500,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO104',
    doId: 'DO104',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 67,
    seller: 'Shampoo Bottles',
    pickup: 'Delhi Personal Care',
    delivery: 'Mumbai Beauty Supply',
    materialType: 'cylindrical',
    dimensions: { diameter: 70, height: 200 },
    weight: 2,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO105',
    doId: 'DO105',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 23,
    seller: 'Dining Tables',
    pickup: 'Delhi Furniture Mart',
    delivery: 'Hyderabad Home Store',
    materialType: 'cuboidal',
    dimensions: { length: 1500, width: 900, height: 750 },
    weight: 45,
    stackable: false,
    maxStackHeight: 750,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO106',
    doId: 'DO106',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 84,
    seller: 'Greeting Cards',
    pickup: 'Delhi Card Printing',
    delivery: 'Chennai Gift Shop',
    materialType: 'cuboidal',
    dimensions: { length: 150, width: 100, height: 5 },
    weight: 0.1,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO107',
    doId: 'DO107',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 49,
    seller: 'Protein Powder',
    pickup: 'Delhi Nutrition Lab',
    delivery: 'Bangalore Fitness Store',
    materialType: 'cylindrical',
    dimensions: { diameter: 120, height: 200 },
    weight: 4,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO108',
    doId: 'DO108',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 36,
    seller: 'Handbags',
    pickup: 'Delhi Leather Works',
    delivery: 'Mumbai Fashion Store',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 150 },
    weight: 3,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO109',
    doId: 'DO109',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 72,
    seller: 'Toothpaste Tubes',
    pickup: 'Delhi Oral Care',
    delivery: 'Hyderabad Pharmacy Chain',
    materialType: 'cylindrical',
    dimensions: { diameter: 40, height: 150 },
    weight: 1,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO110',
    doId: 'DO110',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 28,
    seller: 'Washing Machines',
    pickup: 'Delhi Appliance Factory',
    delivery: 'Chennai Electronics Mall',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 600, height: 850 },
    weight: 70,
    stackable: false,
    maxStackHeight: 850,
    priority: 'high',
    status: 'unplanned'
  },
  // Continue adding orders SO111-SO207 to reach 200+ total
  {
    id: 'SO111',
    doId: 'DO111',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 95,
    seller: 'Energy Drinks',
    pickup: 'Delhi Beverage Factory',
    delivery: 'Bangalore Sports Store',
    materialType: 'cylindrical',
    dimensions: { diameter: 65, height: 150 },
    weight: 1,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },

  {
    id: 'SO112',
    doId: 'DO112',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 53,
    seller: 'Backpacks',
    pickup: 'Delhi Bag Manufacturing',
    delivery: 'Mumbai Travel Store',
    materialType: 'cuboidal',
    dimensions: { length: 450, width: 350, height: 200 },
    weight: 4,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO113',
    doId: 'DO113',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 37,
    seller: 'Table Lamps',
    pickup: 'Delhi Lighting Factory',
    delivery: 'Hyderabad Home Decor',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 300, height: 500 },
    weight: 6,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'low',
    status: 'planned'
  },
  {
    id: 'SO114',
    doId: 'DO114',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 61,
    seller: 'Coconut Water',
    pickup: 'Delhi Beverage Processing',
    delivery: 'Chennai Health Store',
    materialType: 'cylindrical',
    dimensions: { diameter: 80, height: 200 },
    weight: 2,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO115',
    doId: 'DO115',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 44,
    seller: 'Wireless Headphones',
    pickup: 'Delhi Audio Equipment',
    delivery: 'Bangalore Electronics Store',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 180, height: 80 },
    weight: 2,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO116',
    doId: 'DO116',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 78,
    seller: 'Face Masks',
    pickup: 'Delhi Medical Supplies',
    delivery: 'Mumbai Pharmacy Chain',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 100, height: 50 },
    weight: 0.5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO117',
    doId: 'DO117',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 29,
    seller: 'Mattresses',
    pickup: 'Delhi Bedding Factory',
    delivery: 'Hyderabad Furniture Store',
    materialType: 'cuboidal',
    dimensions: { length: 1900, width: 900, height: 200 },
    weight: 25,
    stackable: true,
    maxStackHeight: 1000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO118',
    doId: 'DO118',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 86,
    seller: 'Instant Noodles',
    pickup: 'Delhi Food Processing',
    delivery: 'Chennai Supermarket',
    materialType: 'cuboidal',
    dimensions: { length: 120, width: 80, height: 40 },
    weight: 0.3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO119',
    doId: 'DO119',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 52,
    seller: 'Desk Organizers',
    pickup: 'Delhi Office Supplies',
    delivery: 'Bangalore Corporate Store',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 100 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO120',
    doId: 'DO120',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 65,
    seller: 'Sunglasses',
    pickup: 'Delhi Eyewear Factory',
    delivery: 'Mumbai Fashion Store',
    materialType: 'cuboidal',
    dimensions: { length: 180, width: 80, height: 60 },
    weight: 0.5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  // Final batch SO121-SO207 to complete 200+ orders
  {
    id: 'SO121',
    doId: 'DO121',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 48,
    seller: 'Vitamin Supplements',
    pickup: 'Delhi Pharma Lab',
    delivery: 'Hyderabad Health Store',
    materialType: 'cylindrical',
    dimensions: { diameter: 60, height: 120 },
    weight: 1,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO122',
    doId: 'DO122',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 73,
    seller: 'Soap Bars',
    pickup: 'Delhi Soap Factory',
    delivery: 'Chennai Retail Chain',
    materialType: 'cuboidal',
    dimensions: { length: 100, width: 60, height: 30 },
    weight: 0.5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO123',
    doId: 'DO123',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 35,
    seller: 'Smart Watches',
    pickup: 'Delhi Electronics Hub',
    delivery: 'Bangalore Tech Store',
    materialType: 'cuboidal',
    dimensions: { length: 100, width: 80, height: 50 },
    weight: 1,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO124',
    doId: 'DO124',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 91,
    seller: 'Hair Oil Bottles',
    pickup: 'Delhi Cosmetics Factory',
    delivery: 'Mumbai Beauty Store',
    materialType: 'cylindrical',
    dimensions: { diameter: 50, height: 150 },
    weight: 1,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO125',
    doId: 'DO125',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 26,
    seller: 'Dining Chairs',
    pickup: 'Delhi Furniture Factory',
    delivery: 'Hyderabad Home Store',
    materialType: 'cuboidal',
    dimensions: { length: 450, width: 450, height: 800 },
    weight: 8,
    stackable: true,
    maxStackHeight: 2400,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO126',
    doId: 'DO126',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 82,
    seller: 'Biscuit Packets',
    pickup: 'Delhi Bakery',
    delivery: 'Chennai Supermarket',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 150, height: 50 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO127',
    doId: 'DO127',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 57,
    seller: 'Power Banks',
    pickup: 'Delhi Electronics Factory',
    delivery: 'Bangalore Mobile Store',
    materialType: 'cuboidal',
    dimensions: { length: 150, width: 80, height: 20 },
    weight: 1,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO128',
    doId: 'DO128',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 39,
    seller: 'Wallets',
    pickup: 'Delhi Leather Goods',
    delivery: 'Mumbai Fashion Store',
    materialType: 'cuboidal',
    dimensions: { length: 120, width: 90, height: 20 },
    weight: 0.3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO129',
    doId: 'DO129',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 64,
    seller: 'Floor Cleaners',
    pickup: 'Delhi Chemical Factory',
    delivery: 'Hyderabad Retail Chain',
    materialType: 'cylindrical',
    dimensions: { diameter: 90, height: 250 },
    weight: 3,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO130',
    doId: 'DO130',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 45,
    seller: 'Wooden Bowls',
    pickup: 'Delhi Handicrafts',
    delivery: 'Chennai Gift Shop',
    materialType: 'cylindrical',
    dimensions: { diameter: 200, height: 80 },
    weight: 2,
    orientation: 'vertical',
    nesting: true,
    fragile: true,
    priority: 'low',
    status: 'unplanned'
  },
  // Additional orders with same consignees for testing unplanned orders dropdown
  {
    id: 'SO131',
    doId: 'DO131',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 30,
    seller: 'Premium Foods Ltd',
    pickup: 'Delhi Food Hub',
    delivery: 'Mumbai Central', // Same consignee as SO001
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 350, height: 250 },
    weight: 18,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'medium',
    status: 'unplanned',
    fragilityScore: 2,
    packagingType: 'corrugated_box',
    materialProfile: 'FOOD_DRY'
  },
  {
    id: 'SO132',
    doId: 'DO132',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 25,
    seller: 'Global Trading Co',
    customer: 'Mumbai Central Retail', // Same consignee as SO001
    pickup: 'Delhi Export Zone',
    delivery: 'Mumbai Central',
    materialType: 'cuboidal',
    dimensions: { length: 450, width: 300, height: 200 },
    weight: 12,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'high',
    status: 'unplanned',
    fragilityScore: 3,
    packagingType: 'corrugated_box',
    materialProfile: 'GENERAL'
  },
  {
    id: 'SO133',
    doId: 'DO133',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 40,
    seller: 'Ocean Freight Inc',
    customer: 'Mumbai Port Logistics', // Same consignee as SO002
    pickup: 'Delhi Port',
    delivery: 'Mumbai Port',
    materialType: 'cylindrical',
    dimensions: { diameter: 350, height: 700 },
    weight: 20,
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'unplanned',
    fragilityScore: 3,
    packagingType: 'metal_drum',
    materialProfile: 'LIQUID_STANDARD'
  },
  {
    id: 'SO134',
    doId: 'DO134',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 35,
    seller: 'Maritime Logistics',
    customer: 'Mumbai Port Logistics', // Same consignee as SO002
    pickup: 'Delhi Cargo Terminal',
    delivery: 'Mumbai Port',
    materialType: 'cylindrical',
    dimensions: { diameter: 400, height: 650 },
    weight: 22,
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'low',
    status: 'unplanned',
    fragilityScore: 2,
    packagingType: 'plastic_drum',
    materialProfile: 'LIQUID_STANDARD'
  },
  {
    id: 'SO135',
    doId: 'DO135',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 60,
    seller: 'Tech Solutions Plus',
    customer: 'Hyderabad Tech Solutions', // Same consignee as SO003
    pickup: 'Delhi IT Park',
    delivery: 'Hyderabad Tech City',
    materialType: 'cuboidal',
    dimensions: { length: 350, width: 250, height: 150 },
    weight: 6,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'high',
    status: 'unplanned',
    fragilityScore: 4,
    packagingType: 'foam_padded',
    materialProfile: 'ELECTRONICS_CONSUMER'
  },
  {
    id: 'SO136',
    doId: 'DO136',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 45,
    seller: 'Digital Devices Corp',
    customer: 'Hyderabad Tech Solutions', // Same consignee as SO003
    pickup: 'Delhi Electronics Hub',
    delivery: 'Hyderabad Tech City',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 180 },
    weight: 7,
    stackable: true,
    maxStackHeight: 1900,
    priority: 'medium',
    status: 'unplanned',
    fragilityScore: 4,
    packagingType: 'foam_padded',
    materialProfile: 'ELECTRONICS_CONSUMER'
  },
  {
    id: 'SO137',
    doId: 'DO137',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 20,
    seller: 'Silicon Valley Imports',
    customer: 'Bangalore Electronics Hub', // Same consignee as SO004
    pickup: 'Delhi Tech Zone',
    delivery: 'Bangalore Electronic City',
    materialType: 'cylindrical',
    dimensions: { diameter: 280, height: 750 },
    weight: 14,
    orientation: 'vertical',
    nesting: true,
    fragile: true,
    priority: 'high',
    status: 'unplanned',
    fragilityScore: 5,
    packagingType: 'foam_padded',
    materialProfile: 'GLASS_CONTAINERS'
  },
  {
    id: 'SO138',
    doId: 'DO138',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 18,
    seller: 'Precision Components Ltd',
    customer: 'Bangalore Electronics Hub', // Same consignee as SO004
    pickup: 'Delhi Manufacturing',
    delivery: 'Bangalore Electronic City',
    materialType: 'cylindrical',
    dimensions: { diameter: 300, height: 700 },
    weight: 15,
    orientation: 'horizontal',
    nesting: true,
    fragile: true,
    priority: 'high',
    status: 'unplanned',
    fragilityScore: 5,
    packagingType: 'foam_padded',
    materialProfile: 'GLASS_CONTAINERS'
  },
  {
    id: 'SO139',
    doId: 'DO139',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 55,
    seller: 'Coastal Trading Co',
    customer: 'Chennai Port Authority', // Same consignee as SO005
    pickup: 'Delhi Logistics Park',
    delivery: 'Chennai Port',
    materialType: 'cuboidal',
    dimensions: { length: 550, width: 400, height: 300 },
    weight: 22,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'medium',
    status: 'unplanned',
    fragilityScore: 2,
    packagingType: 'wooden_crate',
    materialProfile: 'GENERAL'
  },
  {
    id: 'SO140',
    doId: 'DO140',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 42,
    seller: 'Maritime Exports',
    customer: 'Chennai Port Authority', // Same consignee as SO005
    pickup: 'Delhi Cargo Hub',
    delivery: 'Chennai Port',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 450, height: 350 },
    weight: 28,
    stackable: true,
    maxStackHeight: 1400,
    priority: 'low',
    status: 'unplanned',
    fragilityScore: 2,
    packagingType: 'wooden_crate',
    materialProfile: 'GENERAL'
  },
  // More orders with shared consignees for better testing
  {
    id: 'SO141',
    doId: 'DO141',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 28,
    seller: 'Metro Retail Chain',
    customer: 'Mumbai Central Retail', // Same consignee as SO001, SO131, SO132
    pickup: 'Delhi Distribution Center',
    delivery: 'Mumbai Central',
    materialType: 'cuboidal',
    dimensions: { length: 480, width: 320, height: 220 },
    weight: 15,
    stackable: true,
    maxStackHeight: 1700,
    priority: 'high',
    status: 'unplanned',
    fragilityScore: 2,
    packagingType: 'corrugated_box',
    materialProfile: 'FMCG'
  },
  {
    id: 'SO142',
    doId: 'DO142',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 32,
    seller: 'Bulk Trading Enterprises',
    customer: 'Mumbai Port Logistics', // Same consignee as SO002, SO133, SO134
    pickup: 'Delhi Wholesale Market',
    delivery: 'Mumbai Port',
    materialType: 'cylindrical',
    dimensions: { diameter: 380, height: 680 },
    weight: 19,
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'unplanned',
    fragilityScore: 3,
    packagingType: 'metal_drum',
    materialProfile: 'LIQUID_STANDARD'
  },
  {
    id: 'SO143',
    doId: 'DO143',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 50,
    seller: 'IT Hardware Suppliers',
    customer: 'Hyderabad Tech Solutions', // Same consignee as SO003, SO135, SO136
    pickup: 'Delhi Computer Market',
    delivery: 'Hyderabad Tech City',
    materialType: 'cuboidal',
    dimensions: { length: 380, width: 280, height: 160 },
    weight: 5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'high',
    status: 'planned',
    fragilityScore: 4,
    packagingType: 'foam_padded',
    materialProfile: 'ELECTRONICS_CONSUMER'
  },
  {
    id: 'SO144',
    doId: 'DO144',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 22,
    seller: 'Advanced Electronics',
    customer: 'Bangalore Electronics Hub', // Same consignee as SO004, SO137, SO138
    pickup: 'Delhi Tech District',
    delivery: 'Bangalore Electronic City',
    materialType: 'cylindrical',
    dimensions: { diameter: 290, height: 720 },
    weight: 13,
    orientation: 'vertical',
    nesting: true,
    fragile: true,
    priority: 'high',
    status: 'unplanned',
    fragilityScore: 5,
    packagingType: 'foam_padded',
    materialProfile: 'GLASS_CONTAINERS'
  },
  {
    id: 'SO145',
    doId: 'DO145',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 48,
    seller: 'Port Logistics Group',
    customer: 'Chennai Port Authority', // Same consignee as SO005, SO139, SO140
    pickup: 'Delhi Freight Terminal',
    delivery: 'Chennai Port',
    materialType: 'cuboidal',
    dimensions: { length: 520, width: 380, height: 280 },
    weight: 24,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'medium',
    status: 'unplanned',
    fragilityScore: 2,
    packagingType: 'wooden_crate',
    materialProfile: 'GENERAL'
  },
  // Additional orders to ensure each consignee has at least 3 orders
  {
    id: 'SO146',
    doId: 'DO146',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 38,
    seller: 'Retail Distribution Network',
    customer: 'Mumbai Central Retail', // Same consignee as SO001, SO131, SO132, SO141
    pickup: 'Delhi Central Warehouse',
    delivery: 'Mumbai Central',
    materialType: 'cuboidal',
    dimensions: { length: 520, width: 380, height: 280 },
    weight: 20,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'medium',
    status: 'unplanned',
    fragilityScore: 2,
    packagingType: 'corrugated_box',
    materialProfile: 'FMCG'
  },
  {
    id: 'SO147',
    doId: 'DO147',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 45,
    seller: 'Port Services Ltd',
    customer: 'Mumbai Port Logistics', // Same consignee as SO002, SO133, SO134, SO142
    pickup: 'Delhi Maritime Terminal',
    delivery: 'Mumbai Port',
    materialType: 'cylindrical',
    dimensions: { diameter: 420, height: 720 },
    weight: 25,
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'high',
    status: 'unplanned',
    fragilityScore: 3,
    packagingType: 'metal_drum',
    materialProfile: 'LIQUID_STANDARD'
  },
  {
    id: 'SO148',
    doId: 'DO148',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 55,
    seller: 'Electronics Wholesale Co',
    customer: 'Hyderabad Tech Solutions', // Same consignee as SO003, SO135, SO136, SO143
    pickup: 'Delhi Tech Hub',
    delivery: 'Hyderabad Tech City',
    materialType: 'cuboidal',
    dimensions: { length: 360, width: 270, height: 170 },
    weight: 6.5,
    stackable: true,
    maxStackHeight: 1950,
    priority: 'medium',
    status: 'planned',
    fragilityScore: 4,
    packagingType: 'foam_padded',
    materialProfile: 'ELECTRONICS_CONSUMER'
  },
  {
    id: 'SO149',
    doId: 'DO149',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 24,
    seller: 'Tech Components Import',
    customer: 'Bangalore Electronics Hub', // Same consignee as SO004, SO137, SO138, SO144
    pickup: 'Delhi Import Zone',
    delivery: 'Bangalore Electronic City',
    materialType: 'cylindrical',
    dimensions: { diameter: 310, height: 740 },
    weight: 16,
    orientation: 'vertical',
    nesting: true,
    fragile: true,
    priority: 'high',
    status: 'unplanned',
    fragilityScore: 5,
    packagingType: 'foam_padded',
    materialProfile: 'GLASS_CONTAINERS'
  },
  {
    id: 'SO150',
    doId: 'DO150',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 50,
    seller: 'Coastal Cargo Services',
    customer: 'Chennai Port Authority', // Same consignee as SO005, SO139, SO140, SO145
    pickup: 'Delhi Port Authority',
    delivery: 'Chennai Port',
    materialType: 'cuboidal',
    dimensions: { length: 540, width: 390, height: 290 },
    weight: 26,
    stackable: true,
    maxStackHeight: 1450,
    priority: 'low',
    status: 'unplanned',
    fragilityScore: 2,
    packagingType: 'wooden_crate',
    materialProfile: 'GENERAL'
  },
  // Continue adding 100+ more orders to reach 250+ total
  {
    id: 'SO151',
    doId: 'DO151',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 90,
    seller: 'Fashion Apparel Ltd',
    pickup: 'Delhi Textile Market',
    delivery: 'Mumbai Fashion District',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 150 },
    weight: 4,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO152',
    doId: 'DO152',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 35,
    seller: 'Industrial Tools Corp',
    pickup: 'Delhi Industrial Park',
    delivery: 'Hyderabad Manufacturing Hub',
    materialType: 'cuboidal',
    dimensions: { length: 450, width: 350, height: 200 },
    weight: 12,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO153',
    doId: 'DO153',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 120,
    seller: 'Book Publishers Inc',
    pickup: 'Delhi Publishing House',
    delivery: 'Chennai Distribution Center',
    materialType: 'cuboidal',
    dimensions: { length: 220, width: 150, height: 40 },
    weight: 1.5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO154',
    doId: 'DO154',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 18,
    seller: 'Chemical Solutions Ltd',
    pickup: 'Delhi Chemical Complex',
    delivery: 'Bangalore Research Lab',
    materialType: 'cylindrical',
    dimensions: { diameter: 350, height: 600 },
    weight: 28,
    orientation: 'vertical',
    nesting: false,
    fragile: true,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO155',
    doId: 'DO155',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 65,
    seller: 'Household Goods Co',
    pickup: 'Delhi Home Appliances',
    delivery: 'Mumbai Retail Chain',
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 400, height: 250 },
    weight: 15,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO156',
    doId: 'DO156',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 42,
    seller: 'Metal Works Ltd',
    pickup: 'Delhi Metal Factory',
    delivery: 'Hyderabad Construction Site',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 300 },
    weight: 35,
    stackable: false,
    maxStackHeight: 300,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO157',
    doId: 'DO157',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 28,
    seller: 'Oil Refinery Supplies',
    pickup: 'Delhi Oil Depot',
    delivery: 'Chennai Processing Plant',
    materialType: 'cylindrical',
    dimensions: { diameter: 500, height: 800 },
    weight: 45,
    orientation: 'horizontal',
    nesting: false,
    fragile: false,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO158',
    doId: 'DO158',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 85,
    seller: 'Cosmetics Brand X',
    pickup: 'Delhi Beauty Factory',
    delivery: 'Bangalore Cosmetics Distributor',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 150, height: 100 },
    weight: 2.5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO159',
    doId: 'DO159',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 22,
    seller: 'Heavy Machinery Corp',
    pickup: 'Delhi Machine Shop',
    delivery: 'Mumbai Industrial Area',
    materialType: 'cuboidal',
    dimensions: { length: 1200, width: 900, height: 700 },
    weight: 120,
    stackable: false,
    maxStackHeight: 700,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO160',
    doId: 'DO160',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 95,
    seller: 'Paper Products Ltd',
    pickup: 'Delhi Paper Mill',
    delivery: 'Hyderabad Printing Press',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 120 },
    weight: 6,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO161',
    doId: 'DO161',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 45,
    seller: 'Steel Pipes Manufacturer',
    pickup: 'Delhi Steel Plant',
    delivery: 'Chennai Construction Co',
    materialType: 'cylindrical',
    dimensions: { diameter: 200, height: 3000 },
    weight: 55,
    orientation: 'horizontal',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO162',
    doId: 'DO162',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 30,
    seller: 'Medical Equipment Ltd',
    pickup: 'Delhi Medical Devices',
    delivery: 'Bangalore Hospital',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 300 },
    weight: 18,
    stackable: true,
    maxStackHeight: 1500,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO163',
    doId: 'DO163',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 75,
    seller: 'Plastic Containers Inc',
    pickup: 'Delhi Plastics Factory',
    delivery: 'Mumbai Packaging Co',
    materialType: 'cuboidal',
    dimensions: { length: 350, width: 250, height: 180 },
    weight: 5,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO164',
    doId: 'DO164',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 18,
    seller: 'Generator Company',
    pickup: 'Delhi Power Equipment',
    delivery: 'Hyderabad Factory',
    materialType: 'cuboidal',
    dimensions: { length: 1000, width: 700, height: 800 },
    weight: 95,
    stackable: false,
    maxStackHeight: 800,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO165',
    doId: 'DO165',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 110,
    seller: 'Tea Packaging Ltd',
    pickup: 'Delhi Tea Factory',
    delivery: 'Chennai Distribution',
    materialType: 'cuboidal',
    dimensions: { length: 180, width: 120, height: 90 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO166',
    doId: 'DO166',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 40,
    seller: 'Computer Peripherals',
    pickup: 'Delhi Tech Market',
    delivery: 'Bangalore IT Company',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 100 },
    weight: 3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO167',
    doId: 'DO167',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 50,
    seller: 'Rubber Products Co',
    pickup: 'Delhi Rubber Factory',
    delivery: 'Mumbai Industrial',
    materialType: 'cylindrical',
    dimensions: { diameter: 150, height: 400 },
    weight: 8,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO168',
    doId: 'DO168',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 25,
    seller: 'Glass Manufacturing',
    pickup: 'Delhi Glass Works',
    delivery: 'Hyderabad Construction',
    materialType: 'cuboidal',
    dimensions: { length: 800, width: 600, height: 100 },
    weight: 40,
    stackable: true,
    maxStackHeight: 500,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO169',
    doId: 'DO169',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 15,
    seller: 'Scientific Instruments',
    pickup: 'Delhi Lab Equipment',
    delivery: 'Chennai Research Institute',
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 400, height: 250 },
    weight: 12,
    stackable: false,
    maxStackHeight: 250,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO170',
    doId: 'DO170',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 65,
    seller: 'Toy Manufacturing Ltd',
    pickup: 'Delhi Toy Factory',
    delivery: 'Bangalore Toy Store',
    materialType: 'cuboidal',
    dimensions: { length: 250, width: 200, height: 150 },
    weight: 3,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO171',
    doId: 'DO171',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 35,
    seller: 'Paint Manufacturing',
    pickup: 'Delhi Paint Factory',
    delivery: 'Mumbai Hardware Store',
    materialType: 'cylindrical',
    dimensions: { diameter: 250, height: 350 },
    weight: 18,
    orientation: 'vertical',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO172',
    doId: 'DO172',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 55,
    seller: 'Cable Manufacturing',
    pickup: 'Delhi Cable Factory',
    delivery: 'Hyderabad Electrical',
    materialType: 'cylindrical',
    dimensions: { diameter: 80, height: 1500 },
    weight: 20,
    orientation: 'horizontal',
    nesting: false,
    fragile: false,
    priority: 'medium',
    status: 'planned'
  },
  {
    id: 'SO173',
    doId: 'DO173',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 90,
    seller: 'Spice Processing Ltd',
    pickup: 'Delhi Spice Market',
    delivery: 'Chennai Food Processing',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 150 },
    weight: 8,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO174',
    doId: 'DO174',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 28,
    seller: 'Air Conditioner Parts',
    pickup: 'Delhi AC Factory',
    delivery: 'Bangalore Service Center',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 300 },
    weight: 22,
    stackable: false,
    maxStackHeight: 300,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO175',
    doId: 'DO175',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 80,
    seller: 'Stationery Wholesale',
    pickup: 'Delhi Stationery Market',
    delivery: 'Mumbai Office Supplies',
    materialType: 'cuboidal',
    dimensions: { length: 250, width: 180, height: 100 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO176',
    doId: 'DO176',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 20,
    seller: 'Water Pump Company',
    pickup: 'Delhi Pump Factory',
    delivery: 'Hyderabad Industrial',
    materialType: 'cuboidal',
    dimensions: { length: 700, width: 500, height: 400 },
    weight: 45,
    stackable: false,
    maxStackHeight: 400,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO177',
    doId: 'DO177',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 45,
    seller: 'Ceramic Tiles Ltd',
    pickup: 'Delhi Tile Factory',
    delivery: 'Chennai Building Materials',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 600, height: 60 },
    weight: 25,
    stackable: true,
    maxStackHeight: 600,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO178',
    doId: 'DO178',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 70,
    seller: 'Mobile Phone Accessories',
    pickup: 'Delhi Mobile Market',
    delivery: 'Bangalore Phone Store',
    materialType: 'cuboidal',
    dimensions: { length: 120, width: 80, height: 30 },
    weight: 0.5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO179',
    doId: 'DO179',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 25,
    seller: 'Furniture Components',
    pickup: 'Delhi Wood Factory',
    delivery: 'Mumbai Furniture Store',
    materialType: 'cuboidal',
    dimensions: { length: 1000, width: 600, height: 400 },
    weight: 30,
    stackable: false,
    maxStackHeight: 400,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO180',
    doId: 'DO180',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 85,
    seller: 'Organic Food Products',
    pickup: 'Delhi Organic Farm',
    delivery: 'Hyderabad Health Store',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 150 },
    weight: 7,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO181',
    doId: 'DO181',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 32,
    seller: 'Industrial Chemicals',
    pickup: 'Delhi Chemical Plant',
    delivery: 'Chennai Manufacturing',
    materialType: 'cylindrical',
    dimensions: { diameter: 400, height: 600 },
    weight: 32,
    orientation: 'vertical',
    nesting: false,
    fragile: true,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO182',
    doId: 'DO182',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 55,
    seller: 'Home Appliances Ltd',
    pickup: 'Delhi Appliance Factory',
    delivery: 'Bangalore Retail Chain',
    materialType: 'cuboidal',
    dimensions: { length: 450, width: 350, height: 200 },
    weight: 12,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO183',
    doId: 'DO183',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 40,
    seller: 'Sports Equipment Co',
    pickup: 'Delhi Sports Factory',
    delivery: 'Mumbai Sports Store',
    materialType: 'cuboidal',
    dimensions: { length: 800, width: 400, height: 250 },
    weight: 20,
    stackable: true,
    maxStackHeight: 1250,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO184',
    doId: 'DO184',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 18,
    seller: 'Solar Panel Systems',
    pickup: 'Delhi Solar Factory',
    delivery: 'Hyderabad Energy Co',
    materialType: 'cuboidal',
    dimensions: { length: 1700, width: 1000, height: 50 },
    weight: 30,
    stackable: true,
    maxStackHeight: 200,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO185',
    doId: 'DO185',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 75,
    seller: 'Herbal Products Ltd',
    pickup: 'Delhi Herbal Factory',
    delivery: 'Chennai Pharmacy',
    materialType: 'cuboidal',
    dimensions: { length: 150, width: 100, height: 80 },
    weight: 1.5,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO186',
    doId: 'DO186',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 25,
    seller: 'Industrial Pumps',
    pickup: 'Delhi Pump Manufacturer',
    delivery: 'Bangalore Engineering',
    materialType: 'cuboidal',
    dimensions: { length: 800, width: 600, height: 500 },
    weight: 55,
    stackable: false,
    maxStackHeight: 500,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO187',
    doId: 'DO187',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 60,
    seller: 'Packaging Materials',
    pickup: 'Delhi Packaging Factory',
    delivery: 'Mumbai Industrial',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 200 },
    weight: 6,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO188',
    doId: 'DO188',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 35,
    seller: 'Welding Equipment',
    pickup: 'Delhi Welding Factory',
    delivery: 'Hyderabad Fabrication',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 300 },
    weight: 28,
    stackable: false,
    maxStackHeight: 300,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO189',
    doId: 'DO189',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 50,
    seller: 'Rice Processing Ltd',
    pickup: 'Delhi Rice Mill',
    delivery: 'Chennai Food Distribution',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 200 },
    weight: 30,
    stackable: true,
    maxStackHeight: 1000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO190',
    doId: 'DO190',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 90,
    seller: 'Gift Items Wholesale',
    pickup: 'Delhi Gift Market',
    delivery: 'Bangalore Retail Store',
    materialType: 'cuboidal',
    dimensions: { length: 200, width: 150, height: 100 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO191',
    doId: 'DO191',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 30,
    seller: 'Battery Manufacturing',
    pickup: 'Delhi Battery Factory',
    delivery: 'Mumbai Electronics',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 150 },
    weight: 8,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO192',
    doId: 'DO192',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 22,
    seller: 'Elevator Components',
    pickup: 'Delhi Elevator Factory',
    delivery: 'Hyderabad Construction',
    materialType: 'cuboidal',
    dimensions: { length: 900, width: 700, height: 600 },
    weight: 75,
    stackable: false,
    maxStackHeight: 600,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO193',
    doId: 'DO193',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 65,
    seller: 'Coffee Processing Ltd',
    pickup: 'Delhi Coffee Roaster',
    delivery: 'Chennai Cafe Chain',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 200 },
    weight: 15,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO194',
    doId: 'DO194',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 45,
    seller: 'Industrial Fans Ltd',
    pickup: 'Delhi Fan Factory',
    delivery: 'Bangalore Industrial',
    materialType: 'cuboidal',
    dimensions: { length: 700, width: 700, height: 250 },
    weight: 18,
    stackable: true,
    maxStackHeight: 1000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO195',
    doId: 'DO195',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 55,
    seller: 'Plastic Bottles Ltd',
    pickup: 'Delhi Plastics Plant',
    delivery: 'Mumbai Beverage Co',
    materialType: 'cylindrical',
    dimensions: { diameter: 100, height: 300 },
    weight: 2,
    orientation: 'vertical',
    nesting: true,
    fragile: false,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO196',
    doId: 'DO196',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 40,
    seller: 'Security Systems',
    pickup: 'Delhi Security Factory',
    delivery: 'Hyderabad Corporate',
    materialType: 'cuboidal',
    dimensions: { length: 500, width: 400, height: 200 },
    weight: 14,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'high',
    status: 'planned'
  },
  {
    id: 'SO197',
    doId: 'DO197',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 28,
    seller: 'Marine Equipment',
    pickup: 'Delhi Marine Supplies',
    delivery: 'Chennai Shipyard',
    materialType: 'cuboidal',
    dimensions: { length: 800, width: 600, height: 400 },
    weight: 35,
    stackable: false,
    maxStackHeight: 400,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO198',
    doId: 'DO198',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 80,
    seller: 'Educational Supplies',
    pickup: 'Delhi Education Market',
    delivery: 'Bangalore School District',
    materialType: 'cuboidal',
    dimensions: { length: 300, width: 200, height: 100 },
    weight: 4,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'low',
    status: 'unplanned'
  },
  {
    id: 'SO199',
    doId: 'DO199',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 35,
    seller: 'Power Tools Ltd',
    pickup: 'Delhi Tool Factory',
    delivery: 'Mumbai Hardware',
    materialType: 'cuboidal',
    dimensions: { length: 350, width: 250, height: 150 },
    weight: 10,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO200',
    doId: 'DO200',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 50,
    seller: 'Agricultural Equipment',
    pickup: 'Delhi Agri Machinery',
    delivery: 'Hyderabad Farm Co',
    materialType: 'cuboidal',
    dimensions: { length: 1200, width: 800, height: 600 },
    weight: 80,
    stackable: false,
    maxStackHeight: 600,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO201',
    doId: 'DO201',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 42,
    seller: 'Leather Goods Manufacturer',
    pickup: 'Delhi Leather Factory',
    delivery: 'Chennai Export',
    materialType: 'cuboidal',
    dimensions: { length: 450, width: 350, height: 150 },
    weight: 6,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO202',
    doId: 'DO202',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 25,
    seller: 'Medical Devices Ltd',
    pickup: 'Delhi Medical Equipment',
    delivery: 'Bangalore Healthcare',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 300, height: 200 },
    weight: 8,
    stackable: true,
    maxStackHeight: 1600,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO203',
    doId: 'DO203',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 70,
    seller: 'Kitchenware Manufacturer',
    pickup: 'Delhi Kitchen Factory',
    delivery: 'Mumbai Home Store',
    materialType: 'cuboidal',
    dimensions: { length: 350, width: 250, height: 180 },
    weight: 5,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO204',
    doId: 'DO204',
    route: 'DEL-HYD',
    routeName: 'Delhi → Hyderabad',
    quantity: 30,
    seller: 'Construction Materials',
    pickup: 'Delhi Cement Plant',
    delivery: 'Hyderabad Building Site',
    materialType: 'cuboidal',
    dimensions: { length: 600, width: 400, height: 200 },
    weight: 50,
    stackable: true,
    maxStackHeight: 1000,
    priority: 'medium',
    status: 'unplanned'
  },
  {
    id: 'SO205',
    doId: 'DO205',
    route: 'DEL-CHE',
    routeName: 'Delhi → Chennai',
    quantity: 55,
    seller: 'Textile Machinery',
    pickup: 'Delhi Textile Equipment',
    delivery: 'Chennai Textile Mill',
    materialType: 'cuboidal',
    dimensions: { length: 1000, width: 700, height: 500 },
    weight: 60,
    stackable: false,
    maxStackHeight: 500,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO206',
    doId: 'DO206',
    route: 'DEL-BAN',
    routeName: 'Delhi → Bangalore',
    quantity: 38,
    seller: 'IT Hardware Components',
    pickup: 'Delhi Computer Parts',
    delivery: 'Bangalore Assembly Plant',
    materialType: 'cuboidal',
    dimensions: { length: 250, width: 180, height: 80 },
    weight: 2,
    stackable: true,
    maxStackHeight: 2000,
    priority: 'high',
    status: 'unplanned'
  },
  {
    id: 'SO207',
    doId: 'DO207',
    route: 'DEL-MUM',
    routeName: 'Delhi → Mumbai',
    quantity: 45,
    seller: 'Footwear Manufacturer',
    pickup: 'Delhi Shoe Factory',
    delivery: 'Mumbai Retail Chain',
    materialType: 'cuboidal',
    dimensions: { length: 400, width: 250, height: 150 },
    weight: 4,
    stackable: true,
    maxStackHeight: 1800,
    priority: 'medium',
    status: 'unplanned'
  }
];

// Perfect sample plans with optimal metrics for demonstrating AI capabilities
export const perfectSamplePlans = [
  {
    id: 'PLAN-001',
    orders: [
      { id: 'SO001', doId: 'DO001', route: 'DEL-MUM', quantity: 50, seller: 'ABC Corp', customer: 'Mumbai Central Retail', materialType: 'cuboidal', dimensions: { length: 600, width: 400, height: 300 }, weight: 25, status: 'planned' },
      { id: 'SO008', doId: 'DO008', route: 'DEL-MUM', quantity: 45, seller: 'Fresh Foods Ltd', customer: 'Mumbai Market', materialType: 'cuboidal', dimensions: { length: 500, width: 350, height: 250 }, weight: 12, status: 'planned' },
      { id: 'SO036', doId: 'DO036', route: 'DEL-MUM', quantity: 80, seller: 'Snack Foods', customer: 'Mumbai Supermarket Chain', materialType: 'cuboidal', dimensions: { length: 300, width: 200, height: 150 }, weight: 6, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'all',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['all']
    },
    vehicles: [{
      type: 'EICHER_14FT',
      quantity: 1,
      orders: [
        { id: 'SO001', quantity: 50 },
        { id: 'SO008', quantity: 45 },
        { id: 'SO036', quantity: 80 }
      ],
      loadPlan: {
        items: [
          { id: 'SO001', quantity: 50, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO008', quantity: 45, position: { x: 0, y: 0, z: 900 } },
          { id: 'SO036', quantity: 80, position: { x: 0, y: 0, z: 1150 } }
        ],
        metrics: {
          volumeUtilization: 98.5,
          weightUtilization: 97.2,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1400,
        duration: 18,
        cost: 5880, // 1400km * 18 INR/km * 2.33 (fuel + maintenance factor)
        fuelConsumption: 210,
        tolls: 1200,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'EICHER_14FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 5880,
    totalDistance: 1400,
    totalDuration: 18,
    costBreakdown: {
      fuel: 4200,
      tolls: 1200,
      maintenance: 480
    },
    totalWeight: 4475,
    totalVolume: 37.4,
    createdAt: '2024-11-26T08:00:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 98.5,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-002',
    orders: [
      { id: 'SO003', doId: 'DO003', route: 'DEL-HYD', quantity: 100, seller: 'PQR Industries', customer: 'Hyderabad Tech Solutions', materialType: 'cuboidal', dimensions: { length: 400, width: 300, height: 200 }, weight: 8, status: 'planned' },
      { id: 'SO021', doId: 'DO021', route: 'DEL-HYD', quantity: 60, seller: 'Plastic Containers', customer: 'Hyderabad Packaging', materialType: 'cuboidal', dimensions: { length: 300, width: 200, height: 150 }, weight: 4, status: 'planned' },
      { id: 'SO101', doId: 'DO101', route: 'DEL-HYD', quantity: 42, seller: 'Ceiling Fans', customer: 'Hyderabad Electrical Store', materialType: 'cuboidal', dimensions: { length: 1200, width: 1200, height: 400 }, weight: 12, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'volume',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['all']
    },
    vehicles: [{
      type: 'EICHER_17FT',
      quantity: 1,
      orders: [
        { id: 'SO003', quantity: 100 },
        { id: 'SO021', quantity: 60 },
        { id: 'SO101', quantity: 42 }
      ],
      loadPlan: {
        items: [
          { id: 'SO003', quantity: 100, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO021', quantity: 60, position: { x: 0, y: 0, z: 600 } },
          { id: 'SO101', quantity: 42, position: { x: 0, y: 0, z: 750 } }
        ],
        metrics: {
          volumeUtilization: 99.2,
          weightUtilization: 95.8,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1500,
        duration: 20,
        cost: 8100,
        fuelConsumption: 300,
        tolls: 1500,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'EICHER_17FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 8100,
    totalDistance: 1500,
    totalDuration: 20,
    costBreakdown: {
      fuel: 6000,
      tolls: 1500,
      maintenance: 600
    },
    totalWeight: 3588,
    totalVolume: 38.1,
    createdAt: '2024-11-26T09:15:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 97.8,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-003',
    orders: [
      { id: 'SO006', doId: 'DO006', route: 'DEL-MUM', quantity: 80, seller: 'Pharma Solutions', customer: 'Mumbai Medical District', materialType: 'cuboidal', dimensions: { length: 300, width: 200, height: 150 }, weight: 5, temperatureControlled: true, status: 'planned' },
      { id: 'SO042', doId: 'DO042', route: 'DEL-CHE', quantity: 16, seller: 'Oxygen Cylinders', customer: 'Chennai Hospital', materialType: 'cylindrical', dimensions: { diameter: 140, height: 1370 }, weight: 55, status: 'planned' }
    ],
    materialTypes: ['cuboidal', 'cylindrical'],
    constraints: {
      optimizationPriority: 'all',
      routeStrategy: 'combined',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 2,
      priorities: ['high']
    },
    vehicles: [{
      type: 'REFRIGERATED_14FT',
      quantity: 1,
      orders: [
        { id: 'SO006', quantity: 80 },
        { id: 'SO042', quantity: 16 }
      ],
      loadPlan: {
        items: [
          { id: 'SO006', quantity: 80, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO042', quantity: 16, position: { x: 0, y: 0, z: 225 } }
        ],
        metrics: {
          volumeUtilization: 96.7,
          weightUtilization: 92.4,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1800,
        duration: 24,
        cost: 12960,
        fuelConsumption: 360,
        tolls: 2400,
        stops: 2
      }
    }],
    vehicleConfig: [{
      type: 'REFRIGERATED_14FT',
      quantity: 1
    }],
    dropPoints: 2,
    routeStrategy: 'combined',
    loadingSequence: 'lifo',
    allowMixedRoutes: true,
    totalCost: 12960,
    totalDistance: 1800,
    totalDuration: 24,
    costBreakdown: {
      fuel: 8640,
      tolls: 2400,
      maintenance: 960,
      refrigeration: 960
    },
    totalWeight: 2080,
    totalVolume: 37.2,
    createdAt: '2024-11-26T10:30:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 99.2,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-004',
    orders: [
      { id: 'SO004', doId: 'DO004', route: 'DEL-BAN', quantity: 15, seller: 'Tech Solutions', customer: 'Bangalore Electronics Hub', materialType: 'cylindrical', dimensions: { diameter: 250, height: 800 }, weight: 12, fragile: true, status: 'planned' },
      { id: 'SO039', doId: 'DO039', route: 'DEL-BAN', quantity: 32, seller: 'Computer Monitors', customer: 'Bangalore IT Company', materialType: 'cuboidal', dimensions: { length: 600, width: 400, height: 150 }, weight: 8, status: 'planned' },
      { id: 'SO103', doId: 'DO103', route: 'DEL-BAN', quantity: 31, seller: 'Tablet Computers', customer: 'Bangalore Tech Store', materialType: 'cuboidal', dimensions: { length: 250, width: 180, height: 10 }, weight: 1, status: 'planned' }
    ],
    materialTypes: ['cylindrical', 'cuboidal'],
    constraints: {
      optimizationPriority: 'fragility',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['high']
    },
    vehicles: [{
      type: 'AIR_RIDE_20FT',
      quantity: 1,
      orders: [
        { id: 'SO004', quantity: 15 },
        { id: 'SO039', quantity: 32 },
        { id: 'SO103', quantity: 31 }
      ],
      loadPlan: {
        items: [
          { id: 'SO004', quantity: 15, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO039', quantity: 32, position: { x: 0, y: 0, z: 800 } },
          { id: 'SO103', quantity: 31, position: { x: 0, y: 0, z: 950 } }
        ],
        metrics: {
          volumeUtilization: 97.8,
          weightUtilization: 94.5,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 2100,
        duration: 26,
        cost: 16800,
        fuelConsumption: 420,
        tolls: 3000,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'AIR_RIDE_20FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 16800,
    totalDistance: 2100,
    totalDuration: 26,
    costBreakdown: {
      fuel: 12600,
      tolls: 3000,
      maintenance: 840,
      airRide: 360
    },
    totalWeight: 1267,
    totalVolume: 37.6,
    createdAt: '2024-11-26T11:45:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 98.7,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-005',
    orders: [
      { id: 'SO009', doId: 'DO009', route: 'DEL-HYD', quantity: 8, seller: 'Steel Pipes Co', customer: 'Hyderabad Construction', materialType: 'cylindrical', dimensions: { diameter: 150, height: 3000 }, weight: 45, status: 'planned' },
      { id: 'SO013', doId: 'DO013', route: 'DEL-HYD', quantity: 15, seller: 'Auto Parts Ltd', customer: 'Hyderabad Assembly Plant', materialType: 'cuboidal', dimensions: { length: 600, width: 400, height: 300 }, weight: 18, status: 'planned' },
      { id: 'SO017', doId: 'DO017', route: 'DEL-HYD', quantity: 25, seller: 'Furniture Makers', customer: 'Hyderabad Showroom', materialType: 'cuboidal', dimensions: { length: 1200, width: 800, height: 600 }, weight: 22, status: 'planned' }
    ],
    materialTypes: ['cylindrical', 'cuboidal'],
    constraints: {
      optimizationPriority: 'weight',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['medium']
    },
    vehicles: [{
      type: 'CONTAINER_20FT',
      quantity: 1,
      orders: [
        { id: 'SO009', quantity: 8 },
        { id: 'SO013', quantity: 15 },
        { id: 'SO017', quantity: 25 }
      ],
      loadPlan: {
        items: [
          { id: 'SO009', quantity: 8, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO013', quantity: 15, position: { x: 0, y: 0, z: 3000 } },
          { id: 'SO017', quantity: 25, position: { x: 0, y: 0, z: 3300 } }
        ],
        metrics: {
          volumeUtilization: 98.9,
          weightUtilization: 96.3,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1500,
        duration: 20,
        cost: 8400,
        fuelConsumption: 300,
        tolls: 1500,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_20FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 8400,
    totalDistance: 1500,
    totalDuration: 20,
    costBreakdown: {
      fuel: 6000,
      tolls: 1500,
      maintenance: 900
    },
    totalWeight: 2870,
    totalVolume: 38.0,
    createdAt: '2024-11-26T12:30:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 97.5,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-006',
    orders: [
      { id: 'SO016', doId: 'DO016', route: 'DEL-MUM', quantity: 75, seller: 'Electronics Corp', customer: 'Mumbai Tech Park', materialType: 'cuboidal', dimensions: { length: 350, width: 250, height: 150 }, weight: 6, status: 'planned' },
      { id: 'SO052', doId: 'DO052', route: 'DEL-MUM', quantity: 36, seller: 'Glass Bottles', customer: 'Mumbai Beverage Company', materialType: 'cylindrical', dimensions: { diameter: 80, height: 250 }, weight: 3, fragile: true, status: 'planned' },
      { id: 'SO076', doId: 'DO076', route: 'DEL-MUM', quantity: 33, seller: 'Power Tools', customer: 'Mumbai Hardware Store', materialType: 'cuboidal', dimensions: { length: 400, width: 300, height: 150 }, weight: 8, status: 'planned' }
    ],
    materialTypes: ['cuboidal', 'cylindrical'],
    constraints: {
      optimizationPriority: 'all',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['medium']
    },
    vehicles: [{
      type: 'EICHER_14FT',
      quantity: 1,
      orders: [
        { id: 'SO016', quantity: 75 },
        { id: 'SO052', quantity: 36 },
        { id: 'SO076', quantity: 33 }
      ],
      loadPlan: {
        items: [
          { id: 'SO016', quantity: 75, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO052', quantity: 36, position: { x: 0, y: 0, z: 225 } },
          { id: 'SO076', quantity: 33, position: { x: 0, y: 0, z: 475 } }
        ],
        metrics: {
          volumeUtilization: 99.1,
          weightUtilization: 95.7,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1400,
        duration: 18,
        cost: 5880,
        fuelConsumption: 210,
        tolls: 1200,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'EICHER_14FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 5880,
    totalDistance: 1400,
    totalDuration: 18,
    costBreakdown: {
      fuel: 4200,
      tolls: 1200,
      maintenance: 480
    },
    totalWeight: 2199,
    totalVolume: 38.1,
    createdAt: '2024-11-26T13:15:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 98.9,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-007',
    orders: [
      { id: 'SO022', doId: 'DO022', route: 'DEL-CHE', quantity: 12, seller: 'Heavy Machinery', customer: 'Chennai Factory', materialType: 'cuboidal', dimensions: { length: 1500, width: 1000, height: 800 }, weight: 85, status: 'planned' },
      { id: 'SO054', doId: 'DO054', route: 'DEL-CHE', quantity: 22, seller: 'Steel Rods', customer: 'Chennai Construction', materialType: 'cylindrical', dimensions: { diameter: 25, height: 6000 }, weight: 40, status: 'planned' }
    ],
    materialTypes: ['cuboidal', 'cylindrical'],
    constraints: {
      optimizationPriority: 'weight',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['high']
    },
    vehicles: [{
      type: 'CONTAINER_32FT',
      quantity: 1,
      orders: [
        { id: 'SO022', quantity: 12 },
        { id: 'SO054', quantity: 22 }
      ],
      loadPlan: {
        items: [
          { id: 'SO022', quantity: 12, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO054', quantity: 22, position: { x: 0, y: 0, z: 800 } }
        ],
        metrics: {
          volumeUtilization: 97.3,
          weightUtilization: 98.5,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 2200,
        duration: 28,
        cost: 15840,
        fuelConsumption: 660,
        tolls: 3300,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_32FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 15840,
    totalDistance: 2200,
    totalDuration: 28,
    costBreakdown: {
      fuel: 11880,
      tolls: 3300,
      maintenance: 660
    },
    totalWeight: 3680,
    totalVolume: 53.8,
    createdAt: '2024-11-26T14:00:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 96.8,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-008',
    orders: [
      { id: 'SO027', doId: 'DO027', route: 'DEL-BAN', quantity: 85, seller: 'Mobile Accessories', customer: 'Bangalore Tech Mall', materialType: 'cuboidal', dimensions: { length: 150, width: 100, height: 50 }, weight: 1, status: 'planned' },
      { id: 'SO051', doId: 'DO051', route: 'DEL-BAN', quantity: 75, seller: 'Protein Supplements', customer: 'Bangalore Fitness Stores', materialType: 'cuboidal', dimensions: { length: 200, width: 150, height: 300 }, weight: 5, status: 'planned' },
      { id: 'SO055', doId: 'DO055', route: 'DEL-BAN', quantity: 120, seller: 'Greeting Cards', customer: 'Bangalore Gift Shops', materialType: 'cuboidal', dimensions: { length: 150, width: 100, height: 20 }, weight: 0.5, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'volume',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['low']
    },
    vehicles: [{
      type: 'EICHER_17FT',
      quantity: 1,
      orders: [
        { id: 'SO027', quantity: 85 },
        { id: 'SO051', quantity: 75 },
        { id: 'SO055', quantity: 120 }
      ],
      loadPlan: {
        items: [
          { id: 'SO027', quantity: 85, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO051', quantity: 75, position: { x: 0, y: 0, z: 50 } },
          { id: 'SO055', quantity: 120, position: { x: 0, y: 0, z: 350 } }
        ],
        metrics: {
          volumeUtilization: 99.7,
          weightUtilization: 89.2,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 2100,
        duration: 26,
        cost: 11340,
        fuelConsumption: 420,
        tolls: 3000,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'EICHER_17FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 11340,
    totalDistance: 2100,
    totalDuration: 26,
    costBreakdown: {
      fuel: 7560,
      tolls: 3000,
      maintenance: 780
    },
    totalWeight: 1262.5,
    totalVolume: 37.0,
    createdAt: '2024-11-26T15:30:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 99.1,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-009',
    orders: [
      { id: 'SO033', doId: 'DO033', route: 'DEL-HYD', quantity: 14, seller: 'Chemical Drums', customer: 'Hyderabad Processing Unit', materialType: 'cylindrical', dimensions: { diameter: 450, height: 750 }, weight: 38, fragile: true, status: 'planned' },
      { id: 'SO057', doId: 'DO057', route: 'DEL-HYD', quantity: 18, seller: 'Washing Machines', customer: 'Hyderabad Electronics Mall', materialType: 'cuboidal', dimensions: { length: 600, width: 600, height: 850 }, weight: 70, status: 'planned' }
    ],
    materialTypes: ['cylindrical', 'cuboidal'],
    constraints: {
      optimizationPriority: 'fragility',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['high']
    },
    vehicles: [{
      type: 'AIR_RIDE_REEFER',
      quantity: 1,
      orders: [
        { id: 'SO033', quantity: 14 },
        { id: 'SO057', quantity: 18 }
      ],
      loadPlan: {
        items: [
          { id: 'SO033', quantity: 14, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO057', quantity: 18, position: { x: 0, y: 0, z: 750 } }
        ],
        metrics: {
          volumeUtilization: 95.6,
          weightUtilization: 92.8,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1500,
        duration: 20,
        cost: 16500,
        fuelConsumption: 300,
        tolls: 1500,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'AIR_RIDE_REEFER',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 16500,
    totalDistance: 1500,
    totalDuration: 20,
    costBreakdown: {
      fuel: 10500,
      tolls: 1500,
      maintenance: 900,
      refrigeration: 3000,
      airRide: 600
    },
    totalWeight: 2056,
    totalVolume: 20.8,
    createdAt: '2024-11-26T16:45:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 98.3,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-010',
    orders: [
      { id: 'SO044', doId: 'DO044', route: 'DEL-MUM', quantity: 12, seller: 'Refrigerators', customer: 'Mumbai Electronics Store', materialType: 'cuboidal', dimensions: { length: 600, width: 650, height: 1700 }, weight: 65, status: 'planned' },
      { id: 'SO068', doId: 'DO068', route: 'DEL-MUM', quantity: 14, seller: 'Water Purifiers', customer: 'Mumbai Home Appliances', materialType: 'cuboidal', dimensions: { length: 450, width: 350, height: 500 }, weight: 25, status: 'planned' },
      { id: 'SO071', doId: 'DO071', route: 'DEL-MUM', quantity: 16, seller: 'Microwave Ovens', customer: 'Bangalore Home Store', materialType: 'cuboidal', dimensions: { length: 500, width: 400, height: 300 }, weight: 18, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'weight',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['high']
    },
    vehicles: [{
      type: 'CONTAINER_20FT',
      quantity: 1,
      orders: [
        { id: 'SO044', quantity: 12 },
        { id: 'SO068', quantity: 14 },
        { id: 'SO071', quantity: 16 }
      ],
      loadPlan: {
        items: [
          { id: 'SO044', quantity: 12, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO068', quantity: 14, position: { x: 0, y: 0, z: 1700 } },
          { id: 'SO071', quantity: 16, position: { x: 0, y: 0, z: 2200 } }
        ],
        metrics: {
          volumeUtilization: 97.4,
          weightUtilization: 99.1,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1400,
        duration: 18,
        cost: 7840,
        fuelConsumption: 280,
        tolls: 1200,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_20FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 7840,
    totalDistance: 1400,
    totalDuration: 18,
    costBreakdown: {
      fuel: 5600,
      tolls: 1200,
      maintenance: 1040
    },
    totalWeight: 3468,
    totalVolume: 31.5,
    createdAt: '2024-11-26T17:20:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 97.9,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-011',
    orders: [
      { id: 'SO046', doId: 'DO046', route: 'DEL-CHE', quantity: 38, seller: 'Wooden Furniture', customer: 'Chennai Home Store', materialType: 'cuboidal', dimensions: { length: 1800, width: 800, height: 400 }, weight: 30, status: 'planned' },
      { id: 'SO058', doId: 'DO058', route: 'DEL-CHE', quantity: 85, seller: 'Ayurvedic Medicines', customer: 'Chennai Pharmacy Chain', materialType: 'cuboidal', dimensions: { length: 120, width: 80, height: 60 }, weight: 2, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'volume',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['medium']
    },
    vehicles: [{
      type: 'CONTAINER_32FT',
      quantity: 1,
      orders: [
        { id: 'SO046', quantity: 38 },
        { id: 'SO058', quantity: 85 }
      ],
      loadPlan: {
        items: [
          { id: 'SO046', quantity: 38, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO058', quantity: 85, position: { x: 0, y: 0, z: 400 } }
        ],
        metrics: {
          volumeUtilization: 98.7,
          weightUtilization: 94.3,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 2200,
        duration: 28,
        cost: 15840,
        fuelConsumption: 660,
        tolls: 3300,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_32FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 15840,
    totalDistance: 2200,
    totalDuration: 28,
    costBreakdown: {
      fuel: 11880,
      tolls: 3300,
      maintenance: 660
    },
    totalWeight: 3190,
    totalVolume: 52.8,
    createdAt: '2024-11-26T18:10:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 98.4,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-012',
    orders: [
      { id: 'SO062', doId: 'DO062', route: 'DEL-CHE', quantity: 15, seller: 'Generator Sets', customer: 'Chennai Industrial Area', materialType: 'cuboidal', dimensions: { length: 1200, width: 800, height: 1000 }, weight: 150, status: 'planned' },
      { id: 'SO064', doId: 'DO064', route: 'DEL-MUM', quantity: 14, seller: 'Musical Instruments', customer: 'Mumbai Music Academy', materialType: 'cuboidal', dimensions: { length: 1000, width: 400, height: 200 }, weight: 12, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'weight',
      routeStrategy: 'combined',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 2,
      priorities: ['high']
    },
    vehicles: [{
      type: 'CONTAINER_32FT',
      quantity: 1,
      orders: [
        { id: 'SO062', quantity: 15 },
        { id: 'SO064', quantity: 14 }
      ],
      loadPlan: {
        items: [
          { id: 'SO062', quantity: 15, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO064', quantity: 14, position: { x: 0, y: 0, z: 1000 } }
        ],
        metrics: {
          volumeUtilization: 96.2,
          weightUtilization: 97.8,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1800,
        duration: 24,
        cost: 12960,
        fuelConsumption: 540,
        tolls: 2700,
        stops: 2
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_32FT',
      quantity: 1
    }],
    dropPoints: 2,
    routeStrategy: 'combined',
    loadingSequence: 'lifo',
    allowMixedRoutes: true,
    totalCost: 12960,
    totalDistance: 1800,
    totalDuration: 24,
    costBreakdown: {
      fuel: 9720,
      tolls: 2700,
      maintenance: 540
    },
    totalWeight: 2790,
    totalVolume: 51.2,
    createdAt: '2024-11-26T19:00:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 97.1,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-013',
    orders: [
      { id: 'SO077', doId: 'DO077', route: 'DEL-HYD', quantity: 19, seller: 'Inverters', customer: 'Hyderabad Electronics', materialType: 'cuboidal', dimensions: { length: 400, width: 250, height: 100 }, weight: 12, status: 'planned' },
      { id: 'SO089', doId: 'DO089', route: 'DEL-HYD', quantity: 21, seller: 'Printers', customer: 'Hyderabad Office Supply', materialType: 'cuboidal', dimensions: { length: 450, width: 350, height: 200 }, weight: 12, status: 'planned' },
      { id: 'SO113', doId: 'DO113', route: 'DEL-HYD', quantity: 37, seller: 'Table Lamps', customer: 'Hyderabad Home Decor', materialType: 'cuboidal', dimensions: { length: 300, width: 300, height: 500 }, weight: 6, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'volume',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['high']
    },
    vehicles: [{
      type: 'EICHER_17FT',
      quantity: 1,
      orders: [
        { id: 'SO077', quantity: 19 },
        { id: 'SO089', quantity: 21 },
        { id: 'SO113', quantity: 37 }
      ],
      loadPlan: {
        items: [
          { id: 'SO077', quantity: 19, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO089', quantity: 21, position: { x: 0, y: 0, z: 100 } },
          { id: 'SO113', quantity: 37, position: { x: 0, y: 0, z: 300 } }
        ],
        metrics: {
          volumeUtilization: 99.3,
          weightUtilization: 93.7,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1500,
        duration: 20,
        cost: 8100,
        fuelConsumption: 300,
        tolls: 1500,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'EICHER_17FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 8100,
    totalDistance: 1500,
    totalDuration: 20,
    costBreakdown: {
      fuel: 6000,
      tolls: 1500,
      maintenance: 600
    },
    totalWeight: 1429,
    totalVolume: 37.8,
    createdAt: '2024-11-26T20:15:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 98.6,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-014',
    orders: [
      { id: 'SO089', doId: 'DO089', route: 'DEL-HYD', quantity: 21, seller: 'Printers', customer: 'Hyderabad Office Supply', materialType: 'cuboidal', dimensions: { length: 450, width: 350, height: 200 }, weight: 12, status: 'planned' },
      { id: 'SO123', doId: 'DO123', route: 'DEL-BAN', quantity: 25, seller: 'Smart Watches', customer: 'Bangalore Tech Store', materialType: 'cuboidal', dimensions: { length: 100, width: 80, height: 50 }, weight: 1, status: 'planned' },
      { id: 'SO143', doId: 'DO143', route: 'DEL-HYD', quantity: 48, seller: 'IT Hardware Components', customer: 'Hyderabad Corporate', materialType: 'cuboidal', dimensions: { length: 250, width: 180, height: 80 }, weight: 2, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'all',
      routeStrategy: 'combined',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 2,
      priorities: ['high']
    },
    vehicles: [{
      type: 'EICHER_17FT',
      quantity: 1,
      orders: [
        { id: 'SO089', quantity: 21 },
        { id: 'SO123', quantity: 25 },
        { id: 'SO143', quantity: 48 }
      ],
      loadPlan: {
        items: [
          { id: 'SO089', quantity: 21, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO123', quantity: 25, position: { x: 0, y: 0, z: 200 } },
          { id: 'SO143', quantity: 48, position: { x: 0, y: 0, z: 250 } }
        ],
        metrics: {
          volumeUtilization: 98.9,
          weightUtilization: 91.4,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1800,
        duration: 24,
        cost: 9720,
        fuelConsumption: 360,
        tolls: 2700,
        stops: 2
      }
    }],
    vehicleConfig: [{
      type: 'EICHER_17FT',
      quantity: 1
    }],
    dropPoints: 2,
    routeStrategy: 'combined',
    loadingSequence: 'lifo',
    allowMixedRoutes: true,
    totalCost: 9720,
    totalDistance: 1800,
    totalDuration: 24,
    costBreakdown: {
      fuel: 6840,
      tolls: 2700,
      maintenance: 180
    },
    totalWeight: 1229,
    totalVolume: 37.5,
    createdAt: '2024-11-26T21:30:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 99.0,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-015',
    orders: [
      { id: 'SO148', doId: 'DO148', route: 'DEL-HYD', quantity: 55, seller: 'Electronics Wholesale Co', customer: 'Hyderabad Tech Solutions', materialType: 'cuboidal', dimensions: { length: 360, width: 270, height: 170 }, weight: 6.5, status: 'planned' },
      { id: 'SO152', doId: 'DO152', route: 'DEL-HYD', quantity: 35, seller: 'Industrial Tools Corp', customer: 'Hyderabad Manufacturing Hub', materialType: 'cuboidal', dimensions: { length: 450, width: 350, height: 200 }, weight: 12, status: 'planned' },
      { id: 'SO158', doId: 'DO158', route: 'DEL-HYD', quantity: 42, seller: 'Metal Works Ltd', customer: 'Hyderabad Construction Site', materialType: 'cuboidal', dimensions: { length: 600, width: 400, height: 300 }, weight: 35, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'all',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['medium']
    },
    vehicles: [{
      type: 'CONTAINER_20FT',
      quantity: 1,
      orders: [
        { id: 'SO148', quantity: 55 },
        { id: 'SO152', quantity: 35 },
        { id: 'SO158', quantity: 42 }
      ],
      loadPlan: {
        items: [
          { id: 'SO148', quantity: 55, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO152', quantity: 35, position: { x: 0, y: 0, z: 170 } },
          { id: 'SO158', quantity: 42, position: { x: 0, y: 0, z: 370 } }
        ],
        metrics: {
          volumeUtilization: 99.5,
          weightUtilization: 96.8,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1500,
        duration: 20,
        cost: 8400,
        fuelConsumption: 300,
        tolls: 1500,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_20FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 8400,
    totalDistance: 1500,
    totalDuration: 20,
    costBreakdown: {
      fuel: 6000,
      tolls: 1500,
      maintenance: 900
    },
    totalWeight: 3749,
    totalVolume: 32.8,
    createdAt: '2024-11-26T22:45:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 98.2,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-016',
    orders: [
      { id: 'SO159', doId: 'DO159', route: 'DEL-MUM', quantity: 25, seller: 'Heavy Machinery Corp', customer: 'Mumbai Industrial Area', materialType: 'cuboidal', dimensions: { length: 1200, width: 900, height: 700 }, weight: 120, status: 'planned' },
      { id: 'SO162', doId: 'DO162', route: 'DEL-BAN', quantity: 20, seller: 'Medical Equipment Ltd', customer: 'Bangalore Hospital', materialType: 'cuboidal', dimensions: { length: 600, width: 400, height: 300 }, weight: 18, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'weight',
      routeStrategy: 'combined',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 2,
      priorities: ['high']
    },
    vehicles: [{
      type: 'CONTAINER_32FT',
      quantity: 1,
      orders: [
        { id: 'SO159', quantity: 25 },
        { id: 'SO162', quantity: 20 }
      ],
      loadPlan: {
        items: [
          { id: 'SO159', quantity: 25, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO162', quantity: 20, position: { x: 0, y: 0, z: 700 } }
        ],
        metrics: {
          volumeUtilization: 95.8,
          weightUtilization: 99.2,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1750,
        duration: 23,
        cost: 12600,
        fuelConsumption: 525,
        tolls: 2625,
        stops: 2
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_32FT',
      quantity: 1
    }],
    dropPoints: 2,
    routeStrategy: 'combined',
    loadingSequence: 'lifo',
    allowMixedRoutes: true,
    totalCost: 12600,
    totalDistance: 1750,
    totalDuration: 23,
    costBreakdown: {
      fuel: 9450,
      tolls: 2625,
      maintenance: 525
    },
    totalWeight: 3660,
    totalVolume: 51.9,
    createdAt: '2024-11-27T08:00:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 96.9,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-017',
    orders: [
      { id: 'SO164', doId: 'DO164', route: 'DEL-HYD', quantity: 18, seller: 'Generator Company', customer: 'Hyderabad Factory', materialType: 'cuboidal', dimensions: { length: 1000, width: 700, height: 800 }, weight: 95, status: 'planned' },
      { id: 'SO167', doId: 'DO167', route: 'DEL-HYD', quantity: 24, seller: 'Glass Manufacturing', customer: 'Hyderabad Construction', materialType: 'cuboidal', dimensions: { length: 800, width: 600, height: 100 }, weight: 40, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'weight',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['high']
    },
    vehicles: [{
      type: 'CONTAINER_20FT',
      quantity: 1,
      orders: [
        { id: 'SO164', quantity: 18 },
        { id: 'SO167', quantity: 24 }
      ],
      loadPlan: {
        items: [
          { id: 'SO164', quantity: 18, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO167', quantity: 24, position: { x: 0, y: 0, z: 800 } }
        ],
        metrics: {
          volumeUtilization: 97.1,
          weightUtilization: 98.7,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1500,
        duration: 20,
        cost: 8400,
        fuelConsumption: 300,
        tolls: 1500,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_20FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 8400,
    totalDistance: 1500,
    totalDuration: 20,
    costBreakdown: {
      fuel: 6000,
      tolls: 1500,
      maintenance: 900
    },
    totalWeight: 3030,
    totalVolume: 31.8,
    createdAt: '2024-11-27T09:15:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 97.4,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-018',
    orders: [
      { id: 'SO169', doId: 'DO169', route: 'DEL-CHE', quantity: 15, seller: 'Scientific Instruments', customer: 'Chennai Research Institute', materialType: 'cuboidal', dimensions: { length: 500, width: 400, height: 250 }, weight: 12, status: 'planned' },
      { id: 'SO172', doId: 'DO172', route: 'DEL-CHE', quantity: 38, seller: 'Cable Manufacturing', customer: 'Chennai Electrical', materialType: 'cylindrical', dimensions: { diameter: 80, height: 1500 }, weight: 20, status: 'planned' },
      { id: 'SO176', doId: 'DO176', route: 'DEL-CHE', quantity: 20, seller: 'Water Pump Company', customer: 'Chennai Industrial', materialType: 'cuboidal', dimensions: { length: 700, width: 500, height: 400 }, weight: 45, status: 'planned' }
    ],
    materialTypes: ['cuboidal', 'cylindrical'],
    constraints: {
      optimizationPriority: 'volume',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['high']
    },
    vehicles: [{
      type: 'CONTAINER_32FT',
      quantity: 1,
      orders: [
        { id: 'SO169', quantity: 15 },
        { id: 'SO172', quantity: 38 },
        { id: 'SO176', quantity: 20 }
      ],
      loadPlan: {
        items: [
          { id: 'SO169', quantity: 15, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO172', quantity: 38, position: { x: 0, y: 0, z: 250 } },
          { id: 'SO176', quantity: 20, position: { x: 0, y: 0, z: 1750 } }
        ],
        metrics: {
          volumeUtilization: 98.4,
          weightUtilization: 95.6,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 2200,
        duration: 28,
        cost: 15840,
        fuelConsumption: 660,
        tolls: 3300,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_32FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 15840,
    totalDistance: 2200,
    totalDuration: 28,
    costBreakdown: {
      fuel: 11880,
      tolls: 3300,
      maintenance: 660
    },
    totalWeight: 3350,
    totalVolume: 52.1,
    createdAt: '2024-11-27T10:30:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 98.1,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-019',
    orders: [
      { id: 'SO184', doId: 'DO184', route: 'DEL-HYD', quantity: 18, seller: 'Solar Panel Systems', customer: 'Hyderabad Energy Co', materialType: 'cuboidal', dimensions: { length: 1700, width: 1000, height: 50 }, weight: 30, status: 'planned' },
      { id: 'SO188', doId: 'DO188', route: 'DEL-HYD', quantity: 35, seller: 'Welding Equipment', customer: 'Hyderabad Fabrication', materialType: 'cuboidal', dimensions: { length: 600, width: 400, height: 300 }, weight: 28, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'all',
      routeStrategy: 'separate',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 1,
      priorities: ['high']
    },
    vehicles: [{
      type: 'CONTAINER_20FT',
      quantity: 1,
      orders: [
        { id: 'SO184', quantity: 18 },
        { id: 'SO188', quantity: 35 }
      ],
      loadPlan: {
        items: [
          { id: 'SO184', quantity: 18, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO188', quantity: 35, position: { x: 0, y: 0, z: 50 } }
        ],
        metrics: {
          volumeUtilization: 96.9,
          weightUtilization: 94.8,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1500,
        duration: 20,
        cost: 8400,
        fuelConsumption: 300,
        tolls: 1500,
        stops: 1
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_20FT',
      quantity: 1
    }],
    dropPoints: 1,
    routeStrategy: 'separate',
    loadingSequence: 'lifo',
    allowMixedRoutes: false,
    totalCost: 8400,
    totalDistance: 1500,
    totalDuration: 20,
    costBreakdown: {
      fuel: 6000,
      tolls: 1500,
      maintenance: 900
    },
    totalWeight: 1890,
    totalVolume: 31.7,
    createdAt: '2024-11-27T11:45:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 97.7,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  },
  {
    id: 'PLAN-020',
    orders: [
      { id: 'SO192', doId: 'DO192', route: 'DEL-HYD', quantity: 22, seller: 'Elevator Components', customer: 'Hyderabad Construction', materialType: 'cuboidal', dimensions: { length: 900, width: 700, height: 600 }, weight: 75, status: 'planned' },
      { id: 'SO196', doId: 'DO196', route: 'DEL-CHE', quantity: 40, seller: 'Security Systems', customer: 'Chennai Corporate', materialType: 'cuboidal', dimensions: { length: 500, width: 400, height: 200 }, weight: 14, status: 'planned' }
    ],
    materialTypes: ['cuboidal'],
    constraints: {
      optimizationPriority: 'weight',
      routeStrategy: 'combined',
      loadingSequence: 'lifo',
      maxWeight: 25000,
      maxVolume: 38.5,
      dropPoints: 2,
      priorities: ['high']
    },
    vehicles: [{
      type: 'CONTAINER_32FT',
      quantity: 1,
      orders: [
        { id: 'SO192', quantity: 22 },
        { id: 'SO196', quantity: 40 }
      ],
      loadPlan: {
        items: [
          { id: 'SO192', quantity: 22, position: { x: 0, y: 0, z: 0 } },
          { id: 'SO196', quantity: 40, position: { x: 0, y: 0, z: 600 } }
        ],
        metrics: {
          volumeUtilization: 97.3,
          weightUtilization: 98.1,
          stability: 100,
          fragilityCompliance: 100
        },
        warnings: []
      },
      optimizedPositions: [],
      routeInfo: {
        distance: 1850,
        duration: 25,
        cost: 13320,
        fuelConsumption: 555,
        tolls: 2925,
        stops: 2
      }
    }],
    vehicleConfig: [{
      type: 'CONTAINER_32FT',
      quantity: 1
    }],
    dropPoints: 2,
    routeStrategy: 'combined',
    loadingSequence: 'lifo',
    allowMixedRoutes: true,
    totalCost: 13320,
    totalDistance: 1850,
    totalDuration: 25,
    costBreakdown: {
      fuel: 9990,
      tolls: 2925,
      maintenance: 405
    },
    totalWeight: 2798,
    totalVolume: 52.3,
    createdAt: '2024-11-27T12:30:00.000Z',
    status: 'Planned',
    isAIGenerated: true,
    aiConfidence: 96.5,
    optimizationScore: 100,
    dispatchStatus: 'Ready'
  }
];

export const optimizationPriorities = [
  { id: 'cost', label: 'Cost Optimization', description: 'Minimize transportation cost' },
  { id: 'volume', label: 'Volume Utilization', description: 'Maximize space usage' },
  { id: 'weight', label: 'Weight Distribution', description: 'Optimize weight balance' },
  { id: 'route', label: 'Route Efficiency', description: 'Minimize travel distance' },
  { id: 'all', label: 'Balanced Optimization', description: 'Balance all factors' }
];

export const stackingRules = {
  cuboidal: {
    heavyBelowLight: true,
    fullCoverageBase: true,
    preventTipping: true,
    maxOverhang: 0.1, // 10% overhang allowed
    fragilityRules: {
      // Fragility score of item above -> max fragility score of item below
      5: 0, // Extremely fragile: nothing can be stacked on top
      4: 3, // Fragile: can be on items with fragility 3 or less
      3: 2, // Moderate: can be on items with fragility 2 or less
      2: 1, // Durable: can be on items with fragility 1
      1: 1  // Robust: can be on robust items only (or any item as base)
    }
  },
  cylindrical: {
    interlocking: true,
    preventRolling: true,
    useWedges: true,
    avoidHorizontalStacking: true, // for fragile items
    fragilityRules: {
      5: 0,
      4: 2,
      3: 2,
      2: 1,
      1: 1
    }
  },
  // Fragility-based zone assignment
  loadingZones: {
    PROTECTED: { // Top/center area - for fragile items
      minFragility: 4,
      maxWeight: 30, // kg per item
      position: 'top-center'
    },
    STANDARD: { // Middle area - standard items
      minFragility: 2,
      maxFragility: 3,
      position: 'middle'
    },
    HEAVY_BASE: { // Bottom area - heavy, robust items
      maxFragility: 2,
      minWeight: 20, // kg per item
      position: 'bottom'
    }
  }
};

// Fragility level definitions for UI reference
export const fragilityLevels = [
  { score: 1, label: 'Robust', description: 'Can withstand rough handling', color: '#22c55e' }, // green-500
  { score: 2, label: 'Durable', description: 'Normal handling acceptable', color: '#84cc16' }, // lime-500
  { score: 3, label: 'Moderate', description: 'Standard care required', color: '#eab308' }, // yellow-500
  { score: 4, label: 'Fragile', description: 'Careful handling required', color: '#f97316' }, // orange-500
  { score: 5, label: 'Extremely Fragile', description: 'Special handling only', color: '#ef4444' } // red-500
];

// Material profile quick reference for UI
export const materialProfileOptions = [
  { id: 'ELECTRONICS_CONSUMER', label: 'Consumer Electronics', fragilityScore: 4 },
  { id: 'ELECTRONICS_HEAVY', label: 'Heavy Electronics (Appliances)', fragilityScore: 3 },
  { id: 'GLASS_CONTAINERS', label: 'Glass Containers', fragilityScore: 5 },
  { id: 'CERAMICS', label: 'Ceramics & Pottery', fragilityScore: 5 },
  { id: 'LIQUID_STANDARD', label: 'Standard Liquids', fragilityScore: 3 },
  { id: 'LIQUID_HAZARDOUS', label: 'Hazardous Liquids', fragilityScore: 4 },
  { id: 'FOOD_DRY', label: 'Dry Food Products', fragilityScore: 2 },
  { id: 'FOOD_PERISHABLE', label: 'Perishable Foods', fragilityScore: 4 },
  { id: 'PHARMA_STANDARD', label: 'Standard Pharmaceuticals', fragilityScore: 3 },
  { id: 'PHARMA_SENSITIVE', label: 'Sensitive Pharmaceuticals', fragilityScore: 5 },
  { id: 'METAL_PARTS', label: 'Metal Parts & Components', fragilityScore: 1 },
  { id: 'MACHINERY', label: 'Industrial Machinery', fragilityScore: 2 },
  { id: 'TEXTILES', label: 'Textiles & Fabrics', fragilityScore: 1 },
  { id: 'PAPER_PRODUCTS', label: 'Paper Products', fragilityScore: 2 },
  { id: 'FURNITURE_WOOD', label: 'Wooden Furniture', fragilityScore: 3 },
  { id: 'COSMETICS', label: 'Cosmetics & Personal Care', fragilityScore: 4 },
  { id: 'GAS_CYLINDERS', label: 'Gas Cylinders', fragilityScore: 3 },
  { id: 'GENERAL', label: 'General Goods', fragilityScore: 2 }
];

// Packaging type options for UI - Note: Icons are now handled via getPackagingIcon from packagingTypes.js
export const packagingTypeOptions = [
  { id: 'corrugated_box', label: 'Corrugated Box' },
  { id: 'corrugated_box_heavy', label: 'Heavy-Duty Box' },
  { id: 'wooden_crate', label: 'Wooden Crate' },
  { id: 'wooden_pallet', label: 'Wooden Pallet' },
  { id: 'plastic_container', label: 'Plastic Container' },
  { id: 'plastic_crate', label: 'Plastic Crate' },
  { id: 'metal_drum', label: 'Metal Drum' },
  { id: 'metal_container', label: 'Metal Container' },
  { id: 'foam_padded', label: 'Foam-Padded Box' },
  { id: 'bubble_wrapped', label: 'Bubble Wrapped' },
  { id: 'shrink_wrap', label: 'Shrink Wrapped' },
  { id: 'thermal_insulated', label: 'Thermal Insulated' },
  { id: 'woven_sack', label: 'Woven Sack' },
  { id: 'paper_sack', label: 'Paper Sack' },
  { id: 'glass_carton', label: 'Glass Carton' },
  { id: 'cylinder_cage', label: 'Cylinder Cage' }
];

import * as XLSX from 'xlsx';

/**
 * Parse Excel file and convert to order data format
 * @param {File} file - Excel file to parse
 * @returns {Promise<Array>} - Array of parsed orders
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Parse the data based on expected format
        const orders = parseOrderData(jsonData);
        resolve(orders);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse raw Excel data into order format
 * @param {Array} rawData - Raw data from Excel sheet
 * @returns {Array} - Formatted order data
 */
const parseOrderData = (rawData) => {
  if (rawData.length < 2) {
    throw new Error('Excel file must contain at least a header row and one data row');
  }

  const headers = rawData[0].map(header => header?.toString().toLowerCase().trim());
  const orders = [];

  // Define column mappings (flexible to handle different Excel formats)
  const columnMappings = {
    'so id': 'id',
    'sales order': 'id',
    'order id': 'id',
    'do id': 'doId',
    'delivery order': 'doId',
    'route': 'route',
    'route code': 'route',
    'quantity': 'quantity',
    'qty': 'quantity',
    'seller': 'seller',
    'vendor': 'seller',
    'pickup': 'pickup',
    'pickup location': 'pickup',
    'delivery': 'delivery',
    'delivery location': 'delivery',
    'destination': 'delivery',
    'weight': 'weight',
    'weight (kg)': 'weight',
    'material type': 'materialType',
    'type': 'materialType',
    'length': 'length',
    'width': 'width',
    'height': 'height',
    'diameter': 'diameter',
    'priority': 'priority',
    'status': 'status',
    // Fragility and packaging fields
    'fragility': 'fragilityScore',
    'fragility score': 'fragilityScore',
    'fragility level': 'fragilityScore',
    'fragile': 'fragile',
    'is fragile': 'fragile',
    'packaging': 'packagingType',
    'packaging type': 'packagingType',
    'package type': 'packagingType',
    'material profile': 'materialProfile',
    'product category': 'materialProfile',
    'crush resistance': 'crushResistance',
    'load bearing': 'loadBearingCapacity',
    'load bearing capacity': 'loadBearingCapacity',
    'max stack weight': 'loadBearingCapacity',
    'temperature controlled': 'temperatureControlled',
    'temp controlled': 'temperatureControlled',
    'refrigerated': 'temperatureControlled',
    'hazardous': 'hazardous',
    'hazmat': 'hazardous',
    'special handling': 'specialHandling',
    'handling instructions': 'specialHandling'
  };

  // Create mapping from Excel columns to our data structure
  const fieldMapping = {};
  headers.forEach((header, index) => {
    const mappedField = columnMappings[header];
    if (mappedField) {
      fieldMapping[mappedField] = index;
    }
  });

  // Process each data row
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    try {
      const order = parseOrderRow(row, fieldMapping, i);
      if (order) {
        orders.push(order);
      }
    } catch (error) {
      console.warn(`Skipping row ${i + 1}: ${error.message}`);
    }
  }

  return orders;
};

/**
 * Parse a single order row
 * @param {Array} row - Row data from Excel
 * @param {Object} fieldMapping - Mapping of fields to column indices
 * @param {number} rowIndex - Row index for error reporting
 * @returns {Object} - Parsed order object
 */
const parseOrderRow = (row, fieldMapping, rowIndex) => {
  const getValue = (field, defaultValue = '') => {
    const index = fieldMapping[field];
    return index !== undefined ? (row[index] || defaultValue) : defaultValue;
  };

  const getNumericValue = (field, defaultValue = 0) => {
    const value = getValue(field);
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Required fields
  const id = getValue('id');
  const quantity = getNumericValue('quantity');

  if (!id || quantity <= 0) {
    throw new Error(`Missing required fields (ID: ${id}, Quantity: ${quantity})`);
  }

  // Determine material type and dimensions
  const materialType = determineMaterialType(row, fieldMapping);
  const dimensions = parseDimensions(row, fieldMapping, materialType);

  // Build order object
  const order = {
    id: id.toString(),
    doId: getValue('doId', `DO${id}`),
    route: parseRoute(getValue('route')),
    routeName: getRouteName(parseRoute(getValue('route'))),
    quantity: quantity,
    seller: getValue('seller', 'Unknown Seller'),
    pickup: getValue('pickup', 'Unknown Pickup'),
    delivery: getValue('delivery', 'Unknown Delivery'),
    materialType: materialType,
    dimensions: dimensions,
    weight: getNumericValue('weight', 25),
    priority: parsePriority(getValue('priority')),
    status: getValue('status', 'unplanned').toLowerCase()
  };

  // Add material-specific properties
  if (materialType === 'cuboidal') {
    order.stackable = true;
    order.maxStackHeight = getNumericValue('maxStackHeight', 2000);
  } else if (materialType === 'cylindrical') {
    order.orientation = getValue('orientation', 'vertical').toLowerCase();
    order.nesting = getValue('nesting', 'false').toLowerCase() === 'true';
    order.fragile = getValue('fragile', 'false').toLowerCase() === 'true';
  }

  // Add fragility and packaging properties
  const fragilityScore = getNumericValue('fragilityScore', 0);
  if (fragilityScore >= 1 && fragilityScore <= 5) {
    order.fragilityScore = fragilityScore;
  }

  const packagingType = getValue('packagingType', '');
  if (packagingType) {
    order.packagingType = normalizePackagingType(packagingType);
  }

  const materialProfile = getValue('materialProfile', '');
  if (materialProfile) {
    order.materialProfile = normalizeMaterialProfile(materialProfile);
  }

  // Parse additional fragility-related fields
  const crushResistance = getNumericValue('crushResistance', 0);
  if (crushResistance > 0) {
    order.crushResistance = crushResistance;
  }

  const loadBearing = getNumericValue('loadBearingCapacity', 0);
  if (loadBearing > 0) {
    order.loadBearingCapacity = loadBearing;
  }

  // Boolean fields
  const tempControlled = getValue('temperatureControlled', '').toLowerCase();
  if (tempControlled === 'true' || tempControlled === 'yes' || tempControlled === '1') {
    order.temperatureControlled = true;
  }

  const hazardous = getValue('hazardous', '').toLowerCase();
  if (hazardous === 'true' || hazardous === 'yes' || hazardous === '1') {
    order.hazardous = true;
  }

  const specialHandling = getValue('specialHandling', '');
  if (specialHandling) {
    order.specialHandling = specialHandling.split(',').map(s => s.trim()).filter(s => s);
  }

  // Legacy fragile flag - convert to fragility score if not already set
  const fragileValue = getValue('fragile', '').toLowerCase();
  if (!order.fragilityScore && (fragileValue === 'true' || fragileValue === 'yes' || fragileValue === '1')) {
    order.fragile = true;
    order.fragilityScore = 4; // Default fragile to level 4
  }

  return order;
};

/**
 * Normalize packaging type to match system values
 */
const normalizePackagingType = (value) => {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, '_').trim();
  
  const mappings = {
    'corrugated': 'corrugated_box',
    'corrugated_box': 'corrugated_box',
    'cardboard': 'corrugated_box',
    'box': 'corrugated_box',
    'heavy_duty': 'corrugated_box_heavy',
    'heavy_duty_box': 'corrugated_box_heavy',
    'wooden_crate': 'wooden_crate',
    'crate': 'wooden_crate',
    'wood': 'wooden_crate',
    'pallet': 'wooden_pallet',
    'wooden_pallet': 'wooden_pallet',
    'plastic': 'plastic_container',
    'plastic_container': 'plastic_container',
    'plastic_crate': 'plastic_crate',
    'drum': 'metal_drum',
    'metal_drum': 'metal_drum',
    'steel_drum': 'metal_drum',
    'metal': 'metal_container',
    'metal_container': 'metal_container',
    'foam': 'foam_padded',
    'foam_padded': 'foam_padded',
    'bubble': 'bubble_wrapped',
    'bubble_wrap': 'bubble_wrapped',
    'bubble_wrapped': 'bubble_wrapped',
    'shrink': 'shrink_wrap',
    'shrink_wrap': 'shrink_wrap',
    'thermal': 'thermal_insulated',
    'thermal_insulated': 'thermal_insulated',
    'insulated': 'thermal_insulated',
    'sack': 'woven_sack',
    'woven_sack': 'woven_sack',
    'paper_sack': 'paper_sack',
    'glass': 'glass_carton',
    'glass_carton': 'glass_carton',
    'cylinder_cage': 'cylinder_cage',
    'gas_cage': 'cylinder_cage'
  };

  return mappings[normalized] || 'corrugated_box';
};

/**
 * Normalize material profile to match system values
 */
const normalizeMaterialProfile = (value) => {
  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '_').trim();
  
  const validProfiles = [
    'ELECTRONICS_CONSUMER', 'ELECTRONICS_HEAVY', 'GLASS_CONTAINERS', 'CERAMICS',
    'LIQUID_STANDARD', 'LIQUID_HAZARDOUS', 'FOOD_DRY', 'FOOD_PERISHABLE',
    'PHARMA_STANDARD', 'PHARMA_SENSITIVE', 'METAL_PARTS', 'MACHINERY',
    'TEXTILES', 'PAPER_PRODUCTS', 'FURNITURE_WOOD', 'COSMETICS',
    'GAS_CYLINDERS', 'GENERAL'
  ];

  // Try direct match
  if (validProfiles.includes(normalized)) {
    return normalized;
  }

  // Try partial match
  for (const profile of validProfiles) {
    if (profile.includes(normalized) || normalized.includes(profile.split('_')[0])) {
      return profile;
    }
  }

  return 'GENERAL';
};

/**
 * Determine material type from row data
 */
const determineMaterialType = (row, fieldMapping) => {
  const explicitType = fieldMapping.materialType !== undefined ?
    row[fieldMapping.materialType]?.toString().toLowerCase() : null;

  if (explicitType) {
    if (explicitType.includes('cylindrical') || explicitType.includes('cylinder')) {
      return 'cylindrical';
    }
    if (explicitType.includes('cuboidal') || explicitType.includes('box')) {
      return 'cuboidal';
    }
  }

  // Infer from dimensions
  const hasDiameter = fieldMapping.diameter !== undefined && row[fieldMapping.diameter];
  const hasLength = fieldMapping.length !== undefined && row[fieldMapping.length];
  const hasWidth = fieldMapping.width !== undefined && row[fieldMapping.width];

  if (hasDiameter) {
    return 'cylindrical';
  }
  if (hasLength && hasWidth) {
    return 'cuboidal';
  }

  // Default to cuboidal
  return 'cuboidal';
};

/**
 * Parse dimensions based on material type
 */
const parseDimensions = (row, fieldMapping, materialType) => {
  const getValue = (field, defaultValue = 0) => {
    const index = fieldMapping[field];
    const value = index !== undefined ? row[index] : null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  if (materialType === 'cylindrical') {
    return {
      diameter: getValue('diameter', 500),
      height: getValue('height', 800)
    };
  } else {
    return {
      length: getValue('length', 600),
      width: getValue('width', 400),
      height: getValue('height', 300)
    };
  }
};

/**
 * Parse and normalize route code
 */
const parseRoute = (routeValue) => {
  if (!routeValue) return 'DEL-MUM';

  const route = routeValue.toString().toUpperCase().trim();

  // Common route mappings
  const routeMappings = {
    'DELHI-MUMBAI': 'DEL-MUM',
    'DELHI-HYDERABAD': 'DEL-HYD',
    'DELHI-CHENNAI': 'DEL-CHE',
    'DELHI-BANGALORE': 'DEL-BAN',
    'DEL-MUMBAI': 'DEL-MUM',
    'DEL-HYDERABAD': 'DEL-HYD',
    'DEL-CHENNAI': 'DEL-CHE',
    'DEL-BANGALORE': 'DEL-BAN'
  };

  return routeMappings[route] || route;
};

/**
 * Get route display name
 */
const getRouteName = (routeCode) => {
  const routeNames = {
    'DEL-MUM': 'Delhi → Mumbai',
    'DEL-HYD': 'Delhi → Hyderabad',
    'DEL-CHE': 'Delhi → Chennai',
    'DEL-BAN': 'Delhi → Bangalore'
  };

  return routeNames[routeCode] || routeCode;
};

/**
 * Parse priority value
 */
const parsePriority = (priorityValue) => {
  if (!priorityValue) return 'medium';

  const priority = priorityValue.toString().toLowerCase().trim();

  if (priority.includes('high') || priority.includes('urgent') || priority === '1') {
    return 'high';
  }
  if (priority.includes('low') || priority === '3') {
    return 'low';
  }

  return 'medium';
};

/**
 * Export orders to Excel format
 * @param {Array} orders - Orders to export
 * @param {string} filename - Output filename
 */
export const exportToExcel = (orders, filename = 'dispatch_plan.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(orders.map(order => ({
    'SO ID': order.id,
    'DO ID': order.doId,
    'Route': order.routeName,
    'Quantity': order.quantity,
    'Seller': order.seller,
    'Pickup': order.pickup,
    'Delivery': order.delivery,
    'Material Type': order.materialType,
    'Weight (kg)': order.weight,
    'Priority': order.priority,
    'Status': order.status,
    ...(order.materialType === 'cuboidal' ? {
      'Length (mm)': order.dimensions.length,
      'Width (mm)': order.dimensions.width,
      'Height (mm)': order.dimensions.height,
      'Stackable': order.stackable ? 'Yes' : 'No'
    } : {
      'Diameter (mm)': order.dimensions.diameter,
      'Height (mm)': order.dimensions.height,
      'Orientation': order.orientation,
      'Nesting': order.nesting ? 'Yes' : 'No'
    })
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  XLSX.writeFile(workbook, filename);
};

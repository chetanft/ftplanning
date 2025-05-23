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
    'status': 'status'
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
  
  return order;
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

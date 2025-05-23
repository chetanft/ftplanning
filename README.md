# Freight Tiger SmartDispatch Planner

A web-based prototype for dispatch planning tool that supports cuboidal and cylindrical material planning, with load optimization, constraints configuration, and 3D interactive truck visualization.

## Features

### 🎯 Core Functionality
- **Order Intake & Classification**: Manage unplanned orders with filtering and selection
- **Material Type Selection**: Support for cuboidal, cylindrical, and mixed loads
- **Plan Creation**: Interactive planning interface with freight order management
- **3D Visualization**: Interactive truck load visualization with Three.js
- **Constraints Configuration**: Comprehensive optimization settings
- **Excel Integration**: Import/export order data from Excel files

### 📦 Material Types Supported
- **Cuboidal Items**: Boxes, cartons, pallets with L×W×H dimensions
- **Cylindrical Items**: Drums, rolls, pipes with diameter and height
- **Mixed Loads**: Combination of both types with optimized arrangement

### 🚛 Vehicle Types
- SXL Container (25T, 38.5m³)
- Tata Ace (750kg, 4.6m³)
- Eicher 14ft (4.5T, 16.6m³)

### 🗺️ Supported Routes
- Delhi → Mumbai (via Jaipur)
- Delhi → Hyderabad (via Nagpur)
- Delhi → Chennai (via Bangalore)
- Delhi → Bangalore (via Hyderabad)

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: TailwindCSS
- **3D Visualization**: Three.js with React Three Fiber
- **Excel Processing**: SheetJS (xlsx)
- **Icons**: Lucide React
- **Export**: jsPDF, html2canvas

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with WebGL support

### Installation

1. Clone or download the project
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Sample Data
The application comes with pre-loaded sample orders demonstrating various material types and routes. You can also import your own Excel files using the supported format.

## Usage Guide

### 1. Order Intake
- View and filter unplanned orders
- Select orders for planning using checkboxes
- Use search and filters to find specific orders
- Click "Create Plan" to proceed

### 2. Material Type Selection
- Choose between Cuboidal, Cylindrical, or Mixed loads
- Review material-specific constraints and dimensions
- Continue to planning phase

### 3. Plan Creation
- Review selected orders grouped by route
- Configure vehicle type and optimization priorities
- Set number of drop points
- Generate optimized plan

### 4. 3D Visualization
- Interactive 3D view of truck load arrangement
- Click items to view details
- Rotate, zoom, and pan the view
- Toggle labels and export options

### 5. Constraints Configuration
- Set vehicle capacity limits
- Configure stacking rules for different material types
- Adjust load distribution parameters
- Define loading sequence preferences

## Excel File Format

The application supports Excel files with the following columns:
- SO ID / Order ID (required)
- DO ID / Delivery Order
- Route / Route Code
- Quantity (required)
- Seller / Vendor
- Pickup Location
- Delivery Location
- Weight (kg)
- Material Type
- Length/Width/Height (for cuboidal)
- Diameter/Height (for cylindrical)
- Priority
- Status

## Load Optimization Features

### Cuboidal Items
- Heavy-below-light stacking
- Full coverage base requirement
- Center of gravity optimization
- Orientation flexibility
- LIFO/FIFO sequence support

### Cylindrical Items
- Interlocking arrangements
- Rolling prevention
- Wedge/brace suggestions
- Vertical/horizontal orientation
- Nesting optimization

### Mixed Loads
- Combined optimization algorithms
- Material-specific constraints
- Void space minimization
- Balanced weight distribution

## Performance Targets

- Load plans generated within 2 seconds for up to 100 items
- ≥90% average truck utilization
- ≤5% dispatches requiring re-planning
- Support for multiple concurrent planning sessions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Build for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

## Future Enhancements

- Real-time GPS tracking integration
- Advanced route optimization with external APIs
- Multi-language support
- Mobile app companion
- API integrations with ERP/WMS systems
- Advanced reporting and analytics
- Machine learning-based optimization

## License

This project is a prototype for demonstration purposes.

## Support

For questions or issues, please refer to the project documentation or contact the development team.

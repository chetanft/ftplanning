# Route-Aware Vehicle Assignment System

## Overview

The dispatch planning tool now includes a comprehensive route-aware vehicle assignment system that addresses the issue where orders from different routes were being mixed into the same vehicles. The system now provides two main strategies for handling multiple routes:

## Key Features

### 1. Route Strategy Options

#### **Separate Vehicles per Route** (Default)
- **Behavior**: Assigns different vehicles for different routes
- **Use Case**: When you want dedicated vehicles for each route
- **Benefits**: 
  - Clear route separation
  - Optimal vehicle selection per route
  - No route mixing confusion

#### **Consolidate Routes**
- **Behavior**: Clubs orders from different routes using shared vehicle pool
- **Use Case**: When you want to maximize vehicle utilization across routes
- **Benefits**:
  - Better vehicle utilization
  - Cost optimization
  - Flexible route handling

### 2. Loading Sequence Options

The system supports multiple loading sequences with LIFO as default:

- **LIFO (Last In, First Out)**: Heavy items loaded first (unloaded last)
- **FIFO (First In, First Out)**: Light items loaded first (unloaded first)
- **Route-based**: Maintain original order
- **Weight-based**: Heaviest items first
- **Priority-based**: High priority items first

### 3. Mixed Routes Option

When using "Consolidate Routes" strategy, you can enable:
- **Allow Mixed Routes**: Orders from different routes can be in the same vehicle
- **Route Separation**: Orders grouped by route but using shared vehicle pool

## How It Works

### Separate Vehicles Strategy
1. Groups orders by route
2. Calculates optimal vehicle requirements for each route
3. Uses auto-suggestions to determine best vehicle types per route
4. Assigns dedicated vehicles to each route
5. Applies selected loading sequence within each route

### Consolidate Routes Strategy
1. Creates shared vehicle pool from user selection
2. Groups orders by route (if mixed routes disabled)
3. Distributes orders using best-fit algorithm
4. Applies loading sequence preferences
5. Optimizes vehicle utilization across all routes

## Test Results

The system has been thoroughly tested with multiple routes:

### Test Scenario
- **DEL-MUM**: 2 orders (SO001: 25kg×50, SO002: 15kg×30)
- **DEL-HYD**: 2 orders (SO003: 20kg×40, SO004: 12kg×25)  
- **DEL-CHE**: 1 order (SO005: 18kg×35)

### Results with Separate Strategy
- Generated 6 vehicles (2 per route + optimal suggestions)
- Each vehicle assigned to specific route
- No route mixing
- Route-specific optimization

### Results with Consolidate Strategy
- Generated 1-3 vehicles depending on configuration
- Orders distributed across shared vehicle pool
- Option for mixed routes or route grouping
- Overall utilization optimization

## UI Controls

The new route strategy controls are available in the Plan Creation interface:

1. **Vehicle Assignment Strategy**
   - Radio buttons for "Separate" vs "Consolidate"
   - Clear descriptions of each strategy

2. **Loading Sequence**
   - Dropdown with all sequence options
   - Helpful descriptions for each sequence type

3. **Mixed Routes Option**
   - Checkbox (only visible when consolidating)
   - Allows/prevents route mixing in same vehicle

## Benefits

### For Different Routes
- ✅ **Separate vehicles per route**: Each route gets dedicated vehicles
- ✅ **Route-specific optimization**: Vehicle types optimized per route
- ✅ **Clear logistics**: No confusion about which vehicle goes where

### For Route Consolidation
- ✅ **Better utilization**: Shared vehicle pool maximizes capacity usage
- ✅ **Cost optimization**: Fewer vehicles needed overall
- ✅ **Flexible loading**: LIFO arrangement with multiple sequence options

### For Loading Management
- ✅ **LIFO support**: Heavy items loaded first for proper weight distribution
- ✅ **Multiple sequences**: Choose based on operational needs
- ✅ **Route awareness**: Loading sequence applied per route or globally

## Configuration Examples

### Example 1: E-commerce Distribution
```
Strategy: Separate Vehicles per Route
Loading: LIFO (heavy items first)
Use Case: Different delivery zones need dedicated vehicles
```

### Example 2: Consolidated Shipping
```
Strategy: Consolidate Routes
Loading: Weight-based
Mixed Routes: Enabled
Use Case: Maximize vehicle utilization across regions
```

### Example 3: Priority Delivery
```
Strategy: Separate Vehicles per Route  
Loading: Priority-based
Use Case: High-priority orders need dedicated handling per route
```

## Technical Implementation

The system uses several new utility functions:

- `groupOrdersByRoute()`: Groups orders by route code
- `distributeOrdersForRoute()`: Handles single route distribution with loading sequences
- `distributeOrdersAcrossVehicles()`: Main function with route strategy options
- Enhanced vehicle suggestion algorithm per route

## Migration

Existing functionality remains unchanged. The new route-aware features are:
- **Backward compatible**: Default behavior maintains existing logic
- **Opt-in**: New features activated through UI controls
- **Configurable**: Multiple options to suit different use cases

This addresses the original issue where "selecting different orders of different routes should give different vehicles" while also providing the option to "club orders such that they fall in one route with LIFO arrangement."

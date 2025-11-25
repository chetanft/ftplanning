import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Package, MapPin, User, Hash, Shield, Box, Edit, ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import Pagination from './Pagination';
import FragilityPanel from './FragilityPanel';
import { assessOrderFragility, FRAGILITY_DESCRIPTIONS } from '../utils/fragilityScoring';
import { getPackagingType, getAllPackagingTypes } from '../utils/packagingTypes';

const OrderIntake = ({ orders, selectedOrders, onOrderSelection, onUpdateOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState('all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [statusTab, setStatusTab] = useState('unplanned');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFragilityModal, setShowFragilityModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced Filters State
  const [filters, setFilters] = useState({
    fragilityLevel: 'all',          // 1-5 or 'all'
    packagingType: 'all',           // packaging type ID or 'all'
    materialCategory: 'all',        // Glass, Electronic, Liquid, Solid, Other
    dispatchTimeBucket: 'all',      // <1 day, 1-2 days, >2 days
    loadShape: 'all',               // Cuboidal, Cylindrical, Mixed
    stackable: 'all',               // Yes, No, all
    weightBucket: 'all',            // Light <5T, Medium, Heavy >15T
    vehicleFitAvailable: 'all',     // Yes, No, all
    pickupLocation: '',             // Searchable text
    dropLocation: '',               // Searchable text
    priority: 'all',                // high, medium, low, all
    temperatureControlled: 'all',   // Yes, No, all
    hazardous: 'all'                // Yes, No, all
  });

  // Get unique values for filter dropdowns
  const routes = useMemo(() => {
    const uniqueRoutes = [...new Set(orders.map(order => order.route))];
    return uniqueRoutes;
  }, [orders]);

  const materialTypes = useMemo(() => {
    const uniqueTypes = [...new Set(orders.map(order => order.materialType))];
    return uniqueTypes;
  }, [orders]);

  const pickupLocations = useMemo(() => {
    const unique = [...new Set(orders.map(order => order.pickup).filter(Boolean))];
    return unique;
  }, [orders]);

  const deliveryLocations = useMemo(() => {
    const unique = [...new Set(orders.map(order => order.delivery).filter(Boolean))];
    return unique;
  }, [orders]);

  // Material Categories
  const materialCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'glass', label: 'Glass' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'liquid', label: 'Liquid' },
    { value: 'solid', label: 'Solid' },
    { value: 'perishable', label: 'Perishable' },
    { value: 'pharmaceutical', label: 'Pharmaceutical' },
    { value: 'chemical', label: 'Chemical' },
    { value: 'other', label: 'Other' }
  ];

  // Weight Buckets
  const weightBuckets = [
    { value: 'all', label: 'All Weights' },
    { value: 'light', label: 'Light (<500 kg)' },
    { value: 'medium', label: 'Medium (500-2000 kg)' },
    { value: 'heavy', label: 'Heavy (>2000 kg)' }
  ];

  // Dispatch Time Buckets
  const dispatchTimeBuckets = [
    { value: 'all', label: 'All Times' },
    { value: 'urgent', label: 'Urgent (<1 day)' },
    { value: 'normal', label: 'Normal (1-2 days)' },
    { value: 'flexible', label: 'Flexible (>2 days)' }
  ];

  // Load Shapes
  const loadShapes = [
    { value: 'all', label: 'All Shapes' },
    { value: 'cuboidal', label: 'Cuboidal' },
    { value: 'cylindrical', label: 'Cylindrical' },
    { value: 'irregular', label: 'Irregular' }
  ];

  // Packaging Types for dropdown
  const packagingOptions = useMemo(() => {
    const types = getAllPackagingTypes();
    return [
      { value: 'all', label: 'All Packaging' },
      ...types.map(t => ({ value: t.id, label: `${t.icon} ${t.label}` }))
    ];
  }, []);

  // Helper function to determine material category from order
  const getMaterialCategory = (order) => {
    const seller = (order.seller || '').toLowerCase();
    const materialProfile = order.materialProfile || '';
    
    if (seller.includes('glass') || seller.includes('bottle') || materialProfile.includes('GLASS')) return 'glass';
    if (seller.includes('electronic') || seller.includes('tech') || materialProfile.includes('ELECTRONICS')) return 'electronic';
    if (seller.includes('liquid') || seller.includes('oil') || seller.includes('beverage') || materialProfile.includes('LIQUID')) return 'liquid';
    if (seller.includes('pharma') || seller.includes('medical') || materialProfile.includes('PHARMA')) return 'pharmaceutical';
    if (seller.includes('chemical') || seller.includes('hazard') || materialProfile.includes('HAZARDOUS')) return 'chemical';
    if (seller.includes('food') || seller.includes('fresh') || seller.includes('dairy') || materialProfile.includes('PERISHABLE')) return 'perishable';
    if (order.materialType === 'solid' || seller.includes('metal') || seller.includes('steel')) return 'solid';
    return 'other';
  };

  // Helper function to get weight bucket
  const getWeightBucket = (order) => {
    const totalWeight = order.weight * (order.quantity || 1);
    if (totalWeight < 500) return 'light';
    if (totalWeight <= 2000) return 'medium';
    return 'heavy';
  };

  // Helper function to get dispatch time bucket
  const getDispatchTimeBucket = (order) => {
    if (!order.dispatchDate) return 'normal';
    const dispatchDate = new Date(order.dispatchDate);
    const now = new Date();
    const diffDays = (dispatchDate - now) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 1) return 'urgent';
    if (diffDays <= 2) return 'normal';
    return 'flexible';
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all' && value !== '') count++;
    });
    return count;
  }, [filters]);

  // Filter orders based on all criteria
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Basic search
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.doId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.pickup.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRoute = routeFilter === 'all' || order.route === routeFilter;
      const matchesMaterial = materialFilter === 'all' || order.materialType === materialFilter;
      const matchesStatus = order.status.toLowerCase() === statusTab.toLowerCase();

      // Advanced filters
      // Fragility Level
      let matchesFragility = true;
      if (filters.fragilityLevel !== 'all') {
        const fragility = assessOrderFragility(order);
        matchesFragility = fragility.score === parseInt(filters.fragilityLevel);
      }

      // Packaging Type
      let matchesPackaging = true;
      if (filters.packagingType !== 'all') {
        matchesPackaging = order.packagingType === filters.packagingType;
      }

      // Material Category
      let matchesMaterialCategory = true;
      if (filters.materialCategory !== 'all') {
        matchesMaterialCategory = getMaterialCategory(order) === filters.materialCategory;
      }

      // Dispatch Time Bucket
      let matchesDispatchTime = true;
      if (filters.dispatchTimeBucket !== 'all') {
        matchesDispatchTime = getDispatchTimeBucket(order) === filters.dispatchTimeBucket;
      }

      // Load Shape
      let matchesLoadShape = true;
      if (filters.loadShape !== 'all') {
        matchesLoadShape = order.materialType === filters.loadShape;
      }

      // Stackable
      let matchesStackable = true;
      if (filters.stackable !== 'all') {
        const isStackable = order.stackable !== false;
        matchesStackable = filters.stackable === 'yes' ? isStackable : !isStackable;
      }

      // Weight Bucket
      let matchesWeight = true;
      if (filters.weightBucket !== 'all') {
        matchesWeight = getWeightBucket(order) === filters.weightBucket;
      }

      // Pickup Location (searchable)
      let matchesPickup = true;
      if (filters.pickupLocation) {
        matchesPickup = order.pickup?.toLowerCase().includes(filters.pickupLocation.toLowerCase());
      }

      // Drop Location (searchable)
      let matchesDrop = true;
      if (filters.dropLocation) {
        matchesDrop = order.delivery?.toLowerCase().includes(filters.dropLocation.toLowerCase());
      }

      // Priority
      let matchesPriority = true;
      if (filters.priority !== 'all') {
        matchesPriority = order.priority === filters.priority;
      }

      // Temperature Controlled
      let matchesTempControlled = true;
      if (filters.temperatureControlled !== 'all') {
        const isTempControlled = order.temperatureControlled === true;
        matchesTempControlled = filters.temperatureControlled === 'yes' ? isTempControlled : !isTempControlled;
      }

      // Hazardous
      let matchesHazardous = true;
      if (filters.hazardous !== 'all') {
        const isHazardous = order.hazardous === true;
        matchesHazardous = filters.hazardous === 'yes' ? isHazardous : !isHazardous;
      }

      return matchesSearch && matchesRoute && matchesMaterial && matchesStatus &&
             matchesFragility && matchesPackaging && matchesMaterialCategory &&
             matchesDispatchTime && matchesLoadShape && matchesStackable &&
             matchesWeight && matchesPickup && matchesDrop && matchesPriority &&
             matchesTempControlled && matchesHazardous;
    });
  }, [orders, searchTerm, routeFilter, materialFilter, statusTab, filters]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, routeFilter, materialFilter, statusTab, filters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Get current page orders
  const currentOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const handleOrderToggle = (order) => {
    const isSelected = selectedOrders.some(selected => selected.id === order.id);
    if (isSelected) {
      onOrderSelection(selectedOrders.filter(selected => selected.id !== order.id));
    } else {
      onOrderSelection([...selectedOrders, order]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      onOrderSelection([]);
    } else {
      onOrderSelection(filteredOrders);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleBulkFragilityUpdate = (orderId, updates) => {
    if (onUpdateOrder) {
      onUpdateOrder(orderId, updates);
    }
  };

  const handleEditFragility = (order) => {
    setEditingOrder(order);
    setShowFragilityModal(true);
  };

  const handleBulkEditFragility = () => {
    setEditingOrder(selectedOrders[0]);
    setShowFragilityModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      fragilityLevel: 'all',
      packagingType: 'all',
      materialCategory: 'all',
      dispatchTimeBucket: 'all',
      loadShape: 'all',
      stackable: 'all',
      weightBucket: 'all',
      vehicleFitAvailable: 'all',
      pickupLocation: '',
      dropLocation: '',
      priority: 'all',
      temperatureControlled: 'all',
      hazardous: 'all'
    });
    setRouteFilter('all');
    setMaterialFilter('all');
    setSearchTerm('');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMaterialTypeIcon = (type) => {
    return type === 'cylindrical' ? '⚪' : '⬜';
  };

  const getFragilityBadge = (score) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-lime-100 text-lime-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[score] || colors[2];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Intake & Classification</h2>
          <p className="text-gray-600 mt-1">
            Select orders to create dispatch plans. {filteredOrders.length} orders available.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedOrders.length > 0 && (
            <button
              onClick={handleBulkEditFragility}
              className="btn-secondary flex items-center text-sm"
            >
              <Shield className="h-4 w-4 mr-2" />
              Edit Fragility ({selectedOrders.length})
            </button>
          )}
          <span className="text-sm text-gray-500">
            {selectedOrders.length} of {filteredOrders.length} selected
          </span>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['Unplanned', 'In Planning', 'Validation Failed', 'Planned', 'Dispatched'].map((status) => {
            const statusKey = status.toLowerCase().replace(' ', '_');
            const count = orders.filter(o => {
              const orderStatus = o.status.toLowerCase().replace(' ', '_');
              return orderStatus === statusKey || 
                     (statusKey === 'unplanned' && orderStatus === 'unplanned') ||
                     (statusKey === 'in_planning' && orderStatus === 'in planning') ||
                     (statusKey === 'validation_failed' && orderStatus === 'validation failed');
            }).length;
            
            return (
              <button
                key={status}
                onClick={() => setStatusTab(status.toLowerCase())}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${statusTab === status.toLowerCase()
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {status}
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                  statusTab === status.toLowerCase() ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-900'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Basic Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, DO ID, seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Route Filter */}
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Routes</option>
            {routes.map(route => (
              <option key={route} value={route}>{route}</option>
            ))}
          </select>

          {/* Material Type Filter */}
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Shapes</option>
            {materialTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`btn-secondary flex items-center justify-center ${activeFilterCount > 0 ? 'bg-primary-50 border-primary-300' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
            {showAdvancedFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </button>

          {/* Select All Button */}
          <button
            onClick={handleSelectAll}
            className="btn-secondary flex items-center justify-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            {selectedOrders.length === filteredOrders.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Advanced Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All Filters
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Fragility Level */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fragility Level</label>
                <select
                  value={filters.fragilityLevel}
                  onChange={(e) => handleFilterChange('fragilityLevel', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="1">1 - Robust</option>
                  <option value="2">2 - Durable</option>
                  <option value="3">3 - Moderate</option>
                  <option value="4">4 - Fragile</option>
                  <option value="5">5 - Extremely Fragile</option>
                </select>
              </div>

              {/* Packaging Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Packaging Type</label>
                <select
                  value={filters.packagingType}
                  onChange={(e) => handleFilterChange('packagingType', e.target.value)}
                  className="input-field text-sm"
                >
                  {packagingOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Material Category */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Material Category</label>
                <select
                  value={filters.materialCategory}
                  onChange={(e) => handleFilterChange('materialCategory', e.target.value)}
                  className="input-field text-sm"
                >
                  {materialCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Dispatch Time */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dispatch Time</label>
                <select
                  value={filters.dispatchTimeBucket}
                  onChange={(e) => handleFilterChange('dispatchTimeBucket', e.target.value)}
                  className="input-field text-sm"
                >
                  {dispatchTimeBuckets.map(bucket => (
                    <option key={bucket.value} value={bucket.value}>{bucket.label}</option>
                  ))}
                </select>
              </div>

              {/* Weight Bucket */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Weight Range</label>
                <select
                  value={filters.weightBucket}
                  onChange={(e) => handleFilterChange('weightBucket', e.target.value)}
                  className="input-field text-sm"
                >
                  {weightBuckets.map(bucket => (
                    <option key={bucket.value} value={bucket.value}>{bucket.label}</option>
                  ))}
                </select>
              </div>

              {/* Stackable */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stackable</label>
                <select
                  value={filters.stackable}
                  onChange={(e) => handleFilterChange('stackable', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pickup Location</label>
                <input
                  type="text"
                  placeholder="Search pickup..."
                  value={filters.pickupLocation}
                  onChange={(e) => handleFilterChange('pickupLocation', e.target.value)}
                  className="input-field text-sm"
                  list="pickup-locations"
                />
                <datalist id="pickup-locations">
                  {pickupLocations.map(loc => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>

              {/* Drop Location */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Drop Location</label>
                <input
                  type="text"
                  placeholder="Search drop..."
                  value={filters.dropLocation}
                  onChange={(e) => handleFilterChange('dropLocation', e.target.value)}
                  className="input-field text-sm"
                  list="drop-locations"
                />
                <datalist id="drop-locations">
                  {deliveryLocations.map(loc => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>

              {/* Temperature Controlled */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Temp Controlled</label>
                <select
                  value={filters.temperatureControlled}
                  onChange={(e) => handleFilterChange('temperatureControlled', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="all">All</option>
                  <option value="yes">Required</option>
                  <option value="no">Not Required</option>
                </select>
              </div>

              {/* Hazardous */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hazardous</label>
                <select
                  value={filters.hazardous}
                  onChange={(e) => handleFilterChange('hazardous', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="all">All</option>
                  <option value="yes">Hazardous</option>
                  <option value="no">Non-Hazardous</option>
                </select>
              </div>

              {/* Load Shape */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Load Shape</label>
                <select
                  value={filters.loadShape}
                  onChange={(e) => handleFilterChange('loadShape', e.target.value)}
                  className="input-field text-sm"
                >
                  {loadShapes.map(shape => (
                    <option key={shape.value} value={shape.value}>{shape.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (value === 'all' || value === '') return null;
            const labels = {
              fragilityLevel: `Fragility: ${value}`,
              packagingType: `Packaging: ${value}`,
              materialCategory: `Category: ${value}`,
              dispatchTimeBucket: `Dispatch: ${value}`,
              loadShape: `Shape: ${value}`,
              stackable: `Stackable: ${value}`,
              weightBucket: `Weight: ${value}`,
              pickupLocation: `Pickup: ${value}`,
              dropLocation: `Drop: ${value}`,
              priority: `Priority: ${value}`,
              temperatureControlled: `Temp: ${value}`,
              hazardous: `Hazardous: ${value}`
            };
            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
              >
                {labels[key]}
                <button
                  onClick={() => handleFilterChange(key, key === 'pickupLocation' || key === 'dropLocation' ? '' : 'all')}
                  className="ml-2 hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left">Order Details</th>
                <th className="px-4 py-3 text-left">Route</th>
                <th className="px-4 py-3 text-left">Material</th>
                <th className="px-4 py-3 text-left">Fragility</th>
                <th className="px-4 py-3 text-left">Packaging</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Weight</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order) => {
                const isSelected = selectedOrders.some(selected => selected.id === order.id);
                let fragility;
                try {
                  fragility = assessOrderFragility(order);
                } catch (e) {
                  fragility = { score: 2, label: 'N/A', color: '#6b7280' };
                }
                
                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                    }`}
                    onClick={() => handleOrderToggle(order)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleOrderToggle(order)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.id}</div>
                          <div className="text-xs text-gray-500">DO: {order.doId}</div>
                          <div className="text-xs text-gray-400">{order.seller}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.routeName || order.route}</div>
                          <div className="text-xs text-gray-500 max-w-[150px] truncate">{order.pickup}</div>
                          <div className="text-xs text-gray-400 max-w-[150px] truncate">→ {order.delivery}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-1">{getMaterialTypeIcon(order.materialType)}</span>
                        <span className="text-sm text-gray-700 capitalize">{order.materialType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFragilityBadge(fragility.score)}`}>
                        <span 
                          className="w-2 h-2 rounded-full mr-1.5" 
                          style={{ backgroundColor: fragility.color }}
                        />
                        {fragility.score}/5 {fragility.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-1">
                          {order.packagingType ? getPackagingType(order.packagingType)?.icon || '📦' : '📦'}
                        </span>
                        <span className="capitalize text-xs">
                          {order.packagingType ? (getPackagingType(order.packagingType)?.label || 'Box') : 'Box'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.quantity}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{order.weight} kg</div>
                      <div className="text-xs text-gray-500">
                        Total: {(order.weight * order.quantity).toLocaleString()} kg
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Validation Failed' ? 'bg-red-100 text-red-800' :
                        order.status === 'In Planning' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFragility(order);
                        }}
                        className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50"
                        title="Edit Fragility & Packaging"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredOrders.length}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {/* Fragility Modal */}
      {showFragilityModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedOrders.length > 1 ? `Bulk Edit (${selectedOrders.length} Orders)` : 'Edit Fragility & Packaging'}
                </h2>
                <button
                  onClick={() => setShowFragilityModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <FragilityPanel
                orders={selectedOrders.length > 1 ? selectedOrders : [editingOrder]}
                selectedOrder={editingOrder}
                onUpdateOrder={(id, updates) => {
                  if (selectedOrders.length > 1) {
                    selectedOrders.forEach(order => {
                      handleBulkFragilityUpdate(order.id, updates);
                    });
                  } else {
                    handleBulkFragilityUpdate(id, updates);
                  }
                }}
              />

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowFragilityModal(false)}
                  className="btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderIntake;

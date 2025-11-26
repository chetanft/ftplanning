import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Package, MapPin, Hash, Shield, Edit, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { getPackagingIcon } from '../utils/packagingTypes';
import Pagination from './Pagination';
import FragilityPanel from './FragilityPanel';
import { assessOrderFragility } from '../utils/fragilityScoring';
import { getPackagingType, getAllPackagingTypes } from '../utils/packagingTypes';
import { vehicleTypes } from '../data/mockData';
import { calculateOrderWeightAndVolume } from '../utils/vehicleOptimization';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const OrderIntake = ({ orders, selectedOrders, onOrderSelection, onUpdateOrder, onCreatePlan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState('all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [statusTab, setStatusTab] = useState('unplanned');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFragilityModal, setShowFragilityModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Advanced Filters State
  const [filters, setFilters] = useState({
    fragilityLevel: 'all',          // 1-5 or 'all'
    packagingType: 'all',           // packaging type ID or 'all'
    materialCategory: 'all',        // Glass, Electronic, Liquid, Solid, Other
    dispatchTimeBucket: 'all',      // <1 day, 1-2 days, >2 days
    loadShape: 'all',               // Cuboidal, Cylindrical, Mixed
    stackable: 'all',               // Yes, No, all
    weightBucket: 'all',            // Light <5T, Medium, Heavy >15T
    pickupLocation: '',             // Searchable text
    dropLocation: '',               // Searchable text
    consignee: 'all',              // Consignee filter
    seller: 'all',                 // Seller/Consignor/Shipper filter
    priority: 'all',                // high, medium, low, all
    temperatureControlled: 'all',   // Yes, No, all
    hazardous: 'all',               // Yes, No, all
    vehicleFitAvailability: 'all'   // Yes, No, all
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

  // Get unique consignees (recipients only - no sellers)
  const consignees = useMemo(() => {
    const uniqueConsignees = new Set();
    orders.forEach(order => {
      // Only include consignee/recipient names and delivery locations
      // Priority: customer (consignee name) > delivery location
      if (order.customer) {
        uniqueConsignees.add(order.customer);
      }
      if (order.deliveryLocation) {
        uniqueConsignees.add(order.deliveryLocation);
      }
      if (order.delivery) {
        uniqueConsignees.add(order.delivery);
      }
    });
    return Array.from(uniqueConsignees).sort();
  }, [orders]);

  // Get unique sellers/consignors/shippers
  const sellers = useMemo(() => {
    const uniqueSellers = new Set();
    orders.forEach(order => {
      if (order.seller) {
        uniqueSellers.add(order.seller);
      }
    });
    return Array.from(uniqueSellers).sort();
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

  // Packaging Types for dropdown
  const packagingOptions = useMemo(() => {
    const types = getAllPackagingTypes();
    return [
      { value: 'all', label: 'All Packaging' },
      ...types.map(t => ({ value: t.id, label: t.label }))
    ];
  }, []);

  // Helper functions
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

  const getWeightBucket = (order) => {
    const totalWeight = order.weight * (order.quantity || 1);
    if (totalWeight < 500) return 'light';
    if (totalWeight <= 2000) return 'medium';
    return 'heavy';
  };

  const getDispatchTimeBucket = (order) => {
    if (!order.dispatchDate) return 'normal';
    const dispatchDate = new Date(order.dispatchDate);
    const now = new Date();
    const diffDays = (dispatchDate - now) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 1) return 'urgent';
    if (diffDays <= 2) return 'normal';
    return 'flexible';
  };

  // Check if order can fit in at least one available vehicle
  const canOrderFitInAnyVehicle = (order) => {
    try {
      const { orderWeight, orderVolume } = calculateOrderWeightAndVolume(order);
      
      // Check if order fits in at least one vehicle by weight and volume
      const fitsInAnyVehicle = vehicleTypes.some(vehicle => {
        const fitsWeight = orderWeight <= vehicle.maxWeight;
        const fitsVolume = orderVolume <= vehicle.volume;
        
        // For cuboidal items, also check dimensions
        if (order.materialType === 'cuboidal' && order.dimensions) {
          const fitsLength = order.dimensions.length <= vehicle.dimensions.length;
          const fitsWidth = order.dimensions.width <= vehicle.dimensions.width;
          const fitsHeight = order.dimensions.height <= vehicle.dimensions.height;
          return fitsWeight && fitsVolume && fitsLength && fitsWidth && fitsHeight;
        }
        
        // For cylindrical items, check diameter and height
        if (order.materialType === 'cylindrical' && order.dimensions) {
          const fitsDiameter = order.dimensions.diameter <= Math.min(vehicle.dimensions.width, vehicle.dimensions.length);
          const fitsHeight = order.dimensions.height <= vehicle.dimensions.height;
          return fitsWeight && fitsVolume && fitsDiameter && fitsHeight;
        }
        
        return fitsWeight && fitsVolume;
      });
      
      return fitsInAnyVehicle;
    } catch (error) {
      console.error('Error checking vehicle fit:', error);
      return true; // Default to true if check fails to avoid filtering out orders
    }
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all' && value !== '') count++;
    });
    return count;
  }, [filters]);

  // Filter orders
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
      const normalizedOrderStatus = (order.status || '').toLowerCase().replace(/[\s_]+/g, '_');
      const normalizedStatusTab = statusTab.toLowerCase().replace(/[\s_]+/g, '_');
      const matchesStatus = normalizedOrderStatus === normalizedStatusTab;

      // Advanced filters
      let matchesFragility = true;
      if (filters.fragilityLevel !== 'all') {
        const fragility = assessOrderFragility(order);
        matchesFragility = fragility.score === parseInt(filters.fragilityLevel);
      }

      let matchesPackaging = true;
      if (filters.packagingType !== 'all') {
        matchesPackaging = order.packagingType === filters.packagingType;
      }

      let matchesMaterialCategory = true;
      if (filters.materialCategory !== 'all') {
        matchesMaterialCategory = getMaterialCategory(order) === filters.materialCategory;
      }

      let matchesDispatchTime = true;
      if (filters.dispatchTimeBucket !== 'all') {
        matchesDispatchTime = getDispatchTimeBucket(order) === filters.dispatchTimeBucket;
      }

      let matchesLoadShape = true;
      if (filters.loadShape !== 'all') {
        matchesLoadShape = order.materialType === filters.loadShape;
      }

      let matchesStackable = true;
      if (filters.stackable !== 'all') {
        const isStackable = order.stackable !== false;
        matchesStackable = filters.stackable === 'yes' ? isStackable : !isStackable;
      }

      let matchesWeight = true;
      if (filters.weightBucket !== 'all') {
        matchesWeight = getWeightBucket(order) === filters.weightBucket;
      }

      let matchesPickup = true;
      if (filters.pickupLocation) {
        matchesPickup = order.pickup?.toLowerCase().includes(filters.pickupLocation.toLowerCase());
      }

      let matchesDrop = true;
      if (filters.dropLocation) {
        matchesDrop = order.delivery?.toLowerCase().includes(filters.dropLocation.toLowerCase());
      }

      let matchesConsignee = true;
      if (filters.consignee !== 'all') {
        // Match by customer (consignee) or delivery location only (no sellers)
        const orderConsignee = order.customer || order.deliveryLocation || order.delivery || '';
        matchesConsignee = orderConsignee === filters.consignee;
      }

      let matchesSeller = true;
      if (filters.seller !== 'all') {
        matchesSeller = order.seller === filters.seller;
      }

      let matchesPriority = true;
      if (filters.priority !== 'all') {
        matchesPriority = order.priority === filters.priority;
      }

      let matchesTempControlled = true;
      if (filters.temperatureControlled !== 'all') {
        const isTempControlled = order.temperatureControlled === true;
        matchesTempControlled = filters.temperatureControlled === 'yes' ? isTempControlled : !isTempControlled;
      }

      let matchesHazardous = true;
      if (filters.hazardous !== 'all') {
        const isHazardous = order.hazardous === true;
        matchesHazardous = filters.hazardous === 'yes' ? isHazardous : !isHazardous;
      }

      let matchesVehicleFit = true;
      if (filters.vehicleFitAvailability !== 'all') {
        const canFit = canOrderFitInAnyVehicle(order);
        matchesVehicleFit = filters.vehicleFitAvailability === 'yes' ? canFit : !canFit;
      }

      return matchesSearch && matchesRoute && matchesMaterial && matchesStatus &&
             matchesFragility && matchesPackaging && matchesMaterialCategory &&
             matchesDispatchTime && matchesLoadShape && matchesStackable &&
             matchesWeight && matchesPickup && matchesDrop && matchesConsignee &&
             matchesSeller && matchesPriority && matchesTempControlled && matchesHazardous && matchesVehicleFit;
    });
  }, [orders, searchTerm, routeFilter, materialFilter, statusTab, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, routeFilter, materialFilter, statusTab, filters]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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
      pickupLocation: '',
      dropLocation: '',
      consignee: 'all',
      seller: 'all',
      priority: 'all',
      temperatureControlled: 'all',
      hazardous: 'all',
      vehicleFitAvailability: 'all'
    });
    setRouteFilter('all');
    setMaterialFilter('all');
    setSearchTerm('');
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'secondary';
    }
  };

  const getFragilityBadgeVariant = (score) => {
    switch(score) {
      case 5: return 'destructive';
      case 4: return 'bg-amber-500 text-white'; // orange-ish
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order Intake & Classification</h2>
          <p className="text-muted-foreground">
            Manage incoming orders and prepare dispatch plans.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedOrders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingOrder(selectedOrders[0]);
                setShowFragilityModal(true);
              }}
            >
              <Shield className="h-4 w-4 mr-2" />
              Edit Fragility ({selectedOrders.length})
            </Button>
          )}
          {selectedOrders.length > 0 && onCreatePlan && (
            <Button onClick={onCreatePlan}>
               Create Plan ({selectedOrders.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats/Tabs */}
      <div className="flex space-x-1 overflow-x-auto border-b">
          {['Unplanned', 'In Planning', 'Validation Failed', 'Planned', 'Dispatched'].map((status) => {
            const statusKey = status.toLowerCase().replace(/[\s_]+/g, '_');
            const count = orders.filter(o => {
              const orderStatus = (o.status || '').toLowerCase().replace(/[\s_]+/g, '_');
              return orderStatus === statusKey;
            }).length;
            const isActive = statusTab === status.toLowerCase();
            
            return (
              <Button
                key={status}
                variant="ghost"
                className={`rounded-none border-b-2 px-4 pb-3 pt-2 ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setStatusTab(status.toLowerCase())}
              >
                {status}
                <Badge variant={isActive ? "secondary" : "outline"} className="ml-2">
                  {count}
                </Badge>
              </Button>
            );
          })}
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
               <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
            {routes.map(route => (
                    <SelectItem key={route} value={route}>{route}</SelectItem>
            ))}
                </SelectContent>
              </Select>

              <Select value={materialFilter} onValueChange={setMaterialFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Shape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shapes</SelectItem>
            {materialTypes.map(type => (
                    <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
            ))}
                </SelectContent>
              </Select>

               <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={activeFilterCount > 0 ? "border-primary text-primary" : ""}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5">{activeFilterCount}</Badge>
            )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium leading-none">Advanced Filters</h4>
                      <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-0 text-primary">
                        Clear all
                      </Button>
        </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="space-y-2">
                         <Label>Fragility</Label>
                         <Select value={filters.fragilityLevel} onValueChange={(val) => handleFilterChange('fragilityLevel', val)}>
                           <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">All Levels</SelectItem>
                             <SelectItem value="1">1 - Robust</SelectItem>
                             <SelectItem value="2">2 - Durable</SelectItem>
                             <SelectItem value="3">3 - Moderate</SelectItem>
                             <SelectItem value="4">4 - Fragile</SelectItem>
                             <SelectItem value="5">5 - Extremely Fragile</SelectItem>
                           </SelectContent>
                         </Select>
            </div>
                       <div className="space-y-2">
                         <Label>Packaging</Label>
                         <Select value={filters.packagingType} onValueChange={(val) => handleFilterChange('packagingType', val)}>
                           <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                           <SelectContent>
                  {packagingOptions.map(opt => (
                               <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                           </SelectContent>
                         </Select>
              </div>
                       <div className="space-y-2">
                         <Label>Category</Label>
                          <Select value={filters.materialCategory} onValueChange={(val) => handleFilterChange('materialCategory', val)}>
                           <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                           <SelectContent>
                  {materialCategories.map(cat => (
                               <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                           </SelectContent>
                         </Select>
              </div>
                       <div className="space-y-2">
                         <Label>Consignee</Label>
                         <Select value={filters.consignee} onValueChange={(val) => handleFilterChange('consignee', val)}>
                           <SelectTrigger><SelectValue placeholder="All Consignees" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">All Consignees</SelectItem>
                             {consignees.map(consignee => (
                               <SelectItem key={consignee} value={consignee}>{consignee}</SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
              </div>
                       <div className="space-y-2">
                         <Label>Seller/Consignor</Label>
                         <Select value={filters.seller} onValueChange={(val) => handleFilterChange('seller', val)}>
                           <SelectTrigger><SelectValue placeholder="All Sellers" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">All Sellers</SelectItem>
                             {sellers.map(seller => (
                               <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
              </div>
                       {/* Add more filters here as needed, keeping it concise for now */}
                       <div className="space-y-2">
                         <Label>Priority</Label>
                         <Select value={filters.priority} onValueChange={(val) => handleFilterChange('priority', val)}>
                           <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">All</SelectItem>
                             <SelectItem value="high">High</SelectItem>
                             <SelectItem value="medium">Medium</SelectItem>
                             <SelectItem value="low">Low</SelectItem>
                           </SelectContent>
                         </Select>
              </div>
                       <div className="space-y-2">
                         <Label>Vehicle Fit</Label>
                         <Select value={filters.vehicleFitAvailability} onValueChange={(val) => handleFilterChange('vehicleFitAvailability', val)}>
                           <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">All</SelectItem>
                             <SelectItem value="yes">Can Fit</SelectItem>
                             <SelectItem value="no">Cannot Fit</SelectItem>
                           </SelectContent>
                         </Select>
              </div>
              </div>
              </div>
                </PopoverContent>
              </Popover>

               {selectedOrders.length > 0 && selectedOrders.length !== filteredOrders.length && (
                 <Button variant="ghost" onClick={handleSelectAll}>Select All</Button>
               )}
               {selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length && (
                 <Button variant="ghost" onClick={handleSelectAll}>Deselect All</Button>
               )}
            </div>
      </div>

          {/* Active Tags */}
      {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
          {Object.entries(filters).map(([key, value]) => {
            if (value === 'all' || value === '') return null;
            // Format filter key for display
            const formatKey = (k) => {
              const keyMap = {
                'fragilityLevel': 'Fragility',
                'packagingType': 'Packaging',
                'materialCategory': 'Category',
                'dispatchTimeBucket': 'Dispatch Time',
                'loadShape': 'Load Shape',
                'weightBucket': 'Weight',
                'pickupLocation': 'Pickup',
                'dropLocation': 'Drop',
                'consignee': 'Consignee',
                'seller': 'Seller',
                'priority': 'Priority',
                'temperatureControlled': 'Temp Control',
                'hazardous': 'Hazardous',
                'vehicleFitAvailability': 'Vehicle Fit'
              };
              return keyMap[k] || k;
            };
            return (
                  <Badge key={key} variant="secondary" className="px-2 py-1">
                    {formatKey(key)}: {value}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-3 w-3 ml-2 hover:bg-transparent"
                      onClick={() => handleFilterChange(key, key.includes('Location') ? '' : 'all')}
                >
                  <X className="h-3 w-3" />
                    </Button>
                  </Badge>
            );
          })}
        </div>
      )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </TableHead>
                <TableHead>Order Details</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Fragility</TableHead>
                <TableHead>Packaging</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Weight</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => {
                const isSelected = selectedOrders.some(selected => selected.id === order.id);
                let fragility;
                try {
                  fragility = assessOrderFragility(order);
                } catch (e) {
                  fragility = { score: 2, label: 'N/A', color: '#6b7280' };
                }
                
                return (
                    <TableRow 
                    key={order.id}
                      data-state={isSelected ? "selected" : undefined}
                      className="cursor-pointer"
                    onClick={() => handleOrderToggle(order)}
                  >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleOrderToggle(order)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.id}</span>
                          <span className="text-xs text-muted-foreground">{order.seller}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-[150px]">
                          <span className="font-medium truncate">{order.route}</span>
                          <span className="text-xs text-muted-foreground truncate">{order.pickup} → {order.delivery}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            {order.materialType === 'cylindrical' ? (
                                <div className="w-2 h-2 rounded-full bg-slate-400" />
                            ) : (
                                <div className="w-2 h-2 bg-slate-400" />
                            )}
                            <span className="capitalize">{order.materialType}</span>
                      </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          {...(getFragilityBadgeVariant(fragility.score).includes('bg-') 
                            ? { className: getFragilityBadgeVariant(fragility.score) }
                            : { variant: getFragilityBadgeVariant(fragility.score) }
                          )}
                        >
                        {fragility.score}/5 {fragility.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                           {(() => {
                             const IconComponent = getPackagingIcon(order.packagingType);
                             return <IconComponent className="h-4 w-4 text-muted-foreground" />;
                           })()}
                           <span className="text-xs capitalize">{getPackagingType(order.packagingType)?.label || 'Box'}</span>
                      </div>
                      </TableCell>
                      <TableCell className="text-right">{order.quantity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span>{order.weight} kg</span>
                          <span className="text-xs text-muted-foreground">Total: {(order.weight * order.quantity).toLocaleString()}</span>
                      </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          {...(getPriorityBadgeVariant(order.priority).includes('bg-') 
                            ? { className: `${getPriorityBadgeVariant(order.priority)} capitalize` }
                            : { variant: getPriorityBadgeVariant(order.priority), className: "capitalize" }
                          )}
                        >
                        {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                        {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingOrder(order);
                            setShowFragilityModal(true);
                          }}
                      >
                        <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

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

      {/* Fragility Modal - Keep existing logic but wrap or style if needed, or assume it works as is */}
      {showFragilityModal && editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedOrders.length > 1 ? `Bulk Edit (${selectedOrders.length} Orders)` : 'Edit Fragility & Packaging'}
                </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowFragilityModal(false)}>
                <X className="h-4 w-4" />
              </Button>
              </div>
              
              <FragilityPanel
              orders={selectedOrders.length > 1 && selectedOrders.includes(editingOrder) ? selectedOrders : [editingOrder]}
                selectedOrder={editingOrder}
                onUpdateOrder={(id, updates) => {
                if (selectedOrders.length > 1 && selectedOrders.some(o => o.id === editingOrder.id)) {
                    selectedOrders.forEach(order => {
                    onUpdateOrder(order.id, updates);
                    });
                  } else {
                  onUpdateOrder(id, updates);
                  }
                }}
              />

              <div className="flex justify-end mt-6">
              <Button onClick={() => setShowFragilityModal(false)}>
                  Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderIntake;

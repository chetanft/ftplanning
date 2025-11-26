import React, { useState } from 'react';
import { Eye, MoreVertical, ChevronRight, FileText, Calendar, Package, Truck, AlertCircle, CheckCircle, Edit, Trash2, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PlansList = ({ plans, onViewPlan }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Calculate counts based on plan status
  // Pending: Plans that haven't been generated yet (no vehicles assigned)
  const pendingCount = plans.filter(plan => {
    return !plan.vehicles || plan.vehicles.length === 0;
  }).length;

  // Generated: Plans that have been optimized/generated (have vehicles assigned)
  const generatedCount = plans.filter(plan => {
    return plan.vehicles && plan.vehicles.length > 0;
  }).length;

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'planned': return 'default';
      case 'active': return 'success';
      case 'completed': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleMoreActions = (plan, action) => {
    setSelectedPlanId(null);
    switch (action) {
      case 'edit':
        // TODO: Implement edit functionality
        console.log('Edit plan:', plan.id);
        break;
      case 'duplicate':
        // TODO: Implement duplicate functionality
        console.log('Duplicate plan:', plan.id);
        break;
      case 'delete':
        // TODO: Implement delete functionality
        if (window.confirm(`Are you sure you want to delete ${plan.id}?`)) {
          console.log('Delete plan:', plan.id);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Plans</h2>
          <p className="text-muted-foreground">Manage and monitor your dispatch plans</p>
        </div>
        <div className="flex gap-2">
          <Button variant={pendingCount > 0 ? "default" : "outline"}>
            Pending
            <Badge variant="secondary" className="ml-2">{pendingCount}</Badge>
          </Button>
          <Button variant={generatedCount > 0 ? "default" : "outline"}>
            Generated
            <Badge variant={generatedCount > 0 ? "secondary" : "outline"} className="ml-2">{generatedCount}</Badge>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="Search plans..." />
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" />
            <Button variant="outline">More Filters</Button>
        </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
              </TableHead>
              <TableHead>Plan Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Vehicles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {plans.length > 0 ? (
                plans.map((plan) => (
                <TableRow key={plan.id} onClick={(e) => {
                  // Prevent row click from interfering with button clicks
                  const target = e.target;
                  const isButton = target.closest('button') || target.closest('[role="button"]');
                  if (isButton) {
                    return; // Let button handle its own click
                  }
                }}>
                  <TableCell>
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{plan.id}</div>
                        <div className="text-xs text-muted-foreground">Created by: System Admin</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                        <div>{new Date(plan.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(plan.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                        {plan.orders.length} Orders
                      </div>
                  </TableCell>
                  <TableCell>
                      {(plan.totalWeight / 1000).toFixed(1)} Ton
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                        {plan.vehicles.length} Vehicles
                      </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(plan.status)}>
                      {plan.status === 'failed' ? (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                        {plan.status || 'Planned'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('View button clicked, plan:', plan.id);
                          if (onViewPlan && typeof onViewPlan === 'function') {
                            console.log('Calling onViewPlan with plan:', plan);
                            onViewPlan(plan);
                          } else {
                            console.error('onViewPlan is not a function:', typeof onViewPlan, onViewPlan);
                          }
                        }}
                        title="View plan details"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 cursor-pointer relative z-10"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            title="More options"
                            className="cursor-pointer hover:bg-accent"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleMoreActions(plan, 'edit')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMoreActions(plan, 'duplicate')}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMoreActions(plan, 'delete')}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Chevron button clicked, plan:', plan.id);
                          if (onViewPlan && typeof onViewPlan === 'function') {
                            console.log('Calling onViewPlan with plan:', plan);
                            onViewPlan(plan);
                          } else {
                            console.error('onViewPlan is not a function:', typeof onViewPlan, onViewPlan);
                          }
                        }}
                        title="View plan details"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 cursor-pointer relative z-10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="font-medium">No plans available</h3>
                    <p className="text-sm text-muted-foreground">Create a new plan from the Orders tab to get started.</p>
                    </div>
                </TableCell>
              </TableRow>
              )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {plans.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{plans.length}</span> of <span className="font-medium">{plans.length}</span> results
                </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PlansList;

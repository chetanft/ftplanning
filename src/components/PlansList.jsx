import React from 'react';
import { Eye, MoreVertical, ChevronRight, FileText, Calendar, Package, Truck, AlertCircle, CheckCircle } from 'lucide-react';

const PlansList = ({ plans, onViewPlan }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plans</h2>
          <p className="text-gray-600 mt-1">Manage and monitor your dispatch plans</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden">
            <button className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border-r border-gray-300">
              Pending <span className="ml-1 bg-primary-200 text-primary-800 text-xs px-1.5 py-0.5 rounded-full">{plans.length}</span>
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Generated <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search plans..."
            className="input-field"
          />
          <select className="input-field">
            <option>All Locations</option>
            <option>Delhi</option>
            <option>Mumbai</option>
          </select>
          <input
            type="date"
            className="input-field"
          />
          <button className="btn-secondary flex items-center justify-center">
            More Filters
          </button>
        </div>
      </div>

      {/* Plans Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.length > 0 ? (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{plan.id}</div>
                          <div className="text-xs text-gray-500">Created by: System Admin</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 pl-6">
                        {new Date(plan.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        {plan.orders.length} Orders
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(plan.totalWeight / 1000).toFixed(1)} Ton
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Truck className="h-4 w-4 mr-2 text-gray-400" />
                        {plan.vehicles.length} Vehicles
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status || 'Planned')}`}>
                        {plan.status === 'failed' ? <AlertCircle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                        {plan.status || 'Planned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => onViewPlan(plan)}
                          className="text-gray-400 hover:text-primary-600 p-1"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        <button 
                           onClick={() => onViewPlan(plan)}
                           className="text-gray-400 hover:text-primary-600 p-1"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                      <FileText className="h-full w-full" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No plans available</h3>
                    <p className="text-gray-500 mt-1">Create a new plan from the Orders tab to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination placeholder */}
        {plans.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{plans.length}</span> of <span className="font-medium">{plans.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansList;


'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Edit, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DemandForm } from './DemandForm';

export default function DemandsPage() {
  const [demands, setDemands] = useState<any[]>([]);
  const [filteredDemands, setFilteredDemands] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDemand, setEditingDemand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    fetchDemands();
  }, []);

  useEffect(() => {
    filterDemands();
  }, [demands, searchTerm, filterDistrict]);

  const fetchDemands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/demands', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setDemands(data.data || []);
        
        // Extract unique districts
        const uniqueDistricts = [...new Set(data.data.map((d: any) => d.district))];
        setDistricts(uniqueDistricts as string[]);
      }
    } catch (error) {
      console.error('Failed to fetch demands:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDemands = () => {
    let filtered = demands;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(demand =>
        demand.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demand.rice_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // District filter
    if (filterDistrict) {
      filtered = filtered.filter(demand => demand.district === filterDistrict);
    }

    setFilteredDemands(filtered);
  };

  const handleEdit = (demand: any) => {
    setEditingDemand(demand);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this demand record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/demands/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        fetchDemands();
      } else {
        alert(data.error || 'Failed to delete demand');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete demand');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDemand(null);
  };

  const handleFormSuccess = () => {
    fetchDemands();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demand Management</h1>
          <p className="text-gray-600 mt-1">Manage rice demand records across districts</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Demand
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by district or rice type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* District Filter */}
          <div>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Districts</option>
              {districts.map(district => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            Showing {filteredDemands.length} of {demands.length} records
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rice Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demand Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDemands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No demand records found. Click "Add Demand" to create one.
                  </td>
                </tr>
              ) : (
                filteredDemands.map(demand => (
                  <tr key={demand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {demand.district}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{demand.rice_type_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {Number(demand.quantity_kg).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(demand.demand_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {demand.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(demand)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(demand.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <DemandForm
          demand={editingDemand}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
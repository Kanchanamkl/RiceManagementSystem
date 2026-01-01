'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { ProductionForm } from '@/components/farmer/ProductionForm';
import { formatNumber } from '@/lib/utils';

export default function ProductionsPage() {
  const { productions, deleteProduction, refreshProductions } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProduction, setEditingProduction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeason, setFilterSeason] = useState('');
  const [filterRiceType, setFilterRiceType] = useState('');
  const [seasons, setSeasons] = useState<any[]>([]);
  const [riceTypes, setRiceTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeasons();
    fetchRiceTypes();
    setLoading(false);
  }, []);

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/seasons');
      const result = await response.json();
      if (result.success) setSeasons(result.data);
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const fetchRiceTypes = async () => {
    try {
      const response = await fetch('/api/rice-types');
      const result = await response.json();
      if (result.success) setRiceTypes(result.data);
    } catch (error) {
      console.error('Error fetching rice types:', error);
    }
  };

  const handleEdit = (production: any) => {
    setEditingProduction(production);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this production record?')) {
      try {
        await deleteProduction(id);
        await refreshProductions();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleFormClose = async () => {
    setShowForm(false);
    setEditingProduction(null);
    await refreshProductions();
  };

  const filteredProductions = productions.filter(prod => {
    const matchesSearch = searchTerm === '' || 
      prod.rice_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.district?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeason = filterSeason === '' || prod.season_id === filterSeason;
    const matchesRiceType = filterRiceType === '' || prod.rice_type_id === filterRiceType;
    
    return matchesSearch && matchesSeason && matchesRiceType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Production Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Production
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search rice type or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filterSeason}
            onChange={(e) => setFilterSeason(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Seasons</option>
            {seasons.map(season => (
              <option key={season.id} value={season.id}>{season.name}</option>
            ))}
          </select>

          <select
            value={filterRiceType}
            onChange={(e) => setFilterRiceType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Rice Types</option>
            {riceTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rice Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductions.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {prod.rice_type_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prod.season_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prod.district}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatNumber(prod.quantity_kg)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(prod.production_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(prod)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProductions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No production records found
            </div>
          )}
        </div>
      </Card>

      {showForm && (
        <ProductionForm
          production={editingProduction}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
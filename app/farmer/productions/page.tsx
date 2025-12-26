'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProductionForm } from '@/components/farmer/ProductionForm';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';
import { mockRiceTypes, seasons } from '@/lib/mockData';
import { Production } from '@/lib/types';

export default function ProductionsPage() {
  const { user, productions, setProductions } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProduction, setEditingProduction] = useState<Production | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeason, setFilterSeason] = useState('');

  if (!user) return null;

  const userProductions = productions.filter(p => p.farmer_id === user.id);
  const filteredProductions = userProductions.filter(p => {
    const matchesSearch = p.rice_type_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeason = !filterSeason || p.season === filterSeason;
    return matchesSearch && matchesSeason;
  });

  const handleSubmit = (formData: any) => {
    const riceType = mockRiceTypes.find(r => r.id === parseInt(formData.rice_type_id));
    if (!riceType) return;

    if (editingProduction) {
      setProductions(productions.map(p => 
        p.id === editingProduction.id ? {
          ...p,
          ...formData,
          rice_type_id: parseInt(formData.rice_type_id),
          rice_type_name: riceType.name,
          quantity_kg: parseFloat(formData.quantity_kg)
        } : p
      ));
    } else {
      const newProduction: Production = {
        id: Math.max(...productions.map(p => p.id), 0) + 1,
        farmer_id: user.id,
        farmer_name: user.name,
        rice_type_id: parseInt(formData.rice_type_id),
        rice_type_name: riceType.name,
        quantity_kg: parseFloat(formData.quantity_kg),
        created_at: new Date().toISOString().split('T')[0],
        season: formData.season,
        district: formData.district,
        production_date: formData.production_date,
        notes: formData.notes
      };
      setProductions([...productions, newProduction]);
    }
    
    setShowForm(false);
    setEditingProduction(undefined);
  };

  const handleEdit = (prod: Production) => {
    setEditingProduction(prod);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this production record?')) {
      setProductions(productions.filter(p => p.id !== id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduction(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Production Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Production
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by rice type or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={filterSeason}
            onChange={(e) => setFilterSeason(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Seasons</option>
            {seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Rice Type</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Season</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">District</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Quantity (kg)</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProductions.map(prod => (
                <tr key={prod.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{formatDate(prod.production_date)}</td>
                  <td className="px-4 py-3 text-sm">{prod.rice_type_name}</td>
                  <td className="px-4 py-3 text-sm">{prod.season}</td>
                  <td className="px-4 py-3 text-sm">{prod.district}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {formatNumber(prod.quantity_kg)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button 
                      onClick={() => handleEdit(prod)} 
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button 
                      onClick={() => handleDelete(prod.id)} 
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showForm && (
        <ProductionForm
          production={editingProduction}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
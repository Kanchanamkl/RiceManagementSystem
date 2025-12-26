'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Production } from '@/lib/types';
import { mockRiceTypes, mockDistricts, seasons } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';

interface ProductionFormProps {
  production?: Production;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ProductionForm({ production, onSubmit, onCancel }: ProductionFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rice_type_id: '',
    season: 'Maha 2024/25',
    district: user?.district || '',
    quantity_kg: '',
    production_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (production) {
      setFormData({
        rice_type_id: production.rice_type_id.toString(),
        season: production.season,
        district: production.district,
        quantity_kg: production.quantity_kg.toString(),
        production_date: production.production_date,
        notes: production.notes || ''
      });
    }
  }, [production]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {production ? 'Edit Production' : 'Add New Production'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rice Type
            </label>
            <select
              value={formData.rice_type_id}
              onChange={(e) => setFormData({...formData, rice_type_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Rice Type</option>
              {mockRiceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.category})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
            <select
              value={formData.season}
              onChange={(e) => setFormData({...formData, season: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              {mockDistricts.map(district => (
                <option key={district.id} value={district.name}>{district.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Quantity (kg)"
            type="number"
            value={formData.quantity_kg}
            onChange={(e) => setFormData({...formData, quantity_kg: e.target.value})}
            required
            min="0"
            step="0.01"
          />

          <Input
            label="Production Date"
            type="date"
            value={formData.production_date}
            onChange={(e) => setFormData({...formData, production_date: e.target.value})}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              {production ? 'Update' : 'Add'} Production
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
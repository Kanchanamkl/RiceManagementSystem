'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';

interface ProductionFormProps {
  production?: any;
  onClose: () => void;
}

export function ProductionForm({ production, onClose }: ProductionFormProps) {
  const { user, addProduction, updateProduction } = useAuth();
  const [riceTypes, setRiceTypes] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rice_type_id: production?.rice_type_id || '',
    season_id: production?.season_id || '',
    district: production?.district || user?.district || '',
    quantity_kg: production?.quantity_kg || '',
    production_date: production?.production_date || new Date().toISOString().split('T')[0],
    notes: production?.notes || '',
  });

  useEffect(() => {
    fetchRiceTypes();
    fetchSeasons();
  }, []);

  const fetchRiceTypes = async () => {
    try {
      const response = await fetch('/api/rice-types');
      const result = await response.json();
      if (result.success) setRiceTypes(result.data);
    } catch (error) {
      console.error('Error fetching rice types:', error);
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/seasons');
      const result = await response.json();
      if (result.success) setSeasons(result.data);
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (production) {
        await updateProduction(production.id, formData);
      } else {
        await addProduction(formData);
      }
      
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {production ? 'Edit Production' : 'Add New Production'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rice Type *
            </label>
            <select
              value={formData.rice_type_id}
              onChange={(e) => setFormData({ ...formData, rice_type_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Rice Type</option>
              {riceTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Season *
            </label>
            <select
              value={formData.season_id}
              onChange={(e) => setFormData({ ...formData, season_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Season</option>
              {seasons.map(season => (
                <option key={season.id} value={season.id}>{season.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="District *"
            type="text"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            required
          />

          <Input
            label="Quantity (kg) *"
            type="number"
            value={formData.quantity_kg}
            onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
            min="0"
            step="0.01"
            required
          />

          <Input
            label="Production Date *"
            type="date"
            value={formData.production_date}
            onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : production ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
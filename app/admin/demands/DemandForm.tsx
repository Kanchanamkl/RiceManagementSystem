'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface DemandFormProps {
  demand?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function DemandForm({ demand, onClose, onSuccess }: DemandFormProps) {
  const [formData, setFormData] = useState({
    rice_type_id: demand?.rice_type_id || '',
    district: demand?.district || '',
    quantity_kg: demand?.quantity_kg || '',
    demand_date: demand?.demand_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    notes: demand?.notes || ''
  });
  const [riceTypes, setRiceTypes] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRiceTypes();
    fetchDistricts();
  }, []);

  const fetchRiceTypes = async () => {
    try {
      const response = await fetch('/api/rice-types');
      const data = await response.json();
      if (data.success) {
        setRiceTypes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch rice types:', error);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/districts');
      const data = await response.json();
      if (data.success) {
        setDistricts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = demand ? `/api/demands/${demand.id}` : '/api/demands';
      const method = demand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity_kg: Number(formData.quantity_kg)
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to save demand record');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900">
        {demand ? 'Edit Demand Record' : 'Add New Demand Record'}
        </h2>
        <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition"
        >
        <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
          District <span className="text-red-500">*</span>
          </label>
          <select
          required
          value={formData.district}
          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
          <option value="">Select District</option>
          {districts.map(district => (
            <option key={district.id} value={district.name}>
            {district.name}
            </option>
          ))}
          </select>
        </div>

        {/* Rice Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Rice Type <span className="text-red-500">*</span>
          </label>
          <select
          required
          value={formData.rice_type_id}
          onChange={(e) => setFormData({ ...formData, rice_type_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
          <option value="">Select Rice Type</option>
          {riceTypes.map(type => (
            <option key={type.id} value={type.id}>
            {type.name} ({type.category})
            </option>
          ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity (kg) <span className="text-red-500">*</span>
          </label>
          <Input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.quantity_kg}
          onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
          placeholder="Enter quantity in kg"
          />
        </div>

        {/* Demand Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Demand Date <span className="text-red-500">*</span>
          </label>
          <Input
          type="date"
          required
          value={formData.demand_date}
          onChange={(e) => setFormData({ ...formData, demand_date: e.target.value })}
          />
        </div>
        </div>

        {/* Notes */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Additional notes or comments..."
        />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : demand ? 'Update Demand' : 'Add Demand'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        </div>
      </form>
      </div>
    </div>
  );
}
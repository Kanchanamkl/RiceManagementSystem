'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

interface RiceType {
  id: string;
  name: string;
  description?: string;
}

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export default function SettingsPage() {
  const [riceTypes, setRiceTypes] = useState<RiceType[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Rice Type form
  const [showRiceTypeForm, setShowRiceTypeForm] = useState(false);
  const [editingRiceType, setEditingRiceType] = useState<RiceType | null>(null);
  const [riceTypeForm, setRiceTypeForm] = useState({ name: '', description: '' });

  // Season form
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [seasonForm, setSeasonForm] = useState({ name: '', start_date: '', end_date: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchRiceTypes(), fetchSeasons()]);
    } finally {
      setLoading(false);
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

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/seasons');
      const result = await response.json();
      if (result.success) setSeasons(result.data);
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const showSuccessToast = (message: string) => {
    setToastType('success');
    setToastMessage(message);
    setShowToast(true);
  };

  const showErrorToast = (message: string) => {
    setToastType('error');
    setToastMessage(message);
    setShowToast(true);
  };

  // Rice Type handlers
  const handleAddRiceType = () => {
    setEditingRiceType(null);
    setRiceTypeForm({ name: '', description: '' });
    setShowRiceTypeForm(true);
  };

  const handleEditRiceType = (riceType: RiceType) => {
    setEditingRiceType(riceType);
    setRiceTypeForm({ name: riceType.name, description: riceType.description || '' });
    setShowRiceTypeForm(true);
  };

  const handleSaveRiceType = async () => {
    try {
      const url = editingRiceType 
        ? `/api/admin/rice-types/${editingRiceType.id}`
        : '/api/admin/rice-types';
      
      const response = await fetch(url, {
        method: editingRiceType ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riceTypeForm),
      });

      const result = await response.json();
      
      if (result.success) {
        showSuccessToast(editingRiceType ? 'Rice type updated successfully' : 'Rice type added successfully');
        setShowRiceTypeForm(false);
        await fetchRiceTypes();
      } else {
        showErrorToast(result.error?.message || 'Operation failed');
      }
    } catch (error) {
      showErrorToast('Failed to save rice type');
    }
  };

  const handleDeleteRiceType = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this rice type?')) return;

    try {
      const response = await fetch(`/api/admin/rice-types/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        showSuccessToast('Rice type deleted successfully');
        await fetchRiceTypes();
      } else {
        showErrorToast(result.error?.message || 'Delete failed');
      }
    } catch (error) {
      showErrorToast('Failed to delete rice type');
    }
  };

  // Season handlers
  const handleAddSeason = () => {
    setEditingSeason(null);
    setSeasonForm({ name: '', start_date: '', end_date: '' });
    setShowSeasonForm(true);
  };

  const handleEditSeason = (season: Season) => {
    setEditingSeason(season);
    setSeasonForm({
      name: season.name,
      start_date: season.start_date.split('T')[0],
      end_date: season.end_date.split('T')[0],
    });
    setShowSeasonForm(true);
  };

  const handleSaveSeason = async () => {
    try {
      const url = editingSeason 
        ? `/api/admin/seasons/${editingSeason.id}`
        : '/api/admin/seasons';
      
      const response = await fetch(url, {
        method: editingSeason ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seasonForm),
      });

      const result = await response.json();
      
      if (result.success) {
        showSuccessToast(editingSeason ? 'Season updated successfully' : 'Season added successfully');
        setShowSeasonForm(false);
        await fetchSeasons();
      } else {
        showErrorToast(result.error?.message || 'Operation failed');
      }
    } catch (error) {
      showErrorToast('Failed to save season');
    }
  };

  const handleDeleteSeason = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this season?')) return;

    try {
      const response = await fetch(`/api/admin/seasons/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        showSuccessToast('Season deleted successfully');
        await fetchSeasons();
      } else {
        showErrorToast(result.error?.message || 'Delete failed');
      }
    } catch (error) {
      showErrorToast('Failed to delete season');
    }
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
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">System Settings</h2>
        <p className="text-sm sm:text-base text-gray-600">Manage rice types and seasons</p>
      </div>

      {/* Rice Types Section */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Rice Types</h3>
          <Button onClick={handleAddRiceType} className="text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Rice Type
          </Button>
        </div>

        <div className="space-y-2">
          {riceTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{type.name}</p>
                {type.description && (
                  <p className="text-sm text-gray-600">{type.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditRiceType(type)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRiceType(type.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {riceTypes.length === 0 && (
            <p className="text-center py-8 text-gray-500">No rice types added yet</p>
          )}
        </div>
      </Card>

      {/* Seasons Section */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Seasons</h3>
          <Button onClick={handleAddSeason} className="text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Season
          </Button>
        </div>

        <div className="space-y-2">
          {seasons.map((season) => (
            <div key={season.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{season.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(season.start_date).toLocaleDateString()} - {new Date(season.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSeason(season)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSeason(season.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {seasons.length === 0 && (
            <p className="text-center py-8 text-gray-500">No seasons added yet</p>
          )}
        </div>
      </Card>

      {/* Rice Type Form Modal */}
      {showRiceTypeForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingRiceType ? 'Edit Rice Type' : 'Add Rice Type'}
              </h3>
              <button onClick={() => setShowRiceTypeForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Name *"
                value={riceTypeForm.name}
                onChange={(e) => setRiceTypeForm({ ...riceTypeForm, name: e.target.value })}
                placeholder="Enter rice type name"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={riceTypeForm.description}
                  onChange={(e) => setRiceTypeForm({ ...riceTypeForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSaveRiceType} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => setShowRiceTypeForm(false)} variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Season Form Modal */}
      {showSeasonForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingSeason ? 'Edit Season' : 'Add Season'}
              </h3>
              <button onClick={() => setShowSeasonForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Name *"
                value={seasonForm.name}
                onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
                placeholder="e.g., Maha 2024"
                required
              />
              <Input
                label="Start Date *"
                type="date"
                value={seasonForm.start_date}
                onChange={(e) => setSeasonForm({ ...seasonForm, start_date: e.target.value })}
                required
              />
              <Input
                label="End Date *"
                type="date"
                value={seasonForm.end_date}
                onChange={(e) => setSeasonForm({ ...seasonForm, end_date: e.target.value })}
                required
              />

              <div className="flex gap-3">
                <Button onClick={handleSaveSeason} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => setShowSeasonForm(false)} variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

export default function FarmerProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    district: user?.district || '',
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        district: user.district || '',
      });
    }
  }, [user]);

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/districts');
      const result = await response.json();
      if (result.success) {
        setDistricts(result.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone || undefined,
        district: formData.district,
      });

      setToastType('success');
      setToastMessage('Profile updated successfully!');
      setShowToast(true);
      setIsEditing(false);
    } catch (error: any) {
      setToastType('error');
      setToastMessage(error.message || 'Failed to update profile');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      district: user?.district || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Profile Settings</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage your account information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
            Edit Profile
          </Button>
        )}
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Placeholder */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+94 XX XXX XXXX"
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  District
                </label>
                {isEditing ? (
                  loadingDistricts ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select district</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  )
                ) : (
                  <Input
                    type="text"
                    value={formData.district}
                    disabled
                    className="bg-gray-50"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
                className="w-full sm:flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Account Information */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Account Type:</span>
            <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">User ID:</span>
            <span className="font-medium text-gray-900">{user?.id}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Member Since:</span>
            <span className="font-medium text-gray-900">
              {new Date().toLocaleDateString()} {/* You can add actual created_at date */}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

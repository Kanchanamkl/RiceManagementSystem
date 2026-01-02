'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, Mail, Phone, MapPin, Package, Loader2, User } from 'lucide-react';

interface Farmer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  district?: string;
  created_at: string;
  production_count?: number;
  total_quantity?: number;
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await fetch('/api/admin/farmers');
      const result = await response.json();
      
      if (result.success) {
        setFarmers(result.data);
        
        // Extract unique districts
        const uniqueDistricts = Array.from(
          new Set(result.data.map((f: Farmer) => f.district).filter(Boolean))
        ) as string[];
        setDistricts(uniqueDistricts.sort());
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = searchTerm === '' || 
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.district?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDistrict = filterDistrict === '' || farmer.district === filterDistrict;
    
    return matchesSearch && matchesDistrict;
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
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Farmers Management</h2>
        <p className="text-sm sm:text-base text-gray-600">View and manage all registered farmers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Farmers</p>
              <p className="text-2xl font-bold text-gray-900">{farmers.length}</p>
            </div>
            <User className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Districts Covered</p>
              <p className="text-2xl font-bold text-gray-900">{districts.length}</p>
            </div>
            <MapPin className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Producers</p>
              <p className="text-2xl font-bold text-gray-900">
                {farmers.filter(f => (f.production_count || 0) > 0).length}
              </p>
            </div>
            <Package className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, email, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFarmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{farmer.name}</div>
                        <div className="text-sm text-gray-500">{farmer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      {farmer.phone ? (
                        <>
                          <Phone className="w-4 h-4 mr-2" />
                          {farmer.phone}
                        </>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {farmer.district || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {farmer.production_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {farmer.total_quantity?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(farmer.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFarmers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No farmers found
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredFarmers.map((farmer) => (
            <div key={farmer.id} className="bg-white border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{farmer.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{farmer.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{farmer.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{farmer.district || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span>{farmer.production_count || 0} productions • {farmer.total_quantity?.toLocaleString() || 0} kg</span>
                </div>
              </div>
              
              <div className="pt-2 border-t text-xs text-gray-500">
                Joined: {new Date(farmer.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {filteredFarmers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No farmers found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

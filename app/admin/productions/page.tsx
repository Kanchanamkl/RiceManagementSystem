'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, Package, TrendingUp, Calendar, Loader2, User, MapPin } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface Production {
  id: string;
  rice_type_name: string;
  season_name: string;
  farmer_name: string;
  district: string;
  quantity_kg: number;
  production_date: string;
  notes?: string;
}

interface ProductionStats {
  total_quantity: number;
  total_productions: number;
  total_farmers: number;
  by_season: Array<{ season_name: string; total: number }>;
  by_district: Array<{ district: string; total: number }>;
}

export default function AdminProductionsPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeason, setFilterSeason] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [seasons, setSeasons] = useState<any[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchProductions(),
        fetchStats(),
        fetchSeasons(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductions = async () => {
    try {
      const response = await fetch('/api/admin/productions');
      const result = await response.json();
      
      if (result.success) {
        setProductions(result.data);
        
        // Extract unique districts
        const uniqueDistricts = Array.from(
          new Set(result.data.map((p: Production) => p.district).filter(Boolean))
        ) as string[];
        setDistricts(uniqueDistricts.sort());
      }
    } catch (error) {
      console.error('Error fetching productions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/productions/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const filteredProductions = productions.filter(prod => {
    const matchesSearch = searchTerm === '' || 
      prod.rice_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.district.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeason = filterSeason === '' || prod.season_name === filterSeason;
    const matchesDistrict = filterDistrict === '' || prod.district === filterDistrict;
    
    return matchesSearch && matchesSeason && matchesDistrict;
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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Production Records</h2>
        <p className="text-sm sm:text-base text-gray-600">View all production records across the system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Production</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(stats?.total_quantity || 0)} kg
              </p>
            </div>
            <Package className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_productions || 0}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Farmers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_farmers || 0}
              </p>
            </div>
            <User className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Districts</p>
              <p className="text-2xl font-bold text-gray-900">
                {districts.length}
              </p>
            </div>
            <MapPin className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by rice type, farmer, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Seasons</option>
              {seasons.map(season => (
                <option key={season.id} value={season.name}>{season.name}</option>
              ))}
            </select>

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
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rice Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
                    {prod.farmer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {prod.district}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prod.season_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {formatNumber(prod.quantity_kg)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(prod.production_date).toLocaleDateString()}
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredProductions.map((prod) => (
            <div key={prod.id} className="bg-white border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{prod.rice_type_name}</h3>
                  <p className="text-sm text-gray-500">{prod.season_name}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  {formatNumber(prod.quantity_kg)} kg
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{prod.farmer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{prod.district}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{new Date(prod.production_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredProductions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No production records found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

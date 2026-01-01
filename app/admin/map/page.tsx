'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Package, BarChart3, Database, Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

const RiceMap = dynamic(
  () => import('@/components/admin/RiceMap').then(mod => ({ default: mod.RiceMap })),
  { ssr: false }
);

export default function AdminMapPage() {
  const { user } = useAuth();
  const [mapData, setMapData] = useState<any[]>([]);
  const [riceTypes, setRiceTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRiceType, setFilterRiceType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchMapData();
    fetchRiceTypes();
  }, []);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/map');
      const result = await response.json();
      
      if (result.success) {
        setMapData(result.data);
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiceTypes = async () => {
    try {
      const response = await fetch('/api/rice-types');
      const result = await response.json();
      
      if (result.success) {
        setRiceTypes(result.data);
      }
    } catch (error) {
      console.error('Error fetching rice types:', error);
    }
  };

  const getFilteredDistricts = () => {
    return mapData.filter(district => {
      // Filter by status
      if (filterStatus && district.status !== filterStatus) {
        return false;
      }

      // Filter by rice type
      if (filterRiceType) {
        const hasRiceType = district.rice_types?.some(
          (rt: any) => rt.rice_type_id === filterRiceType
        );
        if (!hasRiceType) return false;
      }

      return true;
    });
  };

  const filteredDistricts = getFilteredDistricts();
  const totalProduction = filteredDistricts.reduce((sum, d) => sum + d.production, 0);
  const totalDemand = filteredDistricts.reduce((sum, d) => sum + d.demand, 0);
  const totalBalance = totalProduction - totalDemand;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Map View - District Analysis</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          icon={Package} 
          label="Total Production" 
          value={`${formatNumber(totalProduction)} kg`} 
          color="green" 
        />
        <StatCard 
          icon={BarChart3} 
          label="Total Demand" 
          value={`${formatNumber(totalDemand)} kg`} 
          color="blue" 
        />
        <StatCard 
          icon={Database} 
          label="Balance" 
          value={`${totalBalance > 0 ? '+' : ''}${formatNumber(totalBalance)} kg`} 
          color={totalBalance > 0 ? 'green' : totalBalance < 0 ? 'red' : 'yellow'} 
        />
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="surplus">Surplus</option>
            <option value="deficit">Deficit</option>
            <option value="balanced">Balanced</option>
          </select>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Surplus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Deficit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>Balanced</span>
            </div>
          </div>
        </div>

        <RiceMap districts={filteredDistricts} />
      </Card>
    </div>
  );
}
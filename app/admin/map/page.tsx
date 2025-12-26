'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Package, BarChart3, Database } from 'lucide-react';
import { mockDistricts, mockDemand, mockRiceTypes } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

const RiceMap = dynamic(
  () => import('@/components/admin/RiceMap').then(mod => ({ default: mod.RiceMap })),
  { ssr: false }
);

export default function AdminMapPage() {
  const { productions } = useAuth();
  const [filterRiceType, setFilterRiceType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const getDistrictStats = () => {
    return mockDistricts.map(district => {
      const districtProductions = productions.filter(p => p.district === district.name);
      const districtDemands = mockDemand.filter(d => d.district === district.name);
      
      const filteredProductions = filterRiceType 
        ? districtProductions.filter(p => p.rice_type_name === filterRiceType)
        : districtProductions;
      
      const filteredDemands = filterRiceType
        ? districtDemands.filter(d => d.rice_type_name === filterRiceType)
        : districtDemands;
      
      const totalProduction = filteredProductions.reduce((sum, p) => sum + p.quantity_kg, 0);
      const totalDemand = filteredDemands.reduce((sum, d) => sum + d.quantity_kg, 0);
      const balance = totalProduction - totalDemand;
      const status = balance > 0 ? 'surplus' : balance < 0 ? 'deficit' : 'balanced';
      
      return {
        ...district,
        production: totalProduction,
        demand: totalDemand,
        balance,
        status
      };
    }).filter(d => {
      if (!filterStatus) return true;
      return d.status === filterStatus;
    });
  };

  const districtStats = getDistrictStats();
  const totalProduction = districtStats.reduce((sum, d) => sum + d.production, 0);
  const totalDemand = districtStats.reduce((sum, d) => sum + d.demand, 0);
  const totalBalance = totalProduction - totalDemand;

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
            {mockRiceTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
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

        <RiceMap districts={districtStats} />
      </Card>
    </div>
  );
}
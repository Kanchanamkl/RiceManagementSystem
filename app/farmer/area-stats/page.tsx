'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { mockDistricts, mockDemand, mockRiceTypes } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

export default function AreaStatsPage() {
  const { productions } = useAuth();
  const [filterRiceType, setFilterRiceType] = useState('');

  const aggregateByDistrict = () => {
    const stats: { [key: string]: any } = {};
    
    mockDistricts.forEach(district => {
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
      
      const riceTypes = [...new Set(filteredProductions.map(p => p.rice_type_name))];
      
      if (totalProduction > 0 || totalDemand > 0) {
        stats[district.name] = {
          production: totalProduction,
          demand: totalDemand,
          balance,
          status: balance > 0 ? 'surplus' : balance < 0 ? 'deficit' : 'balanced',
          riceTypes
        };
      }
    });
    
    return stats;
  };

  const stats = aggregateByDistrict();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'surplus': return 'green';
      case 'deficit': return 'red';
      default: return 'yellow';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Area Statistics</h2>
        <div className="w-full sm:w-64">
          <select
            value={filterRiceType}
            onChange={(e) => setFilterRiceType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Rice Types</option>
            {mockRiceTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(stats).map(([district, data]) => (
          <Card key={district}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{district}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Production:</span>
                <span className="font-semibold text-green-600">
                  {formatNumber(data.production)} kg
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Demand:</span>
                <span className="font-semibold text-blue-600">
                  {formatNumber(data.demand)} kg
                </span>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Balance:</span>
                  <span className={`font-bold text-${getStatusColor(data.status)}-600`}>
                    {data.balance > 0 ? '+' : ''}{formatNumber(data.balance)} kg
                  </span>
                </div>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-${getStatusColor(data.status)}-100 text-${getStatusColor(data.status)}-700`}>
                    {data.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {data.riceTypes.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-2">Rice Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.riceTypes.map((type: string) => (
                      <span key={type} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
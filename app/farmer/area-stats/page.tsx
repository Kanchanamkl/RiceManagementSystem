'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function AreaStatsPage() {
  const [districtStats, setDistrictStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistrictStats();
  }, []);

  const fetchDistrictStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/district-stats');
      const result = await response.json();
      
      if (result.success) {
        // Group by district
        const grouped = result.data.reduce((acc: any, stat: any) => {
          if (!acc[stat.district]) {
            acc[stat.district] = {
              district: stat.district,
              production: 0,
              demand: 0,
              balance: 0,
              rice_types: [],
            };
          }
          acc[stat.district].production += stat.production;
          acc[stat.district].demand += stat.demand;
          acc[stat.district].balance += stat.balance;
          acc[stat.district].rice_types.push(stat);
          return acc;
        }, {});

        setDistrictStats(Object.values(grouped));
      }
    } catch (error) {
      console.error('Error fetching district stats:', error);
    } finally {
      setLoading(false);
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
      <h2 className="text-2xl font-bold text-gray-800">Area Statistics - Production vs Demand</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {districtStats.map((stat) => (
          <Card key={stat.district}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">{stat.district}</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Production:</span>
                  <span className="font-semibold text-green-600">
                    {formatNumber(stat.production)} kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Demand:</span>
                  <span className="font-semibold text-blue-600">
                    {formatNumber(stat.demand)} kg
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Balance:</span>
                  <span className={`font-bold ${
                    stat.balance > 0 ? 'text-green-600' : 
                    stat.balance < 0 ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {stat.balance > 0 ? '+' : ''}{formatNumber(stat.balance)} kg
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  stat.balance > 0 ? 'bg-green-100 text-green-800' :
                  stat.balance < 0 ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {stat.balance > 0 ? 'Surplus' : stat.balance < 0 ? 'Deficit' : 'Balanced'}
                </span>
              </div>

              {stat.rice_types.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">By Rice Type:</p>
                  <div className="space-y-1">
                    {stat.rice_types.map((rt: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600">{rt.rice_type_name}</span>
                        <span className={
                          rt.balance > 0 ? 'text-green-600' : 
                          rt.balance < 0 ? 'text-red-600' : 
                          'text-gray-600'
                        }>
                          {rt.balance > 0 ? '+' : ''}{formatNumber(rt.balance)} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {districtStats.length === 0 && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            No district statistics available
          </div>
        </Card>
      )}
    </div>
  );
}
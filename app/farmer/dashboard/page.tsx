'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Package, BarChart3, Database } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';

export default function FarmerDashboard() {
  const { user, productions } = useAuth();
  
  if (!user) return null;

  const userProductions = productions.filter(p => p.farmer_id === user.id);
  const totalProduction = userProductions.reduce((sum, p) => sum + p.quantity_kg, 0);
  const totalRecords = userProductions.length;
  const uniqueSeasons = [...new Set(userProductions.map(p => p.season))].length;
  const uniqueRiceTypes = [...new Set(userProductions.map(p => p.rice_type_name))].length;
  const currentSeasonProduction = userProductions
    .filter(p => p.season === 'Maha 2024/25')
    .reduce((sum, p) => sum + p.quantity_kg, 0);
  const recentProductions = userProductions.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Welcome, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Package} 
          label="Total Production" 
          value={`${formatNumber(totalProduction)} kg`} 
        />
        <StatCard 
          icon={BarChart3} 
          label="Total Records" 
          value={totalRecords} 
        />
        <StatCard 
          icon={Database} 
          label="Seasons Tracked" 
          value={uniqueSeasons} 
          color="blue" 
        />
        <StatCard 
          icon={Package} 
          label="Rice Varieties" 
          value={uniqueRiceTypes} 
          color="purple" 
        />
      </div>

      <Card title="Current Season (Maha 2024/25)">
        <p className="text-3xl font-bold text-green-600">
          {formatNumber(currentSeasonProduction)} kg
        </p>
        <p className="text-gray-600 mt-2">Total production this season</p>
      </Card>

      <Card title="Recent Productions">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Rice Type</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Season</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Quantity (kg)</th>
              </tr>
            </thead>
            <tbody>
              {recentProductions.map(prod => (
                <tr key={prod.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{formatDate(prod.production_date)}</td>
                  <td className="px-4 py-3 text-sm">{prod.rice_type_name}</td>
                  <td className="px-4 py-3 text-sm">{prod.season}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {formatNumber(prod.quantity_kg)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
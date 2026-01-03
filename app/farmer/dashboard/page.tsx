'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Package, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface ProductionStats {
  total: number;
  count: number;
  bySeasons: Array<{ season_name: string; season_total: number }>;
}

export default function FarmerDashboard() {
  const { user, productions } = useAuth();
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/productions/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome, {user?.name}!</h2>
        <p className="text-sm sm:text-base text-gray-600">Here's an overview of your rice production</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Production</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(stats?.total || 0)} kg
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
                {stats?.count || 0}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Seasons Tracked</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.bySeasons?.length || 0}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      {stats?.bySeasons && stats.bySeasons.length > 0 && (
        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Production by Season</h3>
          <div className="space-y-3">
            {stats.bySeasons.map((season, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-gray-700">{season.season_name || 'Unknown'}</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(season.season_total)} kg
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {productions.length > 0 && (
        <Card>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Recent Productions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600">Rice Type</th>
                  <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600">Season</th>
                  <th className="text-right py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600">Quantity</th>
                  <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {productions.slice(0, 5).map((prod) => (
                  <tr key={prod.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">{prod.rice_type_name}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">{prod.season_name}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">{formatNumber(prod.quantity_kg)} kg</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">
                      {new Date(prod.production_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
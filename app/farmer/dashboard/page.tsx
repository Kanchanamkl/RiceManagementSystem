'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Package, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function FarmerDashboard() {
  const { user, productions } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
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

  const recentProductions = productions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}!</h2>
        <p className="text-gray-600">District: {user?.district}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          icon={Package} 
          label="Total Production" 
          value={`${formatNumber(stats?.total || 0)} kg`} 
          color="green" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Records" 
          value={stats?.count || 0} 
          color="blue" 
        />
        <StatCard 
          icon={Calendar} 
          label="Active Seasons" 
          value={Object.keys(stats?.bySeason || {}).length} 
          color="purple" 
        />
      </div>

      {stats?.bySeason && Object.keys(stats.bySeason).length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Production by Season</h3>
          <div className="space-y-3">
            {Object.entries(stats.bySeason).map(([season, quantity]: [string, any]) => (
              <div key={season} className="flex items-center justify-between">
                <span className="text-gray-700">{season}</span>
                <span className="font-semibold text-green-600">{formatNumber(quantity)} kg</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Productions</h3>
        {recentProductions.length > 0 ? (
          <div className="space-y-3">
            {recentProductions.map((prod) => (
              <div key={prod.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{prod.rice_type_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(prod.production_date).toLocaleDateString()} • {prod.district}
                  </p>
                </div>
                <span className="font-semibold text-green-600">{formatNumber(prod.quantity_kg)} kg</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No production records yet</p>
        )}
      </Card>
    </div>
  );
}
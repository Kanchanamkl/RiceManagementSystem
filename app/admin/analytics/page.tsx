'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Package, TrendingUp, Users, MapPin, Calendar, Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    total_production: number;
    total_farmers: number;
    total_records: number;
    active_districts: number;
  };
  by_season: Array<{ season_name: string; total: number; count: number }>;
  by_district: Array<{ district: string; total: number; count: number; farmer_count: number }>;
  by_rice_type: Array<{ rice_type: string; total: number; count: number }>;
  monthly_trend: Array<{ month: string; total: number; count: number }>;
  top_farmers: Array<{ farmer_name: string; district: string; total: number; count: number }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600">Comprehensive system statistics and insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Production</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.overview.total_production)} kg
              </p>
            </div>
            <Package className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Farmers</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.total_farmers}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Production Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.total_records}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Districts</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.active_districts}
              </p>
            </div>
            <MapPin className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production by Season */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Production by Season
          </h3>
          <div className="space-y-4">
            {data.by_season.map((season, index) => {
              const maxTotal = Math.max(...data.by_season.map(s => s.total));
              const percentage = (season.total / maxTotal) * 100;
              
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {season.season_name || 'Unknown'}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {formatNumber(season.total)} kg
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({season.count} records)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Production by Rice Type */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Production by Rice Type
          </h3>
          <div className="space-y-4">
            {data.by_rice_type.slice(0, 5).map((type, index) => {
              const maxTotal = Math.max(...data.by_rice_type.map(t => t.total));
              const percentage = (type.total / maxTotal) * 100;
              
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {type.rice_type}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {formatNumber(type.total)} kg
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({type.count} records)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Districts */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-orange-600" />
          Top Districts by Production
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">District</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Total (kg)</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Records</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Farmers</th>
              </tr>
            </thead>
            <tbody>
              {data.by_district.slice(0, 10).map((district, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{district.district}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">{formatNumber(district.total)}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600">{district.count}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600">{district.farmer_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Farmers */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Top Contributing Farmers
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Farmer</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">District</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Total (kg)</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Records</th>
              </tr>
            </thead>
            <tbody>
              {data.top_farmers.slice(0, 10).map((farmer, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{farmer.farmer_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{farmer.district}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">{formatNumber(farmer.total)}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600">{farmer.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Monthly Trend */}
      {data.monthly_trend.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Monthly Production Trend
          </h3>
          <div className="space-y-3">
            {data.monthly_trend.map((month, index) => {
              const maxTotal = Math.max(...data.monthly_trend.map(m => m.total));
              const percentage = maxTotal > 0 ? (month.total / maxTotal) * 100 : 0;
              
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {formatNumber(month.total)} kg
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({month.count} records)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Download, Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function StocksPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [riceTypes, setRiceTypes] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterRiceType, setFilterRiceType] = useState('');

  useEffect(() => {
    fetchStocks();
    fetchRiceTypes();
    fetchDistricts();
  }, [filterDistrict, filterRiceType]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterDistrict) params.append('district', filterDistrict);
      if (filterRiceType) params.append('rice_type_id', filterRiceType);

      const response = await fetch(`/api/analytics/district-stats?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setStocks(result.data);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiceTypes = async () => {
    try {
      const response = await fetch('/api/rice-types');
      const result = await response.json();
      if (result.success) setRiceTypes(result.data);
    } catch (error) {
      console.error('Error fetching rice types:', error);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/districts');
      const result = await response.json();
      if (result.success) setDistricts(result.data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filterDistrict) params.append('district', filterDistrict);
      if (filterRiceType) params.append('rice_type_id', filterRiceType);

      const response = await fetch(`/api/analytics/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rice-stocks-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = searchTerm === '' || 
      stock.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.rice_type_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Stocks Management</h2>
        <Button onClick={handleExport} variant="secondary">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search district or rice type..."
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
              <option key={district.id} value={district.name}>{district.name}</option>
            ))}
          </select>

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
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rice Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Production (kg)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand (kg)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance (kg)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStocks.map((stock, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stock.district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.rice_type_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatNumber(stock.production)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatNumber(stock.demand)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      stock.balance > 0 ? 'text-green-600' : stock.balance < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {stock.balance > 0 ? '+' : ''}{formatNumber(stock.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        stock.status === 'surplus' ? 'bg-green-100 text-green-800' :
                        stock.status === 'deficit' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {stock.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStocks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No stock records found
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

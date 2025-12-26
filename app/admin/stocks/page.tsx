'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Package, BarChart3, Database, Download, Search } from 'lucide-react';
import { mockDemand, mockRiceTypes } from '@/lib/mockData';
import { formatNumber, exportToCSV } from '@/lib/utils';
import { StockData } from '@/lib/types';

export default function AdminStocksPage() {
  const { productions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRiceType, setFilterRiceType] = useState('');

  const getStocksData = (): StockData[] => {
    const stocks: { [key: string]: StockData } = {};
    
    productions.forEach(prod => {
      const key = `${prod.district}-${prod.rice_type_name}`;
      if (!stocks[key]) {
        stocks[key] = {
          district: prod.district,
          riceType: prod.rice_type_name,
          production: 0,
          demand: 0,
          remaining: 0,
          status: 'balanced'
        };
      }
      stocks[key].production += prod.quantity_kg;
    });
    
    mockDemand.forEach(dem => {
      const key = `${dem.district}-${dem.rice_type_name}`;
      if (!stocks[key]) {
        stocks[key] = {
          district: dem.district,
          riceType: dem.rice_type_name,
          production: 0,
          demand: 0,
          remaining: 0,
          status: 'balanced'
        };
      }
      stocks[key].demand += dem.quantity_kg;
    });
    
    return Object.values(stocks).map(stock => ({
      ...stock,
      remaining: stock.production - stock.demand,
      status: stock.production - stock.demand > 0 ? 'surplus' : 
              stock.production - stock.demand < 0 ? 'deficit' : 'balanced'
    }));
  };

  const allStocks = getStocksData();
  const filteredStocks = allStocks.filter(stock => {
    const matchesSearch = stock.district.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         stock.riceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || stock.status === filterStatus;
    const matchesRiceType = !filterRiceType || stock.riceType === filterRiceType;
    return matchesSearch && matchesStatus && matchesRiceType;
  });

  const surplusCount = allStocks.filter(s => s.status === 'surplus').length;
  const deficitCount = allStocks.filter(s => s.status === 'deficit').length;
  const balancedCount = allStocks.filter(s => s.status === 'balanced').length;

  const handleExportCSV = () => {
    const csvData = filteredStocks.map(stock => ({
      District: stock.district,
      'Rice Type': stock.riceType,
      'Production (kg)': stock.production,
      'Demand (kg)': stock.demand,
      'Remaining (kg)': stock.remaining,
      Status: stock.status
    }));
    exportToCSV(csvData, 'rice-stocks');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Stocks Management</h2>
        <Button onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2 inline" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Package} label="Surplus Areas" value={surplusCount} color="green" />
        <StatCard icon={BarChart3} label="Deficit Areas" value={deficitCount} color="red" />
        <StatCard icon={Database} label="Balanced Areas" value={balancedCount} color="yellow" />
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search district or rice type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">District</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rice Type</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Production (kg)</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Demand (kg)</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Remaining (kg)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{stock.district}</td>
                  <td className="px-4 py-3 text-sm">{stock.riceType}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatNumber(stock.production)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatNumber(stock.demand)}</td>
                  <td className={`px-4 py-3 text-sm text-right font-semibold ${
                    stock.status === 'surplus' ? 'text-green-600' : 
                    stock.status === 'deficit' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {stock.remaining > 0 ? '+' : ''}{formatNumber(stock.remaining)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      stock.status === 'surplus' ? 'bg-green-100 text-green-700' :
                      stock.status === 'deficit' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {stock.status.toUpperCase()}
                    </span>
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

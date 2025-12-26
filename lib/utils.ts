import { Production, Demand } from './types';

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-LK').format(num);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-LK');
}

export function calculateBalance(production: number, demand: number) {
  const remaining = production - demand;
  const status = remaining > 0 ? 'surplus' : remaining < 0 ? 'deficit' : 'balanced';
  return { remaining, status };
}

export function getProductionsByFarmer(productions: Production[], farmerId: number) {
  return productions.filter(p => p.farmer_id === farmerId);
}

export function aggregateByDistrict(productions: Production[], demands: Demand[]) {
  const districts: { [key: string]: any } = {};
  
  productions.forEach(prod => {
    if (!districts[prod.district]) {
      districts[prod.district] = { production: 0, demand: 0, riceTypes: new Set() };
    }
    districts[prod.district].production += prod.quantity_kg;
    districts[prod.district].riceTypes.add(prod.rice_type_name);
  });
  
  demands.forEach(dem => {
    if (!districts[dem.district]) {
      districts[dem.district] = { production: 0, demand: 0, riceTypes: new Set() };
    }
    districts[dem.district].demand += dem.quantity_kg;
  });
  
  return Object.entries(districts).map(([district, data]) => ({
    district,
    production: data.production,
    demand: data.demand,
    balance: data.production - data.demand,
    status: data.production - data.demand > 0 ? 'surplus' : data.production - data.demand < 0 ? 'deficit' : 'balanced',
    riceTypes: Array.from(data.riceTypes)
  }));
}

export function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(header => row[header]).join(','));
  const csvContent = [headers.join(','), ...rows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

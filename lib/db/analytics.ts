
import { supabaseAdmin } from '@/lib/supabase/client';

export interface DistrictStatsRecord {
  district: string;
  rice_type_id: string;
  rice_type_name: string;
  production: number;
  demand: number;
  balance: number;
  status: 'surplus' | 'deficit' | 'balanced';
}

export interface StocksSummary {
  district: string;
  rice_type_id: string;
  rice_type_name: string;
  production: number;
  demand: number;
  balance: number;
}

export async function getDistrictStats(filters?: {
  district?: string;
  rice_type_id?: string;
  status?: string;
}) {
  // Get all productions grouped by district and rice type
  const { data: productions, error: prodError } = await supabaseAdmin
    .from('productions')
    .select(`
      district,
      rice_type_id,
      quantity_kg,
      rice_types:rice_type_id(id, name, category)
    `);

  if (prodError) throw prodError;

  // Get all demands grouped by district and rice type
  const { data: demands, error: demandError } = await supabaseAdmin
    .from('demands')
    .select(`
      district,
      rice_type_id,
      quantity_kg,
      rice_types:rice_type_id(id, name, category)
    `);

  if (demandError) throw demandError;

  // Aggregate by district and rice type
  const statsMap = new Map<string, DistrictStatsRecord>();

  // Process productions
  (productions || []).forEach(prod => {
    const key = `${prod.district}-${prod.rice_type_id}`;
    if (!statsMap.has(key)) {
      statsMap.set(key, {
        district: prod.district,
        rice_type_id: prod.rice_type_id,
        rice_type_name: prod.rice_types?.name || 'Unknown',
        production: 0,
        demand: 0,
        balance: 0,
        status: 'balanced',
      });
    }
    const stats = statsMap.get(key)!;
    stats.production += Number(prod.quantity_kg);
  });

  // Process demands
  (demands || []).forEach(demand => {
    const key = `${demand.district}-${demand.rice_type_id}`;
    if (!statsMap.has(key)) {
      statsMap.set(key, {
        district: demand.district,
        rice_type_id: demand.rice_type_id,
        rice_type_name: demand.rice_types?.name || 'Unknown',
        production: 0,
        demand: 0,
        balance: 0,
        status: 'balanced',
      });
    }
    const stats = statsMap.get(key)!;
    stats.demand += Number(demand.quantity_kg);
  });

  // Calculate balance and status
  const results = Array.from(statsMap.values()).map(stat => {
    stat.balance = stat.production - stat.demand;
    if (stat.balance > 0) {
      stat.status = 'surplus';
    } else if (stat.balance < 0) {
      stat.status = 'deficit';
    } else {
      stat.status = 'balanced';
    }
    return stat;
  });

  // Apply filters
  let filtered = results;

  if (filters?.district) {
    filtered = filtered.filter(s => s.district === filters.district);
  }

  if (filters?.rice_type_id) {
    filtered = filtered.filter(s => s.rice_type_id === filters.rice_type_id);
  }

  if (filters?.status) {
    filtered = filtered.filter(s => s.status === filters.status);
  }

  return filtered;
}

export async function getStocksSummary(filters?: {
  district?: string;
  rice_type_id?: string;
}) {
  const stats = await getDistrictStats(filters);

  // Group by district for summary
  const districtSummary = new Map<string, any>();

  stats.forEach(stat => {
    if (!districtSummary.has(stat.district)) {
      districtSummary.set(stat.district, {
        district: stat.district,
        total_production: 0,
        total_demand: 0,
        total_balance: 0,
        rice_types: [],
      });
    }

    const summary = districtSummary.get(stat.district)!;
    summary.total_production += stat.production;
    summary.total_demand += stat.demand;
    summary.total_balance += stat.balance;
    summary.rice_types.push({
      rice_type_id: stat.rice_type_id,
      rice_type_name: stat.rice_type_name,
      production: stat.production,
      demand: stat.demand,
      balance: stat.balance,
      status: stat.status,
    });
  });

  return Array.from(districtSummary.values());
}

export async function getMapData() {
  // Get districts
  const { data: districts, error: distError } = await supabaseAdmin
    .from('districts')
    .select('*');

  if (distError) throw distError;

  // Get stats for all districts
  const stats = await getDistrictStats();

  // Map district stats to district data
  return (districts || []).map(district => {
    const districtStats = stats.filter(s => s.district === district.name);
    
    const totalProduction = districtStats.reduce((sum, s) => sum + s.production, 0);
    const totalDemand = districtStats.reduce((sum, s) => sum + s.demand, 0);
    const totalBalance = totalProduction - totalDemand;

    let status: 'surplus' | 'deficit' | 'balanced' = 'balanced';
    if (totalBalance > 0) status = 'surplus';
    else if (totalBalance < 0) status = 'deficit';

    return {
      id: district.id,
      name: district.name,
      latitude: district.latitude,
      longitude: district.longitude,
      is_paddy_area: district.is_paddy_area,
      production: totalProduction,
      demand: totalDemand,
      balance: totalBalance,
      status,
      rice_types: districtStats,
    };
  });
}

export function generateCSV(data: any[], columns: string[]) {
  const headers = columns.join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col];
      // Escape values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );

  return [headers, ...rows].join('\n');
}

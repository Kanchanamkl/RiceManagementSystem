import { query } from './connection';

export interface DistrictStatsRecord {
  district: string;
  rice_type_id: string;
  rice_type_name: string;
  production: number;
  demand: number;
  balance: number;
  status: 'surplus' | 'deficit' | 'balanced';
}

export async function getDistrictStats(filters?: {
  district?: string;
  rice_type_id?: string;
  status?: string;
}) {
  let sql = `
    WITH production_agg AS (
      SELECT 
        p.district,
        p.rice_type_id,
        rt.name as rice_type_name,
        COALESCE(SUM(p.quantity_kg), 0) as production
      FROM productions p
      LEFT JOIN rice_types rt ON p.rice_type_id = rt.id
      GROUP BY p.district, p.rice_type_id, rt.name
    ),
    demand_agg AS (
      SELECT 
        d.district,
        d.rice_type_id,
        COALESCE(SUM(d.quantity_kg), 0) as demand
      FROM demands d
      GROUP BY d.district, d.rice_type_id
    )
    SELECT 
      COALESCE(pa.district, da.district) as district,
      COALESCE(pa.rice_type_id, da.rice_type_id) as rice_type_id,
      COALESCE(pa.rice_type_name, 'Unknown') as rice_type_name,
      COALESCE(pa.production, 0) as production,
      COALESCE(da.demand, 0) as demand,
      COALESCE(pa.production, 0) - COALESCE(da.demand, 0) as balance
    FROM production_agg pa
    FULL OUTER JOIN demand_agg da 
      ON pa.district = da.district AND pa.rice_type_id = da.rice_type_id
  `;

  const params: any[] = [];
  const conditions: string[] = [];
  let paramCount = 1;

  if (filters?.district) {
    conditions.push(`COALESCE(pa.district, da.district) = $${paramCount}`);
    params.push(filters.district);
    paramCount++;
  }

  if (filters?.rice_type_id) {
    conditions.push(`COALESCE(pa.rice_type_id, da.rice_type_id) = $${paramCount}`);
    params.push(filters.rice_type_id);
    paramCount++;
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  const result = await query(sql, params);

  return result.rows.map(row => ({
    district: row.district,
    rice_type_id: row.rice_type_id,
    rice_type_name: row.rice_type_name,
    production: Number(row.production),
    demand: Number(row.demand),
    balance: Number(row.balance),
    status: Number(row.balance) > 0 ? 'surplus' : Number(row.balance) < 0 ? 'deficit' : 'balanced',
  })).filter(stat => {
    if (filters?.status) {
      return stat.status === filters.status;
    }
    return true;
  });
}

export async function getStocksSummary(filters?: {
  district?: string;
  rice_type_id?: string;
}) {
  const stats = await getDistrictStats(filters);

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
  const result = await query(`
    SELECT 
      d.id,
      d.name,
      d.latitude,
      d.longitude,
      d.is_paddy_area,
      COALESCE(SUM(p.quantity_kg), 0) as production,
      COALESCE(SUM(dm.quantity_kg), 0) as demand
    FROM districts d
    LEFT JOIN productions p ON d.name = p.district
    LEFT JOIN demands dm ON d.name = dm.district
    GROUP BY d.id, d.name, d.latitude, d.longitude, d.is_paddy_area
  `);

  const stats = await getDistrictStats();

  return result.rows.map(district => {
    const production = Number(district.production);
    const demand = Number(district.demand);
    const balance = production - demand;

    let status: 'surplus' | 'deficit' | 'balanced' = 'balanced';
    if (balance > 0) status = 'surplus';
    else if (balance < 0) status = 'deficit';

    return {
      id: district.id,
      name: district.name,
      latitude: Number(district.latitude),
      longitude: Number(district.longitude),
      is_paddy_area: district.is_paddy_area,
      production,
      demand,
      balance,
      status,
      rice_types: stats.filter(s => s.district === district.name),
    };
  });
}

export function generateCSV(data: any[], columns: string[]) {
  const headers = columns.join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );

  return [headers, ...rows].join('\n');
}

import { query } from './connection';

export interface ProductionRecord {
  id: string;
  farmer_id: string;
  rice_type_id: string;
  season_id: string;
  district: string;
  quantity_kg: number;
  production_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  rice_type_name?: string;
  season_name?: string;
  farmer_name?: string;
}

export async function getAllProductions(userId?: string, role?: string) {
  let sql = `
    SELECT 
      p.*,
      rt.name as rice_type_name,
      s.name as season_name,
      u.name as farmer_name
    FROM productions p
    LEFT JOIN rice_types rt ON p.rice_type_id = rt.id
    LEFT JOIN seasons s ON p.season_id = s.id
    LEFT JOIN users u ON p.farmer_id = u.id
  `;
  
  const params: any[] = [];

  if (role === 'farmer' && userId) {
    sql += ' WHERE p.farmer_id = $1';
    params.push(userId);
  }

  sql += ' ORDER BY p.production_date DESC';

  const result = await query<ProductionRecord>(sql, params);
  return result.rows;
}

export async function getProductionById(id: string) {
  const result = await query<ProductionRecord>(
    `SELECT 
      p.*,
      rt.name as rice_type_name,
      s.name as season_name,
      u.name as farmer_name
    FROM productions p
    LEFT JOIN rice_types rt ON p.rice_type_id = rt.id
    LEFT JOIN seasons s ON p.season_id = s.id
    LEFT JOIN users u ON p.farmer_id = u.id
    WHERE p.id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function createProduction(data: {
  farmer_id: string;
  rice_type_id: string;
  season_id: string;
  district: string;
  quantity_kg: number;
  production_date: string;
  notes?: string;
}) {
  const result = await query<ProductionRecord>(
    `INSERT INTO productions (farmer_id, rice_type_id, season_id, district, quantity_kg, production_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.farmer_id, data.rice_type_id, data.season_id, data.district, data.quantity_kg, data.production_date, data.notes]
  );

  return result.rows[0];
}

export async function updateProduction(id: string, updates: Partial<ProductionRecord>) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<ProductionRecord>(
    `UPDATE productions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0];
}

export async function deleteProduction(id: string) {
  await query('DELETE FROM productions WHERE id = $1', [id]);
}

export async function getProductionStats(userId?: string, role?: string) {
  let sql = `
    SELECT 
      SUM(p.quantity_kg) as total,
      COUNT(*) as count,
      s.name as season_name,
      SUM(p.quantity_kg) as season_total
    FROM productions p
    LEFT JOIN seasons s ON p.season_id = s.id
  `;
  
  const params: any[] = [];

  if (role === 'farmer' && userId) {
    sql += ' WHERE p.farmer_id = $1';
    params.push(userId);
  }

  sql += ' GROUP BY s.name';

  const result = await query(sql, params);

  const total = result.rows.reduce((sum, row) => sum + Number(row.season_total || 0), 0);
  const count = result.rows.reduce((sum, row) => sum + Number(row.count || 0), 0);
  
  const bySeason: Record<string, number> = {};
  result.rows.forEach(row => {
    if (row.season_name) {
      bySeason[row.season_name] = Number(row.season_total);
    }
  });

  return { total, count, bySeason };
}

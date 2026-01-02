import { query } from './connection';

export interface DemandRecord {
  id: string;
  rice_type_id: string;
  district: string;
  quantity_kg: number;
  demand_date: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  rice_type_name?: string;
  creator_name?: string;
}

export async function getAllDemands() {
  const result = await query<DemandRecord>(
    `SELECT 
      d.*,
      rt.name as rice_type_name,
      u.name as creator_name
    FROM demands d
    LEFT JOIN rice_types rt ON d.rice_type_id = rt.id
    LEFT JOIN users u ON d.created_by = u.id
    ORDER BY d.demand_date DESC`
  );

  return result.rows;
}

export async function getDemandById(id: string) {
  const result = await query<DemandRecord>(
    `SELECT 
      d.*,
      rt.name as rice_type_name,
      u.name as creator_name
    FROM demands d
    LEFT JOIN rice_types rt ON d.rice_type_id = rt.id
    LEFT JOIN users u ON d.created_by = u.id
    WHERE d.id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function createDemand(data: {
  rice_type_id: string;
  district: string;
  quantity_kg: number;
  demand_date: string;
  notes?: string;
  created_by: string;
}) {
  const result = await query<DemandRecord>(
    `INSERT INTO demands (rice_type_id, district, quantity_kg, demand_date, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.rice_type_id, data.district, data.quantity_kg, data.demand_date, data.notes, data.created_by]
  );

  return result.rows[0];
}

export async function updateDemand(id: string, updates: Partial<DemandRecord>) {
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

  const result = await query<DemandRecord>(
    `UPDATE demands SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0];
}

export async function deleteDemand(id: string) {
  await query('DELETE FROM demands WHERE id = $1', [id]);
}

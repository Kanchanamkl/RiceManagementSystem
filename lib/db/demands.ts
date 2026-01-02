import { query } from './connection';

export interface Demand {
  id: string;
  rice_type_id: string;
  rice_type_name?: string;
  district: string;
  quantity_kg: number;
  demand_date: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

// Get all demands (admin can see all, farmers can see their district)
export async function getAllDemands(userId: string, userRole: string, userDistrict?: string) {
  try {
    let sql = `
      SELECT 
        d.id,
        d.rice_type_id,
        rt.name as rice_type_name,
        d.district,
        d.quantity_kg,
        d.demand_date,
        d.notes,
        d.created_by,
        d.created_at,
        d.updated_at
      FROM demands d
      LEFT JOIN rice_types rt ON d.rice_type_id = rt.id
    `;

    const params: any[] = [];

    // If farmer, filter by their district
    if (userRole === 'farmer' && userDistrict) {
      sql += ` WHERE d.district = $1`;
      params.push(userDistrict);
    }

    sql += ` ORDER BY d.demand_date DESC, d.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Get all demands error:', error);
    throw error;
  }
}

// Get single demand by ID
export async function getDemandById(id: string) {
  try {
    const result = await query(
      `SELECT 
        d.id,
        d.rice_type_id,
        rt.name as rice_type_name,
        d.district,
        d.quantity_kg,
        d.demand_date,
        d.notes,
        d.created_by,
        d.created_at,
        d.updated_at
      FROM demands d
      LEFT JOIN rice_types rt ON d.rice_type_id = rt.id
      WHERE d.id = $1`,
      [id]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Get demand by ID error:', error);
    throw error;
  }
}

// Create new demand (admin only)
export async function createDemand(data: {
  rice_type_id: string;
  district: string;
  quantity_kg: number;
  demand_date: string;
  notes?: string;
  created_by: string;
}) {
  try {
    const result = await query(
      `INSERT INTO demands (rice_type_id, district, quantity_kg, demand_date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING 
         id,
         rice_type_id,
         district,
         quantity_kg,
         demand_date,
         notes,
         created_by,
         created_at`,
      [
        data.rice_type_id,
        data.district,
        data.quantity_kg,
        data.demand_date,
        data.notes || null,
        data.created_by
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Create demand error:', error);
    throw error;
  }
}

// Update demand (admin only)
export async function updateDemand(
  id: string,
  data: {
    rice_type_id?: string;
    district?: string;
    quantity_kg?: number;
    demand_date?: string;
    notes?: string;
  }
) {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.rice_type_id !== undefined) {
      updates.push(`rice_type_id = $${paramIndex++}`);
      values.push(data.rice_type_id);
    }
    if (data.district !== undefined) {
      updates.push(`district = $${paramIndex++}`);
      values.push(data.district);
    }
    if (data.quantity_kg !== undefined) {
      updates.push(`quantity_kg = $${paramIndex++}`);
      values.push(data.quantity_kg);
    }
    if (data.demand_date !== undefined) {
      updates.push(`demand_date = $${paramIndex++}`);
      values.push(data.demand_date);
    }
    if (data.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(data.notes);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE demands 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING 
         id,
         rice_type_id,
         district,
         quantity_kg,
         demand_date,
         notes,
         created_by,
         created_at,
         updated_at`,
      values
    );

    return result.rows[0];
  } catch (error) {
    console.error('Update demand error:', error);
    throw error;
  }
}

// Delete demand (admin only)
export async function deleteDemand(id: string) {
  try {
    const result = await query(
      'DELETE FROM demands WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Delete demand error:', error);
    throw error;
  }
}

// Get demands by district
export async function getDemandsByDistrict(district: string) {
  try {
    const result = await query(
      `SELECT 
        d.id,
        d.rice_type_id,
        rt.name as rice_type_name,
        d.district,
        d.quantity_kg,
        d.demand_date,
        d.notes,
        d.created_at
      FROM demands d
      LEFT JOIN rice_types rt ON d.rice_type_id = rt.id
      WHERE d.district = $1
      ORDER BY d.demand_date DESC`,
      [district]
    );

    return result.rows;
  } catch (error) {
    console.error('Get demands by district error:', error);
    throw error;
  }
}

// Get total demand by rice type and district
export async function getTotalDemandByRiceTypeAndDistrict(
  riceTypeId: string,
  district: string
) {
  try {
    const result = await query(
      `SELECT COALESCE(SUM(quantity_kg), 0) as total_demand
       FROM demands
       WHERE rice_type_id = $1 AND district = $2`,
      [riceTypeId, district]
    );

    return Number(result.rows[0].total_demand);
  } catch (error) {
    console.error('Get total demand error:', error);
    throw error;
  }
}
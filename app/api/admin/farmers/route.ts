import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { query } from '@/lib/db/connection';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request);
    
    if (!authContext) {
      return errorResponse('Unauthorized', 401);
    }

    const result = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.district,
        u.created_at,
        COUNT(p.id) as production_count,
        COALESCE(SUM(p.quantity_kg), 0) as total_quantity
      FROM users u
      LEFT JOIN productions p ON u.id = p.farmer_id
      WHERE u.role = 'farmer'
      GROUP BY u.id, u.name, u.email, u.phone, u.district, u.created_at
      ORDER BY u.created_at DESC
    `);

    return successResponse(result.rows);
  } catch (error) {
    console.error('Fetch farmers error:', error);
    return errorResponse('Internal server error', 500);
  }
}

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
        p.id,
        p.quantity_kg,
        p.production_date,
        p.notes,
        p.district,
        rt.name as rice_type_name,
        s.name as season_name,
        u.name as farmer_name
      FROM productions p
      LEFT JOIN rice_types rt ON p.rice_type_id = rt.id
      LEFT JOIN seasons s ON p.season_id = s.id
      LEFT JOIN users u ON p.farmer_id = u.id
      ORDER BY p.production_date DESC, p.created_at DESC
    `);

    return successResponse(result.rows);
  } catch (error) {
    console.error('Fetch productions error:', error);
    return errorResponse('Internal server error', 500);
  }
}

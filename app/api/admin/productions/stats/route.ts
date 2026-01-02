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

    // Get overall stats
    const overallStats = await query(`
      SELECT 
        COALESCE(SUM(quantity_kg), 0) as total_quantity,
        COUNT(*) as total_productions,
        COUNT(DISTINCT farmer_id) as total_farmers
      FROM productions
    `);

    // Get stats by season
    const seasonStats = await query(`
      SELECT 
        s.name as season_name,
        COALESCE(SUM(p.quantity_kg), 0) as total
      FROM productions p
      LEFT JOIN seasons s ON p.season_id = s.id
      GROUP BY s.name
      ORDER BY total DESC
    `);

    // Get stats by district
    const districtStats = await query(`
      SELECT 
        district,
        COALESCE(SUM(quantity_kg), 0) as total
      FROM productions
      WHERE district IS NOT NULL
      GROUP BY district
      ORDER BY total DESC
    `);

    return successResponse({
      total_quantity: parseFloat(overallStats.rows[0]?.total_quantity || 0),
      total_productions: parseInt(overallStats.rows[0]?.total_productions || 0),
      total_farmers: parseInt(overallStats.rows[0]?.total_farmers || 0),
      by_season: seasonStats.rows,
      by_district: districtStats.rows,
    });
  } catch (error) {
    console.error('Fetch production stats error:', error);
    return errorResponse('Internal server error', 500);
  }
}

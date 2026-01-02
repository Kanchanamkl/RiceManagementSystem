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

    // Overview stats
    const overview = await query(`
      SELECT 
        COALESCE(SUM(quantity_kg), 0) as total_production,
        COUNT(DISTINCT farmer_id) as total_farmers,
        COUNT(*) as total_records,
        COUNT(DISTINCT district) as active_districts
      FROM productions
    `);

    // Production by season
    const bySeason = await query(`
      SELECT 
        s.name as season_name,
        COALESCE(SUM(p.quantity_kg), 0) as total,
        COUNT(p.id) as count
      FROM seasons s
      LEFT JOIN productions p ON s.id = p.season_id
      GROUP BY s.name
      ORDER BY total DESC
    `);

    // Production by district
    const byDistrict = await query(`
      SELECT 
        district,
        COALESCE(SUM(quantity_kg), 0) as total,
        COUNT(id) as count,
        COUNT(DISTINCT farmer_id) as farmer_count
      FROM productions
      WHERE district IS NOT NULL
      GROUP BY district
      ORDER BY total DESC
    `);

    // Production by rice type
    const byRiceType = await query(`
      SELECT 
        rt.name as rice_type,
        COALESCE(SUM(p.quantity_kg), 0) as total,
        COUNT(p.id) as count
      FROM rice_types rt
      LEFT JOIN productions p ON rt.id = p.rice_type_id
      GROUP BY rt.name
      ORDER BY total DESC
    `);

    // Monthly trend (last 12 months)
    const monthlyTrend = await query(`
      SELECT 
        TO_CHAR(production_date, 'YYYY-MM') as month,
        COALESCE(SUM(quantity_kg), 0) as total,
        COUNT(*) as count
      FROM productions
      WHERE production_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(production_date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `);

    // Top farmers
    const topFarmers = await query(`
      SELECT 
        u.name as farmer_name,
        u.district,
        COALESCE(SUM(p.quantity_kg), 0) as total,
        COUNT(p.id) as count
      FROM users u
      LEFT JOIN productions p ON u.id = p.farmer_id
      WHERE u.role = 'farmer'
      GROUP BY u.name, u.district
      HAVING COUNT(p.id) > 0
      ORDER BY total DESC
      LIMIT 10
    `);

    return successResponse({
      overview: overview.rows[0],
      by_season: bySeason.rows,
      by_district: byDistrict.rows,
      by_rice_type: byRiceType.rows,
      monthly_trend: monthlyTrend.rows,
      top_farmers: topFarmers.rows,
    });
  } catch (error) {
    console.error('Fetch analytics error:', error);
    return errorResponse('Internal server error', 500);
  }
}

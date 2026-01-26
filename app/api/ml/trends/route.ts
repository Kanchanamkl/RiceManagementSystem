import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';

export async function POST(request: NextRequest) {
  try {
    const { district, rice_type } = await request.json();

    if (!district || !rice_type) {
      return NextResponse.json(
        { success: false, error: 'District and rice type required' },
        { status: 400 }
      );
    }

    const result = await query(`
      SELECT 
        s.name as season,
        EXTRACT(YEAR FROM s.start_date) as year,
        AVG(p.quantity_kg) as avg_production,
        COUNT(*) as sample_count
      FROM productions p
      JOIN rice_types rt ON p.rice_type_id = rt.id
      JOIN seasons s ON p.season_id = s.id
      WHERE p.district = $1 AND rt.name = $2
      GROUP BY s.name, s.start_date
      ORDER BY s.start_date DESC
      LIMIT 10
    `, [district, rice_type]);

    return NextResponse.json({
      success: true,
      trends: result.rows
    });
  } catch (error: any) {
    console.error('Trends API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}

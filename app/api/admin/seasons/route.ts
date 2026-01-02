import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { query } from '@/lib/db/connection';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request);
    
    if (!authContext) {
      return errorResponse('Unauthorized', 401);
    }

    const { name, start_date, end_date } = await request.json();

    if (!name || !start_date || !end_date) {
      return errorResponse('Name, start date, and end date are required', 400);
    }

    const result = await query(
      'INSERT INTO seasons (name, start_date, end_date) VALUES ($1, $2, $3) RETURNING *',
      [name, start_date, end_date]
    );

    return successResponse(result.rows[0], 'Season created successfully');
  } catch (error) {
    console.error('Create season error:', error);
    return errorResponse('Internal server error', 500);
  }
}

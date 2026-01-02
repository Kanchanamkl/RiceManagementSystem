import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { query } from '@/lib/db/connection';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      'UPDATE seasons SET name = $1, start_date = $2, end_date = $3 WHERE id = $4 RETURNING *',
      [name, start_date, end_date, params.id]
    );

    if (result.rows.length === 0) {
      return errorResponse('Season not found', 404);
    }

    return successResponse(result.rows[0], 'Season updated successfully');
  } catch (error) {
    console.error('Update season error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authContext = await requireAdmin(request);
    
    if (!authContext) {
      return errorResponse('Unauthorized', 401);
    }

    await query('DELETE FROM seasons WHERE id = $1', [params.id]);

    return successResponse(null, 'Season deleted successfully');
  } catch (error) {
    console.error('Delete season error:', error);
    return errorResponse('Internal server error', 500);
  }
}

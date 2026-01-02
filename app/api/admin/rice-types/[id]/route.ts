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

    const { name, description } = await request.json();

    if (!name) {
      return errorResponse('Name is required', 400);
    }

    const result = await query(
      'UPDATE rice_types SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description || null, params.id]
    );

    if (result.rows.length === 0) {
      return errorResponse('Rice type not found', 404);
    }

    return successResponse(result.rows[0], 'Rice type updated successfully');
  } catch (error) {
    console.error('Update rice type error:', error);
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

    await query('DELETE FROM rice_types WHERE id = $1', [params.id]);

    return successResponse(null, 'Rice type deleted successfully');
  } catch (error) {
    console.error('Delete rice type error:', error);
    return errorResponse('Internal server error', 500);
  }
}

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

    const { name, description } = await request.json();

    if (!name) {
      return errorResponse('Name is required', 400);
    }

    const result = await query(
      'INSERT INTO rice_types (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );

    return successResponse(result.rows[0], 'Rice type created successfully');
  } catch (error) {
    console.error('Create rice type error:', error);
    return errorResponse('Internal server error', 500);
  }
}

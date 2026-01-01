import { NextRequest } from 'next/server';
import { getRiceTypes } from '@/lib/db/references';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const riceTypes = await getRiceTypes();
    return successResponse(riceTypes);
  } catch (error) {
    console.error('Get rice types error:', error);
    return errorResponse('Internal server error', 500);
  }
}

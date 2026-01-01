import { NextRequest } from 'next/server';
import { getSeasons } from '@/lib/db/references';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const seasons = await getSeasons();
    return successResponse(seasons);
  } catch (error) {
    console.error('Get seasons error:', error);
    return errorResponse('Internal server error', 500);
  }
}

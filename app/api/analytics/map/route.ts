import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { getMapData } from '@/lib/db/analytics';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const mapData = await getMapData();

    return successResponse(mapData);

  } catch (error) {
    console.error('Get map data error:', error);
    return errorResponse('Internal server error', 500);
  }
}

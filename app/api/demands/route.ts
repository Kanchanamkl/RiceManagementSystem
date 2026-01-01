import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { getAllDemands } from '@/lib/db/demands';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const demands = await getAllDemands();

    return successResponse(demands);

  } catch (error) {
    console.error('Get demands error:', error);
    return errorResponse('Internal server error', 500);
  }
}

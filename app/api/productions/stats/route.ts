
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { getProductionStats } from '@/lib/db/productions';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const stats = await getProductionStats(
      context.user.id,
      context.user.role
    );

    return successResponse(stats);

  } catch (error) {
    console.error('Get production stats error:', error);
    return errorResponse('Internal server error', 500);
  }
}


import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { getAllProductions } from '@/lib/db/productions';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const productions = await getAllProductions(
      context.user.id,
      context.user.role
    );

    return successResponse(productions);

  } catch (error) {
    console.error('Get productions error:', error);
    return errorResponse('Internal server error', 500);
  }
}

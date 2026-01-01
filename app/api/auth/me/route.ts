import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    return successResponse({ user: context.user });

  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Internal server error', 500);
  }
}

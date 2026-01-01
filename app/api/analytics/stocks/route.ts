import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { getStocksSummary } from '@/lib/db/analytics';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district') || undefined;
    const rice_type_id = searchParams.get('rice_type_id') || undefined;

    const stocks = await getStocksSummary({
      district,
      rice_type_id,
    });

    return successResponse(stocks);

  } catch (error) {
    console.error('Get stocks error:', error);
    return errorResponse('Internal server error', 500);
  }
}

import { NextRequest } from 'next/server';
import { getDistricts } from '@/lib/db/references';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const districts = await getDistricts();
    return successResponse(districts);
  } catch (error) {
    console.error('Get districts error:', error);
    return errorResponse('Internal server error', 500);
  }
}

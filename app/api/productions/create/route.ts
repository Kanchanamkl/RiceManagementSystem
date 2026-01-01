
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { createProduction } from '@/lib/db/productions';
import { successResponse, unauthorizedResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const body = await request.json();
    const { rice_type_id, season_id, district, quantity_kg, production_date, notes } = body;

    // Validate input
    const errors: Record<string, string[]> = {};
    
    if (!rice_type_id) errors.rice_type_id = ['Rice type is required'];
    if (!season_id) errors.season_id = ['Season is required'];
    if (!district) errors.district = ['District is required'];
    if (!quantity_kg) errors.quantity_kg = ['Quantity is required'];
    if (quantity_kg && quantity_kg <= 0) errors.quantity_kg = ['Quantity must be greater than 0'];
    if (!production_date) errors.production_date = ['Production date is required'];

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors);
    }

    // Create production
    const production = await createProduction({
      farmer_id: context.user.id,
      rice_type_id,
      season_id,
      district,
      quantity_kg: Number(quantity_kg),
      production_date,
      notes,
    });

    return successResponse({
      production,
      message: 'Production record created successfully',
    }, 201);

  } catch (error) {
    console.error('Create production error:', error);
    return errorResponse('Internal server error', 500);
  }
}

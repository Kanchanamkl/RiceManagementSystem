import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { createDemand } from '@/lib/db/demands';
import { successResponse, forbiddenResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const context = await requireAdmin(request);

    if (!context) {
      return forbiddenResponse('Only admins can create demand records');
    }

    const body = await request.json();
    const { rice_type_id, district, quantity_kg, demand_date, notes } = body;

    // Validate input
    const errors: Record<string, string[]> = {};
    
    if (!rice_type_id) errors.rice_type_id = ['Rice type is required'];
    if (!district) errors.district = ['District is required'];
    if (!quantity_kg) errors.quantity_kg = ['Quantity is required'];
    if (quantity_kg && quantity_kg <= 0) errors.quantity_kg = ['Quantity must be greater than 0'];
    if (!demand_date) errors.demand_date = ['Demand date is required'];

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors);
    }

    // Create demand
    const demand = await createDemand({
      rice_type_id,
      district,
      quantity_kg: Number(quantity_kg),
      demand_date,
      notes,
      created_by: context.user.id,
    });

    return successResponse({
      demand,
      message: 'Demand record created successfully',
    }, 201);

  } catch (error) {
    console.error('Create demand error:', error);
    return errorResponse('Internal server error', 500);
  }
}

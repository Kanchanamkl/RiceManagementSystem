import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { getAllDemands, createDemand } from '@/lib/db/demands';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse } from '@/lib/api/response';

// GET all demands
export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const demands = await getAllDemands(
      context.user.id,
      context.user.role,
      context.user.district
    );

    return successResponse(demands);
  } catch (error) {
    console.error('Get demands error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// POST create new demand (Admin only)
export async function POST(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    // Check if admin
    if (context.user.role !== 'admin') {
      return forbiddenResponse('Only administrators can create demand records');
    }

    const body = await request.json();
    const { rice_type_id, district, quantity_kg, demand_date, notes } = body;

    // Validation
    if (!rice_type_id || !district || !quantity_kg || !demand_date) {
      return errorResponse('Missing required fields: rice_type_id, district, quantity_kg, demand_date', 400);
    }

    if (quantity_kg <= 0) {
      return errorResponse('Quantity must be greater than 0', 400);
    }

    const demand = await createDemand({
      rice_type_id,
      district,
      quantity_kg: Number(quantity_kg),
      demand_date,
      notes,
      created_by: context.user.id
    });

    return successResponse({
      demand,
      message: 'Demand record created successfully',
    });
  } catch (error) {
    console.error('Create demand error:', error);
    return errorResponse('Internal server error', 500);
  }
}
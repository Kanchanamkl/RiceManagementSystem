import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { getDemandById, updateDemand, deleteDemand } from '@/lib/db/demands';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse, notFoundResponse } from '@/lib/api/response';

// GET single demand
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const demand = await getDemandById(params.id);

    if (!demand) {
      return notFoundResponse('Demand record not found');
    }

    return successResponse(demand);
  } catch (error) {
    console.error('Get demand error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// PUT update demand (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    if (context.user.role !== 'admin') {
      return forbiddenResponse('Only administrators can update demand records');
    }

    const demand = await getDemandById(params.id);
    if (!demand) {
      return notFoundResponse('Demand record not found');
    }

    const body = await request.json();
    const { rice_type_id, district, quantity_kg, demand_date, notes } = body;

    // Validation
    if (quantity_kg !== undefined && quantity_kg <= 0) {
      return errorResponse('Quantity must be greater than 0', 400);
    }

    const updatedDemand = await updateDemand(params.id, {
      rice_type_id,
      district,
      quantity_kg: quantity_kg ? Number(quantity_kg) : undefined,
      demand_date,
      notes
    });

    return successResponse(updatedDemand, 'Demand record updated successfully');
  } catch (error) {
    console.error('Update demand error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE demand (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    if (context.user.role !== 'admin') {
      return forbiddenResponse('Only administrators can delete demand records');
    }

    const demand = await getDemandById(params.id);
    if (!demand) {
      return notFoundResponse('Demand record not found');
    }

    await deleteDemand(params.id);

    return successResponse(null, 'Demand record deleted successfully');
  } catch (error) {
    console.error('Delete demand error:', error);
    return errorResponse('Internal server error', 500);
  }
}
import { NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/api/auth';
import { getDemandById, updateDemand, deleteDemand } from '@/lib/db/demands';
import { 
  successResponse, 
  unauthorizedResponse, 
  errorResponse, 
  notFoundResponse,
  forbiddenResponse,
  validationErrorResponse 
} from '@/lib/api/response';

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
      return notFoundResponse('Demand not found');
    }

    return successResponse(demand);

  } catch (error) {
    console.error('Get demand error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAdmin(request);

    if (!context) {
      return forbiddenResponse('Only admins can update demand records');
    }

    const demand = await getDemandById(params.id);

    if (!demand) {
      return notFoundResponse('Demand not found');
    }

    const body = await request.json();
    const { rice_type_id, district, quantity_kg, demand_date, notes } = body;

    // Validate input
    const errors: Record<string, string[]> = {};
    
    if (quantity_kg !== undefined && quantity_kg <= 0) {
      errors.quantity_kg = ['Quantity must be greater than 0'];
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors);
    }

    // Build updates object
    const updates: any = {};
    if (rice_type_id !== undefined) updates.rice_type_id = rice_type_id;
    if (district !== undefined) updates.district = district;
    if (quantity_kg !== undefined) updates.quantity_kg = Number(quantity_kg);
    if (demand_date !== undefined) updates.demand_date = demand_date;
    if (notes !== undefined) updates.notes = notes;

    const updatedDemand = await updateDemand(params.id, updates);

    return successResponse({
      demand: updatedDemand,
      message: 'Demand updated successfully',
    });

  } catch (error) {
    console.error('Update demand error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAdmin(request);

    if (!context) {
      return forbiddenResponse('Only admins can delete demand records');
    }

    const demand = await getDemandById(params.id);

    if (!demand) {
      return notFoundResponse('Demand not found');
    }

    await deleteDemand(params.id);

    return successResponse({
      message: 'Demand deleted successfully',
    });

  } catch (error) {
    console.error('Delete demand error:', error);
    return errorResponse('Internal server error', 500);
  }
}

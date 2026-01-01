
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { getProductionById, updateProduction, deleteProduction } from '@/lib/db/productions';
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

    const production = await getProductionById(params.id);

    if (!production) {
      return notFoundResponse('Production not found');
    }

    // Check ownership for farmers
    if (context.user.role === 'farmer' && production.farmer_id !== context.user.id) {
      return forbiddenResponse('You do not have permission to view this production');
    }

    return successResponse(production);

  } catch (error) {
    console.error('Get production error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const production = await getProductionById(params.id);

    if (!production) {
      return notFoundResponse('Production not found');
    }

    // Check ownership for farmers
    if (context.user.role === 'farmer' && production.farmer_id !== context.user.id) {
      return forbiddenResponse('You do not have permission to update this production');
    }

    const body = await request.json();
    const { rice_type_id, season_id, district, quantity_kg, production_date, notes } = body;

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
    if (season_id !== undefined) updates.season_id = season_id;
    if (district !== undefined) updates.district = district;
    if (quantity_kg !== undefined) updates.quantity_kg = Number(quantity_kg);
    if (production_date !== undefined) updates.production_date = production_date;
    if (notes !== undefined) updates.notes = notes;

    const updatedProduction = await updateProduction(params.id, updates);

    return successResponse({
      production: updatedProduction,
      message: 'Production updated successfully',
    });

  } catch (error) {
    console.error('Update production error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const production = await getProductionById(params.id);

    if (!production) {
      return notFoundResponse('Production not found');
    }

    // Check ownership for farmers
    if (context.user.role === 'farmer' && production.farmer_id !== context.user.id) {
      return forbiddenResponse('You do not have permission to delete this production');
    }

    await deleteProduction(params.id);

    return successResponse({
      message: 'Production deleted successfully',
    });

  } catch (error) {
    console.error('Delete production error:', error);
    return errorResponse('Internal server error', 500);
  }
}

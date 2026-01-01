import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { updateUserProfile } from '@/lib/db/users';
import { successResponse, unauthorizedResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';

export async function PUT(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const body = await request.json();
    const { name, district, phone } = body;

    // Validate input
    const errors: Record<string, string[]> = {};
    
    if (name !== undefined && !name) errors.name = ['Name cannot be empty'];
    if (context.user.role === 'farmer' && district !== undefined && !district) {
      errors.district = ['District is required for farmers'];
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors);
    }

    // Update profile
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (district !== undefined) updates.district = district;
    if (phone !== undefined) updates.phone = phone;

    const updatedProfile = await updateUserProfile(context.user.id, updates);

    return successResponse({
      user: updatedProfile,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Internal server error', 500);
  }
}

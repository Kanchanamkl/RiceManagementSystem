import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createUserProfile } from '@/lib/db/users';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, district, phone } = body;

    // Validate input
    const errors: Record<string, string[]> = {};
    
    if (!email) errors.email = ['Email is required'];
    if (!password) errors.password = ['Password is required'];
    if (password && password.length < 6) errors.password = ['Password must be at least 6 characters'];
    if (!name) errors.name = ['Name is required'];
    if (!role) errors.role = ['Role is required'];
    if (!['admin', 'farmer'].includes(role)) errors.role = ['Role must be admin or farmer'];
    if (role === 'farmer' && !district) errors.district = ['District is required for farmers'];

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors);
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return errorResponse('Email already exists', 409);
      }
      return errorResponse(authError.message, 400);
    }

    if (!authData.user) {
      return errorResponse('Failed to create user', 500);
    }

    // Create user profile
    try {
      const userProfile = await createUserProfile(authData.user.id, {
        email,
        name,
        role,
        district: role === 'farmer' ? district : undefined,
        phone,
      });

      return successResponse({
        user: userProfile,
        message: 'Registration successful',
      }, 201);

    } catch (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Internal server error', 500);
  }
}

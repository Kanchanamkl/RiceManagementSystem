
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getUserProfile } from '@/lib/db/users';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return errorResponse('Invalid email or password', 401);
    }

    if (!authData.user) {
      return errorResponse('Authentication failed', 401);
    }

    // Get user profile
    const userProfile = await getUserProfile(authData.user.id);

    if (!userProfile) {
      return errorResponse('User profile not found', 404);
    }

    return successResponse({
      user: userProfile,
      session: authData.session,
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}

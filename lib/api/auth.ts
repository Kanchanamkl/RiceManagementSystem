import { getUserProfile, UserProfile } from '@/lib/db/users';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export interface AuthContext {
  user: UserProfile;
}

export async function requireAuth(request: NextRequest): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return null;
  }

  try {
    // Parse session data from cookie
    const sessionData = JSON.parse(sessionCookie.value);
    const userId = sessionData.userId;
    
    if (!userId) {
      return null;
    }

    const userProfile = await getUserProfile(userId);
    
    if (!userProfile) {
      return null;
    }

    return {
      user: userProfile,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function requireAdmin(request: NextRequest): Promise<AuthContext | null> {
  const context = await requireAuth(request);
  
  if (!context || context.user.role !== 'admin') {
    return null;
  }

  return context;
}

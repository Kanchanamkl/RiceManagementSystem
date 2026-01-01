
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUserProfile, UserProfile } from '@/lib/db/users';
import { NextRequest } from 'next/server';

export interface AuthContext {
  user: UserProfile;
  supabase: ReturnType<typeof createServerSupabaseClient>;
}

export async function requireAuth(request: NextRequest): Promise<AuthContext | null> {
  const supabase = createServerSupabaseClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }

  const userProfile = await getUserProfile(session.user.id);
  
  if (!userProfile) {
    return null;
  }

  return {
    user: userProfile,
    supabase,
  };
}

export async function requireAdmin(request: NextRequest): Promise<AuthContext | null> {
  const context = await requireAuth(request);
  
  if (!context || context.user.role !== 'admin') {
    return null;
  }

  return context;
}

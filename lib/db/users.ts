
import { supabaseAdmin } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'farmer';
  district?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export async function createUserProfile(userId: string, data: {
  email: string;
  name: string;
  role: 'admin' | 'farmer';
  district?: string;
  phone?: string;
}) {
  const { data: profile, error } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      email: data.email,
      name: data.name,
      role: data.role,
      district: data.district,
      phone: data.phone,
    })
    .select()
    .single();

  if (error) throw error;
  return profile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteUser(userId: string) {
  // Delete from auth.users (will cascade to public.users)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}

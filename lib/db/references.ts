import { supabaseAdmin } from '@/lib/supabase/client';

export async function getRiceTypes() {
  const { data, error } = await supabaseAdmin
    .from('rice_types')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getDistricts() {
  const { data, error } = await supabaseAdmin
    .from('districts')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getSeasons() {
  const { data, error } = await supabaseAdmin
    .from('seasons')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

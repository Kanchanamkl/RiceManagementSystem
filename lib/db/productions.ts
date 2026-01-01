
import { supabaseAdmin } from '@/lib/supabase/client';

export interface ProductionRecord {
  id: string;
  farmer_id: string;
  rice_type_id: string;
  season_id: string;
  district: string;
  quantity_kg: number;
  production_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  rice_type_name?: string;
  season_name?: string;
  farmer_name?: string;
}

export async function getAllProductions(userId?: string, role?: string) {
  let query = supabaseAdmin
    .from('productions')
    .select(`
      *,
      rice_types:rice_type_id(id, name, category),
      seasons:season_id(id, name),
      users:farmer_id(id, name, email)
    `)
    .order('production_date', { ascending: false });

  // If farmer, only show their productions
  if (role === 'farmer' && userId) {
    query = query.eq('farmer_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform joined data
  return (data || []).map(prod => ({
    id: prod.id,
    farmer_id: prod.farmer_id,
    rice_type_id: prod.rice_type_id,
    season_id: prod.season_id,
    district: prod.district,
    quantity_kg: prod.quantity_kg,
    production_date: prod.production_date,
    notes: prod.notes,
    created_at: prod.created_at,
    updated_at: prod.updated_at,
    rice_type_name: prod.rice_types?.name,
    season_name: prod.seasons?.name,
    farmer_name: prod.users?.name,
  }));
}

export async function getProductionById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('productions')
    .select(`
      *,
      rice_types:rice_type_id(id, name, category),
      seasons:season_id(id, name),
      users:farmer_id(id, name, email)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    farmer_id: data.farmer_id,
    rice_type_id: data.rice_type_id,
    season_id: data.season_id,
    district: data.district,
    quantity_kg: data.quantity_kg,
    production_date: data.production_date,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
    rice_type_name: data.rice_types?.name,
    season_name: data.seasons?.name,
    farmer_name: data.users?.name,
  };
}

export async function createProduction(data: {
  farmer_id: string;
  rice_type_id: string;
  season_id: string;
  district: string;
  quantity_kg: number;
  production_date: string;
  notes?: string;
}) {
  const { data: production, error } = await supabaseAdmin
    .from('productions')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return production;
}

export async function updateProduction(id: string, updates: Partial<ProductionRecord>) {
  const { data, error } = await supabaseAdmin
    .from('productions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduction(id: string) {
  const { error } = await supabaseAdmin
    .from('productions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getProductionStats(userId?: string, role?: string) {
  let query = supabaseAdmin
    .from('productions')
    .select('quantity_kg, season_id, seasons:season_id(name)');

  if (role === 'farmer' && userId) {
    query = query.eq('farmer_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const total = (data || []).reduce((sum, p) => sum + Number(p.quantity_kg), 0);
  
  const bySeason: Record<string, number> = {};
  (data || []).forEach(p => {
    const seasonName = p.seasons?.name || 'Unknown';
    bySeason[seasonName] = (bySeason[seasonName] || 0) + Number(p.quantity_kg);
  });

  return {
    total,
    count: data?.length || 0,
    bySeason,
  };
}

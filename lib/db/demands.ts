
import { supabaseAdmin } from '@/lib/supabase/client';

export interface DemandRecord {
  id: string;
  rice_type_id: string;
  district: string;
  quantity_kg: number;
  demand_date: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  rice_type_name?: string;
  creator_name?: string;
}

export async function getAllDemands() {
  const { data, error } = await supabaseAdmin
    .from('demands')
    .select(`
      *,
      rice_types:rice_type_id(id, name, category),
      users:created_by(id, name)
    `)
    .order('demand_date', { ascending: false });

  if (error) throw error;

  return (data || []).map(demand => ({
    id: demand.id,
    rice_type_id: demand.rice_type_id,
    district: demand.district,
    quantity_kg: demand.quantity_kg,
    demand_date: demand.demand_date,
    notes: demand.notes,
    created_by: demand.created_by,
    created_at: demand.created_at,
    updated_at: demand.updated_at,
    rice_type_name: demand.rice_types?.name,
    creator_name: demand.users?.name,
  }));
}

export async function getDemandById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('demands')
    .select(`
      *,
      rice_types:rice_type_id(id, name, category),
      users:created_by(id, name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    rice_type_id: data.rice_type_id,
    district: data.district,
    quantity_kg: data.quantity_kg,
    demand_date: data.demand_date,
    notes: data.notes,
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    rice_type_name: data.rice_types?.name,
    creator_name: data.users?.name,
  };
}

export async function createDemand(data: {
  rice_type_id: string;
  district: string;
  quantity_kg: number;
  demand_date: string;
  notes?: string;
  created_by: string;
}) {
  const { data: demand, error } = await supabaseAdmin
    .from('demands')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return demand;
}

export async function updateDemand(id: string, updates: Partial<DemandRecord>) {
  const { data, error } = await supabaseAdmin
    .from('demands')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDemand(id: string) {
  const { error } = await supabaseAdmin
    .from('demands')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

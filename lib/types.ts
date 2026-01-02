export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'farmer';
  district?: string;
  phone?: string;
  created_at?: string;
}

export interface RiceType {
  id: number;
  name: string;
  category: 'White' | 'Red';
  description?: string;
}

export interface District {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  is_paddy_area: boolean;
}

export interface Season {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  type: 'Maha' | 'Yala';
}

export interface Production {
  id: number;
  farmer_id: number;
  rice_type_id: number;
  rice_type_name?: string; // Joined data
  season_id: number; // ✅ Added
  season?: string; // For backward compatibility with mock data
  season_name?: string; // Joined data
  district: string;
  quantity_kg: number;
  production_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Demand {
  id: number;
  rice_type_id: number;
  rice_type_name?: string;
  district: string;
  quantity_kg: number;
  demand_date: string;
  created_at?: string;
}

export interface Stock {
  district: string;
  rice_type_id: number;
  rice_type_name: string;
  production: number;
  demand: number;
  balance: number;
  status: 'surplus' | 'deficit' | 'balanced';
}
export interface User {
    id: number;
    email: string;
    password?: string;
    name: string;
    role: 'admin' | 'farmer';
    district: string;
    phone: string;
  }
  
  export interface RiceType {
    id: number;
    name: string;
    category: 'White' | 'Red';
    description: string;
  }
  
  export interface District {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    is_paddy_area: boolean;
  }
  
  export interface Production {
    id: number;
    farmer_id: number;
    farmer_name: string;
    rice_type_id: number;
    rice_type_name: string;
    season: string;
    district: string;
    quantity_kg: number;
    production_date: string;
    notes?: string;
    created_at: string;
  }
  
  export interface Demand {
    id: number;
    rice_type_id: number;
    rice_type_name: string;
    district: string;
    quantity_kg: number;
    demand_date: string;
  }
  
  export interface StockData {
    district: string;
    riceType: string;
    production: number;
    demand: number;
    remaining: number;
    status: 'surplus' | 'deficit' | 'balanced';
  }
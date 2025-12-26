import { User, RiceType, District, Production, Demand } from './types';

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@rice.lk',
    password: 'password123',
    name: 'Admin User',
    role: 'admin',
    district: 'Colombo',
    phone: '0771234567'
  },
  {
    id: 2,
    email: 'farmer1@rice.lk',
    password: 'password123',
    name: 'Sunil Perera',
    role: 'farmer',
    district: 'Anuradhapura',
    phone: '0712345678'
  },
  {
    id: 3,
    email: 'farmer2@rice.lk',
    password: 'password123',
    name: 'Nimal Silva',
    role: 'farmer',
    district: 'Polonnaruwa',
    phone: '0723456789'
  }
];

export const mockRiceTypes: RiceType[] = [
  { id: 1, name: 'Basmati', category: 'White', description: 'Long grain aromatic rice' },
  { id: 2, name: 'Samba', category: 'Red', description: 'Traditional Sri Lankan red rice' },
  { id: 3, name: 'Nadu', category: 'White', description: 'Medium grain white rice' },
  { id: 4, name: 'Keeri Samba', category: 'Red', description: 'Premium short grain red rice' },
  { id: 5, name: 'Kalu Heenati', category: 'Red', description: 'Traditional black rice variety' }
];

export const mockDistricts: District[] = [
  { id: 1, name: 'Ampara', latitude: 7.2914, longitude: 81.6747, is_paddy_area: true },
  { id: 2, name: 'Anuradhapura', latitude: 8.3114, longitude: 80.4037, is_paddy_area: true },
  { id: 3, name: 'Polonnaruwa', latitude: 7.9403, longitude: 81.0188, is_paddy_area: true },
  { id: 4, name: 'Kurunegala', latitude: 7.4863, longitude: 80.3623, is_paddy_area: true },
  { id: 5, name: 'Hambantota', latitude: 6.1429, longitude: 81.1212, is_paddy_area: true },
  { id: 6, name: 'Batticaloa', latitude: 7.7310, longitude: 81.6747, is_paddy_area: true },
  { id: 7, name: 'Puttalam', latitude: 8.0362, longitude: 79.8283, is_paddy_area: true },
  { id: 8, name: 'Matara', latitude: 5.9549, longitude: 80.5550, is_paddy_area: true },
  { id: 9, name: 'Badulla', latitude: 6.9934, longitude: 81.0550, is_paddy_area: true },
  { id: 10, name: 'Gampaha', latitude: 7.0840, longitude: 80.0098, is_paddy_area: true }
];

export const initialProductions: Production[] = [
  {
    id: 1,
    farmer_id: 2,
    farmer_name: 'Sunil Perera',
    rice_type_id: 1,
    rice_type_name: 'Basmati',
    season: 'Maha 2024/25',
    district: 'Anuradhapura',
    quantity_kg: 5000,
    production_date: '2024-12-01',
    notes: 'Good harvest',
    created_at: '2024-12-01'
  },
  {
    id: 2,
    farmer_id: 2,
    farmer_name: 'Sunil Perera',
    rice_type_id: 2,
    rice_type_name: 'Samba',
    season: 'Maha 2024/25',
    district: 'Anuradhapura',
    quantity_kg: 3000,
    production_date: '2024-12-05',
    notes: 'Traditional variety',
    created_at: '2024-12-05'
  },
  {
    id: 3,
    farmer_id: 3,
    farmer_name: 'Nimal Silva',
    rice_type_id: 3,
    rice_type_name: 'Nadu',
    season: 'Yala 2024',
    district: 'Polonnaruwa',
    quantity_kg: 4500,
    production_date: '2024-08-15',
    notes: 'Drought affected',
    created_at: '2024-08-15'
  },
  {
    id: 4,
    farmer_id: 3,
    farmer_name: 'Nimal Silva',
    rice_type_id: 1,
    rice_type_name: 'Basmati',
    season: 'Maha 2024/25',
    district: 'Polonnaruwa',
    quantity_kg: 6000,
    production_date: '2024-11-20',
    notes: 'Excellent yield',
    created_at: '2024-11-20'
  },
  {
    id: 5,
    farmer_id: 2,
    farmer_name: 'Sunil Perera',
    rice_type_id: 4,
    rice_type_name: 'Keeri Samba',
    season: 'Maha 2024/25',
    district: 'Anuradhapura',
    quantity_kg: 2500,
    production_date: '2024-12-10',
    notes: 'Premium quality',
    created_at: '2024-12-10'
  }
];

export const mockDemand: Demand[] = [
  { id: 1, rice_type_id: 1, rice_type_name: 'Basmati', district: 'Anuradhapura', quantity_kg: 8000, demand_date: '2024-12-01' },
  { id: 2, rice_type_id: 2, rice_type_name: 'Samba', district: 'Anuradhapura', quantity_kg: 4000, demand_date: '2024-12-01' },
  { id: 3, rice_type_id: 3, rice_type_name: 'Nadu', district: 'Polonnaruwa', quantity_kg: 7000, demand_date: '2024-12-01' },
  { id: 4, rice_type_id: 1, rice_type_name: 'Basmati', district: 'Polonnaruwa', quantity_kg: 5000, demand_date: '2024-12-01' },
  { id: 5, rice_type_id: 1, rice_type_name: 'Basmati', district: 'Kurunegala', quantity_kg: 6000, demand_date: '2024-12-01' },
  { id: 6, rice_type_id: 2, rice_type_name: 'Samba', district: 'Hambantota', quantity_kg: 3500, demand_date: '2024-12-01' },
  { id: 7, rice_type_id: 3, rice_type_name: 'Nadu', district: 'Batticaloa', quantity_kg: 4000, demand_date: '2024-12-01' },
  { id: 8, rice_type_id: 4, rice_type_name: 'Keeri Samba', district: 'Anuradhapura', quantity_kg: 3000, demand_date: '2024-12-01' }
];

export const seasons = [
  'Maha 2024/25',
  'Yala 2024',
  'Maha 2023/24',
  'Yala 2023'
];
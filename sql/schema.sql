
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'farmer')),
  district VARCHAR(100),
  phone VARCHAR(20),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rice types table
CREATE TABLE IF NOT EXISTS rice_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_paddy_area BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Productions table
CREATE TABLE IF NOT EXISTS productions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rice_type_id UUID NOT NULL REFERENCES rice_types(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  district VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(12, 2) NOT NULL,
  production_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Demands table
CREATE TABLE IF NOT EXISTS demands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rice_type_id UUID NOT NULL REFERENCES rice_types(id) ON DELETE CASCADE,
  district VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(12, 2) NOT NULL,
  demand_date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_productions_farmer ON productions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_productions_district ON productions(district);
CREATE INDEX IF NOT EXISTS idx_productions_date ON productions(production_date);
CREATE INDEX IF NOT EXISTS idx_demands_district ON demands(district);
CREATE INDEX IF NOT EXISTS idx_demands_date ON demands(demand_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

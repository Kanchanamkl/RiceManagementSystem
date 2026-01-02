
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'farmer')),
  district TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rice types table
CREATE TABLE public.rice_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('White Rice', 'Red Rice')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Districts table
CREATE TABLE public.districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_paddy_area BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seasons table
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.seasons 
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Productions table
CREATE TABLE public.productions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rice_type_id UUID NOT NULL REFERENCES public.rice_types(id) ON DELETE RESTRICT,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE RESTRICT,
  district TEXT NOT NULL,
  quantity_kg DECIMAL(12, 2) NOT NULL CHECK (quantity_kg >= 0),
  production_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demands table
CREATE TABLE public.demands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rice_type_id UUID NOT NULL REFERENCES public.rice_types(id) ON DELETE RESTRICT,
  district TEXT NOT NULL,
  quantity_kg DECIMAL(12, 2) NOT NULL CHECK (quantity_kg >= 0),
  demand_date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_productions_farmer ON public.productions(farmer_id);
CREATE INDEX idx_productions_rice_type ON public.productions(rice_type_id);
CREATE INDEX idx_productions_season ON public.productions(season_id);
CREATE INDEX idx_productions_district ON public.productions(district);
CREATE INDEX idx_productions_date ON public.productions(production_date);

CREATE INDEX idx_demands_rice_type ON public.demands(rice_type_id);
CREATE INDEX idx_demands_district ON public.demands(district);
CREATE INDEX idx_demands_date ON public.demands(demand_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productions_updated_at BEFORE UPDATE ON public.productions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demands_updated_at BEFORE UPDATE ON public.demands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rice_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demands ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Rice types policies (everyone can read)
CREATE POLICY "Anyone can view rice types" ON public.rice_types
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify rice types" ON public.rice_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Districts policies (everyone can read)
CREATE POLICY "Anyone can view districts" ON public.districts
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify districts" ON public.districts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Seasons policies (everyone can read)
CREATE POLICY "Anyone can view seasons" ON public.seasons
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify seasons" ON public.seasons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Productions policies
CREATE POLICY "Farmers can view their own productions" ON public.productions
  FOR SELECT USING (farmer_id = auth.uid());

CREATE POLICY "Admins can view all productions" ON public.productions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Farmers can create their own productions" ON public.productions
  FOR INSERT WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers can update their own productions" ON public.productions
  FOR UPDATE USING (farmer_id = auth.uid());

CREATE POLICY "Farmers can delete their own productions" ON public.productions
  FOR DELETE USING (farmer_id = auth.uid());

-- Demands policies
CREATE POLICY "Everyone can view demands" ON public.demands
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify demands" ON public.demands
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

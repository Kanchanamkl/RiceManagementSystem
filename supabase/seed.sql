
-- Insert rice types
INSERT INTO public.rice_types (name, category, description) VALUES
  ('Basmati', 'White Rice', 'Long grain aromatic rice'),
  ('Samba', 'White Rice', 'Medium grain rice popular in Sri Lanka'),
  ('Nadu', 'White Rice', 'Short grain rice'),
  ('Keeri Samba', 'White Rice', 'Small grain traditional rice'),
  ('Kalu Heenati', 'Red Rice', 'Traditional red rice variety');

-- Insert districts
INSERT INTO public.districts (name, latitude, longitude, is_paddy_area) VALUES
  ('Ampara', 7.2914, 81.6747, true),
  ('Anuradhapura', 8.3114, 80.4037, true),
  ('Polonnaruwa', 7.9403, 81.0188, true),
  ('Kurunegala', 7.4818, 80.3609, true),
  ('Hambantota', 6.1429, 81.1212, true),
  ('Batticaloa', 7.7310, 81.6747, true),
  ('Trincomalee', 8.5874, 81.2152, true),
  ('Matara', 5.9549, 80.5550, false),
  ('Galle', 6.0535, 80.2210, false),
  ('Colombo', 6.9271, 79.8612, false);

-- Insert seasons
INSERT INTO public.seasons (name, start_date, end_date, is_active) VALUES
  ('Maha 2024/25', '2024-10-01', '2025-03-31', true),
  ('Yala 2024', '2024-05-01', '2024-09-30', false),
  ('Maha 2023/24', '2023-10-01', '2024-03-31', false),
  ('Yala 2023', '2023-05-01', '2023-09-30', false);

-- Note: Users will be created through Supabase Auth during registration
-- Productions and demands will be created through the application

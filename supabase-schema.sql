-- Supabase Database Schema for Jus de Pomme Reservations
-- This script should be run in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create presences table
CREATE TABLE IF NOT EXISTS presences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create slots table
CREATE TABLE IF NOT EXISTS slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  presence_id UUID NOT NULL REFERENCES presences(id) ON DELETE CASCADE,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (presence_id, start_at)
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  comment TEXT,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slots_start_at ON slots(start_at);
CREATE INDEX IF NOT EXISTS idx_slots_presence_id ON slots(presence_id);
CREATE INDEX IF NOT EXISTS idx_reservations_token ON reservations(token);
CREATE INDEX IF NOT EXISTS idx_reservations_slot_id ON reservations(slot_id);
CREATE INDEX IF NOT EXISTS idx_presences_date ON presences(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_presences_updated_at ON presences;
CREATE TRIGGER update_presences_updated_at 
    BEFORE UPDATE ON presences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON reservations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Public read access for presences and slots (needed for public booking)
CREATE POLICY "Public can read presences" ON presences FOR SELECT USING (true);
CREATE POLICY "Public can read slots" ON slots FOR SELECT USING (true);

-- Public can insert reservations
CREATE POLICY "Public can insert reservations" ON reservations FOR INSERT WITH CHECK (true);

-- Public can read their own reservations using token
CREATE POLICY "Public can read own reservations" ON reservations 
  FOR SELECT USING (true); -- We'll handle access control in application layer

-- Public can update their own reservations using token
CREATE POLICY "Public can update own reservations" ON reservations 
  FOR UPDATE USING (true); -- We'll handle access control in application layer

-- Public can delete their own reservations using token
CREATE POLICY "Public can delete own reservations" ON reservations 
  FOR DELETE USING (true); -- We'll handle access control in application layer

-- Admin policies (for authenticated users with admin role)
-- Note: You'll need to set up authentication and roles in Supabase Auth
-- For now, we'll use service role key for admin operations

-- Grant necessary permissions to authenticated users
-- GRANT SELECT ON presences TO authenticated;
-- GRANT SELECT ON slots TO authenticated;
-- GRANT ALL ON reservations TO authenticated;
-- GRANT ALL ON presences TO authenticated;
-- GRANT ALL ON slots TO authenticated;

-- Sample data for testing (optional - remove in production)
/*
INSERT INTO presences (location, date, start_time, end_time) VALUES
('Place de la Mairie', '2024-10-01', '09:00', '12:00'),
('Rue de la Station', '2024-10-01', '14:00', '17:00'),
('Place de l''Église', '2024-10-02', '10:00', '13:00');
*/
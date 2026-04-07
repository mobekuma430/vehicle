-- SQL Schema for IVMS (Integrated Vehicle Management System)
-- Run this in your Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  region TEXT,
  branch TEXT,
  branch_phone TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  plate_number TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  region TEXT,
  branch TEXT,
  is_static BOOLEAN DEFAULT FALSE,
  assigned_to TEXT,
  maintenance_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES users(id),
  region TEXT,
  branch TEXT,
  department TEXT,
  purpose TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  destination TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  is_static BOOLEAN DEFAULT FALSE,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'PENDING_DIRECTORATE',
  directorate_approver_id TEXT REFERENCES users(id),
  directorate_approval_date TIMESTAMPTZ,
  vehicle_manager_approver_id TEXT REFERENCES users(id),
  vehicle_manager_approval_date TIMESTAMPTZ,
  assigned_vehicle_id TEXT REFERENCES vehicles(id),
  assigned_driver_id TEXT REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SMS Logs Table
CREATE TABLE IF NOT EXISTS sms_logs (
  id TEXT PRIMARY KEY,
  request_id TEXT REFERENCES requests(id),
  recipient_phone TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
-- For a simple setup, you can disable RLS or add policies.
-- Since we are using the Service Role Key on the backend, RLS is bypassed.
-- If you want to use the Anon Key on the frontend, you'll need policies.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow all access for now (for development)
-- In production, you should restrict this!
CREATE POLICY "Allow all access" ON users FOR ALL USING (true);
CREATE POLICY "Allow all access" ON vehicles FOR ALL USING (true);
CREATE POLICY "Allow all access" ON requests FOR ALL USING (true);
CREATE POLICY "Allow all access" ON sms_logs FOR ALL USING (true);

-- 5. Fuel Requests Table
CREATE TABLE IF NOT EXISTS fuel_requests (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL REFERENCES users(id),
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  amount NUMERIC NOT NULL,
  current_mileage NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_TEAM_LEADER',
  team_leader_approver_id TEXT REFERENCES users(id),
  directorate_approver_id TEXT REFERENCES users(id),
  vehicle_manager_approver_id TEXT REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'APP',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fuel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON fuel_requests FOR ALL USING (true);
CREATE POLICY "Allow all access" ON notifications FOR ALL USING (true);

-- 7. Regions Table
CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON regions FOR ALL USING (true);

-- 8. Enable Realtime for all tables
-- This allows the frontend to subscribe to changes in real-time.
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;

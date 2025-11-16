-- Provider Request System
-- Run this in Supabase SQL Editor after the main schema

-- ============================================
-- PROVIDER REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS provider_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  organization_type TEXT, -- 'gym', 'studio', 'venue', 'other'
  business_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  phone TEXT,
  website TEXT,
  reason TEXT NOT NULL, -- Why they should be onboarded
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin who reviewed
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One request per user
);

CREATE INDEX IF NOT EXISTS idx_provider_requests_user ON provider_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_requests_status ON provider_requests(status);
CREATE INDEX IF NOT EXISTS idx_provider_requests_created ON provider_requests(created_at DESC);

-- ============================================
-- RLS POLICIES FOR PROVIDER REQUESTS
-- ============================================
ALTER TABLE provider_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own provider requests" ON provider_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create provider requests" ON provider_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests (check role OR email)
CREATE POLICY "Admins can view all provider requests" ON provider_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.email = 'vinvadoothker@gmail.com')
    )
  );

-- Admins can update requests (approve/reject) - check role OR email
CREATE POLICY "Admins can update provider requests" ON provider_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.email = 'vinvadoothker@gmail.com')
    )
  );

-- ============================================
-- FUNCTION TO AUTO-APPROVE PROVIDER ROLE
-- ============================================
CREATE OR REPLACE FUNCTION approve_provider_request()
RETURNS TRIGGER AS $$
BEGIN
  -- When a request is approved, update user role to provider
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE profiles
    SET role = 'provider',
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Create or update provider record
    -- Check if provider already exists
    IF EXISTS (SELECT 1 FROM providers WHERE user_id = NEW.user_id) THEN
      -- Update existing provider
      UPDATE providers
      SET name = NEW.organization_name,
          address = NEW.business_address,
          city = NEW.city,
          state = NEW.state,
          country = NEW.country,
          phone = NEW.phone,
          email = NEW.email,
          website = NEW.website,
          updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSE
      -- Create new provider
      INSERT INTO providers (
        user_id,
        name,
        address,
        city,
        state,
        country,
        phone,
        email,
        website,
        category,
        active,
        verified
      ) VALUES (
        NEW.user_id,
        NEW.organization_name,
        NEW.business_address,
        NEW.city,
        NEW.state,
        NEW.country,
        NEW.phone,
        NEW.email,
        NEW.website,
        COALESCE(NEW.organization_type, 'other'),
        TRUE,
        FALSE -- Needs verification
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_approve_provider_request
  AFTER UPDATE ON provider_requests
  FOR EACH ROW
  EXECUTE FUNCTION approve_provider_request();

-- ============================================
-- SET SUPER ADMIN
-- ============================================
-- This will set vinvadoothker@gmail.com as admin
-- Run this after the user signs up, or manually update
UPDATE profiles
SET role = 'admin'
WHERE email = 'vinvadoothker@gmail.com';


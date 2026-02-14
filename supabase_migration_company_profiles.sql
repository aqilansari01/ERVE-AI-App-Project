-- Create company_profiles table for storing static company information
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_tagline TEXT DEFAULT '',
  founded_year TEXT DEFAULT '',
  hq_location TEXT DEFAULT '',
  company_description TEXT DEFAULT '',
  erve_investment TEXT DEFAULT '',
  round_breakdown TEXT DEFAULT '',
  total_raised TEXT DEFAULT '',
  erve_ownership TEXT DEFAULT '',
  security_type TEXT DEFAULT '',
  other_shareholders TEXT DEFAULT '',
  board_member TEXT DEFAULT '',
  board_observer TEXT DEFAULT '',
  last_pre_money_valuation TEXT DEFAULT '',
  last_post_money_valuation TEXT DEFAULT '',
  exit_cases JSONB DEFAULT NULL,
  blended_expected_return TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (required by Supabase)
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key (adjust for production auth)
CREATE POLICY "Allow all access to company_profiles"
  ON company_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

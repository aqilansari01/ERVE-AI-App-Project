-- Add quarterly data columns to company_profiles for quarter-rolling logic
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

ALTER TABLE company_profiles
  ADD COLUMN IF NOT EXISTS nav_as_of_quarter TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS quarterly_financials JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS valuation_waterfall JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS methodology TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS valuation TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS implied_multiple TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS current_quarter_nav TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS prior_quarter_nav TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS monthly_burn TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS fume_months TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS company_update_commentary TEXT DEFAULT '';

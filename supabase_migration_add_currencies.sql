-- Add currency fields to company_profiles
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

ALTER TABLE company_profiles
  ADD COLUMN IF NOT EXISTS investment_currency TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS fund_currency TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS current_quarter_nav_fund TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS prior_quarter_nav_fund TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS monthly_burn_currency TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_pre_money_currency TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_post_money_currency TEXT DEFAULT '';

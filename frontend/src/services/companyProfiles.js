import { supabase } from './supabase'

// Fields that are saved to a company profile (static/semi-static data).
const PROFILE_FIELDS = [
  'companyName',
  'companyTagline',
  'foundedYear',
  'hqLocation',
  'companyDescription',
  'erveInvestment',
  'roundBreakdown',
  'totalRaised',
  'erveOwnership',
  'securityType',
  'otherShareholders',
  'boardMember',
  'boardObserver',
  'lastPreMoneyValuation',
  'lastPostMoneyValuation',
  'investmentCurrency',
  'fundCurrency',
  'currentQuarterNavFund',
  'priorQuarterNavFund',
  'monthlyBurnCurrency',
  'lastPreMoneyCurrency',
  'lastPostMoneyCurrency',
]

// Exit cases are semi-static, saved as JSON
const PROFILE_EXIT_CASE_FIELD = 'exitCases'
const PROFILE_BLENDED_FIELD = 'blendedExpectedReturn'

export const extractProfileFromNavData = (navData) => {
  const profile = {}
  for (const field of PROFILE_FIELDS) {
    profile[field] = navData[field] || ''
  }
  profile.exit_cases = navData.exitCases || null
  profile.blended_expected_return = navData.blendedExpectedReturn || ''

  // Save quarterly data and the "as of quarter" for rolling logic
  profile.nav_as_of_quarter = navData.currentNavQuarter || ''
  profile.quarterly_financials = navData.quarterlyFinancials || null
  profile.valuation_waterfall = navData.valuationWaterfall || null
  profile.methodology = navData.methodology || ''
  profile.valuation = navData.valuation || ''
  profile.implied_multiple = navData.impliedMultiple || ''
  profile.current_quarter_nav = navData.currentQuarterNav || ''
  profile.prior_quarter_nav = navData.priorQuarterNav || ''
  profile.monthly_burn = navData.monthlyBurn || ''
  profile.fume_months = navData.fumeMonths || ''
  profile.company_update_commentary = navData.companyUpdateCommentary || ''
  profile.nav_quarter_label = navData.navQuarterLabel || ''
  profile.proposed_nav_valuation = navData.proposedNavValuation || ''

  return profile
}

export const applyProfileToNavData = (navData, profile) => {
  const updated = { ...navData }
  for (const field of PROFILE_FIELDS) {
    if (profile[field] !== undefined && profile[field] !== null) {
      updated[field] = profile[field]
    }
  }
  if (profile.exit_cases) {
    updated.exitCases = profile.exit_cases
  }
  if (profile.blended_expected_return) {
    updated.blendedExpectedReturn = profile.blended_expected_return
  }

  // Restore quarterly data (before rolling — App.jsx handles rolling)
  if (profile.quarterly_financials) {
    updated.quarterlyFinancials = profile.quarterly_financials
  }
  if (profile.valuation_waterfall) {
    updated.valuationWaterfall = profile.valuation_waterfall
  }
  if (profile.methodology) updated.methodology = profile.methodology
  if (profile.valuation) updated.valuation = profile.valuation
  if (profile.implied_multiple) updated.impliedMultiple = profile.implied_multiple
  if (profile.current_quarter_nav) updated.currentQuarterNav = profile.current_quarter_nav
  if (profile.prior_quarter_nav) updated.priorQuarterNav = profile.prior_quarter_nav
  if (profile.monthly_burn) updated.monthlyBurn = profile.monthly_burn
  if (profile.fume_months) updated.fumeMonths = profile.fume_months
  if (profile.company_update_commentary) updated.companyUpdateCommentary = profile.company_update_commentary
  if (profile.nav_quarter_label) updated.navQuarterLabel = profile.nav_quarter_label
  if (profile.proposed_nav_valuation) updated.proposedNavValuation = profile.proposed_nav_valuation

  return updated
}

// Map camelCase JS fields to snake_case DB columns
const toDbRow = (profile) => ({
  company_name: profile.companyName,
  company_tagline: profile.companyTagline,
  founded_year: profile.foundedYear,
  hq_location: profile.hqLocation,
  company_description: profile.companyDescription,
  erve_investment: profile.erveInvestment,
  round_breakdown: profile.roundBreakdown,
  total_raised: profile.totalRaised,
  erve_ownership: profile.erveOwnership,
  security_type: profile.securityType,
  other_shareholders: profile.otherShareholders,
  board_member: profile.boardMember,
  board_observer: profile.boardObserver,
  last_pre_money_valuation: profile.lastPreMoneyValuation,
  last_post_money_valuation: profile.lastPostMoneyValuation,
  investment_currency: profile.investmentCurrency || '',
  fund_currency: profile.fundCurrency || '',
  current_quarter_nav_fund: profile.currentQuarterNavFund || '',
  prior_quarter_nav_fund: profile.priorQuarterNavFund || '',
  monthly_burn_currency: profile.monthlyBurnCurrency || '',
  last_pre_money_currency: profile.lastPreMoneyCurrency || '',
  last_post_money_currency: profile.lastPostMoneyCurrency || '',
  exit_cases: profile.exit_cases,
  blended_expected_return: profile.blended_expected_return,
  nav_as_of_quarter: profile.nav_as_of_quarter,
  quarterly_financials: profile.quarterly_financials,
  valuation_waterfall: profile.valuation_waterfall,
  methodology: profile.methodology,
  valuation: profile.valuation,
  implied_multiple: profile.implied_multiple,
  current_quarter_nav: profile.current_quarter_nav,
  prior_quarter_nav: profile.prior_quarter_nav,
  monthly_burn: profile.monthly_burn,
  fume_months: profile.fume_months,
  company_update_commentary: profile.company_update_commentary,
  nav_quarter_label: profile.nav_quarter_label,
  proposed_nav_valuation: profile.proposed_nav_valuation,
})

const fromDbRow = (row) => ({
  id: row.id,
  companyName: row.company_name || '',
  companyTagline: row.company_tagline || '',
  foundedYear: row.founded_year || '',
  hqLocation: row.hq_location || '',
  companyDescription: row.company_description || '',
  erveInvestment: row.erve_investment || '',
  roundBreakdown: row.round_breakdown || '',
  totalRaised: row.total_raised || '',
  erveOwnership: row.erve_ownership || '',
  securityType: row.security_type || '',
  otherShareholders: row.other_shareholders || '',
  boardMember: row.board_member || '',
  boardObserver: row.board_observer || '',
  lastPreMoneyValuation: row.last_pre_money_valuation || '',
  lastPostMoneyValuation: row.last_post_money_valuation || '',
  investmentCurrency: row.investment_currency || '',
  fundCurrency: row.fund_currency || '',
  currentQuarterNavFund: row.current_quarter_nav_fund || '',
  priorQuarterNavFund: row.prior_quarter_nav_fund || '',
  monthlyBurnCurrency: row.monthly_burn_currency || '',
  lastPreMoneyCurrency: row.last_pre_money_currency || '',
  lastPostMoneyCurrency: row.last_post_money_currency || '',
  exit_cases: row.exit_cases || null,
  blended_expected_return: row.blended_expected_return || '',
  nav_as_of_quarter: row.nav_as_of_quarter || '',
  quarterly_financials: row.quarterly_financials || null,
  valuation_waterfall: row.valuation_waterfall || null,
  methodology: row.methodology || '',
  valuation: row.valuation || '',
  implied_multiple: row.implied_multiple || '',
  current_quarter_nav: row.current_quarter_nav || '',
  prior_quarter_nav: row.prior_quarter_nav || '',
  monthly_burn: row.monthly_burn || '',
  fume_months: row.fume_months || '',
  company_update_commentary: row.company_update_commentary || '',
  nav_quarter_label: row.nav_quarter_label || '',
  proposed_nav_valuation: row.proposed_nav_valuation || '',
  created_at: row.created_at,
  updated_at: row.updated_at,
})

export const fetchCompanyProfiles = async () => {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .order('company_name', { ascending: true })

  if (error) throw error
  return (data || []).map(fromDbRow)
}

export const saveCompanyProfile = async (navData, existingId = null) => {
  const extracted = extractProfileFromNavData(navData)
  const dbRow = toDbRow(extracted)

  if (existingId) {
    dbRow.updated_at = new Date().toISOString()
    const { data, error } = await supabase
      .from('company_profiles')
      .update(dbRow)
      .eq('id', existingId)
      .select()
      .single()

    if (error) throw error
    return fromDbRow(data)
  } else {
    const { data, error } = await supabase
      .from('company_profiles')
      .insert(dbRow)
      .select()
      .single()

    if (error) throw error
    return fromDbRow(data)
  }
}

export const deleteCompanyProfile = async (id) => {
  const { error } = await supabase
    .from('company_profiles')
    .delete()
    .eq('id', id)

  if (error) throw error
}

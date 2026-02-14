import { supabase } from './supabase'

// Fields that are saved to a company profile (static/semi-static data).
// Quarterly-changing fields are excluded.
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
  exit_cases: profile.exit_cases,
  blended_expected_return: profile.blended_expected_return,
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
  exit_cases: row.exit_cases || null,
  blended_expected_return: row.blended_expected_return || '',
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

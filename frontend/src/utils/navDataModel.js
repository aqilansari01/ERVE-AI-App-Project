import { generateFinancialColumns, generateWaterfallLabels, parseQuarter, formatQuarter, prevQuarter } from './quarterUtils'

const DEFAULT_NAV_QUARTER = 'Q1-26'

export const CURRENCY_OPTIONS = ['EUR', 'USD', 'CHF', 'NOK', 'GBP', 'SEK']

export const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF ',
  NOK: 'NOK ',
  SEK: 'SEK ',
}

export const getCurrencySymbol = (code) => CURRENCY_SYMBOLS[code] || ''

/**
 * Compute the prior quarter string from a quarter like "Q4-25" -> "Q3-25".
 */
export const getPriorQuarterLabel = (currentNavQuarter) => {
  const q = parseQuarter(currentNavQuarter)
  if (!q) return ''
  return formatQuarter(prevQuarter(q))
}

/**
 * Build the "Proposed NAV valuation" line from nav data.
 * Format: Proposed NAV valuation Q4-25: €19.0m / $21.6m (Q3-25: €19.0m / $20.5m)
 * Returns empty string if required values are missing.
 */
export const buildProposedNavLine = (navData) => {
  const invSym = getCurrencySymbol(navData.investmentCurrency)
  const fundSym = getCurrencySymbol(navData.fundCurrency)
  const currentQ = navData.currentNavQuarter
  const priorQ = getPriorQuarterLabel(currentQ)

  if (!currentQ || !invSym || !fundSym || !navData.currentQuarterNav || !navData.currentQuarterNavFund) {
    return ''
  }

  let line = `Proposed NAV valuation ${currentQ}: ${invSym}${navData.currentQuarterNav} / ${fundSym}${navData.currentQuarterNavFund}`

  if (priorQ && navData.priorQuarterNav && navData.priorQuarterNavFund) {
    line += ` (${priorQ}: ${invSym}${navData.priorQuarterNav} / ${fundSym}${navData.priorQuarterNavFund})`
  }

  return line
}

export const createEmptyNavData = (navQuarter = DEFAULT_NAV_QUARTER) => ({
  // Header
  companyName: '',
  companyTagline: '',
  foundedYear: '',
  hqLocation: '',

  // Company Description
  companyDescription: '',

  // Currency selectors
  investmentCurrency: '',
  fundCurrency: '',

  // NAV Values
  currentQuarterNav: '',
  currentQuarterNavFund: '',
  priorQuarterNav: '',
  priorQuarterNavFund: '',

  // Current NAV Quarter selector (drives rolling logic)
  currentNavQuarter: navQuarter,

  // Investment Details
  erveInvestment: '',
  roundBreakdown: '',
  totalRaised: '',
  erveOwnership: '',
  securityType: '',
  otherShareholders: '',
  boardMember: '',
  boardObserver: '',
  monthlyBurn: '',
  monthlyBurnCurrency: '',
  fumeMonths: '',
  lastPreMoneyValuation: '',
  lastPreMoneyCurrency: '',
  lastPostMoneyValuation: '',
  lastPostMoneyCurrency: '',

  // RAG Status
  ragFinancials: 'Green',
  ragCash: 'Green',
  ragMarket: 'Green',
  ragTeam: 'Green',
  ragGovernance: 'Green',
  ragOverall: 'Green',

  // Quarterly Financials (AI-extracted or manual)
  quarterlyFinancials: {
    columns: generateFinancialColumns(navQuarter),
    rows: [
      { metric: 'ARR', values: ['', '', '', '', '', '', '', ''] },
      { metric: 'Revenue', values: ['', '', '', '', '', '', '', ''] },
      { metric: 'GM', values: ['', '', '', '', '', '', '', ''] },
      { metric: 'EBITDA', values: ['', '', '', '', '', '', '', ''] },
      { metric: 'FTEs', values: ['', '', '', '', '', '', '', ''] },
    ],
  },

  // Exit Cases / Opportunity Matrix
  exitCases: {
    high: { weight: '20%', evExit: '', moic: '', irr: '', keyFactors: '' },
    base: { weight: '60%', evExit: '', moic: '', irr: '', keyFactors: '' },
    low: { weight: '20%', evExit: '', moic: '', irr: '', keyFactors: '' },
  },
  blendedExpectedReturn: '',

  // Investment Valuation Waterfall
  valuationWaterfall: {
    quarterLabels: generateWaterfallLabels(navQuarter),
    comparableMultiple: ['', '', ''],
    arr: ['', '', ''],
    evPreDiscount: ['', '', ''],
    discountRate: ['', '', ''],
    evAfterDiscount: ['', '', ''],
    cash: ['', '', ''],
    equityValue: ['', '', ''],
    erveOwnership: ['', '', ''],
    compsBasedValue: ['', '', ''],
  },
  methodology: '',
  valuation: '',
  impliedMultiple: '',

  // AI-generated / editable
  companyUpdateCommentary: '',
})

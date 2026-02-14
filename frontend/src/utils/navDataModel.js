import { generateFinancialColumns, generateWaterfallLabels } from './quarterUtils'

const DEFAULT_NAV_QUARTER = 'Q1-26'

export const createEmptyNavData = (navQuarter = DEFAULT_NAV_QUARTER) => ({
  // Header
  companyName: '',
  companyTagline: '',
  foundedYear: '',
  hqLocation: '',

  // Company Description
  companyDescription: '',

  // NAV Values
  currentQuarterNav: '',
  priorQuarterNav: '',
  proposedNavValuation: '',
  navQuarterLabel: navQuarter,

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
  fumeMonths: '',
  lastPreMoneyValuation: '',
  lastPostMoneyValuation: '',

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

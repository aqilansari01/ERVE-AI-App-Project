export const createEmptyNavData = () => ({
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
  navQuarterLabel: 'Q4-25',

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
    columns: ['Dec-24', 'Mar-25', 'Jun-25', 'Sep-25', 'LTM', 'FY23 Actual', 'FY24 Actual', 'FY25 Budget'],
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
    quarterLabels: ['Q4 NAV', 'Q3 NAV', 'Q2 NAV'],
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

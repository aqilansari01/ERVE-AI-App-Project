// Quarter utility functions for rolling logic

// All quarters in order: Q1, Q2, Q3, Q4
// Quarter-to-month mapping: Q1=Mar, Q2=Jun, Q3=Sep, Q4=Dec

const QUARTER_MONTHS = { 1: 'Mar', 2: 'Jun', 3: 'Sep', 4: 'Dec' }
const MONTH_TO_QUARTER = { Mar: 1, Jun: 2, Sep: 3, Dec: 4 }

/**
 * Parse a quarter string like "Q1-26" into { quarter: 1, year: 26 }
 */
export const parseQuarter = (qStr) => {
  if (!qStr) return null
  const match = qStr.match(/^Q(\d)-(\d{2})$/)
  if (!match) return null
  return { quarter: parseInt(match[1]), year: parseInt(match[2]) }
}

/**
 * Format { quarter, year } back to "Q1-26"
 */
export const formatQuarter = (q) => {
  if (!q) return ''
  return `Q${q.quarter}-${String(q.year).padStart(2, '0')}`
}

/**
 * Get the previous quarter. Q1-26 -> Q4-25, Q2-26 -> Q1-26, etc.
 */
export const prevQuarter = (q) => {
  if (!q) return null
  if (q.quarter === 1) return { quarter: 4, year: q.year - 1 }
  return { quarter: q.quarter - 1, year: q.year }
}

/**
 * Get the next quarter. Q4-25 -> Q1-26, Q3-25 -> Q4-25, etc.
 */
export const nextQuarter = (q) => {
  if (!q) return null
  if (q.quarter === 4) return { quarter: 1, year: q.year + 1 }
  return { quarter: q.quarter + 1, year: q.year }
}

/**
 * Get the number of quarters between two quarters (b - a).
 * Positive if b is after a.
 */
export const quarterDiff = (a, b) => {
  if (!a || !b) return 0
  return (b.year - a.year) * 4 + (b.quarter - a.quarter)
}

/**
 * Get the ending month label for a quarter, e.g. Q4-25 -> "Dec-25", Q1-26 -> "Mar-26"
 */
export const quarterToMonthLabel = (q) => {
  if (!q) return ''
  return `${QUARTER_MONTHS[q.quarter]}-${String(q.year).padStart(2, '0')}`
}

/**
 * Get the fiscal year for a quarter's calendar year.
 * Assumes fiscal year = calendar year (FY25 = calendar year 2025).
 */
const fiscalYearLabel = (year, suffix) => `FY${String(year).padStart(2, '0')} ${suffix}`

/**
 * Generate the 8 column headers for Quarterly Financials based on Current NAV Quarter.
 *
 * Pattern:
 *   4 quarterly actuals ending one quarter before the current NAV quarter (one quarter lag)
 *   LTM
 *   2 years prior year actual
 *   Prior year actual
 *   Current year budget
 *
 * Example: Current NAV Quarter = Q1-26
 *   Quarterly: Mar-25, Jun-25, Sep-25, Dec-25 (i.e. Q1-25, Q2-25, Q3-25, Q4-25 — oldest to newest)
 *   LTM
 *   FY24 Actual, FY25 Actual, FY26 Budget
 */
export const generateFinancialColumns = (currentNavQuarter) => {
  const q = parseQuarter(currentNavQuarter)
  if (!q) {
    return ['Q-4', 'Q-3', 'Q-2', 'Q-1', 'LTM', 'FY-2 Actual', 'FY-1 Actual', 'FY Budget']
  }

  // One quarter lag: the most recent actual quarter is one before the current NAV quarter
  // Build oldest to newest order
  let mostRecent = prevQuarter(q)
  const quarterLabels = []
  for (let i = 0; i < 4; i++) {
    quarterLabels.push(quarterToMonthLabel(mostRecent))
    mostRecent = prevQuarter(mostRecent)
  }
  quarterLabels.reverse()

  // Current year (calendar year of the NAV quarter), prior year, 2 years prior
  const currentYear = q.year
  const priorYear = currentYear - 1
  const twoYearsPrior = currentYear - 2

  return [
    ...quarterLabels,
    'LTM',
    fiscalYearLabel(twoYearsPrior, 'Actual'),
    fiscalYearLabel(priorYear, 'Actual'),
    fiscalYearLabel(currentYear, 'Budget'),
  ]
}

/**
 * Generate the 3 quarter labels for Valuation Waterfall.
 *
 * Pattern: Current NAV quarter, prior quarter, two quarters ago.
 * Example: Q1-26 -> ["Q1-26 NAV", "Q4-25 NAV", "Q3-25 NAV"]
 */
export const generateWaterfallLabels = (currentNavQuarter) => {
  const q = parseQuarter(currentNavQuarter)
  if (!q) return ['Current NAV', 'Prior NAV', '2Q Ago NAV']

  const prev1 = prevQuarter(q)
  const prev2 = prevQuarter(prev1)

  return [
    `${formatQuarter(q)} NAV`,
    `${formatQuarter(prev1)} NAV`,
    `${formatQuarter(prev2)} NAV`,
  ]
}

/**
 * Generate list of selectable quarters for the dropdown.
 * Returns quarters from Q1-25 to Q4-27 (covers a reasonable range).
 */
export const getQuarterOptions = () => {
  const options = []
  for (let year = 25; year <= 28; year++) {
    for (let q = 1; q <= 4; q++) {
      options.push(`Q${q}-${String(year).padStart(2, '0')}`)
    }
  }
  return options
}

/**
 * Roll quarterly financials data forward by a given number of quarters.
 * Shifts column data left, newest columns become empty.
 */
export const rollFinancialsForward = (financials, quartersToRoll, newColumns) => {
  if (quartersToRoll <= 0 || quartersToRoll > 4) {
    return { ...financials, columns: newColumns }
  }

  // For the 4 quarterly columns (indices 0-3), shift left by quartersToRoll
  const rolledRows = financials.rows.map((row) => {
    const quarterValues = row.values.slice(0, 4) // first 4 are quarterly
    const otherValues = row.values.slice(4) // LTM + annual columns

    // Shift quarterly values: drop oldest, add empty for new
    const shifted = [...quarterValues.slice(quartersToRoll), ...Array(quartersToRoll).fill('')]

    // Annual columns get cleared since they may change with the year
    return { ...row, values: [...shifted, ...otherValues] }
  })

  return { columns: newColumns, rows: rolledRows }
}

/**
 * Roll valuation waterfall data forward by a given number of quarters.
 * Shifts data right (current -> prior -> 2Q ago), newest column becomes empty.
 */
export const rollWaterfallForward = (waterfall, quartersToRoll, newLabels) => {
  if (quartersToRoll <= 0 || quartersToRoll > 3) {
    return { ...waterfall, quarterLabels: newLabels }
  }

  const metrics = [
    'comparableMultiple', 'arr', 'evPreDiscount', 'discountRate',
    'evAfterDiscount', 'cash', 'equityValue', 'erveOwnership', 'compsBasedValue',
  ]

  const rolled = { ...waterfall, quarterLabels: newLabels }

  for (const metric of metrics) {
    const values = [...waterfall[metric]]
    if (quartersToRoll >= 3) {
      // All data is too old
      rolled[metric] = ['', '', '']
    } else if (quartersToRoll === 2) {
      // Only index 0 (was current) moves to index 2 (two quarters ago)
      rolled[metric] = ['', '', values[0]]
    } else {
      // quartersToRoll === 1: current -> prior, prior -> 2Q ago, new current is empty
      rolled[metric] = ['', values[0], values[1]]
    }
  }

  return rolled
}

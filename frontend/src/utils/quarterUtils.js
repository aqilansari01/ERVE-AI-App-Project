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
 * Uses label-based remapping so data stays aligned with the correct column headers.
 * Preserves and consults historicalData so values that scroll off-screen aren't lost.
 */
export const rollFinancialsForward = (financials, quartersToRoll, newColumns) => {
  if (quartersToRoll <= 0) {
    return { ...financials, columns: newColumns }
  }

  const oldColumns = financials.columns
  const historical = financials.historicalData || {}

  // Snapshot current values into historicalData
  const updatedHistorical = { ...historical }
  financials.rows.forEach((row) => {
    if (!updatedHistorical[row.metric]) updatedHistorical[row.metric] = {}
    updatedHistorical[row.metric] = { ...updatedHistorical[row.metric] }
    oldColumns.forEach((col, i) => {
      if (row.values[i]) {
        updatedHistorical[row.metric][col] = row.values[i]
      }
    })
  })

  const rolledRows = financials.rows.map((row) => {
    const metricHistory = updatedHistorical[row.metric] || {}
    const positionalMap = {}
    oldColumns.forEach((col, i) => {
      positionalMap[col] = row.values[i] || ''
    })
    const newValues = newColumns.map((col) => metricHistory[col] || positionalMap[col] || '')
    return { ...row, values: newValues }
  })

  return { columns: newColumns, rows: rolledRows, historicalData: updatedHistorical }
}

/**
 * Roll valuation waterfall data forward by a given number of quarters.
 * Uses label-based remapping so data stays aligned with the correct column headers.
 * Preserves and consults historicalData so values that scroll off-screen aren't lost.
 *
 * Supports the flexible rows-based structure where waterfall.rows is an array
 * of { label, values } objects, and methodology/valuation/impliedMultiple are
 * per-quarter arrays.
 */
export const rollWaterfallForward = (waterfall, quartersToRoll, newLabels) => {
  if (quartersToRoll <= 0) {
    return { ...waterfall, quarterLabels: newLabels }
  }

  const oldLabels = waterfall.quarterLabels
  const historical = waterfall.historicalData || {}
  const rows = waterfall.rows || []

  // Snapshot current row values into historicalData (keyed by row label)
  const updatedHistorical = { ...historical }
  rows.forEach((row) => {
    if (!updatedHistorical[row.label]) updatedHistorical[row.label] = {}
    updatedHistorical[row.label] = { ...updatedHistorical[row.label] }
    oldLabels.forEach((label, i) => {
      if (row.values[i]) {
        updatedHistorical[row.label][label] = row.values[i]
      }
    })
  })

  // Roll the flexible rows
  const rolledRows = rows.map((row) => {
    const rowHistory = updatedHistorical[row.label] || {}
    const positionalMap = {}
    oldLabels.forEach((label, i) => {
      positionalMap[label] = row.values[i] || ''
    })
    const newValues = newLabels.map((label) => rowHistory[label] || positionalMap[label] || '')
    return { ...row, values: newValues }
  })

  const rolled = { ...waterfall, quarterLabels: newLabels, rows: rolledRows, historicalData: updatedHistorical }

  // Roll methodology, valuation, impliedMultiple arrays the same way
  ;['methodology', 'valuation', 'impliedMultiple'].forEach((field) => {
    const values = waterfall[field] || ['', '', '']
    const fieldKey = `_${field}`
    if (!updatedHistorical[fieldKey]) updatedHistorical[fieldKey] = {}
    updatedHistorical[fieldKey] = { ...updatedHistorical[fieldKey] }
    oldLabels.forEach((label, i) => {
      if (values[i]) {
        updatedHistorical[fieldKey][label] = values[i]
      }
    })
    const fieldHistory = updatedHistorical[fieldKey] || {}
    const positionalMap = {}
    oldLabels.forEach((label, i) => {
      positionalMap[label] = values[i] || ''
    })
    rolled[field] = newLabels.map((label) => fieldHistory[label] || positionalMap[label] || '')
  })

  rolled.historicalData = updatedHistorical
  return rolled
}

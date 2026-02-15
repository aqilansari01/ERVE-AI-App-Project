import { forwardRef } from 'react'
import { getCurrencySymbol } from '../utils/navDataModel'

const COLORS = {
  navy: '#1B2A4A',
  navyLight: '#2C3E5A',
  white: '#FFFFFF',
  lightGray: '#F5F6F8',
  medGray: '#E8EAF0',
  darkText: '#1A1A2E',
  mutedText: '#6B7280',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  border: '#D1D5DB',
}

const styles = {
  page: {
    width: '297mm',
    height: '210mm',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontSize: '7.5pt',
    color: COLORS.darkText,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    padding: '6mm 8mm 10mm 8mm',
    lineHeight: '1.3',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: COLORS.navy,
    color: COLORS.white,
    padding: '5mm 6mm',
    margin: '-6mm -8mm 4mm -8mm',
    borderRadius: '0',
  },
  headerLeft: {
    flex: '1',
  },
  headerCenter: {
    flex: '1',
    textAlign: 'center',
  },
  headerRight: {
    flex: '0 0 auto',
    textAlign: 'right',
    fontSize: '7pt',
  },
  companyName: {
    fontSize: '13pt',
    fontWeight: '700',
    marginBottom: '2px',
  },
  companyTagline: {
    fontSize: '8pt',
    opacity: 0.85,
  },
  navValuation: {
    fontSize: '9pt',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '3px 10px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  columns: {
    display: 'flex',
    gap: '5mm',
    height: 'calc(100% - 28mm)',
  },
  leftCol: {
    flex: '1.1',
    display: 'flex',
    flexDirection: 'column',
    gap: '3mm',
    overflow: 'hidden',
  },
  rightCol: {
    flex: '0.9',
    display: 'flex',
    flexDirection: 'column',
    gap: '3mm',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: '8pt',
    fontWeight: '700',
    color: COLORS.navy,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '1.5mm',
    borderBottom: `1.5px solid ${COLORS.navy}`,
    paddingBottom: '1mm',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '7pt',
  },
  th: {
    backgroundColor: COLORS.navy,
    color: COLORS.white,
    padding: '2px 4px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '6.5pt',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '1.5px 4px',
    borderBottom: `0.5px solid ${COLORS.medGray}`,
    verticalAlign: 'top',
  },
  tdLabel: {
    padding: '1.5px 4px',
    borderBottom: `0.5px solid ${COLORS.medGray}`,
    fontWeight: '600',
    fontSize: '6.5pt',
    whiteSpace: 'nowrap',
    backgroundColor: COLORS.lightGray,
  },
  tdValue: {
    padding: '1.5px 4px',
    borderBottom: `0.5px solid ${COLORS.medGray}`,
    textAlign: 'right',
  },
  ragDot: (color) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'inline-block',
    marginRight: '4px',
    verticalAlign: 'middle',
  }),
  ragRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '3mm',
    padding: '1.5mm 0',
  },
  ragItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '7pt',
    minWidth: '60px',
  },
  footer: {
    position: 'absolute',
    bottom: '3mm',
    right: '8mm',
    fontSize: '7pt',
    color: COLORS.mutedText,
    fontWeight: '600',
  },
  commentary: {
    fontSize: '7pt',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap',
  },
  description: {
    fontSize: '7pt',
    lineHeight: '1.35',
    color: COLORS.darkText,
    marginBottom: '2mm',
  },
}

const RAG_COLORS = {
  Green: COLORS.green,
  Amber: COLORS.amber,
  Red: COLORS.red,
}

const InvestmentSummaryTable = ({ data }) => {
  const burnPrefix = getCurrencySymbol(data.monthlyBurnCurrency)
  const preMoneyPrefix = getCurrencySymbol(data.lastPreMoneyCurrency)
  const postMoneyPrefix = getCurrencySymbol(data.lastPostMoneyCurrency)

  const formatWithCcy = (prefix, value) => {
    if (!value) return '—'
    return prefix ? `${prefix}${value}` : value
  }

  // Build current/prior NAV display with dual currencies
  const currentNav = data.currentQuarterNav && data.currentQuarterNavFund
    ? `${data.currentQuarterNav} / ${data.currentQuarterNavFund}`
    : data.currentQuarterNav || data.currentQuarterNavFund || ''
  const priorNav = data.priorQuarterNav && data.priorQuarterNavFund
    ? `${data.priorQuarterNav} / ${data.priorQuarterNavFund}`
    : data.priorQuarterNav || data.priorQuarterNavFund || ''

  return (
    <table style={styles.table}>
      <tbody>
        {[
          ['ERVE Investment', data.erveInvestment],
          ['Break-down by round', data.roundBreakdown],
          ['Total Raised', data.totalRaised],
          ['ERVE % / Security', `${data.erveOwnership} / ${data.securityType}`],
          ['Other Shareholders', data.otherShareholders],
          ['Board Member', data.boardMember],
          ['Board Observer', data.boardObserver],
          ['Monthly Burn / FUME', `${formatWithCcy(burnPrefix, data.monthlyBurn)} / ${data.fumeMonths} months`],
          ['Last Pre-money', formatWithCcy(preMoneyPrefix, data.lastPreMoneyValuation)],
          ['Last Post-money', formatWithCcy(postMoneyPrefix, data.lastPostMoneyValuation)],
          ['Current Quarter NAV', currentNav],
          ['Prior Quarter NAV', priorNav],
        ].map(([label, value], i) => (
          <tr key={i}>
            <td style={styles.tdLabel}>{label}</td>
            <td style={styles.tdValue}>{value || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const RagStatus = ({ data }) => (
  <div style={styles.ragRow}>
    {[
      ['Financials', data.ragFinancials],
      ['Cash', data.ragCash],
      ['Market', data.ragMarket],
      ['Team', data.ragTeam],
      ['Governance', data.ragGovernance],
      ['Overall', data.ragOverall],
    ].map(([label, status]) => (
      <div key={label} style={styles.ragItem}>
        <span style={styles.ragDot(RAG_COLORS[status] || COLORS.green)} />
        {label}
      </div>
    ))}
  </div>
)

const QuarterlyFinancialsTable = ({ data }) => {
  const { columns, rows } = data.quarterlyFinancials
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}></th>
          {columns.map((col, i) => (
            <th key={i} style={{ ...styles.th, textAlign: 'right', fontSize: '6pt' }}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            <td style={styles.tdLabel}>{row.metric}</td>
            {row.values.map((v, vi) => (
              <td key={vi} style={{ ...styles.tdValue, fontSize: '6.5pt' }}>{v || '—'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const ExitCasesTable = ({ data }) => (
  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>Scenario</th>
        <th style={styles.th}>Wt</th>
        <th style={{ ...styles.th, textAlign: 'right' }}>EV/Exit</th>
        <th style={{ ...styles.th, textAlign: 'right' }}>MOIC</th>
        <th style={{ ...styles.th, textAlign: 'right' }}>IRR</th>
        <th style={styles.th}>Key Factors</th>
      </tr>
    </thead>
    <tbody>
      {[
        ['High', data.exitCases.high],
        ['Base', data.exitCases.base],
        ['Low', data.exitCases.low],
      ].map(([label, sc]) => (
        <tr key={label}>
          <td style={styles.tdLabel}>{label}</td>
          <td style={styles.td}>{sc.weight}</td>
          <td style={styles.tdValue}>{sc.evExit || '—'}</td>
          <td style={styles.tdValue}>{sc.moic || '—'}</td>
          <td style={styles.tdValue}>{sc.irr || '—'}</td>
          <td style={{ ...styles.td, fontSize: '6pt', maxWidth: '80px' }}>{sc.keyFactors || '—'}</td>
        </tr>
      ))}
      <tr style={{ borderTop: `1px solid ${COLORS.navy}` }}>
        <td style={{ ...styles.tdLabel, fontWeight: '700' }} colSpan={2}>Blended</td>
        <td style={styles.tdValue} colSpan={4}>{data.blendedExpectedReturn || '—'}</td>
      </tr>
    </tbody>
  </table>
)

const ValuationWaterfallTable = ({ data }) => {
  const wf = data.valuationWaterfall
  const labels = wf.quarterLabels
  const rowDefs = [
    ['Comparable EV/Rev Multiple', wf.comparableMultiple],
    ['ARR', wf.arr],
    ['Enterprise Value (pre-discount)', wf.evPreDiscount],
    ['Discount Rate', wf.discountRate],
    ['Enterprise Value (after discount)', wf.evAfterDiscount],
    ['Cash', wf.cash],
    ['Equity Value', wf.equityValue],
    ['ERVE Ownership', wf.erveOwnership],
    ['Comps-based Value', wf.compsBasedValue],
  ]

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}></th>
          {labels.map((l, i) => (
            <th key={i} style={{ ...styles.th, textAlign: 'right' }}>{l}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rowDefs.map(([label, values], ri) => (
          <tr key={ri}>
            <td style={styles.tdLabel}>{label}</td>
            {values.map((v, vi) => (
              <td key={vi} style={styles.tdValue}>{v || '—'}</td>
            ))}
          </tr>
        ))}
        <tr style={{ borderTop: `1.5px solid ${COLORS.navy}` }}>
          <td style={{ ...styles.tdLabel, fontWeight: '700' }}>Methodology</td>
          <td style={styles.tdValue} colSpan={3}>{data.methodology || '—'}</td>
        </tr>
        <tr>
          <td style={{ ...styles.tdLabel, fontWeight: '700' }}>Valuation</td>
          <td style={styles.tdValue} colSpan={3}>{data.valuation || '—'}</td>
        </tr>
        <tr>
          <td style={{ ...styles.tdLabel, fontWeight: '700' }}>Implied Multiple</td>
          <td style={styles.tdValue} colSpan={3}>{data.impliedMultiple || '—'}</td>
        </tr>
      </tbody>
    </table>
  )
}

const NavOnePagerTemplate = forwardRef(({ navData }, ref) => {
  const data = navData

  return (
    <div ref={ref} style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.companyName}>{data.companyName || 'Company Name'}</div>
          <div style={styles.companyTagline}>{data.companyTagline || ''}</div>
        </div>
        <div style={styles.headerCenter}>
          <div style={styles.navValuation}>
            {data.proposedNavValuation || `Proposed NAV valuation ${data.navQuarterLabel}`}
          </div>
        </div>
        <div style={styles.headerRight}>
          <div>Founded: {data.foundedYear || '—'}</div>
          <div>HQ: {data.hqLocation || '—'}</div>
        </div>
      </div>

      {/* TWO COLUMNS */}
      <div style={styles.columns}>
        {/* LEFT COLUMN */}
        <div style={styles.leftCol}>
          {/* Investment Summary */}
          <div>
            <div style={styles.sectionTitle}>Investment Summary</div>
            {data.companyDescription && (
              <div style={styles.description}>{data.companyDescription}</div>
            )}
            <InvestmentSummaryTable data={data} />
          </div>

          {/* RAG Status */}
          <div>
            <div style={styles.sectionTitle}>RAG Status</div>
            <RagStatus data={data} />
          </div>

          {/* Quarterly Financials */}
          <div>
            <div style={styles.sectionTitle}>Quarterly Financials</div>
            <QuarterlyFinancialsTable data={data} />
          </div>

          {/* Exit Cases */}
          <div>
            <div style={styles.sectionTitle}>Opportunity Matrix</div>
            <ExitCasesTable data={data} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={styles.rightCol}>
          {/* Company Update */}
          <div>
            <div style={styles.sectionTitle}>Company Update</div>
            <div style={styles.commentary}>
              {data.companyUpdateCommentary || 'No company update provided.'}
            </div>
          </div>

          {/* Investment Valuation */}
          <div>
            <div style={styles.sectionTitle}>Investment Valuation</div>
            <ValuationWaterfallTable data={data} />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        Eight Roads Ventures
      </div>
    </div>
  )
})

NavOnePagerTemplate.displayName = 'NavOnePagerTemplate'

export default NavOnePagerTemplate

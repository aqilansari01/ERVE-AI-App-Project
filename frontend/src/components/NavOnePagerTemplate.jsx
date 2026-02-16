import { forwardRef } from 'react'
import { getCurrencySymbol, buildProposedNavLine } from '../utils/navDataModel'

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

const FONT_BODY = "Arial, Helvetica, sans-serif"
const FONT_HEADER = "Georgia, 'Times New Roman', serif"

const styles = {
  page: {
    width: '297mm',
    height: '210mm',
    fontFamily: FONT_BODY,
    fontSize: '7.5pt',
    color: COLORS.darkText,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    padding: '6mm 8mm 10mm 8mm',
    lineHeight: '1.4',
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
    fontFamily: FONT_BODY,
  },
  companyName: {
    fontSize: '13pt',
    fontWeight: '700',
    fontFamily: FONT_HEADER,
    marginBottom: '2px',
  },
  companyTagline: {
    fontSize: '8pt',
    fontFamily: FONT_HEADER,
    opacity: 0.85,
  },
  navValuation: {
    fontSize: '9pt',
    fontWeight: '600',
    fontFamily: FONT_BODY,
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
    fontFamily: FONT_BODY,
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
    padding: '4px 6px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '6.5pt',
    lineHeight: '1.4',
  },
  td: {
    padding: '4px 6px',
    borderBottom: `0.5px solid ${COLORS.medGray}`,
    verticalAlign: 'top',
    lineHeight: '1.4',
  },
  tdLabel: {
    padding: '4px 6px',
    borderBottom: `0.5px solid ${COLORS.medGray}`,
    fontWeight: '600',
    fontSize: '6.5pt',
    backgroundColor: COLORS.lightGray,
    lineHeight: '1.4',
  },
  tdValue: {
    padding: '4px 6px',
    borderBottom: `0.5px solid ${COLORS.medGray}`,
    textAlign: 'right',
    lineHeight: '1.4',
  },
  ragSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '5mm',
    padding: '3mm 0',
  },
  ragItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    minWidth: '45px',
  },
  ragLabel: {
    fontSize: '6.5pt',
    fontWeight: '600',
    color: COLORS.darkText,
    textAlign: 'center',
  },
  ragIndicator: (color) => ({
    width: '36px',
    height: '15px',
    borderRadius: '8px',
    backgroundColor: color,
  }),
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
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  description: {
    fontSize: '7pt',
    lineHeight: '1.4',
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
  <div style={styles.ragSection}>
    {[
      ['Financials', data.ragFinancials],
      ['Cash', data.ragCash],
      ['Market', data.ragMarket],
      ['Team', data.ragTeam],
      ['Governance', data.ragGovernance],
      ['Overall', data.ragOverall],
    ].map(([label, status]) => (
      <div key={label} style={styles.ragItem}>
        <span style={styles.ragLabel}>{label}</span>
        <div style={styles.ragIndicator(RAG_COLORS[status] || COLORS.green)} />
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
          <td style={{ ...styles.td, fontSize: '6pt', whiteSpace: 'normal', wordWrap: 'break-word' }}>{sc.keyFactors || '—'}</td>
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
          <td style={{ ...styles.tdValue, whiteSpace: 'normal', wordWrap: 'break-word' }} colSpan={3}>{data.methodology || '—'}</td>
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
            {buildProposedNavLine(data) || `Proposed NAV valuation ${data.currentNavQuarter || ''}`}
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

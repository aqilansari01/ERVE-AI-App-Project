import { useState } from 'react'
import FileUpload from './FileUpload'
import { getQuarterOptions, generateFinancialColumns, generateWaterfallLabels } from '../utils/quarterUtils'
import { CURRENCY_OPTIONS, getCurrencySymbol, buildProposedNavLine, getPriorQuarterLabel } from '../utils/navDataModel'

const Section = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-navy-800 rounded-lg overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-navy-700/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-accent-500 rounded-full"></div>
          <span className="font-display font-semibold text-sm tracking-wide text-white">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-navy-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="section-content px-6 py-5 space-y-4 border-t border-navy-700">{children}</div>}
    </div>
  )
}

const Field = ({ label, value, onChange, type = 'text', placeholder = '', className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-navy-200 mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-navy-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 focus:outline-none transition-colors"
    />
  </div>
)

const TextArea = ({ label, value, onChange, rows = 3, placeholder = '' }) => (
  <div>
    <label className="block text-xs font-medium text-navy-200 mb-1.5">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-navy-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 focus:outline-none transition-colors resize-y"
    />
  </div>
)

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-navy-200 mb-1.5">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 focus:outline-none transition-colors"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
)

const CurrencyField = ({ label, value, onChange, currencyValue, onCurrencyChange, placeholder = '' }) => (
  <div>
    <label className="block text-xs font-medium text-navy-200 mb-1.5">{label}</label>
    <div className="flex">
      <select
        value={currencyValue}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className="bg-navy-700 border border-navy-600 border-r-0 rounded-l-lg px-2 py-2 text-xs text-white focus:border-accent-500 focus:outline-none transition-colors"
      >
        <option value="">--</option>
        {CURRENCY_OPTIONS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-navy-900 border border-navy-600 rounded-r-lg px-3 py-2 text-sm text-white placeholder-navy-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 focus:outline-none transition-colors"
      />
    </div>
  </div>
)

const RAG_OPTIONS = ['Green', 'Amber', 'Red']

export default function NavInputForm({ navData, onNavDataChange, files, onFilesChange, disabled, profiles, selectedProfileId, onSelectProfile, onSaveProfile, onDeleteProfile, profileSaving, rollForwardMessage, onDismissRollMessage }) {
  const update = (field, value) => {
    onNavDataChange({ ...navData, [field]: value })
  }

  const handleQuarterChange = (newQuarter) => {
    const oldCols = navData.quarterlyFinancials.columns
    const newCols = generateFinancialColumns(newQuarter)

    const newRows = navData.quarterlyFinancials.rows.map((row) => {
      const dataMap = {}
      oldCols.forEach((col, i) => {
        dataMap[col] = row.values[i] || ''
      })
      const newValues = newCols.map((col) => dataMap[col] || '')
      return { ...row, values: newValues }
    })

    const oldWfLabels = navData.valuationWaterfall.quarterLabels
    const newWfLabels = generateWaterfallLabels(newQuarter)

    const waterfallKeys = [
      'comparableMultiple', 'arr', 'evPreDiscount', 'discountRate',
      'evAfterDiscount', 'cash', 'equityValue', 'erveOwnership', 'compsBasedValue',
    ]

    const newWaterfall = { ...navData.valuationWaterfall, quarterLabels: newWfLabels }
    waterfallKeys.forEach((key) => {
      const dataMap = {}
      oldWfLabels.forEach((label, i) => {
        dataMap[label] = navData.valuationWaterfall[key][i] || ''
      })
      newWaterfall[key] = newWfLabels.map((label) => dataMap[label] || '')
    })

    onNavDataChange({
      ...navData,
      currentNavQuarter: newQuarter,
      quarterlyFinancials: { columns: newCols, rows: newRows },
      valuationWaterfall: newWaterfall,
    })
  }

  const updateNested = (path, value) => {
    const keys = path.split('.')
    const newData = { ...navData }
    let obj = newData
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = Array.isArray(obj[keys[i]]) ? [...obj[keys[i]]] : { ...obj[keys[i]] }
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value
    onNavDataChange(newData)
  }

  const updateWaterfallCell = (row, colIndex, value) => {
    const newArr = [...navData.valuationWaterfall[row]]
    newArr[colIndex] = value
    updateNested(`valuationWaterfall.${row}`, newArr)
  }

  const updateFinancialCell = (rowIndex, colIndex, value) => {
    const newRows = navData.quarterlyFinancials.rows.map((r, ri) => {
      if (ri !== rowIndex) return r
      const newValues = [...r.values]
      newValues[colIndex] = value
      return { ...r, values: newValues }
    })
    updateNested('quarterlyFinancials.rows', newRows)
  }

  const updateExitCase = (scenario, field, value) => {
    updateNested(`exitCases.${scenario}.${field}`, value)
  }

  // Compute derived quarter labels and proposed NAV line
  const currentQ = navData.currentNavQuarter || 'Q1-26'
  const priorQ = getPriorQuarterLabel(currentQ)
  const proposedNavLine = buildProposedNavLine(navData)

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-semibold tracking-wide text-white mb-2">NAV 1-Pager Input</h2>
        <p className="text-navy-300 text-sm font-body">
          Fill in the form fields and optionally upload documents for AI-assisted extraction
        </p>
      </div>

      {/* Company Profile Selector */}
      <div className="bg-navy-800 rounded-lg px-6 py-5 shadow-sm">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-navy-200 mb-1.5">Select Company</label>
            <select
              value={selectedProfileId || ''}
              onChange={(e) => onSelectProfile(e.target.value || null)}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 focus:outline-none transition-colors"
              disabled={disabled}
            >
              <option value="">-- New Company --</option>
              {(profiles || []).map((p) => (
                <option key={p.id} value={p.id}>{p.companyName}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={onSaveProfile}
            disabled={disabled || profileSaving || !navData.companyName}
            className={`px-5 py-2 rounded-lg text-sm font-display font-medium tracking-wide transition-all whitespace-nowrap ${
              disabled || profileSaving || !navData.companyName
                ? 'bg-navy-700 text-navy-400 cursor-not-allowed'
                : 'bg-accent-500 hover:bg-accent-600 text-white shadow-sm'
            }`}
          >
            {profileSaving ? 'Saving...' : selectedProfileId ? 'Update Profile' : 'Save Profile'}
          </button>
          {selectedProfileId && (
            <button
              type="button"
              onClick={onDeleteProfile}
              disabled={disabled || profileSaving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all whitespace-nowrap"
            >
              Delete
            </button>
          )}
        </div>
        {selectedProfileId && (
          <p className="text-xs text-navy-400 mt-3">
            All data including quarterly financials and waterfall is saved with the profile. Data will auto-roll forward when loaded in a later quarter.
          </p>
        )}
      </div>

      {/* Roll-forward notification */}
      {rollForwardMessage && (
        <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg px-5 py-4 flex items-center justify-between">
          <p className="text-amber-300 text-sm">{rollForwardMessage}</p>
          <button
            type="button"
            onClick={onDismissRollMessage}
            className="ml-4 text-amber-400 hover:text-amber-200 text-lg font-bold leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* Current NAV Quarter Selector */}
      <div className="bg-navy-800 rounded-lg px-6 py-5 shadow-sm">
        <div className="flex items-end gap-4">
          <div className="w-48">
            <label className="block text-xs font-medium text-navy-200 mb-1.5">Current NAV Quarter</label>
            <select
              value={navData.currentNavQuarter || 'Q1-26'}
              onChange={(e) => handleQuarterChange(e.target.value)}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 focus:outline-none transition-colors"
              disabled={disabled}
            >
              {getQuarterOptions().map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-navy-400 pb-2">
            This drives the rolling column headers for Quarterly Financials and Valuation Waterfall.
          </p>
        </div>
      </div>

      {/* File Uploads */}
      <Section title="Document Uploads (Optional)" defaultOpen={false}>
        <p className="text-xs text-navy-400 mb-3">
          Upload documents to auto-extract quarterly financials and generate company update commentary.
        </p>
        <FileUpload files={files} onFilesChange={onFilesChange} disabled={disabled} />
      </Section>

      {/* Company Info */}
      <Section title="Company Information" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Name" value={navData.companyName} onChange={(v) => update('companyName', v)} placeholder="e.g., Villain" />
          <Field label="Tagline" value={navData.companyTagline} onChange={(v) => update('companyTagline', v)} placeholder="e.g., SaaS platform for tradesmen SMEs" />
          <Field label="Founded Year" value={navData.foundedYear} onChange={(v) => update('foundedYear', v)} placeholder="e.g., 2020" />
          <Field label="HQ Location" value={navData.hqLocation} onChange={(v) => update('hqLocation', v)} placeholder="e.g., London, UK" />
        </div>
        <TextArea
          label="Company Description"
          value={navData.companyDescription}
          onChange={(v) => update('companyDescription', v)}
          placeholder="Brief description of the company for the investment summary section..."
          rows={2}
        />
      </Section>

      {/* NAV Values */}
      <Section title="NAV Values" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-navy-200 mb-1.5">Investment Currency</label>
            <select
              value={navData.investmentCurrency}
              onChange={(e) => update('investmentCurrency', e.target.value)}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 focus:outline-none transition-colors"
            >
              <option value="">-- Select --</option>
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-200 mb-1.5">Fund Currency</label>
            <select
              value={navData.fundCurrency}
              onChange={(e) => update('fundCurrency', e.target.value)}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 focus:outline-none transition-colors"
            >
              <option value="">-- Select --</option>
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label={`${currentQ} NAV${navData.investmentCurrency ? ` (${navData.investmentCurrency})` : ''}`}
            value={navData.currentQuarterNav}
            onChange={(v) => update('currentQuarterNav', v)}
            placeholder="e.g., 19.0m"
          />
          <Field
            label={`${currentQ} NAV${navData.fundCurrency ? ` (${navData.fundCurrency})` : ' (fund ccy)'}`}
            value={navData.currentQuarterNavFund}
            onChange={(v) => update('currentQuarterNavFund', v)}
            placeholder="e.g., 21.6m"
          />
          <Field
            label={`${priorQ || 'Prior'} NAV${navData.investmentCurrency ? ` (${navData.investmentCurrency})` : ''}`}
            value={navData.priorQuarterNav}
            onChange={(v) => update('priorQuarterNav', v)}
            placeholder="e.g., 19.0m"
          />
          <Field
            label={`${priorQ || 'Prior'} NAV${navData.fundCurrency ? ` (${navData.fundCurrency})` : ' (fund ccy)'}`}
            value={navData.priorQuarterNavFund}
            onChange={(v) => update('priorQuarterNavFund', v)}
            placeholder="e.g., 20.5m"
          />
        </div>
        <div className="mt-1 px-1">
          <p className="text-xs text-navy-400 italic">
            {proposedNavLine || 'Fill in NAV values and currencies above to generate the proposed valuation line.'}
          </p>
        </div>
      </Section>

      {/* Investment Details */}
      <Section title="Investment Details" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="ERVE Investment" value={navData.erveInvestment} onChange={(v) => update('erveInvestment', v)} placeholder="e.g., €5.0m" />
          <Field label="Round & Date" value={navData.roundBreakdown} onChange={(v) => update('roundBreakdown', v)} placeholder="e.g., Series A (Mar-22), Series B (Sep-23)" />
          <Field label="Total Raised" value={navData.totalRaised} onChange={(v) => update('totalRaised', v)} placeholder="e.g., €15.0m" />
          <Field label="ERVE Ownership %" value={navData.erveOwnership} onChange={(v) => update('erveOwnership', v)} placeholder="e.g., 18.5%" />
          <Field label="Security Type" value={navData.securityType} onChange={(v) => update('securityType', v)} placeholder="e.g., Preferred Equity" />
          <Field label="Other Shareholders" value={navData.otherShareholders} onChange={(v) => update('otherShareholders', v)} placeholder="e.g., Founders (40%), Accel (15%)" />
          <Field label="Board Member" value={navData.boardMember} onChange={(v) => update('boardMember', v)} placeholder="Name" />
          <Field label="Board Observer" value={navData.boardObserver} onChange={(v) => update('boardObserver', v)} placeholder="Name" />
          <CurrencyField
            label="Monthly Burn"
            value={navData.monthlyBurn}
            onChange={(v) => update('monthlyBurn', v)}
            currencyValue={navData.monthlyBurnCurrency}
            onCurrencyChange={(v) => update('monthlyBurnCurrency', v)}
            placeholder="e.g., 200k"
          />
          <Field label="FUME Months" value={navData.fumeMonths} onChange={(v) => update('fumeMonths', v)} placeholder="e.g., 18" />
          <CurrencyField
            label="Last Pre-money Valuation"
            value={navData.lastPreMoneyValuation}
            onChange={(v) => update('lastPreMoneyValuation', v)}
            currencyValue={navData.lastPreMoneyCurrency}
            onCurrencyChange={(v) => update('lastPreMoneyCurrency', v)}
            placeholder="e.g., 30.0m"
          />
          <CurrencyField
            label="Last Post-money Valuation"
            value={navData.lastPostMoneyValuation}
            onChange={(v) => update('lastPostMoneyValuation', v)}
            currencyValue={navData.lastPostMoneyCurrency}
            onCurrencyChange={(v) => update('lastPostMoneyCurrency', v)}
            placeholder="e.g., 35.0m"
          />
        </div>
      </Section>

      {/* RAG Status */}
      <Section title="RAG Status" defaultOpen={false}>
        <div className="grid grid-cols-3 gap-4">
          {[
            ['Financials', 'ragFinancials'],
            ['Cash', 'ragCash'],
            ['Market', 'ragMarket'],
            ['Team', 'ragTeam'],
            ['Governance', 'ragGovernance'],
            ['Overall', 'ragOverall'],
          ].map(([label, field]) => (
            <Select
              key={field}
              label={label}
              value={navData[field]}
              onChange={(v) => update(field, v)}
              options={RAG_OPTIONS}
            />
          ))}
        </div>
      </Section>

      {/* Quarterly Financials */}
      <Section title="Quarterly Financials" defaultOpen={false}>
        <p className="text-xs text-navy-400 mb-3">
          These can be auto-extracted from an uploaded Financials document, or entered manually.
        </p>
        <div className="overflow-x-auto rounded-lg border border-navy-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-navy-700/50">
                <th className="text-left text-navy-200 px-3 py-2.5 font-medium"></th>
                {navData.quarterlyFinancials.columns.map((col, i) => (
                  <th key={i} className="text-right text-navy-200 px-2 py-2.5 text-xs whitespace-nowrap font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {navData.quarterlyFinancials.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-navy-700/50">
                  <td className="text-navy-100 font-medium px-3 py-2 whitespace-nowrap">{row.metric}</td>
                  {row.values.map((v, ci) => (
                    <td key={ci} className="px-1.5 py-1">
                      <input
                        type="text"
                        value={v}
                        onChange={(e) => updateFinancialCell(ri, ci, e.target.value)}
                        className="w-full bg-navy-900 border border-navy-600 rounded-lg px-2 py-1 text-xs text-white text-right focus:border-accent-500 focus:outline-none transition-colors"
                        placeholder="--"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Exit Cases */}
      <Section title="Exit Cases / Opportunity Matrix" defaultOpen={false}>
        <div className="overflow-x-auto rounded-lg border border-navy-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-navy-700/50">
                <th className="text-left text-navy-200 px-3 py-2.5 font-medium">Scenario</th>
                <th className="text-left text-navy-200 px-2 py-2.5 font-medium">EV/Exit</th>
                <th className="text-left text-navy-200 px-2 py-2.5 font-medium">MOIC</th>
                <th className="text-left text-navy-200 px-2 py-2.5 font-medium">IRR</th>
                <th className="text-left text-navy-200 px-2 py-2.5 font-medium">Key Factors</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['High (20%)', 'high'],
                ['Base (60%)', 'base'],
                ['Low (20%)', 'low'],
              ].map(([label, key]) => (
                <tr key={key} className="border-t border-navy-700/50">
                  <td className="text-navy-100 font-medium px-3 py-2 whitespace-nowrap">{label}</td>
                  {['evExit', 'moic', 'irr'].map((field) => (
                    <td key={field} className="px-1.5 py-1">
                      <input
                        type="text"
                        value={navData.exitCases[key][field]}
                        onChange={(e) => updateExitCase(key, field, e.target.value)}
                        className="w-full bg-navy-900 border border-navy-600 rounded-lg px-2 py-1 text-xs text-white focus:border-accent-500 focus:outline-none transition-colors"
                        placeholder="--"
                      />
                    </td>
                  ))}
                  <td className="px-1.5 py-1">
                    <input
                      type="text"
                      value={navData.exitCases[key].keyFactors}
                      onChange={(e) => updateExitCase(key, 'keyFactors', e.target.value)}
                      className="w-full bg-navy-900 border border-navy-600 rounded-lg px-2 py-1 text-xs text-white focus:border-accent-500 focus:outline-none transition-colors"
                      placeholder="Key factors..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Field
          label="Blended Expected Return"
          value={navData.blendedExpectedReturn}
          onChange={(v) => update('blendedExpectedReturn', v)}
          placeholder="e.g., 2.5x / 25% IRR"
        />
      </Section>

      {/* Valuation Waterfall */}
      <Section title="Investment Valuation Waterfall" defaultOpen={false}>
        <div className="overflow-x-auto rounded-lg border border-navy-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-navy-700/50">
                <th className="text-left text-navy-200 px-3 py-2.5 font-medium"></th>
                {navData.valuationWaterfall.quarterLabels.map((l, i) => (
                  <th key={i} className="text-right text-navy-200 px-2 py-2.5 font-medium">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Comparable EV/Rev Multiple', 'comparableMultiple'],
                ['ARR', 'arr'],
                ['EV (pre-discount)', 'evPreDiscount'],
                ['Discount Rate', 'discountRate'],
                ['EV (after discount)', 'evAfterDiscount'],
                ['Cash', 'cash'],
                ['Equity Value', 'equityValue'],
                ['ERVE Ownership', 'erveOwnership'],
                ['Comps-based Value', 'compsBasedValue'],
              ].map(([label, key]) => (
                <tr key={key} className="border-t border-navy-700/50">
                  <td className="text-navy-100 font-medium px-3 py-2 whitespace-nowrap text-xs">{label}</td>
                  {navData.valuationWaterfall[key].map((v, ci) => (
                    <td key={ci} className="px-1.5 py-1">
                      <input
                        type="text"
                        value={v}
                        onChange={(e) => updateWaterfallCell(key, ci, e.target.value)}
                        className="w-full bg-navy-900 border border-navy-600 rounded-lg px-2 py-1 text-xs text-white text-right focus:border-accent-500 focus:outline-none transition-colors"
                        placeholder="--"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <Field label="Methodology" value={navData.methodology} onChange={(v) => update('methodology', v)} placeholder="e.g., Comparable companies" />
          <Field label="Valuation" value={navData.valuation} onChange={(v) => update('valuation', v)} placeholder="e.g., €19.0m" />
          <Field label="Implied Multiple" value={navData.impliedMultiple} onChange={(v) => update('impliedMultiple', v)} placeholder="e.g., 5.2x" />
        </div>
      </Section>

      {/* Company Update */}
      <Section title="Company Update Commentary" defaultOpen={false}>
        <p className="text-xs text-navy-400 mb-3">
          This can be AI-generated from uploaded Board Notes and Financials, then edited manually.
        </p>
        <TextArea
          label="Commentary"
          value={navData.companyUpdateCommentary}
          onChange={(v) => update('companyUpdateCommentary', v)}
          rows={6}
          placeholder="Company update commentary will appear here after AI processing, or enter manually..."
        />
      </Section>
    </div>
  )
}

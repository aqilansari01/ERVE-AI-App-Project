import { useState } from 'react'
import FileUpload from './FileUpload'
import { getQuarterOptions, generateFinancialColumns, generateWaterfallLabels } from '../utils/quarterUtils'
import { CURRENCY_OPTIONS, getCurrencySymbol, buildProposedNavLine, getPriorQuarterLabel } from '../utils/navDataModel'

const Section = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left border-l-[3px] border-l-[#E84393]"
      >
        <span className="font-display font-semibold text-sm text-gray-900">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="section-content px-5 py-5 space-y-4 border-t border-gray-100">{children}</div>}
    </div>
  )
}

const Field = ({ label, value, onChange, type = 'text', placeholder = '', className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E84393] focus:ring-1 focus:ring-[#E84393]/20 focus:outline-none transition-colors"
    />
  </div>
)

const TextArea = ({ label, value, onChange, rows = 3, placeholder = '' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E84393] focus:ring-1 focus:ring-[#E84393]/20 focus:outline-none transition-colors resize-y"
    />
  </div>
)

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-[#E84393] focus:ring-1 focus:ring-[#E84393]/20 focus:outline-none transition-colors"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
)

const CurrencyField = ({ label, value, onChange, currencyValue, onCurrencyChange, placeholder = '' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    <div className="flex">
      <select
        value={currencyValue}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-2 py-2 text-xs text-gray-700 focus:border-[#E84393] focus:outline-none transition-colors"
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
        className="flex-1 bg-gray-50 border border-gray-300 rounded-r-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#E84393] focus:ring-1 focus:ring-[#E84393]/20 focus:outline-none transition-colors"
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
    const finHistorical = navData.quarterlyFinancials.historicalData || {}

    // Snapshot current values into historicalData before remapping
    const updatedFinHistorical = { ...finHistorical }
    navData.quarterlyFinancials.rows.forEach((row) => {
      if (!updatedFinHistorical[row.metric]) updatedFinHistorical[row.metric] = {}
      updatedFinHistorical[row.metric] = { ...updatedFinHistorical[row.metric] }
      oldCols.forEach((col, i) => {
        if (row.values[i]) {
          updatedFinHistorical[row.metric][col] = row.values[i]
        }
      })
    })

    const newRows = navData.quarterlyFinancials.rows.map((row) => {
      const metricHistory = updatedFinHistorical[row.metric] || {}
      const positionalMap = {}
      oldCols.forEach((col, i) => { positionalMap[col] = row.values[i] || '' })
      const newValues = newCols.map((col) => metricHistory[col] || positionalMap[col] || '')
      return { ...row, values: newValues }
    })

    const oldWfLabels = navData.valuationWaterfall.quarterLabels
    const newWfLabels = generateWaterfallLabels(newQuarter)
    const wfHistorical = navData.valuationWaterfall.historicalData || {}
    const wfRows = navData.valuationWaterfall.rows || []

    // Snapshot current waterfall row values into historicalData (keyed by row label)
    const updatedWfHistorical = { ...wfHistorical }
    wfRows.forEach((row) => {
      if (!updatedWfHistorical[row.label]) updatedWfHistorical[row.label] = {}
      updatedWfHistorical[row.label] = { ...updatedWfHistorical[row.label] }
      oldWfLabels.forEach((label, i) => {
        if (row.values[i]) {
          updatedWfHistorical[row.label][label] = row.values[i]
        }
      })
    })

    const newWfRows = wfRows.map((row) => {
      const rowHistory = updatedWfHistorical[row.label] || {}
      const positionalMap = {}
      oldWfLabels.forEach((label, i) => { positionalMap[label] = row.values[i] || '' })
      const newValues = newWfLabels.map((label) => rowHistory[label] || positionalMap[label] || '')
      return { ...row, values: newValues }
    })

    const newWaterfall = { ...navData.valuationWaterfall, quarterLabels: newWfLabels, rows: newWfRows, historicalData: updatedWfHistorical }

    onNavDataChange({
      ...navData,
      currentNavQuarter: newQuarter,
      quarterlyFinancials: { columns: newCols, rows: newRows, historicalData: updatedFinHistorical },
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

  const updateWaterfallCell = (rowIndex, colIndex, value) => {
    const colLabel = navData.valuationWaterfall.quarterLabels[colIndex]
    const row = navData.valuationWaterfall.rows[rowIndex]

    const newRows = navData.valuationWaterfall.rows.map((r, ri) => {
      if (ri !== rowIndex) return r
      const newValues = [...r.values]
      newValues[colIndex] = value
      return { ...r, values: newValues }
    })

    const newHistorical = { ...navData.valuationWaterfall.historicalData }
    if (!newHistorical[row.label]) newHistorical[row.label] = {}
    newHistorical[row.label] = { ...newHistorical[row.label], [colLabel]: value }

    onNavDataChange({
      ...navData,
      valuationWaterfall: { ...navData.valuationWaterfall, rows: newRows, historicalData: newHistorical },
    })
  }

  const updateWaterfallLabel = (rowIndex, newLabel) => {
    const newRows = navData.valuationWaterfall.rows.map((r, ri) => {
      if (ri !== rowIndex) return r
      return { ...r, label: newLabel }
    })
    updateNested('valuationWaterfall.rows', newRows)
  }

  const addWaterfallRow = (afterIndex) => {
    const newRow = { label: 'New row', values: navData.valuationWaterfall.quarterLabels.map(() => '') }
    const newRows = [...navData.valuationWaterfall.rows]
    newRows.splice(afterIndex + 1, 0, newRow)
    updateNested('valuationWaterfall.rows', newRows)
  }

  const removeWaterfallRow = (rowIndex) => {
    const newRows = navData.valuationWaterfall.rows.filter((_, ri) => ri !== rowIndex)
    updateNested('valuationWaterfall.rows', newRows)
  }

  const moveWaterfallRow = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= navData.valuationWaterfall.rows.length) return
    const newRows = [...navData.valuationWaterfall.rows]
    const [moved] = newRows.splice(fromIndex, 1)
    newRows.splice(toIndex, 0, moved)
    updateNested('valuationWaterfall.rows', newRows)
  }

  const updateFinancialCell = (rowIndex, colIndex, value) => {
    const colLabel = navData.quarterlyFinancials.columns[colIndex]
    const metric = navData.quarterlyFinancials.rows[rowIndex].metric

    const newRows = navData.quarterlyFinancials.rows.map((r, ri) => {
      if (ri !== rowIndex) return r
      const newValues = [...r.values]
      newValues[colIndex] = value
      return { ...r, values: newValues }
    })

    const newHistorical = { ...navData.quarterlyFinancials.historicalData }
    if (!newHistorical[metric]) newHistorical[metric] = {}
    newHistorical[metric] = { ...newHistorical[metric], [colLabel]: value }

    onNavDataChange({
      ...navData,
      quarterlyFinancials: {
        ...navData.quarterlyFinancials,
        rows: newRows,
        historicalData: newHistorical,
      },
    })
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
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">NAV 1-Pager Input</h2>
        <p className="text-gray-500 text-sm font-body">
          Fill in the form fields and optionally upload documents for AI-assisted extraction
        </p>
      </div>

      {/* Company Profile Selector */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 px-5 py-5">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Company</label>
            <select
              value={selectedProfileId || ''}
              onChange={(e) => onSelectProfile(e.target.value || null)}
              className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-[#E84393] focus:ring-1 focus:ring-[#E84393]/20 focus:outline-none transition-colors"
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
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              disabled || profileSaving || !navData.companyName
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#E84393] hover:bg-[#D63384] text-white shadow-sm'
            }`}
          >
            {profileSaving ? 'Saving...' : selectedProfileId ? 'Update Profile' : 'Save Profile'}
          </button>
          {selectedProfileId && (
            <button
              type="button"
              onClick={onDeleteProfile}
              disabled={disabled || profileSaving}
              className="px-4 py-2 rounded-md text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all whitespace-nowrap"
            >
              Delete
            </button>
          )}
        </div>
        {selectedProfileId && (
          <p className="text-xs text-gray-500 mt-3">
            All data including quarterly financials and waterfall is saved with the profile. Data will auto-roll forward when loaded in a later quarter.
          </p>
        )}
      </div>

      {/* Roll-forward notification */}
      {rollForwardMessage && (
        <div className="bg-amber-50 border border-amber-300 rounded-md px-5 py-4 flex items-center justify-between">
          <p className="text-amber-800 text-sm">{rollForwardMessage}</p>
          <button
            type="button"
            onClick={onDismissRollMessage}
            className="ml-4 text-amber-600 hover:text-amber-800 text-lg font-bold leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* Current NAV Quarter Selector */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 px-5 py-5">
        <div className="flex items-end gap-4">
          <div className="w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Current NAV Quarter</label>
            <select
              value={navData.currentNavQuarter || 'Q1-26'}
              onChange={(e) => handleQuarterChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-[#E84393] focus:ring-1 focus:ring-[#E84393]/20 focus:outline-none transition-colors"
              disabled={disabled}
            >
              {getQuarterOptions().map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 pb-2">
            This drives the rolling column headers for Quarterly Financials and Valuation Waterfall.
          </p>
        </div>
      </div>

      {/* File Uploads */}
      <Section title="Document Uploads (Optional)" defaultOpen={false}>
        <p className="text-xs text-gray-500 mb-3">
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
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Investment Currency</label>
            <select
              value={navData.investmentCurrency}
              onChange={(e) => update('investmentCurrency', e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-[#E84393] focus:ring-1 focus:ring-[#E84393]/20 focus:outline-none transition-colors"
            >
              <option value="">-- Select --</option>
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Fund Currency</label>
            <select
              value={navData.fundCurrency}
              onChange={(e) => update('fundCurrency', e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-[#E84393] focus:ring-1 focus:ring-[#E84393]/20 focus:outline-none transition-colors"
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
          <p className="text-xs text-gray-500 italic">
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
        <div className="flex justify-center gap-10 flex-wrap">
          {[
            ['Financials', 'ragFinancials'],
            ['Cash', 'ragCash'],
            ['Market', 'ragMarket'],
            ['Team', 'ragTeam'],
            ['Governance', 'ragGovernance'],
            ['Overall', 'ragOverall'],
          ].map(([label, field]) => (
            <div key={field} className="flex flex-col items-center min-w-[80px]">
              <Select
                label={label}
                value={navData[field]}
                onChange={(v) => update(field, v)}
                options={RAG_OPTIONS}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Quarterly Financials */}
      <Section title="Quarterly Financials" defaultOpen={false}>
        <p className="text-xs text-gray-500 mb-3">
          These can be auto-extracted from an uploaded Financials document, or entered manually.
        </p>
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-2 py-1.5">
                  <input
                    type="text"
                    value={navData.financialsCurrencyUnit || ''}
                    onChange={(e) => update('financialsCurrencyUnit', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:border-[#E84393] focus:outline-none transition-colors"
                    placeholder="e.g. USD'm"
                  />
                </th>
                {navData.quarterlyFinancials.columns.map((col, i) => (
                  <th key={i} className="text-right text-gray-500 font-medium text-xs uppercase tracking-wider px-2 py-2.5 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {navData.quarterlyFinancials.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-gray-100">
                  <td className="text-gray-900 font-medium px-3 py-2 whitespace-nowrap">{row.metric}</td>
                  {row.values.map((v, ci) => (
                    <td key={ci} className="px-1.5 py-1">
                      <input
                        type="text"
                        value={v}
                        onChange={(e) => updateFinancialCell(ri, ci, e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 text-right focus:border-[#E84393] focus:outline-none transition-colors"
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
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wider px-3 py-2.5" style={{ width: '8%' }}>Scenario</th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wider px-2 py-2.5" style={{ width: '8%' }}>Weighting</th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wider px-2 py-2.5" style={{ width: '12%' }}>EV/Exit</th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wider px-2 py-2.5" style={{ width: '7%' }}>MOIC</th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wider px-2 py-2.5" style={{ width: '7%' }}>IRR</th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wider px-2 py-2.5" style={{ width: '58%' }}>Key Factors</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['High', 'high'],
                ['Base', 'base'],
                ['Low', 'low'],
              ].map(([label, key]) => (
                <tr key={key} className="border-t border-gray-100">
                  <td className="text-gray-900 font-medium px-3 py-2 whitespace-nowrap" style={{ width: '8%' }}>{label}</td>
                  <td className="px-1.5 py-1" style={{ width: '8%' }}>
                    <input
                      type="text"
                      value={navData.exitCases[key].weight}
                      onChange={(e) => updateExitCase(key, 'weight', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:border-[#E84393] focus:outline-none transition-colors"
                      placeholder="e.g. 20%"
                    />
                  </td>
                  {['evExit', 'moic', 'irr'].map((field) => (
                    <td key={field} className="px-1.5 py-1">
                      <input
                        type="text"
                        value={navData.exitCases[key][field]}
                        onChange={(e) => updateExitCase(key, field, e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:border-[#E84393] focus:outline-none transition-colors"
                        placeholder="--"
                      />
                    </td>
                  ))}
                  <td className="px-1.5 py-1" style={{ width: '58%' }}>
                    <input
                      type="text"
                      value={navData.exitCases[key].keyFactors}
                      onChange={(e) => updateExitCase(key, 'keyFactors', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:border-[#E84393] focus:outline-none transition-colors"
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
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wider px-1 py-2.5" style={{ width: '52px' }}></th>
                <th className="text-left text-gray-500 font-medium text-xs uppercase tracking-wider px-3 py-2.5"></th>
                {navData.valuationWaterfall.quarterLabels.map((l, i) => (
                  <th key={i} className="text-right text-gray-500 font-medium text-xs uppercase tracking-wider px-2 py-2.5">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(navData.valuationWaterfall.rows || []).map((row, ri) => {
                const rowCount = navData.valuationWaterfall.rows.length
                return (
                  <tr key={ri} className="border-t border-gray-100 group">
                    <td className="px-1 py-1 text-center" style={{ width: '52px' }}>
                      <span className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveWaterfallRow(ri, ri - 1)}
                          disabled={ri === 0}
                          className="text-gray-300 hover:text-gray-600 text-[10px] leading-none disabled:opacity-30 disabled:cursor-default"
                          title="Move up"
                        >&#9650;</button>
                        <button
                          type="button"
                          onClick={() => moveWaterfallRow(ri, ri + 1)}
                          disabled={ri === rowCount - 1}
                          className="text-gray-300 hover:text-gray-600 text-[10px] leading-none disabled:opacity-30 disabled:cursor-default"
                          title="Move down"
                        >&#9660;</button>
                        <button
                          type="button"
                          onClick={() => addWaterfallRow(ri)}
                          className="text-gray-300 hover:text-[#E84393] text-[11px] leading-none ml-0.5"
                          title="Insert row below"
                        >+</button>
                        <button
                          type="button"
                          onClick={() => removeWaterfallRow(ri)}
                          className="text-gray-300 hover:text-red-500 text-xs leading-none ml-0.5"
                          title="Remove row"
                        >&times;</button>
                      </span>
                    </td>
                    <td className="px-1.5 py-1">
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => updateWaterfallLabel(ri, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 font-medium focus:border-[#E84393] focus:outline-none transition-colors"
                      />
                    </td>
                    {row.values.map((v, ci) => (
                      <td key={ci} className="px-1.5 py-1">
                        <input
                          type="text"
                          value={v}
                          onChange={(e) => updateWaterfallCell(ri, ci, e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 text-right focus:border-[#E84393] focus:outline-none transition-colors"
                          placeholder="--"
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() => addWaterfallRow((navData.valuationWaterfall.rows || []).length - 1)}
          className="mt-2 text-xs text-[#E84393] hover:text-[#D63384] font-medium transition-colors"
        >
          + Add Row
        </button>
      </Section>

      {/* Company Update */}
      <Section title="Company Update Commentary" defaultOpen={false}>
        <p className="text-xs text-gray-500 mb-3">
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

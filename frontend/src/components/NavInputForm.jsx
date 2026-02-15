import { useState } from 'react'
import FileUpload from './FileUpload'
import { getQuarterOptions, generateFinancialColumns, generateWaterfallLabels } from '../utils/quarterUtils'
import { CURRENCY_OPTIONS, getCurrencySymbol } from '../utils/navDataModel'

const Section = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-800 hover:bg-slate-750 transition-colors text-left"
      >
        <span className="font-semibold text-sm text-slate-200">{title}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 py-4 space-y-3 bg-slate-900/50">{children}</div>}
    </div>
  )
}

const Field = ({ label, value, onChange, type = 'text', placeholder = '', className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
    />
  </div>
)

const TextArea = ({ label, value, onChange, rows = 3, placeholder = '' }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-y"
    />
  </div>
)

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
)

const CurrencyField = ({ label, value, onChange, currencyValue, onCurrencyChange, placeholder = '' }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
    <div className="flex">
      <select
        value={currencyValue}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className="bg-slate-700 border border-slate-600 border-r-0 rounded-l px-2 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
      >
        <option value="">—</option>
        {CURRENCY_OPTIONS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-slate-800 border border-slate-600 rounded-r px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
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
    const newColumns = generateFinancialColumns(newQuarter)
    const newLabels = generateWaterfallLabels(newQuarter)
    onNavDataChange({
      ...navData,
      currentNavQuarter: newQuarter,
      navQuarterLabel: newQuarter,
      quarterlyFinancials: {
        ...navData.quarterlyFinancials,
        columns: newColumns,
      },
      valuationWaterfall: {
        ...navData.valuationWaterfall,
        quarterLabels: newLabels,
      },
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

  // Build dynamic placeholder for Proposed NAV Valuation Line
  const invSym = getCurrencySymbol(navData.investmentCurrency) || '€'
  const fundSym = getCurrencySymbol(navData.fundCurrency) || '$'
  const qLabel = navData.navQuarterLabel || 'Q4-25'
  const navPlaceholder = `e.g., Proposed NAV valuation ${qLabel}: ${invSym}19.0m / ${fundSym}21.6m`

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">NAV 1-Pager Input</h2>
        <p className="text-slate-400 text-sm">
          Fill in the form fields and optionally upload documents for AI-assisted extraction
        </p>
      </div>

      {/* Company Profile Selector */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-5 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-400 mb-1">Select Company</label>
            <select
              value={selectedProfileId || ''}
              onChange={(e) => onSelectProfile(e.target.value || null)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              disabled={disabled}
            >
              <option value="">— New Company —</option>
              {(profiles || []).map((p) => (
                <option key={p.id} value={p.id}>{p.companyName}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={onSaveProfile}
            disabled={disabled || profileSaving || !navData.companyName}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all whitespace-nowrap ${
              disabled || profileSaving || !navData.companyName
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {profileSaving ? 'Saving...' : selectedProfileId ? 'Update Profile' : 'Save Profile'}
          </button>
          {selectedProfileId && (
            <button
              type="button"
              onClick={onDeleteProfile}
              disabled={disabled || profileSaving}
              className="px-3 py-1.5 rounded text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-all whitespace-nowrap"
            >
              Delete
            </button>
          )}
        </div>
        {selectedProfileId && (
          <p className="text-xs text-slate-500 mt-2">
            All data including quarterly financials and waterfall is saved with the profile. Data will auto-roll forward when loaded in a later quarter.
          </p>
        )}
      </div>

      {/* Roll-forward notification */}
      {rollForwardMessage && (
        <div className="bg-amber-500/10 border border-amber-500 rounded-lg px-5 py-3 flex items-center justify-between">
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
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-5 py-4">
        <div className="flex items-end gap-3">
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-400 mb-1">Current NAV Quarter</label>
            <select
              value={navData.currentNavQuarter || 'Q1-26'}
              onChange={(e) => handleQuarterChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              disabled={disabled}
            >
              {getQuarterOptions().map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500 pb-1">
            This drives the rolling column headers for Quarterly Financials and Valuation Waterfall.
          </p>
        </div>
      </div>

      {/* File Uploads */}
      <Section title="Document Uploads (Optional)" defaultOpen={false}>
        <p className="text-xs text-slate-500 mb-3">
          Upload documents to auto-extract quarterly financials and generate company update commentary.
        </p>
        <FileUpload files={files} onFilesChange={onFilesChange} disabled={disabled} />
      </Section>

      {/* Company Info */}
      <Section title="Company Information" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-3">
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Investment Currency</label>
            <select
              value={navData.investmentCurrency}
              onChange={(e) => update('investmentCurrency', e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">— Select —</option>
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Fund Currency</label>
            <select
              value={navData.fundCurrency}
              onChange={(e) => update('fundCurrency', e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">— Select —</option>
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label={`Current Quarter NAV${navData.investmentCurrency ? ` (${navData.investmentCurrency})` : ''}`}
            value={navData.currentQuarterNav}
            onChange={(v) => update('currentQuarterNav', v)}
            placeholder={`e.g., ${invSym}19.0m`}
          />
          <Field
            label={`Current Quarter NAV${navData.fundCurrency ? ` (${navData.fundCurrency})` : ' (fund ccy)'}`}
            value={navData.currentQuarterNavFund}
            onChange={(v) => update('currentQuarterNavFund', v)}
            placeholder={`e.g., ${fundSym}21.6m`}
          />
          <Field
            label={`Prior Quarter NAV${navData.investmentCurrency ? ` (${navData.investmentCurrency})` : ''}`}
            value={navData.priorQuarterNav}
            onChange={(v) => update('priorQuarterNav', v)}
            placeholder={`e.g., ${invSym}19.0m`}
          />
          <Field
            label={`Prior Quarter NAV${navData.fundCurrency ? ` (${navData.fundCurrency})` : ' (fund ccy)'}`}
            value={navData.priorQuarterNavFund}
            onChange={(v) => update('priorQuarterNavFund', v)}
            placeholder={`e.g., ${fundSym}20.5m`}
          />
        </div>
        <Field label="Quarter Label" value={navData.navQuarterLabel} onChange={(v) => update('navQuarterLabel', v)} placeholder="e.g., Q4-25" />
        <Field label="Proposed NAV Valuation Line" value={navData.proposedNavValuation} onChange={(v) => update('proposedNavValuation', v)} placeholder={navPlaceholder} />
      </Section>

      {/* Investment Details */}
      <Section title="Investment Details" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3">
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
        <div className="grid grid-cols-3 gap-3">
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
        <p className="text-xs text-slate-500 mb-2">
          These can be auto-extracted from an uploaded Financials document, or entered manually.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-slate-400 px-2 py-1"></th>
                {navData.quarterlyFinancials.columns.map((col, i) => (
                  <th key={i} className="text-right text-slate-400 px-1 py-1 text-xs whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {navData.quarterlyFinancials.rows.map((row, ri) => (
                <tr key={ri}>
                  <td className="text-slate-300 font-medium px-2 py-1 whitespace-nowrap">{row.metric}</td>
                  {row.values.map((v, ci) => (
                    <td key={ci} className="px-1 py-0.5">
                      <input
                        type="text"
                        value={v}
                        onChange={(e) => updateFinancialCell(ri, ci, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white text-right focus:border-blue-500 focus:outline-none"
                        placeholder="—"
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
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-slate-400 px-2 py-1">Scenario</th>
                <th className="text-left text-slate-400 px-1 py-1">EV/Exit</th>
                <th className="text-left text-slate-400 px-1 py-1">MOIC</th>
                <th className="text-left text-slate-400 px-1 py-1">IRR</th>
                <th className="text-left text-slate-400 px-1 py-1">Key Factors</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['High (20%)', 'high'],
                ['Base (60%)', 'base'],
                ['Low (20%)', 'low'],
              ].map(([label, key]) => (
                <tr key={key}>
                  <td className="text-slate-300 font-medium px-2 py-1 whitespace-nowrap">{label}</td>
                  {['evExit', 'moic', 'irr'].map((field) => (
                    <td key={field} className="px-1 py-0.5">
                      <input
                        type="text"
                        value={navData.exitCases[key][field]}
                        onChange={(e) => updateExitCase(key, field, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                        placeholder="—"
                      />
                    </td>
                  ))}
                  <td className="px-1 py-0.5">
                    <input
                      type="text"
                      value={navData.exitCases[key].keyFactors}
                      onChange={(e) => updateExitCase(key, 'keyFactors', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:border-blue-500 focus:outline-none"
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
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-slate-400 px-2 py-1"></th>
                {navData.valuationWaterfall.quarterLabels.map((l, i) => (
                  <th key={i} className="text-right text-slate-400 px-1 py-1">{l}</th>
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
                <tr key={key}>
                  <td className="text-slate-300 font-medium px-2 py-1 whitespace-nowrap text-xs">{label}</td>
                  {navData.valuationWaterfall[key].map((v, ci) => (
                    <td key={ci} className="px-1 py-0.5">
                      <input
                        type="text"
                        value={v}
                        onChange={(e) => updateWaterfallCell(key, ci, e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white text-right focus:border-blue-500 focus:outline-none"
                        placeholder="—"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-2">
          <Field label="Methodology" value={navData.methodology} onChange={(v) => update('methodology', v)} placeholder="e.g., Comparable companies" />
          <Field label="Valuation" value={navData.valuation} onChange={(v) => update('valuation', v)} placeholder="e.g., €19.0m" />
          <Field label="Implied Multiple" value={navData.impliedMultiple} onChange={(v) => update('impliedMultiple', v)} placeholder="e.g., 5.2x" />
        </div>
      </Section>

      {/* Company Update */}
      <Section title="Company Update Commentary" defaultOpen={false}>
        <p className="text-xs text-slate-500 mb-2">
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

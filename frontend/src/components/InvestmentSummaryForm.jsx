export default function InvestmentSummaryForm({ data, onChange, disabled }) {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide">Investment Summary</h2>
        <p className="text-gray-400">
          Enter investment details that rarely change quarter-to-quarter
        </p>
      </div>

      {/* Company Header Information */}
      <div className="bg-[#374A5E] rounded-lg p-6 border border-gray-600">
        <h3 className="text-lg font-bold mb-4 text-[#FF5722]">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={data.companyName || ''}
              onChange={(e) => handleChange('companyName', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., Villain"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Company Description
            </label>
            <textarea
              value={data.companyDescription || ''}
              onChange={(e) => handleChange('companyDescription', e.target.value)}
              disabled={disabled}
              rows="3"
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., Villain, founded in Prague in 2018, provides cloud-based project management, time tracking, and invoicing software..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Founded Year
            </label>
            <input
              type="text"
              value={data.foundedYear || ''}
              onChange={(e) => handleChange('foundedYear', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., 2019"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Location (City, Country)
            </label>
            <input
              type="text"
              value={data.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., Hamburg, Germany"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Website URL
            </label>
            <input
              type="text"
              value={data.websiteUrl || ''}
              onChange={(e) => handleChange('websiteUrl', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., https://www.example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Current Quarter NAV (EUR)
            </label>
            <input
              type="text"
              value={data.currentQuarterNAV || ''}
              onChange={(e) => handleChange('currentQuarterNAV', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., €19.0m"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Current Quarter NAV (USD)
            </label>
            <input
              type="text"
              value={data.currentQuarterNAVUSD || ''}
              onChange={(e) => handleChange('currentQuarterNAVUSD', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., $21.9m"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Prior Quarter NAV (EUR)
            </label>
            <input
              type="text"
              value={data.priorQuarterNAV || ''}
              onChange={(e) => handleChange('priorQuarterNAV', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., €19.0m"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Prior Quarter NAV (USD)
            </label>
            <input
              type="text"
              value={data.priorQuarterNAVUSD || ''}
              onChange={(e) => handleChange('priorQuarterNAVUSD', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., $22.3m"
            />
          </div>
        </div>
      </div>

      {/* Investment Details */}
      <div className="bg-[#374A5E] rounded-lg p-6 border border-gray-600">
        <h3 className="text-lg font-bold mb-4 text-[#FF5722]">Investment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ERVE investment amount in EUR */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              ERVE Investment (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              value={data.erveInvestmentEUR || ''}
              onChange={(e) => handleChange('erveInvestmentEUR', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., 12000000"
            />
          </div>

          {/* USD equivalent */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              ERVE Investment (USD Equivalent)
            </label>
            <input
              type="number"
              step="0.01"
              value={data.erveInvestmentUSD || ''}
              onChange={(e) => handleChange('erveInvestmentUSD', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., 13000000"
            />
          </div>

          {/* Investment round and date */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Investment Round & Date
            </label>
            <input
              type="text"
              value={data.investmentRound || ''}
              onChange={(e) => handleChange('investmentRound', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., Jul-24 – Series B: €19.0m"
            />
          </div>

          {/* Total raised */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Total Raised
            </label>
            <input
              type="text"
              value={data.totalRaised || ''}
              onChange={(e) => handleChange('totalRaised', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., €42.0m Primary, €5.0m Secondary"
            />
          </div>

          {/* ERVE % ownership */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              ERVE % Ownership
            </label>
            <input
              type="number"
              step="0.01"
              value={data.erveOwnership || ''}
              onChange={(e) => handleChange('erveOwnership', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., 15.5"
            />
          </div>

          {/* Security type */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Security Type
            </label>
            <input
              type="text"
              value={data.securityType || ''}
              onChange={(e) => handleChange('securityType', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., Senior Preferred shares"
            />
          </div>

          {/* Other shareholders */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Other Shareholders
            </label>
            <input
              type="text"
              value={data.otherShareholders || ''}
              onChange={(e) => handleChange('otherShareholders', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., Accel, Index Ventures, Founders"
            />
          </div>

          {/* Board Member name */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Board Member
            </label>
            <input
              type="text"
              value={data.boardMember || ''}
              onChange={(e) => handleChange('boardMember', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., John Smith"
            />
          </div>

          {/* Board Observer name */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Board Observer
            </label>
            <input
              type="text"
              value={data.boardObserver || ''}
              onChange={(e) => handleChange('boardObserver', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., Jane Doe"
            />
          </div>

          {/* Monthly burn */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Monthly Burn
            </label>
            <input
              type="number"
              step="0.01"
              value={data.monthlyBurn || ''}
              onChange={(e) => handleChange('monthlyBurn', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., 300000"
            />
          </div>

          {/* FUME - months of runway */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              FUME (Months of Runway)
            </label>
            <input
              type="number"
              step="1"
              value={data.fume || ''}
              onChange={(e) => handleChange('fume', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., 18"
            />
          </div>

          {/* Last pre-money valuation */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Last Pre-Money Valuation
            </label>
            <input
              type="number"
              step="0.01"
              value={data.preMoneyValuation || ''}
              onChange={(e) => handleChange('preMoneyValuation', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., 75000000"
            />
          </div>

          {/* Last post-money valuation */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">
              Last Post-Money Valuation
            </label>
            <input
              type="number"
              step="0.01"
              value={data.postMoneyValuation || ''}
              onChange={(e) => handleChange('postMoneyValuation', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50"
              placeholder="e.g., 95000000"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

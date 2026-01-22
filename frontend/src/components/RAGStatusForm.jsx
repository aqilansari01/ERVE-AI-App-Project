export default function RAGStatusForm({ data, onChange, disabled }) {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const statusOptions = ['Green', 'Amber', 'Red']

  const getStatusColor = (status) => {
    switch (status) {
      case 'Green':
        return 'bg-green-600'
      case 'Amber':
        return 'bg-amber-500'
      case 'Red':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const StatusDropdown = ({ label, field }) => (
    <div>
      <label className="block text-sm font-bold uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={data[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-2 border border-gray-600 rounded text-white focus:border-[#FF5722] focus:outline-none disabled:opacity-50 appearance-none ${
            data[field] ? getStatusColor(data[field]) : 'bg-[#2C3E50]'
          }`}
        >
          <option value="" className="bg-[#2C3E50]">Select status...</option>
          {statusOptions.map((option) => (
            <option key={option} value={option} className="bg-[#2C3E50]">
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  )

  return (
    <div className="mt-8 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide">RAG Status Indicators</h2>
        <p className="text-gray-400">
          Select the status for each category
        </p>
      </div>

      <div className="bg-[#374A5E] rounded-lg p-6 border border-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusDropdown label="Financials" field="financialsStatus" />
          <StatusDropdown label="Cash" field="cashStatus" />
          <StatusDropdown label="Market" field="marketStatus" />
          <StatusDropdown label="Team" field="teamStatus" />
          <StatusDropdown label="Governance" field="governanceStatus" />
          <StatusDropdown label="Overall" field="overallStatus" />
        </div>
      </div>
    </div>
  )
}

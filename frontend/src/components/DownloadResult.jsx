export default function DownloadResult({ result, companyName, onReset }) {
  const handleDownload = () => {
    const url = window.URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    const sanitizedName = (companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '-')
    a.download = `NAV-1-Pager-${sanitizedName}-${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-md p-10 shadow-sm border border-gray-200">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">PDF Generated</h2>
            <p className="text-gray-500 text-sm">
              Your NAV 1-pager PDF has been generated successfully
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 bg-[#E84393] hover:bg-[#D63384] rounded-md font-body font-medium text-sm text-white transition-all shadow-sm"
            >
              Download PDF
            </button>

            <button
              onClick={onReset}
              className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-md font-body font-medium text-sm text-gray-700 transition-all"
            >
              Generate Another
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

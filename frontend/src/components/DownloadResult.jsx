export default function DownloadResult({ result, onReset }) {
  const handleDownload = () => {
    const blob = new Blob([result], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `NAV-1-Pager-${new Date().toISOString().split('T')[0]}.docx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg p-8 border border-green-500/30">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <svg
              className="h-20 w-20 text-green-400"
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

          <div>
            <h2 className="text-3xl font-bold mb-2">Success!</h2>
            <p className="text-slate-300">
              Your NAV 1-pager has been generated successfully
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Download NAV 1-Pager
            </button>

            <button
              onClick={onReset}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-all"
            >
              Generate Another
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

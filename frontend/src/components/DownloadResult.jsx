export default function DownloadResult({ result, onReset }) {
  const handleDownload = () => {
    // Result is already a Blob from pptxgenjs
    const url = window.URL.createObjectURL(result)
    const a = document.createElement('a')
    a.href = url
    a.download = `NAV-1-Pager-${new Date().toISOString().split('T')[0]}.pptx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#374A5E] rounded-lg p-12 border border-gray-600">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <svg
              className="h-20 w-20 text-[#FF5722]"
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
            <h2 className="text-3xl font-bold mb-2 uppercase tracking-wide">Success!</h2>
            <p className="text-gray-300">
              Your NAV 1-pager has been generated successfully
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="px-10 py-4 bg-[#FF5722] hover:bg-[#E64A19] rounded-full font-bold text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-xl"
            >
              Download NAV 1-Pager
            </button>

            <button
              onClick={onReset}
              className="px-10 py-4 bg-transparent border-2 border-white hover:bg-white/10 rounded-full font-bold text-sm uppercase tracking-wider transition-all"
            >
              Generate Another
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

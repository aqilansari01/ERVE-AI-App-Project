import { useState } from 'react'
import FileUpload from './components/FileUpload'
import ProcessingStatus from './components/ProcessingStatus'
import DownloadResult from './components/DownloadResult'
import { processNAVDocuments } from './services/documentProcessor'

function App() {
  const [files, setFiles] = useState({
    template: null,
    priorNav: null,
    boardNotes: null,
    financials: null,
  })
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles)
    setError(null)
  }

  const handleGenerate = async () => {
    if (!files.template || !files.priorNav || !files.boardNotes || !files.financials) {
      setError('Please upload all required documents')
      return
    }

    setProcessing(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      setStatusMessage('Uploading documents...')
      setProgress(10)

      const generatedDoc = await processNAVDocuments(
        files,
        (message, progressValue) => {
          setStatusMessage(message)
          setProgress(progressValue)
        }
      )

      setResult(generatedDoc)
      setStatusMessage('NAV 1-pager generated successfully!')
      setProgress(100)
    } catch (err) {
      console.error('Error generating NAV:', err)
      setError(err.message || 'Failed to generate NAV 1-pager')
      setStatusMessage('')
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFiles({
      template: null,
      priorNav: null,
      boardNotes: null,
      financials: null,
    })
    setProcessing(false)
    setProgress(0)
    setStatusMessage('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            NAV 1-Pager Generator
          </h1>
          <p className="text-slate-300 text-lg">
            Automate quarterly NAV 1-pager generation with AI
          </p>
        </header>

        {!result ? (
          <>
            <FileUpload
              files={files}
              onFilesChange={handleFilesChange}
              disabled={processing}
            />

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {processing && (
              <ProcessingStatus
                message={statusMessage}
                progress={progress}
              />
            )}

            <div className="mt-8 text-center">
              <button
                onClick={handleGenerate}
                disabled={processing || !files.template}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                  processing || !files.template
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {processing ? 'Generating...' : 'Generate NAV 1-Pager'}
              </button>
            </div>
          </>
        ) : (
          <DownloadResult
            result={result}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}

export default App

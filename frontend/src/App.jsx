import { useState } from 'react'
import NavInputForm from './components/NavInputForm'
import NavPreview from './components/NavPreview'
import ProcessingStatus from './components/ProcessingStatus'
import DownloadResult from './components/DownloadResult'
import { processNAVDocuments } from './services/documentProcessor'
import { createEmptyNavData } from './utils/navDataModel'

function App() {
  const [step, setStep] = useState('input') // 'input' | 'processing' | 'preview' | 'result'
  const [navData, setNavData] = useState(createEmptyNavData())
  const [files, setFiles] = useState({
    priorNav: null,
    boardNotes: null,
    financials: null,
  })
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [pdfBlob, setPdfBlob] = useState(null)
  const [error, setError] = useState(null)

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles)
    setError(null)
  }

  const handleNavDataChange = (newData) => {
    setNavData(newData)
  }

  const handleProcessUploads = async () => {
    const hasFiles = files.priorNav || files.boardNotes || files.financials
    if (!hasFiles) {
      setError('Please upload at least one document to process with AI')
      return
    }

    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const result = await processNAVDocuments(
        files,
        (message, progressValue) => {
          setStatusMessage(message)
          if (progressValue !== null) setProgress(progressValue)
        }
      )

      // Merge AI results into navData
      const updates = {}
      if (result.quarterlyFinancials) {
        updates.quarterlyFinancials = result.quarterlyFinancials
      }
      if (result.companyUpdateCommentary) {
        updates.companyUpdateCommentary = result.companyUpdateCommentary
      }

      if (Object.keys(updates).length > 0) {
        setNavData((prev) => ({ ...prev, ...updates }))
      }

      setStatusMessage('AI processing complete! Review the extracted data in the form.')
      setProgress(100)
    } catch (err) {
      console.error('Error processing documents:', err)
      setError(err.message || 'Failed to process documents')
    } finally {
      setProcessing(false)
    }
  }

  const handlePreview = () => {
    if (!navData.companyName) {
      setError('Please enter at least a company name before previewing')
      return
    }
    setError(null)
    setStep('preview')
  }

  const handlePdfGenerated = (blob) => {
    setPdfBlob(blob)
    setStep('result')
  }

  const handleReset = () => {
    setStep('input')
    setNavData(createEmptyNavData())
    setFiles({ priorNav: null, boardNotes: null, financials: null })
    setProcessing(false)
    setProgress(0)
    setStatusMessage('')
    setPdfBlob(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            NAV 1-Pager Generator
          </h1>
          <p className="text-slate-300 text-sm">
            Fill in company data, optionally upload documents for AI extraction, then generate a PDF
          </p>
        </header>

        {step === 'input' && (
          <>
            <NavInputForm
              navData={navData}
              onNavDataChange={handleNavDataChange}
              files={files}
              onFilesChange={handleFilesChange}
              disabled={processing}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg max-w-5xl mx-auto">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {processing && (
              <div className="mt-4 max-w-5xl mx-auto">
                <ProcessingStatus message={statusMessage} progress={progress} />
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleProcessUploads}
                disabled={processing || (!files.priorNav && !files.boardNotes && !files.financials)}
                className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                  processing || (!files.priorNav && !files.boardNotes && !files.financials)
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {processing ? 'Processing...' : 'Process Uploads with AI'}
              </button>

              <button
                onClick={handlePreview}
                disabled={processing}
                className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                  processing
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                Preview NAV 1-Pager
              </button>
            </div>
          </>
        )}

        {step === 'preview' && (
          <NavPreview
            navData={navData}
            onBack={() => setStep('input')}
            onPdfGenerated={handlePdfGenerated}
          />
        )}

        {step === 'result' && (
          <DownloadResult
            result={pdfBlob}
            companyName={navData.companyName}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}

export default App

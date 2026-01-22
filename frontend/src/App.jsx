import { useState } from 'react'
import FileUpload from './components/FileUpload'
import InvestmentSummaryForm from './components/InvestmentSummaryForm'
import RAGStatusForm from './components/RAGStatusForm'
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
  const [investmentSummary, setInvestmentSummary] = useState({
    erveInvestmentEUR: '',
    erveInvestmentUSD: '',
    investmentRound: '',
    totalRaised: '',
    erveOwnership: '',
    securityType: '',
    otherShareholders: '',
    boardMember: '',
    boardObserver: '',
    monthlyBurn: '',
    fume: '',
    preMoneyValuation: '',
    postMoneyValuation: '',
  })
  const [ragStatus, setRAGStatus] = useState({
    financialsStatus: '',
    cashStatus: '',
    marketStatus: '',
    teamStatus: '',
    governanceStatus: '',
    overallStatus: '',
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

  const handleInvestmentSummaryChange = (newData) => {
    setInvestmentSummary(newData)
  }

  const handleRAGStatusChange = (newData) => {
    setRAGStatus(newData)
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
        investmentSummary,
        ragStatus,
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
    <div className="min-h-screen bg-[#2C3E50] text-white">
      {/* Orange top stripe like Eight Roads */}
      <div className="h-1 bg-[#FF5722]"></div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white uppercase tracking-wider">
            NAV 1-Pager Generator
          </h1>
          <p className="text-gray-300 text-lg font-light">
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

            <InvestmentSummaryForm
              data={investmentSummary}
              onChange={handleInvestmentSummaryChange}
              disabled={processing}
            />

            <RAGStatusForm
              data={ragStatus}
              onChange={handleRAGStatusChange}
              disabled={processing}
            />

            {error && (
              <div className="mt-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-lg">
                <p className="text-red-300 font-medium">{error}</p>
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
                className={`px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all ${
                  processing || !files.template
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[#FF5722] hover:bg-[#E64A19] text-white shadow-lg hover:shadow-xl'
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

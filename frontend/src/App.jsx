import { useState, useEffect } from 'react'
import NavInputForm from './components/NavInputForm'
import NavPreview from './components/NavPreview'
import ProcessingStatus from './components/ProcessingStatus'
import DownloadResult from './components/DownloadResult'
import { processNAVDocuments } from './services/documentProcessor'
import { createEmptyNavData } from './utils/navDataModel'
import {
  fetchCompanyProfiles,
  saveCompanyProfile,
  deleteCompanyProfile,
  applyProfileToNavData,
} from './services/companyProfiles'
import {
  parseQuarter,
  formatQuarter,
  quarterDiff,
  generateFinancialColumns,
  generateWaterfallLabels,
  rollFinancialsForward,
  rollWaterfallForward,
} from './utils/quarterUtils'

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

  // Company profiles state
  const [profiles, setProfiles] = useState([])
  const [selectedProfileId, setSelectedProfileId] = useState(null)
  const [profileSaving, setProfileSaving] = useState(false)

  // Roll-forward message
  const [rollForwardMessage, setRollForwardMessage] = useState(null)

  // Load profiles on mount
  useEffect(() => {
    fetchCompanyProfiles()
      .then(setProfiles)
      .catch((err) => console.error('Failed to load company profiles:', err))
  }, [])

  const handleSelectProfile = (profileId) => {
    setSelectedProfileId(profileId)
    setRollForwardMessage(null)
    if (!profileId) return

    const profile = profiles.find((p) => p.id === profileId)
    if (!profile) return

    // First apply the profile data as-is
    let updated = applyProfileToNavData(navData, profile)

    // Check if we need to roll forward
    const savedQuarter = profile.nav_as_of_quarter
    const currentQuarter = navData.currentNavQuarter

    if (savedQuarter && currentQuarter) {
      const savedQ = parseQuarter(savedQuarter)
      const currentQ = parseQuarter(currentQuarter)
      const diff = quarterDiff(savedQ, currentQ)

      if (diff > 0) {
        // Roll forward the data
        const newFinCols = generateFinancialColumns(currentQuarter)
        const newWfLabels = generateWaterfallLabels(currentQuarter)

        if (updated.quarterlyFinancials) {
          updated.quarterlyFinancials = rollFinancialsForward(
            updated.quarterlyFinancials,
            diff,
            newFinCols
          )
        }

        if (updated.valuationWaterfall) {
          updated.valuationWaterfall = rollWaterfallForward(
            updated.valuationWaterfall,
            diff,
            newWfLabels
          )
        }

        setRollForwardMessage(
          `Data rolled forward from ${savedQuarter}. Please update the new quarter values.`
        )
      }
    }

    setNavData(updated)
  }

  const handleSaveProfile = async () => {
    if (!navData.companyName) {
      setError('Please enter a company name before saving a profile')
      return
    }
    setProfileSaving(true)
    setError(null)
    try {
      const saved = await saveCompanyProfile(navData, selectedProfileId)
      const updatedProfiles = await fetchCompanyProfiles()
      setProfiles(updatedProfiles)
      setSelectedProfileId(saved.id)
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('Failed to save company profile: ' + (err.message || 'Unknown error'))
    } finally {
      setProfileSaving(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (!selectedProfileId) return
    const profile = profiles.find((p) => p.id === selectedProfileId)
    if (!confirm(`Delete profile for "${profile?.companyName}"?`)) return

    try {
      await deleteCompanyProfile(selectedProfileId)
      setSelectedProfileId(null)
      const updatedProfiles = await fetchCompanyProfiles()
      setProfiles(updatedProfiles)
    } catch (err) {
      console.error('Failed to delete profile:', err)
      setError('Failed to delete profile: ' + (err.message || 'Unknown error'))
    }
  }

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
    setSelectedProfileId(null)
    setRollForwardMessage(null)
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Top Navigation Bar */}
      <nav className="bg-navy-800 border-b border-navy-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">E</span>
              </div>
              <h1 className="font-display font-semibold text-lg tracking-wide text-white">
                NAV 1-Pager Generator
              </h1>
            </div>
            <p className="text-navy-200 text-sm font-body hidden sm:block">
              ERVE Investment Tools
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        {step === 'input' && (
          <>
            <NavInputForm
              navData={navData}
              onNavDataChange={handleNavDataChange}
              files={files}
              onFilesChange={handleFilesChange}
              disabled={processing}
              profiles={profiles}
              selectedProfileId={selectedProfileId}
              onSelectProfile={handleSelectProfile}
              onSaveProfile={handleSaveProfile}
              onDeleteProfile={handleDeleteProfile}
              profileSaving={profileSaving}
              rollForwardMessage={rollForwardMessage}
              onDismissRollMessage={() => setRollForwardMessage(null)}
            />

            {error && (
              <div className="mt-6 px-5 py-4 bg-red-500/10 border-l-4 border-red-500 rounded-lg max-w-5xl mx-auto">
                <p className="text-red-300 text-sm font-body">{error}</p>
              </div>
            )}

            {processing && (
              <div className="mt-6 max-w-5xl mx-auto">
                <ProcessingStatus message={statusMessage} progress={progress} />
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleProcessUploads}
                disabled={processing || (!files.priorNav && !files.boardNotes && !files.financials)}
                className={`px-8 py-3 rounded-lg font-display font-semibold text-sm tracking-wide transition-all ${
                  processing || (!files.priorNav && !files.boardNotes && !files.financials)
                    ? 'bg-navy-700 text-navy-400 cursor-not-allowed'
                    : 'bg-navy-600 text-white hover:bg-navy-500 shadow-md hover:shadow-lg'
                }`}
              >
                {processing ? 'Processing...' : 'Process Uploads with AI'}
              </button>

              <button
                onClick={handlePreview}
                disabled={processing}
                className={`px-8 py-3 rounded-lg font-display font-semibold text-sm tracking-wide transition-all ${
                  processing
                    ? 'bg-navy-700 text-navy-400 cursor-not-allowed'
                    : 'bg-accent-500 text-white hover:bg-accent-600 shadow-md hover:shadow-lg'
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
      </main>
    </div>
  )
}

export default App

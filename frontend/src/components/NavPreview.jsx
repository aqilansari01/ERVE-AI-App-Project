import { useRef, useState } from 'react'
import NavOnePagerTemplate from './NavOnePagerTemplate'
import { generatePDF } from '../services/pdfGenerator'

export default function NavPreview({ navData, onBack, onPdfGenerated }) {
  const pdfRef = useRef(null)
  const [generating, setGenerating] = useState(false)

  const handleGeneratePDF = async () => {
    if (!pdfRef.current) return
    setGenerating(true)
    try {
      const pdfBlob = await generatePDF(pdfRef.current, navData.companyName)
      onPdfGenerated(pdfBlob)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
        >
          Back to Edit
        </button>
        <h2 className="text-xl font-semibold">Preview</h2>
        <button
          onClick={handleGeneratePDF}
          disabled={generating}
          className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
            generating
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg'
          }`}
        >
          {generating ? 'Generating PDF...' : 'Generate PDF'}
        </button>
      </div>

      {/* Scaled preview container */}
      <div className="flex justify-center">
        <div
          className="border border-slate-600 rounded-lg shadow-2xl overflow-hidden"
          style={{
            width: '890px',
            height: '630px',
            position: 'relative',
          }}
        >
          <div
            style={{
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
              width: '297mm',
              height: '210mm',
            }}
          >
            <NavOnePagerTemplate navData={navData} />
          </div>
        </div>
      </div>

      {/* Hidden full-size template for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <NavOnePagerTemplate ref={pdfRef} navData={navData} />
      </div>
    </div>
  )
}

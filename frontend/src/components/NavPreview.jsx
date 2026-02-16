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
          className="px-5 py-2.5 bg-navy-700 hover:bg-navy-600 rounded-lg text-sm font-display font-medium tracking-wide text-white transition-colors"
        >
          Back to Edit
        </button>
        <h2 className="font-display text-xl font-semibold tracking-wide text-white">Preview</h2>
        <button
          onClick={handleGeneratePDF}
          disabled={generating}
          className={`px-6 py-2.5 rounded-lg font-display font-semibold text-sm tracking-wide transition-all ${
            generating
              ? 'bg-navy-700 text-navy-400 cursor-not-allowed'
              : 'bg-accent-500 text-white hover:bg-accent-600 shadow-md hover:shadow-lg'
          }`}
        >
          {generating ? 'Generating PDF...' : 'Generate PDF'}
        </button>
      </div>

      {/* Scaled preview container */}
      <div className="flex justify-center">
        <div
          className="border border-navy-600 rounded-lg shadow-lg overflow-hidden"
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

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
          className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-md text-sm font-body font-medium text-gray-700 transition-colors"
        >
          Back to Edit
        </button>
        <h2 className="font-display text-xl font-bold text-gray-900">Preview</h2>
        <button
          onClick={handleGeneratePDF}
          disabled={generating}
          className={`px-6 py-2 rounded-md font-body font-medium text-sm transition-all ${
            generating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#E84393] text-white hover:bg-[#D63384] shadow-sm'
          }`}
        >
          {generating ? 'Generating PDF...' : 'Generate PDF'}
        </button>
      </div>

      {/* Scaled preview container */}
      <div className="flex justify-center">
        <div
          className="border border-gray-200 rounded-md shadow-sm overflow-hidden bg-white"
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

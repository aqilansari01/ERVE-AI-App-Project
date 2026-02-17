import { useRef, useState, useEffect, useCallback } from 'react'
import NavOnePagerTemplate from './NavOnePagerTemplate'
import { generatePDF } from '../services/pdfGenerator'

// Native size of A4 landscape in px (297mm ≈ 1122px)
const TEMPLATE_WIDTH_PX = 1122
const TEMPLATE_HEIGHT_PX = 793 // 210mm ≈ 793px

export default function NavPreview({ navData, onBack, onPdfGenerated }) {
  const pdfRef = useRef(null)
  const containerRef = useRef(null)
  const [generating, setGenerating] = useState(false)
  const [scale, setScale] = useState(0.5)

  const updateScale = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.clientWidth
    const newScale = containerWidth / TEMPLATE_WIDTH_PX
    setScale(newScale)
  }, [])

  useEffect(() => {
    updateScale()
    const observer = new ResizeObserver(updateScale)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [updateScale])

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

  const scaledHeight = TEMPLATE_HEIGHT_PX * scale

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
      <div
        ref={containerRef}
        className="border border-gray-200 rounded-md shadow-sm overflow-hidden bg-white w-full"
        style={{
          height: `${scaledHeight}px`,
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${TEMPLATE_WIDTH_PX}px`,
            height: `${TEMPLATE_HEIGHT_PX}px`,
          }}
        >
          <NavOnePagerTemplate navData={navData} />
        </div>
      </div>

      {/* Hidden full-size template for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <NavOnePagerTemplate ref={pdfRef} navData={navData} />
      </div>
    </div>
  )
}

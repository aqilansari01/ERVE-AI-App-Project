import html2pdf from 'html2pdf.js'

export const generatePDF = async (element, companyName = 'Company') => {
  const dateSuffix = new Date().toISOString().split('T')[0]
  const sanitizedName = companyName.replace(/[^a-zA-Z0-9]/g, '-') || 'Company'

  const opt = {
    margin: 0,
    filename: `NAV-1-Pager-${sanitizedName}-${dateSuffix}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'landscape',
    },
    pagebreak: { mode: 'avoid-all' },
  }

  const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob')
  return pdfBlob
}

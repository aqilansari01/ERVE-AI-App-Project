import {
  extractTextFromPDF,
  extractQuarterlyFinancials,
  extractExitCasesTable,
  extractCompanyUpdate
} from './claude'
import { generatePowerPointDocument } from './navGenerator'
import {
  parseWordDocument,
  getPDFAsBase64,
  isPowerPoint,
} from '../utils/documentParser'
import { isWordDocument, isPDF } from '../utils/fileValidation'

const extractDocumentContent = async (file, progressCallback) => {
  const filename = file.name

  if (isPowerPoint(filename)) {
    progressCallback('Processing PowerPoint template...', null)
    // For PowerPoint templates, we'll pass the file directly
    return file
  } else if (isWordDocument(filename)) {
    progressCallback('Parsing Word document...', null)
    return await parseWordDocument(file)
  } else if (isPDF(filename)) {
    progressCallback('Extracting text from PDF...', null)
    const base64Content = await getPDFAsBase64(file)
    return await extractTextFromPDF(base64Content)
  } else {
    throw new Error(`Unsupported file type: ${filename}`)
  }
}

export const processNAVDocuments = async (
  files,
  investmentSummary,
  ragStatus,
  progressCallback
) => {
  try {
    progressCallback('Starting document processing...', 10)

    progressCallback('Processing PowerPoint template...', 20)
    const templateFile = await extractDocumentContent(
      files.template,
      progressCallback
    )

    progressCallback('Extracting content from prior quarter NAV...', 30)
    const priorNavContent = await extractDocumentContent(
      files.priorNav,
      progressCallback
    )

    progressCallback('Extracting content from board notes...', 40)
    const boardNotesContent = await extractDocumentContent(
      files.boardNotes,
      progressCallback
    )

    progressCallback('Extracting content from financials...', 50)
    const financialsContent = await extractDocumentContent(
      files.financials,
      progressCallback
    )

    progressCallback('Extracting Exit Cases table from prior NAV...', 55)
    const exitCasesTable = await extractExitCasesTable(priorNavContent)

    progressCallback('Extracting quarterly financials table...', 60)
    const quarterlyFinancials = await extractQuarterlyFinancials(financialsContent)

    // Diagnostic: Show what was extracted
    const periodsFound = Object.keys(quarterlyFinancials || {})
    if (periodsFound.length === 0) {
      alert('⚠️ DIAGNOSTIC: No quarterly financials data was extracted!\n\nThe AI could not parse the financials table from your PDF.\n\nPossible solutions:\n1. Try uploading a Word document (.docx) instead\n2. Make sure the PDF contains readable text (not a scanned image)\n3. Check that the PDF has a clear table with periods like Dec-24, Mar-25, etc.')
    } else {
      const samplePeriod = periodsFound[0]
      const sampleData = quarterlyFinancials[samplePeriod]
      alert(`✓ DIAGNOSTIC: Successfully extracted financials data!\n\nPeriods found: ${periodsFound.join(', ')}\n\nSample data from ${samplePeriod}:\nARR: ${sampleData.ARR}\nRevenue: ${sampleData.Revenue}\nGM: ${sampleData.GM}\nEBITDA: ${sampleData.EBITDA}\nFTEs: ${sampleData.FTEs}`)
    }

    progressCallback('Extracting company update commentary...', 70)
    const companyUpdate = await extractCompanyUpdate(
      boardNotesContent,
      financialsContent,
      priorNavContent
    )

    progressCallback('Generating PowerPoint document...', 85)
    const powerPointDocument = await generatePowerPointDocument({
      templateFile,
      investmentSummary,
      ragStatus,
      exitCasesTable,
      quarterlyFinancials,
      companyUpdate,
    })

    progressCallback('NAV 1-pager generated successfully!', 100)

    return powerPointDocument
  } catch (error) {
    console.error('Error processing NAV documents:', error)
    throw new Error(
      error.message || 'Failed to process documents. Please try again.'
    )
  }
}

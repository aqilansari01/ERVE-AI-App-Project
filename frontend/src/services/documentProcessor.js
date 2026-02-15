import { analyzeDocument, extractQuarterlyFinancials, generateCompanyUpdate, extractTextFromPDF } from './claude'
import {
  parseWordDocument,
  parseExcelDocument,
  getPDFAsBase64,
} from '../utils/documentParser'
import { isWordDocument, isPDF, isExcel } from '../utils/fileValidation'

const extractDocumentContent = async (file, progressCallback) => {
  const filename = file.name

  if (isWordDocument(filename)) {
    progressCallback('Parsing Word document...', null)
    return await parseWordDocument(file)
  } else if (isPDF(filename)) {
    progressCallback('Extracting text from PDF...', null)
    const base64Content = await getPDFAsBase64(file)
    return await extractTextFromPDF(base64Content)
  } else if (isExcel(filename)) {
    progressCallback('Parsing Excel spreadsheet...', null)
    return await parseExcelDocument(file)
  } else {
    throw new Error(`Unsupported file type: ${filename}`)
  }
}

export const processNAVDocuments = async (files, progressCallback) => {
  try {
    const result = {
      quarterlyFinancials: null,
      companyUpdateCommentary: null,
    }

    const hasFiles = files.priorNav || files.boardNotes || files.financials
    if (!hasFiles) {
      return result
    }

    progressCallback('Starting document processing...', 5)

    // Extract content from available documents
    let priorNavContent = null
    let boardNotesContent = null
    let financialsContent = null

    if (files.priorNav) {
      progressCallback('Extracting content from prior quarter NAV...', 20)
      priorNavContent = await extractDocumentContent(files.priorNav, progressCallback)
    }

    if (files.boardNotes) {
      progressCallback('Extracting content from board notes...', 35)
      boardNotesContent = await extractDocumentContent(files.boardNotes, progressCallback)
    }

    if (files.financials) {
      progressCallback('Extracting content from financials...', 50)
      financialsContent = await extractDocumentContent(files.financials, progressCallback)
    }

    // AI Analysis
    let priorNavAnalysis = null
    let boardNotesAnalysis = null
    let financialsAnalysis = null

    if (priorNavContent) {
      progressCallback('Analyzing prior quarter NAV...', 60)
      priorNavAnalysis = await analyzeDocument(
        priorNavContent,
        'Prior Quarter NAV',
        'Extract key metrics, equity stakes, and any items that should be carried forward to the next quarter.'
      )
    }

    if (boardNotesContent) {
      progressCallback('Analyzing board notes...', 70)
      boardNotesAnalysis = await analyzeDocument(
        boardNotesContent,
        'Board Notes',
        'Extract key commentary, insights, and narrative points for the NAV 1-pager commentary section.'
      )
    }

    if (financialsContent) {
      progressCallback('Analyzing financials...', 75)
      financialsAnalysis = await analyzeDocument(
        financialsContent,
        'Financials',
        'Extract all financial metrics, performance indicators, and quantitative data.'
      )
    }

    // Extract structured quarterly financials
    if (financialsAnalysis) {
      progressCallback('Extracting quarterly financials table...', 82)
      try {
        result.quarterlyFinancials = await extractQuarterlyFinancials(financialsAnalysis)
      } catch (err) {
        console.warn('Failed to extract structured financials:', err)
      }
    }

    // Generate company update commentary
    if (boardNotesAnalysis || financialsAnalysis || priorNavAnalysis) {
      progressCallback('Generating company update commentary...', 90)
      result.companyUpdateCommentary = await generateCompanyUpdate(
        boardNotesAnalysis,
        financialsAnalysis,
        priorNavAnalysis
      )
    }

    progressCallback('AI processing complete!', 100)
    return result
  } catch (error) {
    console.error('Error processing NAV documents:', error)
    throw new Error(
      error.message || 'Failed to process documents. Please try again.'
    )
  }
}

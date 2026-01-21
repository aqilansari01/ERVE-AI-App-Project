import { uploadFile } from './supabase'
import { analyzeDocument, synthesizeNAVDocument, extractTextFromPDF } from './claude'
import { generateWordDocument } from './navGenerator'
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
    progressCallback('Starting document processing...', 5)

    const timestamp = Date.now()
    const uploadPromises = []

    progressCallback('Uploading documents to storage...', 10)

    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        const path = `${timestamp}/${key}-${file.name}`
        uploadPromises.push(uploadFile(file, path))
      }
    })

    await Promise.all(uploadPromises)

    progressCallback('Extracting content from template...', 20)
    const templateContent = await extractDocumentContent(
      files.template,
      progressCallback
    )

    progressCallback('Extracting content from prior quarter NAV...', 30)
    const priorNavContent = await extractDocumentContent(
      files.priorNav,
      progressCallback
    )

    progressCallback('Extracting content from board notes...', 45)
    const boardNotesContent = await extractDocumentContent(
      files.boardNotes,
      progressCallback
    )

    progressCallback('Extracting content from financials...', 55)
    const financialsContent = await extractDocumentContent(
      files.financials,
      progressCallback
    )

    progressCallback('Analyzing prior quarter NAV...', 60)
    const priorNavAnalysis = await analyzeDocument(
      priorNavContent,
      'Prior Quarter NAV',
      'Extract key metrics, equity stakes, and any items that should be carried forward to the next quarter.'
    )

    progressCallback('Analyzing board notes...', 70)
    const boardNotesAnalysis = await analyzeDocument(
      boardNotesContent,
      'Board Notes',
      'Extract key commentary, insights, and narrative points for the NAV 1-pager commentary section.'
    )

    progressCallback('Analyzing financials...', 75)
    const financialsAnalysis = await analyzeDocument(
      financialsContent,
      'Financials',
      'Extract all financial metrics, performance indicators, and quantitative data that should be included in the NAV 1-pager.'
    )

    progressCallback('Synthesizing NAV 1-pager...', 85)
    const synthesizedContent = await synthesizeNAVDocument(
      templateContent,
      priorNavAnalysis,
      boardNotesAnalysis,
      financialsAnalysis
    )

    progressCallback('Generating Word document...', 95)
    const wordDocument = await generateWordDocument(
      synthesizedContent,
      templateContent
    )

    progressCallback('NAV 1-pager generated successfully!', 100)

    return wordDocument
  } catch (error) {
    console.error('Error processing NAV documents:', error)
    throw new Error(
      error.message || 'Failed to process documents. Please try again.'
    )
  }
}

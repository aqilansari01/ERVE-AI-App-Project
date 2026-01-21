import Anthropic from '@anthropic-ai/sdk'

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

if (!apiKey) {
  throw new Error('Missing Anthropic API key')
}

const client = new Anthropic({
  apiKey,
  dangerouslyAllowBrowser: true,
})

export const analyzeDocument = async (documentContent, documentType, context = '') => {
  const systemPrompt = `You are an expert financial analyst specializing in NAV (Net Asset Value) 1-pager generation for venture capital firms.
Your task is to analyze documents and extract relevant information for NAV reporting.`

  const userPrompt = `Analyze this ${documentType} document and extract relevant information:

${context ? `Context: ${context}\n\n` : ''}Document content:
${documentContent}

Please extract and structure the key information in a clear, organized format.`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  return message.content[0].text
}

export const synthesizeNAVDocument = async (
  templateContent,
  priorNavAnalysis,
  boardNotesAnalysis,
  financialsAnalysis
) => {
  const systemPrompt = `You are an expert financial document generator for venture capital firms.
Your task is to synthesize information from multiple sources to create a complete NAV 1-pager.
Maintain professional formatting and ensure all financial data is accurate.`

  const userPrompt = `Generate a complete NAV 1-pager using the following information:

TEMPLATE STRUCTURE:
${templateContent}

PRIOR QUARTER NAV (for carrying forward unchanged items):
${priorNavAnalysis}

BOARD NOTES (for commentary section):
${boardNotesAnalysis}

FINANCIALS (for updating financial metrics):
${financialsAnalysis}

Instructions:
1. Use the template structure as the base format
2. Update financial metrics using data from the financials document
3. Carry forward unchanged items (like equity stake %) from the prior quarter's NAV
4. Populate the commentary section using insights from the board notes
5. Ensure consistency in formatting and terminology
6. Maintain professional tone and clarity

Generate the complete NAV 1-pager content now, maintaining the original template's structure and formatting.`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  return message.content[0].text
}

export const extractTextFromPDF = async (base64Content) => {
  const systemPrompt = `You are a document text extraction assistant. Extract all text content from the provided document, maintaining structure and formatting where possible.`

  const userPrompt = `Extract all text content from this document. Preserve the structure and organization of the information.`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64Content,
            },
          },
          {
            type: 'text',
            text: userPrompt,
          },
        ],
      },
    ],
  })

  return message.content[0].text
}

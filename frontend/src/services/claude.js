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

export const extractQuarterlyFinancials = async (financialsContent) => {
  const systemPrompt = `You are a financial data extraction specialist. Your task is to extract quarterly financial metrics from financial documents.`

  const userPrompt = `From the following financials document, extract the quarterly financials table data. I need:

- ARR (Annual Recurring Revenue) for each period
- Revenue for each period
- GM (Gross Margin) for each period
- EBITDA for each period
- FTEs (Full-Time Employees) for each period

Document content:
${financialsContent}

Please return the data as a structured JSON object with periods as keys (e.g., "Dec-24", "Mar-25", "Jun-25", "Sep-25", "FY23", "FY24", "FY25", "LTM") and metrics as nested objects. Use null for missing values.

Example format:
{
  "Dec-24": { "ARR": 10.5, "Revenue": 2.5, "GM": 70, "EBITDA": -0.5, "FTEs": 50 },
  "Mar-25": { "ARR": 12.0, "Revenue": 3.0, "GM": 72, "EBITDA": -0.3, "FTEs": 55 }
}`

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

  try {
    return JSON.parse(message.content[0].text)
  } catch (error) {
    console.error('Error parsing quarterly financials:', error)
    return {}
  }
}

export const extractExitCasesTable = async (priorNavContent) => {
  const systemPrompt = `You are a financial data extraction specialist focused on venture capital NAV documents.`

  const userPrompt = `From the following Prior Quarter NAV document, extract the Exit Cases table/valuation scenarios.

This typically includes scenarios like:
- Base Case
- Downside Case
- Upside Case

For each scenario, extract relevant metrics like valuation multiples, revenue/EBITDA assumptions, and resulting valuations.

Document content:
${priorNavContent}

Please return the data as a structured JSON object. If the exact structure varies, extract whatever exit cases or valuation scenarios are present.

Example format:
{
  "Base Case": { "Multiple": "5.0x ARR", "Valuation": "€60.0m", "ERVE Value": "€9.0m" },
  "Downside": { "Multiple": "3.0x ARR", "Valuation": "€36.0m", "ERVE Value": "€5.4m" },
  "Upside": { "Multiple": "8.0x ARR", "Valuation": "€96.0m", "ERVE Value": "€14.4m" }
}`

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

  try {
    return JSON.parse(message.content[0].text)
  } catch (error) {
    console.error('Error parsing exit cases:', error)
    return {}
  }
}

export const extractCompanyUpdate = async (
  boardNotesContent,
  financialsContent,
  priorNavContent
) => {
  const systemPrompt = `You are an expert at creating executive summaries for venture capital NAV documents. Your task is to synthesize company updates from board notes and financial data.`

  const userPrompt = `Create a company update commentary section for a NAV 1-pager by synthesizing information from the following sources:

BOARD NOTES:
${boardNotesContent}

LATEST FINANCIALS:
${financialsContent}

PRIOR QUARTER NAV (for context and structure):
${priorNavContent}

Instructions:
1. Follow the general structure and tone from the prior quarter NAV
2. Include key highlights from the board notes
3. Reference important financial metrics and performance
4. Keep it concise (3-5 bullet points or 2-3 short paragraphs)
5. Focus on material developments, progress, and key metrics
6. Maintain a professional, objective tone

Generate the Company Update section now:`

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

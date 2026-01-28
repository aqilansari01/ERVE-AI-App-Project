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
    model: 'claude-sonnet-4-5-20250929',
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
    model: 'claude-sonnet-4-5-20250929',
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
    model: 'claude-sonnet-4-5-20250929',
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
  const systemPrompt = `You are a financial data extraction specialist. Your task is to extract quarterly financial metrics from financial documents and return them as valid JSON.`

  const userPrompt = `From the following financials document, extract the quarterly financials table data.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no backticks, no explanations.

Extract these metrics for each period:
- ARR (Annual Recurring Revenue)
- Revenue
- GM (Gross Margin)
- EBITDA
- FTEs (Full-Time Employees)

The periods in the document are labeled like: Dec-24, Mar-25, Jun-25, Sep-25, LTM, FY23, FY24, FY25

Return the data as a JSON object with period names EXACTLY as they appear in the document as keys, and metrics as nested objects. Include all periods found. Use null for missing values.

Document content:
${financialsContent}

Example output format (use the ACTUAL periods and values from the document):
{
  "Dec-24": { "ARR": 9.1, "Revenue": 2.2, "GM": 2.0, "EBITDA": -2.1, "FTEs": 154 },
  "Mar-25": { "ARR": 10.6, "Revenue": 2.6, "GM": 2.4, "EBITDA": -2.4, "FTEs": 170 },
  "Jun-25": { "ARR": 11.8, "Revenue": 3.3, "GM": 3.0, "EBITDA": -2.8, "FTEs": 190 },
  "Sep-25": { "ARR": 13.1, "Revenue": 3.3, "GM": 2.9, "EBITDA": -2.5, "FTEs": 207 },
  "LTM": { "ARR": 13.1, "Revenue": 11.4, "GM": 10.3, "EBITDA": -9.9, "FTEs": 207 },
  "FY23": { "ARR": 4.9, "Revenue": 4.1, "GM": 3.7, "EBITDA": -2.7, "FTEs": 87 },
  "FY24": { "ARR": 9.1, "Revenue": 7.3, "GM": 6.6, "EBITDA": -5.9, "FTEs": 154 },
  "FY25": { "ARR": 15.8, "Revenue": 13.2, "GM": 11.7, "EBITDA": -10.6, "FTEs": 223 }
}

Return ONLY the JSON object, nothing else.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
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
    const responseText = message.content[0].text.trim()

    // Remove markdown code blocks if present
    let jsonText = responseText
    if (responseText.startsWith('```')) {
      jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    }

    const parsedData = JSON.parse(jsonText)
    console.log('Extracted quarterly financials:', parsedData)
    return parsedData
  } catch (error) {
    console.error('Error parsing quarterly financials:', error)
    console.error('Raw response:', message.content[0].text)
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
    model: 'claude-sonnet-4-5-20250929',
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
    model: 'claude-sonnet-4-5-20250929',
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

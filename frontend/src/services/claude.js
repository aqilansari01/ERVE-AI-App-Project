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
    model: 'claude-sonnet-4-20250514',
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

export const extractQuarterlyFinancials = async (financialsContent) => {
  const systemPrompt = `You are an expert financial data extractor. Extract quarterly financial metrics and return them as structured JSON.`

  const userPrompt = `Extract quarterly financial data from this document and return ONLY valid JSON (no markdown, no explanation).

Document content:
${financialsContent}

Return this exact JSON structure, filling in values found in the document. Use empty strings for missing values:
{
  "columns": ["Dec-24", "Mar-25", "Jun-25", "Sep-25", "LTM", "FY23 Actual", "FY24 Actual", "FY25 Budget"],
  "rows": [
    { "metric": "ARR", "values": ["", "", "", "", "", "", "", ""] },
    { "metric": "Revenue", "values": ["", "", "", "", "", "", "", ""] },
    { "metric": "GM", "values": ["", "", "", "", "", "", "", ""] },
    { "metric": "EBITDA", "values": ["", "", "", "", "", "", "", ""] },
    { "metric": "FTEs", "values": ["", "", "", "", "", "", "", ""] }
  ]
}

Map the document's time periods to the closest matching columns. Return ONLY the JSON object.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  const text = message.content[0].text.trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to extract structured financial data')
  }
  return JSON.parse(jsonMatch[0])
}

export const generateCompanyUpdate = async (boardNotesAnalysis, financialsAnalysis, priorNavAnalysis) => {
  const systemPrompt = `You are an expert venture capital analyst writing quarterly company updates for NAV 1-pagers. Write in a professional, factual, concise tone. Use specific numbers and data points. Structure the update as distinct bullet points covering different aspects of the business.`

  const sources = []
  if (boardNotesAnalysis) sources.push(`BOARD NOTES ANALYSIS:\n${boardNotesAnalysis}`)
  if (financialsAnalysis) sources.push(`FINANCIALS ANALYSIS:\n${financialsAnalysis}`)
  if (priorNavAnalysis) sources.push(`PRIOR QUARTER NAV ANALYSIS:\n${priorNavAnalysis}`)

  const userPrompt = `Based on the following source materials, write a Company Update section for a NAV 1-pager.

${sources.join('\n\n')}

Requirements:
- If a PRIOR QUARTER NAV ANALYSIS is provided, use it as a reference for the tone, structure, format, and level of detail. Mirror how the prior quarter's commentary was written, but update with the current quarter's data and developments.
- Write 5-7 concise bullet points (each 1-2 sentences), covering as many of these areas as the source materials support:
  1. Overall quarterly performance headline (ARR, revenue growth, YoY %)
  2. Key growth drivers and sales momentum
  3. Efficiency metrics (payback period, LTV/CAC, NRR, churn)
  4. Cash position, monthly burn rate, and runway
  5. Customer satisfaction (CSAT, NPS, health scores)
  6. Product updates and new feature launches
  7. Strategic initiatives (AI, partnerships, M&A exploration)
  8. Forward-looking plans and priorities
- Not all areas will have data available — only include bullet points where the source materials provide relevant information
- Use specific numbers, percentages, and currency amounts from the sources wherever possible
- Each bullet point should be a standalone paragraph (no bullet characters or dashes, just line breaks between paragraphs)
- Professional tone suitable for investor reporting
- Do NOT include section headers or titles, just the content
- Total length: 180-280 words`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
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
    model: 'claude-sonnet-4-20250514',
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

import pptxgen from 'pptxgenjs'

export const generatePowerPointDocument = async ({
  templateFile,
  investmentSummary,
  ragStatus,
  exitCasesTable,
  quarterlyFinancials,
  companyUpdate,
}) => {
  try {
    const pptx = new pptxgen()

    // Set presentation properties to match template
    pptx.author = 'Eight Roads'
    pptx.company = 'Eight Roads'
    pptx.title = 'NAV 1-Pager'
    pptx.layout = 'LAYOUT_WIDE'

    // Create the single slide
    const slide = pptx.addSlide()

    // Define colors matching Eight Roads template
    const colors = {
      navy: '354A5F',
      orange: 'FF8533',
      white: 'FFFFFF',
      darkGray: '595959',
      mediumGray: '808080',
      lightGray: 'D9D9D9',
      veryLightGray: 'F2F2F2',
      teal: '4DBFAF',
    }

    // RAG Status color mapping
    const ragColors = {
      Green: '4DBFAF',
      Amber: 'FFC000',
      Red: 'C00000',
    }

    const getRAGColor = (status) => ragColors[status] || colors.mediumGray

    // ========== LEFT SIDE LAYOUT ==========

    // 1. Investment Summary Section (top left)
    let leftY = 1.0
    const leftX = 0.3
    const leftWidth = 5.2

    slide.addText('Investment summary', {
      x: leftX,
      y: leftY,
      w: leftWidth,
      h: 0.3,
      fontSize: 9,
      bold: true,
      color: colors.darkGray,
    })

    leftY += 0.35

    // Investment summary table - simplified structure
    const investmentTableRows = [
      [
        { text: 'ERVE investment', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: investmentSummary.erveInvestmentEUR ? `€${investmentSummary.erveInvestmentEUR}m` : '', options: { fontSize: 7, valign: 'middle' } },
        { text: 'Break-down by round', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: investmentSummary.investmentRound || '', options: { fontSize: 7, valign: 'middle' } },
      ],
      [
        { text: 'Total raised', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: investmentSummary.totalRaised || '', options: { fontSize: 7, valign: 'middle' } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'ERVE %', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: investmentSummary.erveOwnership ? `${investmentSummary.erveOwnership}%` : '', options: { fontSize: 7, valign: 'middle' } },
        { text: 'Security', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: investmentSummary.securityType || '', options: { fontSize: 7, valign: 'middle' } },
      ],
      [
        { text: 'Other shareholders', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: investmentSummary.otherShareholders || '', options: { fontSize: 7, valign: 'middle' } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'Governance', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: `Board Member: ${investmentSummary.boardMember || ''}, Observer: ${investmentSummary.boardObserver || ''}`, options: { fontSize: 7, valign: 'middle' } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'Cash', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: '', options: { fontSize: 7 } },
        { text: 'Monthly burn', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: investmentSummary.monthlyBurn ? `€${investmentSummary.monthlyBurn}m` : '', options: { fontSize: 7, valign: 'middle' } },
        { text: 'FUME', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: investmentSummary.fume || '', options: { fontSize: 7, valign: 'middle' } },
      ],
      [
        { text: 'Last pre-/post-money valuation', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: investmentSummary.preMoneyValuation ? `€${investmentSummary.preMoneyValuation}m / €${investmentSummary.postMoneyValuation || 0}m` : '', options: { fontSize: 7, valign: 'middle' } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'Q4-25 NAV', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: '', options: { fontSize: 7 } },
        { text: 'Q3-25 NAV', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: '', options: { fontSize: 7 } },
        { text: 'Increase /(Decrease)', options: { fontSize: 7, color: colors.darkGray, valign: 'middle' } },
        { text: '', options: { fontSize: 7 } },
      ],
    ]

    slide.addTable(investmentTableRows, {
      x: leftX,
      y: leftY,
      w: leftWidth,
      h: 1.8,
      border: { pt: 0.5, color: colors.lightGray },
      fill: { color: colors.white },
      colW: [1.3, 1.3, 1.0, 1.6],
      rowH: 0.22,
    })

    leftY += 1.9

    // 2. RAG Status Indicators (Financials section header)
    slide.addText('Financials', {
      x: leftX,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    slide.addText('Cash', {
      x: leftX + 0.85,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    slide.addText('Market', {
      x: leftX + 1.7,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    slide.addText('Team', {
      x: leftX + 2.55,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    slide.addText('Governance', {
      x: leftX + 3.4,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    slide.addText('Overall', {
      x: leftX + 4.25,
      y: leftY,
      w: 0.9,
      h: 0.2,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    leftY += 0.22

    // RAG colored boxes
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: leftX,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fill: { color: getRAGColor(ragStatus.financialsStatus) },
      line: { type: 'none' },
    })

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: leftX + 0.85,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fill: { color: getRAGColor(ragStatus.cashStatus) },
      line: { type: 'none' },
    })

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: leftX + 1.7,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fill: { color: getRAGColor(ragStatus.marketStatus) },
      line: { type: 'none' },
    })

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: leftX + 2.55,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fill: { color: getRAGColor(ragStatus.teamStatus) },
      line: { type: 'none' },
    })

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: leftX + 3.4,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fill: { color: getRAGColor(ragStatus.governanceStatus) },
      line: { type: 'none' },
    })

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: leftX + 4.25,
      y: leftY,
      w: 0.9,
      h: 0.2,
      fill: { color: getRAGColor(ragStatus.overallStatus) },
      line: { type: 'none' },
    })

    leftY += 0.35

    // 3. Quarterly Actuals Table
    slide.addText('in EUR\'m', {
      x: leftX,
      y: leftY,
      w: 0.6,
      h: 0.2,
      fontSize: 7,
      italic: true,
      color: colors.mediumGray,
      valign: 'middle',
    })

    slide.addText('Quarterly Actuals', {
      x: leftX + 1.0,
      y: leftY,
      w: 1.8,
      h: 0.2,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      align: 'center',
      valign: 'middle',
    })

    slide.addText('Actual', {
      x: leftX + 2.9,
      y: leftY,
      w: 0.6,
      h: 0.2,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      align: 'center',
      valign: 'middle',
    })

    slide.addText('Actual', {
      x: leftX + 3.5,
      y: leftY,
      w: 0.6,
      h: 0.2,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      align: 'center',
      valign: 'middle',
    })

    slide.addText('Budget', {
      x: leftX + 4.1,
      y: leftY,
      w: 0.6,
      h: 0.2,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      align: 'center',
      valign: 'middle',
    })

    leftY += 0.25

    // Build quarterly financials table
    const finTableData = []

    // Header row
    const finHeaders = [
      { text: 'YF 31st Dec', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: 'Dec-24', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: 'Mar-25', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: 'Jun-25', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: 'Sep-25', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: 'LTM', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: 'FY23', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: 'FY24', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: 'FY25', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
    ]
    finTableData.push(finHeaders)

    // Data rows
    const metrics = ['ARR', 'Revenue', 'GM', 'EBITDA', 'FTEs']
    const periods = ['Dec-24', 'Mar-25', 'Jun-25', 'Sep-25', 'LTM', 'FY23', 'FY24', 'FY25']

    metrics.forEach(metric => {
      const row = [{ text: metric, options: { fontSize: 6, bold: true, valign: 'middle' } }]
      periods.forEach(period => {
        const value = quarterlyFinancials?.[period]?.[metric]
        row.push({ text: value != null ? String(value) : '', options: { fontSize: 6, valign: 'middle' } })
      })
      finTableData.push(row)
    })

    slide.addTable(finTableData, {
      x: leftX,
      y: leftY,
      w: leftWidth,
      h: 0.8,
      border: { pt: 0.5, color: colors.lightGray },
      colW: [0.6, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      rowH: 0.13,
    })

    leftY += 0.9

    // 4. Exit Case Table
    const exitTableData = [
      [
        { text: 'Exit case', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
        { text: 'EV/Exit', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
        { text: 'MOIC', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
        { text: 'IRR', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
        { text: 'Key factors', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      ],
    ]

    // Add exit cases from extracted data
    if (exitCasesTable && Object.keys(exitCasesTable).length > 0) {
      Object.entries(exitCasesTable).forEach(([scenario, data]) => {
        exitTableData.push([
          { text: scenario, options: { fontSize: 6, bold: true, valign: 'middle' } },
          { text: data['EV/Exit'] || data.Multiple || '', options: { fontSize: 6, valign: 'middle' } },
          { text: data.MOIC || '', options: { fontSize: 6, valign: 'middle' } },
          { text: data.IRR || '', options: { fontSize: 6, valign: 'middle' } },
          { text: data['Key factors'] || '', options: { fontSize: 6, valign: 'middle' } },
        ])
      })
    } else {
      // Default rows if no data
      exitTableData.push(
        [
          { text: 'High (20%)', options: { fontSize: 6, bold: true, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
        ],
        [
          { text: 'Base (60%)', options: { fontSize: 6, bold: true, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
        ],
        [
          { text: 'Low (20%)', options: { fontSize: 6, bold: true, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
          { text: '', options: { fontSize: 6, valign: 'middle' } },
        ]
      )
    }

    exitTableData.push([
      { text: 'Blended exp. Return', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: '', options: { fontSize: 6, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: '', options: { fontSize: 6, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: '', options: { fontSize: 6, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      { text: '', options: { fontSize: 6, fill: { color: colors.veryLightGray }, valign: 'middle' } },
    ])

    slide.addTable(exitTableData, {
      x: leftX,
      y: leftY,
      w: leftWidth,
      h: 0.7,
      border: { pt: 0.5, color: colors.lightGray },
      colW: [0.9, 0.7, 0.5, 0.4, 2.7],
      rowH: 0.14,
    })

    // ========== RIGHT SIDE LAYOUT ==========

    const rightX = 5.7
    const rightWidth = 4.1
    let rightY = 1.0

    // 5. Company Update Section (gray box)
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: rightX,
      y: rightY,
      w: rightWidth,
      h: 2.5,
      fill: { color: colors.veryLightGray },
      line: { color: colors.lightGray, pt: 0.5 },
    })

    slide.addText('Company update', {
      x: rightX + 0.15,
      y: rightY + 0.1,
      w: rightWidth - 0.3,
      h: 0.25,
      fontSize: 8,
      bold: true,
      color: colors.darkGray,
    })

    // Clean up company update text for better display
    const cleanUpdate = (companyUpdate || '').replace(/## Company Update\n*/g, '').trim()

    slide.addText(cleanUpdate, {
      x: rightX + 0.15,
      y: rightY + 0.4,
      w: rightWidth - 0.3,
      h: 2.0,
      fontSize: 7,
      color: colors.darkGray,
      valign: 'top',
      lineSpacing: 14,
    })

    rightY += 2.65

    // 6. Investment Valuation Section Header
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: rightX,
      y: rightY,
      w: rightWidth,
      h: 0.25,
      fill: { color: colors.veryLightGray },
      line: { color: colors.lightGray, pt: 0.5 },
    })

    slide.addText('Investment valuation', {
      x: rightX,
      y: rightY + 0.05,
      w: rightWidth,
      h: 0.2,
      fontSize: 8,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    rightY += 0.3

    // Valuation waterfall table
    const valuationTableData = [
      [
        { text: 'Comps-based valuation waterfall', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
        { text: 'Q4-25 NAV', options: { fontSize: 7, bold: true, fill: { color: colors.orange }, color: colors.white, valign: 'middle' } },
        { text: 'Q3-25 NAV', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
        { text: 'Q2-25 NAV', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      ],
      [
        { text: 'Comparable EV/Rev Multiple pre-discount', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
      ],
      [
        { text: 'ARR (€m) (Oct/Jun/Mar)', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
      ],
      [
        { text: 'Enterprise value pre-discount (€m)', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
      ],
      [
        { text: 'Discount rate applied to multiple', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
      ],
      [
        { text: 'Enterprise value after discount (€m)', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
      ],
      [
        { text: 'Cash (€m) (Oct/Jun/Mar)', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
      ],
      [
        { text: 'Equity value (€m)', options: { fontSize: 6, bold: true, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
      ],
      [
        { text: 'ERVE ownership', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
        { text: '', options: { fontSize: 6, valign: 'middle' } },
      ],
      [
        { text: 'Comps-based value of ERVE equity (€m)', options: { fontSize: 6, bold: true, fill: { color: colors.veryLightGray }, valign: 'middle' } },
        { text: '', options: { fontSize: 6, fill: { color: colors.veryLightGray }, valign: 'middle' } },
        { text: '', options: { fontSize: 6, fill: { color: colors.veryLightGray }, valign: 'middle' } },
        { text: '', options: { fontSize: 6, fill: { color: colors.veryLightGray }, valign: 'middle' } },
      ],
    ]

    slide.addTable(valuationTableData, {
      x: rightX,
      y: rightY,
      w: rightWidth,
      h: 1.4,
      border: { pt: 0.5, color: colors.lightGray },
      colW: [2.2, 0.6, 0.6, 0.7],
      rowH: 0.14,
    })

    rightY += 1.5

    // Methodology section
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: rightX,
      y: rightY,
      w: rightWidth,
      h: 0.2,
      fill: { color: colors.veryLightGray },
      line: { color: colors.lightGray, pt: 0.5 },
    })

    slide.addText('Methodology', {
      x: rightX + 0.1,
      y: rightY + 0.02,
      w: rightWidth - 0.2,
      h: 0.16,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      valign: 'middle',
    })

    rightY += 0.25

    // Valuation (EUR'm) section
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: rightX,
      y: rightY,
      w: rightWidth,
      h: 0.2,
      fill: { color: colors.veryLightGray },
      line: { color: colors.lightGray, pt: 0.5 },
    })

    slide.addText('Valuation (EUR\'m)', {
      x: rightX + 0.1,
      y: rightY + 0.02,
      w: rightWidth - 0.2,
      h: 0.16,
      fontSize: 7,
      bold: true,
      color: colors.darkGray,
      valign: 'middle',
    })

    rightY += 0.25

    slide.addText('Implied multiple (pre-money /ARR)', {
      x: rightX + 0.1,
      y: rightY,
      w: rightWidth - 0.2,
      h: 0.2,
      fontSize: 6,
      color: colors.darkGray,
      valign: 'top',
    })

    // Add Eight Roads logo (bottom right)
    slide.addText('8°', {
      x: 8.8,
      y: 7.0,
      w: 0.5,
      h: 0.3,
      fontSize: 20,
      bold: true,
      color: colors.orange,
    })

    slide.addText('EIGHT ROADS', {
      x: 9.3,
      y: 7.05,
      w: 1.2,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: colors.darkGray,
      fontFace: 'Arial',
    })

    // Generate and return the PowerPoint as a Blob
    const pptxBlob = await pptx.write({ outputType: 'blob' })
    return pptxBlob
  } catch (error) {
    console.error('Error generating PowerPoint document:', error)
    throw new Error('Failed to generate PowerPoint document')
  }
}

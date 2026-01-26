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
    let leftY = 1.2
    const leftX = 0.4
    const leftWidth = 5.0

    slide.addText('Investment summary', {
      x: leftX,
      y: leftY,
      w: leftWidth,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: colors.darkGray,
    })

    leftY += 0.35

    // Investment summary fields in table format
    const investmentTableData = [
      [
        { text: 'ERVE investment', options: { fontSize: 8, color: colors.darkGray } },
        { text: investmentSummary.erveInvestmentEUR ? `€${investmentSummary.erveInvestmentEUR}m` : '', options: { fontSize: 8 } },
        { text: 'Break-down by round', options: { fontSize: 8, color: colors.darkGray } },
        { text: investmentSummary.investmentRound || '', options: { fontSize: 8 } },
      ],
      [
        { text: 'Total raised', options: { fontSize: 8, color: colors.darkGray } },
        { text: investmentSummary.totalRaised || '', options: { fontSize: 8 }, colSpan: 3 },
      ],
      [
        { text: 'ERVE %', options: { fontSize: 8, color: colors.darkGray } },
        { text: investmentSummary.erveOwnership ? `${investmentSummary.erveOwnership}%` : '', options: { fontSize: 8 } },
        { text: 'Security', options: { fontSize: 8, color: colors.darkGray } },
        { text: investmentSummary.securityType || '', options: { fontSize: 8 } },
      ],
      [
        { text: 'Other shareholders', options: { fontSize: 8, color: colors.darkGray } },
        { text: investmentSummary.otherShareholders || '', options: { fontSize: 8 }, colSpan: 3 },
      ],
      [
        { text: 'Governance', options: { fontSize: 8, color: colors.darkGray } },
        { text: '', options: { fontSize: 8 }, colSpan: 3 },
      ],
      [
        { text: 'Cash', options: { fontSize: 8, color: colors.darkGray } },
        { text: '', options: { fontSize: 8 } },
        { text: 'Monthly burn', options: { fontSize: 8, color: colors.darkGray } },
        { text: investmentSummary.monthlyBurn ? `€${investmentSummary.monthlyBurn}m` : '', options: { fontSize: 8 } },
        { text: 'FUME', options: { fontSize: 8, color: colors.darkGray } },
        { text: investmentSummary.fume ? `${investmentSummary.fume} months` : '', options: { fontSize: 8 } },
      ],
      [
        { text: 'Last pre-/post-money valuation', options: { fontSize: 8, color: colors.darkGray }, colSpan: 2 },
        { text: investmentSummary.preMoneyValuation ? `€${investmentSummary.preMoneyValuation}m / €${investmentSummary.postMoneyValuation || 0}m` : '', options: { fontSize: 8 }, colSpan: 2 },
      ],
      [
        { text: 'Q4-25 NAV', options: { fontSize: 8, color: colors.darkGray } },
        { text: '', options: { fontSize: 8 } },
        { text: 'Q3-25 NAV', options: { fontSize: 8, color: colors.darkGray } },
        { text: '', options: { fontSize: 8 } },
        { text: 'Increase /(Decrease)', options: { fontSize: 8, color: colors.darkGray } },
        { text: '', options: { fontSize: 8 } },
      ],
    ]

    slide.addTable(investmentTableData, {
      x: leftX,
      y: leftY,
      w: leftWidth,
      border: { pt: 0.5, color: colors.lightGray },
      fill: { color: colors.white },
    })

    leftY += 1.8

    // 2. RAG Status Indicators
    const ragIndicators = [
      { label: 'Financials', status: ragStatus.financialsStatus },
      { label: 'Cash', status: ragStatus.cashStatus },
      { label: 'Market', status: ragStatus.marketStatus },
      { label: 'Team', status: ragStatus.teamStatus },
      { label: 'Governance', status: ragStatus.governanceStatus },
      { label: 'Overall', status: ragStatus.overallStatus },
    ]

    const ragBoxWidth = leftWidth / 6
    ragIndicators.forEach(({ label, status }, index) => {
      const ragX = leftX + (index * ragBoxWidth)

      // Label
      slide.addText(label, {
        x: ragX,
        y: leftY,
        w: ragBoxWidth,
        h: 0.2,
        fontSize: 7,
        bold: true,
        color: colors.darkGray,
        align: 'center',
      })

      // Colored box
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: ragX + 0.05,
        y: leftY + 0.22,
        w: ragBoxWidth - 0.1,
        h: 0.18,
        fill: { color: getRAGColor(status) },
      })
    })

    leftY += 0.55

    // 3. Quarterly Actuals Table
    slide.addText('in EUR'm', {
      x: leftX,
      y: leftY,
      w: 0.8,
      h: 0.2,
      fontSize: 8,
      italic: true,
      color: colors.mediumGray,
    })

    slide.addText('Quarterly Actuals', {
      x: leftX + 1.5,
      y: leftY,
      w: 2.0,
      h: 0.2,
      fontSize: 8,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    slide.addText('Actual', {
      x: leftX + 3.8,
      y: leftY,
      w: 0.4,
      h: 0.2,
      fontSize: 8,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    slide.addText('Actual', {
      x: leftX + 4.2,
      y: leftY,
      w: 0.4,
      h: 0.2,
      fontSize: 8,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    slide.addText('Budget', {
      x: leftX + 4.6,
      y: leftY,
      w: 0.4,
      h: 0.2,
      fontSize: 8,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    leftY += 0.25

    // Build quarterly financials table
    const finTableData = []

    // Header row
    const finHeaders = [
      { text: 'YF 31st Dec', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
      { text: 'Dec-24', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
      { text: 'Mar-25', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
      { text: 'Jun-25', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
      { text: 'Sep-25', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
      { text: 'LTM', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
      { text: 'FY23', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
      { text: 'FY24', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
      { text: 'FY25', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
    ]
    finTableData.push(finHeaders)

    // Data rows
    const metrics = ['ARR', 'Revenue', 'GM', 'EBITDA', 'FTEs']
    const periods = ['Dec-24', 'Mar-25', 'Jun-25', 'Sep-25', 'LTM', 'FY23', 'FY24', 'FY25']

    metrics.forEach(metric => {
      const row = [{ text: metric, options: { fontSize: 7, bold: true } }]
      periods.forEach(period => {
        const value = quarterlyFinancials?.[period]?.[metric]
        row.push({ text: value != null ? String(value) : '', options: { fontSize: 7 } })
      })
      finTableData.push(row)
    })

    slide.addTable(finTableData, {
      x: leftX,
      y: leftY,
      w: leftWidth,
      border: { pt: 0.5, color: colors.lightGray },
      colW: [0.8, 0.5, 0.5, 0.5, 0.5, 0.4, 0.4, 0.4, 0.4],
    })

    leftY += 1.3

    // 4. Exit Case Table
    const exitTableData = [
      [
        { text: 'Exit case', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
        { text: 'EV/Exit', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
        { text: 'MOIC', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
        { text: 'IRR', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
        { text: 'Key factors', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
      ],
    ]

    // Add exit cases from extracted data
    if (exitCasesTable && Object.keys(exitCasesTable).length > 0) {
      Object.entries(exitCasesTable).forEach(([scenario, data]) => {
        exitTableData.push([
          { text: scenario, options: { fontSize: 7, bold: true } },
          { text: data['EV/Exit'] || data.Multiple || '', options: { fontSize: 7 } },
          { text: data.MOIC || '', options: { fontSize: 7 } },
          { text: data.IRR || '', options: { fontSize: 7 } },
          { text: data['Key factors'] || '', options: { fontSize: 7 } },
        ])
      })
    } else {
      // Default rows if no data
      exitTableData.push(
        [
          { text: 'High (20%)', options: { fontSize: 7, bold: true } },
          { text: '', options: { fontSize: 7 } },
          { text: '', options: { fontSize: 7 } },
          { text: '', options: { fontSize: 7 } },
          { text: '', options: { fontSize: 7 } },
        ],
        [
          { text: 'Base (60%)', options: { fontSize: 7, bold: true } },
          { text: '', options: { fontSize: 7 } },
          { text: '', options: { fontSize: 7 } },
          { text: '', options: { fontSize: 7 } },
          { text: '', options: { fontSize: 7 } },
        ],
        [
          { text: 'Low (20%)', options: { fontSize: 7, bold: true } },
          { text: '', options: { fontSize: 7 } },
          { text: '', options: { fontSize: 7 } },
          { text: '', options: { fontSize: 7 } },
          { text: '', options: { fontSize: 7 } },
        ]
      )
    }

    exitTableData.push([
      { text: 'Blended exp. Return', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
      { text: '', options: { fontSize: 7, fill: { color: colors.veryLightGray } } },
      { text: '', options: { fontSize: 7, fill: { color: colors.veryLightGray } } },
      { text: '', options: { fontSize: 7, fill: { color: colors.veryLightGray } } },
      { text: '', options: { fontSize: 7, fill: { color: colors.veryLightGray } } },
    ])

    slide.addTable(exitTableData, {
      x: leftX,
      y: leftY,
      w: leftWidth,
      border: { pt: 0.5, color: colors.lightGray },
      colW: [0.8, 0.7, 0.5, 0.5, 2.5],
    })

    // ========== RIGHT SIDE LAYOUT ==========

    const rightX = 5.7
    const rightWidth = 4.0
    let rightY = 1.2

    // 5. Company Update Section (gray box)
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: rightX,
      y: rightY,
      w: rightWidth,
      h: 2.3,
      fill: { color: colors.veryLightGray },
      line: { color: colors.lightGray, pt: 0.5 },
    })

    slide.addText('Company update', {
      x: rightX + 0.1,
      y: rightY + 0.1,
      w: rightWidth - 0.2,
      h: 0.2,
      fontSize: 9,
      bold: true,
      color: colors.darkGray,
    })

    slide.addText(companyUpdate || '', {
      x: rightX + 0.1,
      y: rightY + 0.35,
      w: rightWidth - 0.2,
      h: 1.85,
      fontSize: 8,
      color: colors.darkGray,
      valign: 'top',
    })

    rightY += 2.5

    // 6. Investment Valuation Section
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: rightX,
      y: rightY,
      w: rightWidth,
      h: 0.25,
      fill: { color: colors.veryLightGray },
      line: { color: colors.lightGray, pt: 0.5 },
    })

    slide.addText('Investment valuation', {
      x: rightX + 0.1,
      y: rightY + 0.05,
      w: rightWidth - 0.2,
      h: 0.2,
      fontSize: 9,
      bold: true,
      color: colors.darkGray,
      align: 'center',
    })

    rightY += 0.3

    // Valuation waterfall table
    const valuationTableData = [
      [
        { text: 'Comps-based valuation waterfall', options: { fontSize: 8, bold: true, fill: { color: colors.veryLightGray } } },
        { text: 'Q4-25 NAV', options: { fontSize: 8, bold: true, fill: { color: colors.orange }, color: colors.white } },
        { text: 'Q3-25 NAV', options: { fontSize: 8, bold: true, fill: { color: colors.veryLightGray } } },
        { text: 'Q2-25 NAV', options: { fontSize: 8, bold: true, fill: { color: colors.veryLightGray } } },
      ],
      [
        { text: 'Comparable EV/Rev Multiple pre-discount', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'ARR (€m) (Oct/Jun/Mar)', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'Enterprise value pre-discount (€m)', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'Discount rate applied to multiple', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'Enterprise value after discount (€m)', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'Cash (€m) (Oct/Jun/Mar)', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'Equity value (€m)', options: { fontSize: 7, bold: true } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'ERVE ownership', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
        { text: '', options: { fontSize: 7 } },
      ],
      [
        { text: 'Comps-based value of ERVE equity (€m)', options: { fontSize: 7, bold: true, fill: { color: colors.veryLightGray } } },
        { text: '', options: { fontSize: 7, fill: { color: colors.veryLightGray } } },
        { text: '', options: { fontSize: 7, fill: { color: colors.veryLightGray } } },
        { text: '', options: { fontSize: 7, fill: { color: colors.veryLightGray } } },
      ],
    ]

    slide.addTable(valuationTableData, {
      x: rightX,
      y: rightY,
      w: rightWidth,
      border: { pt: 0.5, color: colors.lightGray },
      colW: [2.0, 0.7, 0.7, 0.6],
    })

    rightY += 2.2

    // Methodology and Valuation sections
    slide.addText('Methodology', {
      x: rightX,
      y: rightY,
      w: rightWidth,
      h: 0.2,
      fontSize: 8,
      bold: true,
      color: colors.darkGray,
      fill: { color: colors.veryLightGray },
    })

    rightY += 0.25

    slide.addText('Valuation (EUR\'m)', {
      x: rightX,
      y: rightY,
      w: rightWidth,
      h: 0.2,
      fontSize: 8,
      bold: true,
      color: colors.darkGray,
      fill: { color: colors.veryLightGray },
    })

    rightY += 0.25

    slide.addText('Implied multiple (pre-money /ARR)', {
      x: rightX + 0.1,
      y: rightY,
      w: rightWidth - 0.2,
      h: 0.18,
      fontSize: 7,
      color: colors.darkGray,
    })

    // Add Eight Roads logo (bottom right)
    slide.addText('8°', {
      x: 9.0,
      y: 7.0,
      w: 0.5,
      h: 0.3,
      fontSize: 18,
      bold: true,
      color: colors.orange,
    })

    slide.addText('EIGHT ROADS', {
      x: 9.5,
      y: 7.05,
      w: 1.0,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: colors.darkGray,
    })

    // Generate and return the PowerPoint as a Blob
    const pptxBlob = await pptx.write({ outputType: 'blob' })
    return pptxBlob
  } catch (error) {
    console.error('Error generating PowerPoint document:', error)
    throw new Error('Failed to generate PowerPoint document')
  }
}

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

    // Set presentation properties
    pptx.author = 'Eight Roads'
    pptx.company = 'Eight Roads'
    pptx.title = 'NAV 1-Pager'

    // Create the single slide
    const slide = pptx.addSlide()

    // Define colors matching Eight Roads branding
    const colors = {
      navy: '2C3E50',
      orange: 'FF5722',
      white: 'FFFFFF',
      gray: '666666',
      lightGray: 'CCCCCC',
    }

    // RAG Status color mapping
    const ragColors = {
      Green: '00A651',
      Amber: 'FFA500',
      Red: 'D32F2F',
    }

    // Helper function to get RAG color
    const getRAGColor = (status) => ragColors[status] || colors.gray

    // 1. Add RAG Status Indicators at the top (small boxes)
    const ragIndicators = [
      { label: 'Financials', status: ragStatus.financialsStatus, x: 0.3, y: 0.3 },
      { label: 'Cash', status: ragStatus.cashStatus, x: 1.2, y: 0.3 },
      { label: 'Market', status: ragStatus.marketStatus, x: 2.1, y: 0.3 },
      { label: 'Team', status: ragStatus.teamStatus, x: 3.0, y: 0.3 },
      { label: 'Governance', status: ragStatus.governanceStatus, x: 3.9, y: 0.3 },
      { label: 'Overall', status: ragStatus.overallStatus, x: 4.8, y: 0.3 },
    ]

    ragIndicators.forEach(({ label, status, x, y }) => {
      // Label text
      slide.addText(label, {
        x,
        y,
        w: 0.8,
        h: 0.25,
        fontSize: 8,
        bold: true,
        color: colors.navy,
        align: 'center',
      })

      // Status box
      slide.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: y + 0.25,
        w: 0.8,
        h: 0.15,
        fill: { color: getRAGColor(status) },
      })
    })

    // 2. Investment Summary section (left side)
    let yPos = 1.0

    slide.addText('INVESTMENT SUMMARY', {
      x: 0.3,
      y: yPos,
      w: 4.5,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: colors.navy,
    })

    yPos += 0.4

    const investmentDetails = [
      { label: 'ERVE Investment', value: `€${parseFloat(investmentSummary.erveInvestmentEUR || 0).toFixed(1)}m (${investmentSummary.investmentRound || 'N/A'})` },
      { label: 'Total Raised', value: investmentSummary.totalRaised || 'N/A' },
      { label: 'ERVE %', value: `${investmentSummary.erveOwnership || 0}%` },
      { label: 'Security', value: investmentSummary.securityType || 'N/A' },
      { label: 'Other Shareholders', value: investmentSummary.otherShareholders || 'N/A' },
      { label: 'Board Member', value: investmentSummary.boardMember || 'N/A' },
      { label: 'Board Observer', value: investmentSummary.boardObserver || 'N/A' },
      { label: 'Monthly Burn', value: `€${parseFloat(investmentSummary.monthlyBurn || 0).toFixed(1)}m` },
      { label: 'FUME', value: `${investmentSummary.fume || 0} months` },
      { label: 'Last Pre-Money', value: `€${parseFloat(investmentSummary.preMoneyValuation || 0).toFixed(1)}m` },
      { label: 'Last Post-Money', value: `€${parseFloat(investmentSummary.postMoneyValuation || 0).toFixed(1)}m` },
    ]

    investmentDetails.forEach(({ label, value }) => {
      slide.addText(label + ':', {
        x: 0.3,
        y: yPos,
        w: 1.5,
        h: 0.2,
        fontSize: 9,
        bold: true,
        color: colors.navy,
      })

      slide.addText(value, {
        x: 1.9,
        y: yPos,
        w: 2.9,
        h: 0.2,
        fontSize: 9,
        color: colors.gray,
      })

      yPos += 0.25
    })

    // 3. Quarterly Financials Table (right side, top)
    const tableX = 5.0
    let tableY = 1.0

    slide.addText('QUARTERLY FINANCIALS', {
      x: tableX,
      y: tableY,
      w: 4.5,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: colors.navy,
    })

    tableY += 0.4

    // Create financials table
    if (quarterlyFinancials && Object.keys(quarterlyFinancials).length > 0) {
      const periods = Object.keys(quarterlyFinancials)
      const metrics = ['ARR', 'Revenue', 'GM', 'EBITDA', 'FTEs']

      const tableData = []

      // Header row
      const headerRow = ['Metric', ...periods]
      tableData.push(headerRow.map(text => ({ text, options: { bold: true, fontSize: 8, color: colors.white, fill: { color: colors.navy } } })))

      // Data rows
      metrics.forEach(metric => {
        const row = [{ text: metric, options: { bold: true, fontSize: 8 } }]
        periods.forEach(period => {
          const value = quarterlyFinancials[period]?.[metric]
          row.push({ text: value != null ? String(value) : '-', options: { fontSize: 8 } })
        })
        tableData.push(row)
      })

      slide.addTable(tableData, {
        x: tableX,
        y: tableY,
        w: 4.5,
        colW: [0.8, ...Array(periods.length).fill((4.5 - 0.8) / periods.length)],
        border: { pt: 1, color: colors.lightGray },
      })
    }

    // 4. Exit Cases Table (right side, middle)
    const exitY = tableY + 2.0

    slide.addText('EXIT CASES', {
      x: tableX,
      y: exitY,
      w: 4.5,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: colors.navy,
    })

    if (exitCasesTable && Object.keys(exitCasesTable).length > 0) {
      const exitTableData = []

      // Header row
      const exitHeaders = ['Scenario', 'Multiple', 'Valuation', 'ERVE Value']
      exitTableData.push(exitHeaders.map(text => ({ text, options: { bold: true, fontSize: 8, color: colors.white, fill: { color: colors.navy } } })))

      // Data rows
      Object.entries(exitCasesTable).forEach(([scenario, data]) => {
        exitTableData.push([
          { text: scenario, options: { bold: true, fontSize: 8 } },
          { text: data.Multiple || '-', options: { fontSize: 8 } },
          { text: data.Valuation || '-', options: { fontSize: 8 } },
          { text: data['ERVE Value'] || '-', options: { fontSize: 8 } },
        ])
      })

      slide.addTable(exitTableData, {
        x: tableX,
        y: exitY + 0.4,
        w: 4.5,
        colW: [1.2, 1.1, 1.1, 1.1],
        border: { pt: 1, color: colors.lightGray },
      })
    }

    // 5. Company Update (bottom, full width)
    const updateY = 5.0

    slide.addText('COMPANY UPDATE', {
      x: 0.3,
      y: updateY,
      w: 9.2,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: colors.navy,
    })

    slide.addText(companyUpdate || 'No updates available', {
      x: 0.3,
      y: updateY + 0.4,
      w: 9.2,
      h: 2.0,
      fontSize: 9,
      color: colors.gray,
      valign: 'top',
    })

    // Generate and return the PowerPoint as a Blob
    const pptxBlob = await pptx.write({ outputType: 'blob' })
    return pptxBlob
  } catch (error) {
    console.error('Error generating PowerPoint document:', error)
    throw new Error('Failed to generate PowerPoint document')
  }
}

// New Python API-based PowerPoint generation
export const generatePowerPointDocument = async ({
  templateFile,
  investmentSummary,
  ragStatus,
  exitCasesTable,
  quarterlyFinancials,
  companyUpdate,
}) => {
  try {
    // Convert template file to base64
    const templateBase64 = await fileToBase64(templateFile)

    // Prepare request payload
    const payload = {
      templateFile: templateBase64,
      investmentSummary,
      ragStatus,
      exitCasesTable,
      quarterlyFinancials,
      companyUpdate,
    }

    // Debug logging
    console.log('=== Data being sent to Python backend ===')
    console.log('Investment Summary:', investmentSummary)
    console.log('RAG Status:', ragStatus)
    console.log('Quarterly Financials:', quarterlyFinancials)
    console.log('Company Update length:', companyUpdate?.length, 'chars')
    console.log('Company Update preview:', companyUpdate?.substring(0, 200))

    // Create a diagnostic summary
    const diagnosticInfo = []
    diagnosticInfo.push('DATA BEING SENT:')
    diagnosticInfo.push(`- ERVE Investment: ${investmentSummary.erveInvestment || 'NOT SET'} ${investmentSummary.erveInvestmentCurrency || 'EUR'}`)
    diagnosticInfo.push(`- Current Quarter NAV: ${investmentSummary.currentQuarterNAV || 'NOT SET'} ${investmentSummary.currentQuarterNAVCurrency || 'EUR'}`)
    diagnosticInfo.push(`- Prior Quarter NAV: ${investmentSummary.priorQuarterNAV || 'NOT SET'} ${investmentSummary.priorQuarterNAVCurrency || 'EUR'}`)
    diagnosticInfo.push(`- Monthly Burn: ${investmentSummary.monthlyBurn || 'NOT SET'}`)
    diagnosticInfo.push(`- FUME: ${investmentSummary.fume || 'NOT SET'}`)
    diagnosticInfo.push(`- Pre-Money Valuation: ${investmentSummary.preMoneyValuation || 'NOT SET'}`)
    diagnosticInfo.push(`- Post-Money Valuation: ${investmentSummary.postMoneyValuation || 'NOT SET'}`)
    diagnosticInfo.push(`- Quarterly Financials periods: ${Object.keys(quarterlyFinancials).join(', ') || 'NONE'}`)
    diagnosticInfo.push(`- Company Update: ${companyUpdate ? companyUpdate.substring(0, 100) + '...' : 'NOT SET'}`)

    console.log(diagnosticInfo.join('\n'))

    // Call Python API
    const response = await fetch('/api/generate-nav', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${errorText}`)
    }

    const result = await response.json()

    if (!result.success || !result.file) {
      throw new Error('Failed to generate PowerPoint')
    }

    // Log what was updated for debugging
    if (result.updates) {
      console.log('PowerPoint updates:', result.updates)
      console.log('Message:', result.message)
    }

    // Show debug info in a visible alert
    if (result.debugInfo) {
      console.log('Debug Info:', result.debugInfo)
      alert('Update Status:\n\n' + result.debugInfo.join('\n'))
    } else if (result.updates) {
      // Fallback if no debug info
      if (result.updates.length > 0) {
        alert(`Successfully updated:\n${result.updates.join('\n')}`)
      } else {
        alert('Warning: No sections were updated in the template. Please check that your template matches the expected format.')
      }
    }

    // Convert base64 back to Blob
    const binaryString = atob(result.file)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    })

    return blob
  } catch (error) {
    console.error('Error generating PowerPoint document:', error)
    throw new Error(`Failed to generate PowerPoint document: ${error.message}`)
  }
}

// Helper function to convert File to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:application/...;base64,")
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}


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

    // Show alert if nothing was updated
    if (result.updates && result.updates.length === 0) {
      console.warn('Warning: No elements were updated in the template. The template structure may not match expected format.')
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


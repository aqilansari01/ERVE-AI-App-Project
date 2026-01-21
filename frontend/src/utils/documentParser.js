import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

export const parseWordDocument = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  } catch (error) {
    console.error('Error parsing Word document:', error)
    throw new Error('Failed to parse Word document')
  }
}

export const parseExcelDocument = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    let allText = ''
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      allText += `\n\n=== Sheet: ${sheetName} ===\n\n`
      jsonData.forEach((row) => {
        if (row.length > 0) {
          allText += row.join('\t') + '\n'
        }
      })
    })

    return allText
  } catch (error) {
    console.error('Error parsing Excel document:', error)
    throw new Error('Failed to parse Excel document')
  }
}

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64String = reader.result.split(',')[1]
      resolve(base64String)
    }
    reader.onerror = (error) => reject(error)
  })
}

export const getPDFAsBase64 = async (file) => {
  try {
    return await fileToBase64(file)
  } catch (error) {
    console.error('Error converting PDF to base64:', error)
    throw new Error('Failed to process PDF document')
  }
}

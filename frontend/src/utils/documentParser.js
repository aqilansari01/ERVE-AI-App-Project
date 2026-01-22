export const parseWordDocument = async (file) => {
  try {
    // For Word documents, we'll extract text via PDF conversion or direct text extraction
    // For now, we'll read as text since we're using Claude for extraction
    const text = await file.text()
    return text
  } catch (error) {
    console.error('Error parsing Word document:', error)
    throw new Error('Failed to parse Word document')
  }
}

export const isPowerPoint = (filename) => {
  const ext = filename.toLowerCase().split('.').pop()
  return ext === 'pptx' || ext === 'ppt'
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

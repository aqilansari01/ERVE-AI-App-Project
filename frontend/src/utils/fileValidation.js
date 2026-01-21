export const ACCEPTED_FILE_TYPES = {
  template: {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
  },
  priorNav: {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'application/pdf': ['.pdf'],
  },
  boardNotes: {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'application/pdf': ['.pdf'],
  },
  financials: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/pdf': ['.pdf'],
  },
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const validateFile = (file, fileType) => {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    }
  }

  const acceptedTypes = ACCEPTED_FILE_TYPES[fileType]
  if (!acceptedTypes) {
    return { valid: false, error: 'Invalid file type category' }
  }

  const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`
  const isValidType = Object.values(acceptedTypes)
    .flat()
    .includes(fileExtension)

  if (!isValidType) {
    return {
      valid: false,
      error: `Invalid file type. Accepted types: ${Object.values(acceptedTypes)
        .flat()
        .join(', ')}`,
    }
  }

  return { valid: true }
}

export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
}

export const isWordDocument = (filename) => {
  const ext = getFileExtension(filename)
  return ext === 'doc' || ext === 'docx'
}

export const isPDF = (filename) => {
  return getFileExtension(filename) === 'pdf'
}

export const isExcel = (filename) => {
  const ext = getFileExtension(filename)
  return ext === 'xls' || ext === 'xlsx'
}

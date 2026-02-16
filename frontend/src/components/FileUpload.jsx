import { useDropzone } from 'react-dropzone'

export const FileUploadBox = ({ title, description, file, onDrop, accept, disabled }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-md p-5 transition-all cursor-pointer ${
        isDragActive
          ? 'border-[#E84393] bg-pink-50'
          : file
          ? 'border-green-400 bg-green-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <div className="mb-2">
          {file ? (
            <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>
        <h3 className="font-display font-semibold text-sm mb-1 text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mb-1">{description}</p>
        {file ? (
          <p className="text-xs text-green-600 font-medium">{file.name}</p>
        ) : (
          <p className="text-xs text-gray-400">
            {isDragActive ? 'Drop file here' : 'Click or drag file'}
          </p>
        )}
      </div>
    </div>
  )
}

export default function FileUpload({ files, onFilesChange, disabled }) {
  const handleFileDrop = (fileType) => (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFilesChange({
        ...files,
        [fileType]: acceptedFiles[0],
      })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FileUploadBox
        title="Prior Quarter NAV"
        description="Previous quarter's NAV (Word/PDF)"
        file={files.priorNav}
        onDrop={handleFileDrop('priorNav')}
        accept={{
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'application/msword': ['.doc'],
          'application/pdf': ['.pdf'],
        }}
        disabled={disabled}
      />

      <FileUploadBox
        title="Board Notes"
        description="Board notes (Word/PDF)"
        file={files.boardNotes}
        onDrop={handleFileDrop('boardNotes')}
        accept={{
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'application/msword': ['.doc'],
          'application/pdf': ['.pdf'],
        }}
        disabled={disabled}
      />

      <FileUploadBox
        title="Financials"
        description="Financials (Excel/PDF)"
        file={files.financials}
        onDrop={handleFileDrop('financials')}
        accept={{
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'application/vnd.ms-excel': ['.xls'],
          'application/pdf': ['.pdf'],
        }}
        disabled={disabled}
      />
    </div>
  )
}

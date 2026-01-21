import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

const FileUploadBox = ({ title, description, file, onDrop, accept, disabled }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
        isDragActive
          ? 'border-blue-400 bg-blue-500/10'
          : file
          ? 'border-green-400 bg-green-500/10'
          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <div className="mb-2">
          {file ? (
            <svg
              className="mx-auto h-12 w-12 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          )}
        </div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-slate-400 mb-2">{description}</p>
        {file ? (
          <p className="text-sm text-green-400 font-medium">{file.name}</p>
        ) : (
          <p className="text-xs text-slate-500">
            {isDragActive ? 'Drop file here' : 'Click or drag file here'}
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Upload Required Documents</h2>
        <p className="text-slate-400">
          Upload all four documents to generate your NAV 1-pager
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadBox
          title="NAV Template"
          description="Blank NAV template (Word doc)"
          file={files.template}
          onDrop={handleFileDrop('template')}
          accept={{
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
          }}
          disabled={disabled}
        />

        <FileUploadBox
          title="Prior Quarter NAV"
          description="Previous quarter's completed NAV (Word/PDF)"
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
          description="Board notes document (Word/PDF)"
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
          description="Financials document (Excel/PDF)"
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
    </div>
  )
}

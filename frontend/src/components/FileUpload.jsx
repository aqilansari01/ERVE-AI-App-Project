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
          ? 'border-[#FF5722] bg-[#FF5722]/10'
          : file
          ? 'border-[#FF5722] bg-[#374A5E]'
          : 'border-gray-600 bg-[#374A5E] hover:border-[#FF5722]/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <div className="mb-2">
          {file ? (
            <svg
              className="mx-auto h-12 w-12 text-[#FF5722]"
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
              className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="font-bold text-sm uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-sm text-gray-400 mb-2">{description}</p>
        {file ? (
          <p className="text-sm text-[#FF5722] font-medium">{file.name}</p>
        ) : (
          <p className="text-xs text-gray-500">
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
        <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide">Upload Required Documents</h2>
        <p className="text-gray-400">
          Upload all four documents to generate your NAV 1-pager
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadBox
          title="NAV Template"
          description="Blank NAV template (PowerPoint .pptx)"
          file={files.template}
          onDrop={handleFileDrop('template')}
          accept={{
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
          }}
          disabled={disabled}
        />

        <FileUploadBox
          title="Prior Quarter NAV"
          description="Previous quarter's completed NAV (PDF)"
          file={files.priorNav}
          onDrop={handleFileDrop('priorNav')}
          accept={{
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
          description="Financials document (PDF)"
          file={files.financials}
          onDrop={handleFileDrop('financials')}
          accept={{
            'application/pdf': ['.pdf'],
          }}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

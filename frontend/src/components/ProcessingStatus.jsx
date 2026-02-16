export default function ProcessingStatus({ message, progress }) {
  return (
    <div className="p-6 bg-navy-800 rounded-lg shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-navy-600 border-t-accent-500"></div>
          <p className="text-base font-display font-medium text-white">{message}</p>
        </div>

        <div className="w-full bg-navy-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-accent-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-center text-sm text-navy-300">{progress}% complete</p>
      </div>
    </div>
  )
}

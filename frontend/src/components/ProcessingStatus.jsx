export default function ProcessingStatus({ message, progress }) {
  return (
    <div className="mt-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-lg font-medium">{message}</p>
        </div>

        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-center text-sm text-slate-400">{progress}% complete</p>
      </div>
    </div>
  )
}

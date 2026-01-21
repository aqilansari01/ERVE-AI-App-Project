export default function ProcessingStatus({ message, progress }) {
  return (
    <div className="mt-8 p-6 bg-[#374A5E] rounded-lg border border-gray-600">
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5722]"></div>
          <p className="text-lg font-medium">{message}</p>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-[#FF5722] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-center text-sm text-gray-400 uppercase tracking-wide">{progress}% complete</p>
      </div>
    </div>
  )
}

export default function ProcessingStatus({ message, progress }) {
  return (
    <div className="p-6 bg-white rounded-md shadow-sm border border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-[#E84393]"></div>
          <p className="text-base font-display font-medium text-gray-900">{message}</p>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#E84393] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-center text-sm text-gray-500">{progress}% complete</p>
      </div>
    </div>
  )
}

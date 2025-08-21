interface UsageBarProps {
  label: string
  used: number
  limit: number
  className?: string
}

export function UsageBar({ label, used, limit, className = "" }: UsageBarProps) {
  const percentage = Math.min(100, Math.round((used / Math.max(1, limit)) * 100))
  const isNearLimit = percentage >= 80
  const isOverLimit = percentage >= 100

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-100">{label}</span>
        <span className={`text-xs ${isOverLimit ? "text-red-400" : isNearLimit ? "text-yellow-400" : "text-gray-400"}`}>
          {used.toLocaleString()}/{limit.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isOverLimit
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : isNearLimit
                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                : "bg-gradient-to-r from-pink-500 to-purple-600"
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {isOverLimit && <p className="text-xs text-red-400">Quota exceeded. Upgrade your plan to continue generating.</p>}
      {isNearLimit && !isOverLimit && (
        <p className="text-xs text-yellow-400">Approaching quota limit. Consider upgrading soon.</p>
      )}
    </div>
  )
}

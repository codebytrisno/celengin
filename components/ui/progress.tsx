interface ProgressProps {
  value: number
  max?: number
  color?: 'teal' | 'orange' | 'blue'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const colorMap = {
  teal: 'bg-teal-500',
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
}

const sizeMap = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
}

export function Progress({
  value,
  max = 100,
  color = 'teal',
  showLabel = false,
  size = 'md',
  className = '',
}: ProgressProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progress</span>
          <span className="font-semibold text-slate-700">{pct}%</span>
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-100 overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`${sizeMap[size]} rounded-full ${colorMap[color]} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

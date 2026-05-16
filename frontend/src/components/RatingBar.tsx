interface Props {
  value: number
  max?: number
  colorClass?: string
  size?: 'sm' | 'md'
}

export function RatingBar({ value, max = 5, colorClass, size = 'md' }: Props) {
  const pct = Math.min(100, (value / max) * 100)
  const h = size === 'sm' ? 'h-1.5' : 'h-2'

  const autoColor = !colorClass
    ? value >= 4
      ? 'bg-emerald-500'
      : value >= 3
      ? 'bg-yellow-400'
      : value >= 2
      ? 'bg-orange-400'
      : 'bg-red-500'
    : colorClass

  return (
    <div className={`w-full bg-gray-200 rounded-full ${h} overflow-hidden`}>
      <div
        className={`${h} rounded-full transition-all duration-300 ${colorClass ?? autoColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

interface StarProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ rating, size = 'md' }: StarProps) {
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
  const color =
    rating >= 4 ? 'text-emerald-500' : rating >= 3 ? 'text-yellow-500' : rating >= 2 ? 'text-orange-500' : 'text-red-500'

  return (
    <span className={`font-bold ${textSize} ${color}`}>
      {rating > 0 ? rating.toFixed(1) : 'N/A'}
      {rating > 0 && <span className="text-yellow-400 ml-0.5">★</span>}
    </span>
  )
}

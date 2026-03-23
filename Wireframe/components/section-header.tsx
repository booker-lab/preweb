import { ChevronRight } from "lucide-react"

interface SectionHeaderProps {
  emoji?: string
  title: string
  showMore?: boolean
  onMoreClick?: () => void
}

export function SectionHeader({
  emoji,
  title,
  showMore = false,
  onMoreClick,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
        {emoji && <span>{emoji}</span>}
        {title}
      </h2>
      {showMore && (
        <button
          onClick={onMoreClick}
          className="text-xs text-muted-foreground flex items-center gap-0.5"
        >
          더보기
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

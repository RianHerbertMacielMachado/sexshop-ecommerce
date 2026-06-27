'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((p, i) => {
        const prev = visiblePages[i - 1]
        const showEllipsis = prev && p - prev > 1

        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="px-2 text-muted-foreground text-sm">...</span>
            )}
            <Button
              variant={p === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(p)}
              className="min-w-[36px]"
            >
              {p}
            </Button>
          </span>
        )
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

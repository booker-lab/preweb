"use client"

import { Heart } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface ProductCardProps {
  id: number
  name: string
  originalPrice: number
  salePrice: number
  discount: number
  imageUrl?: string
  category?: string
  isGroupBuy?: boolean
  groupBuyProgress?: { current: number; total: number }
  deadline?: string
}

export function ProductCard({
  id,
  name,
  originalPrice,
  salePrice,
  discount,
  imageUrl,
  category,
  isGroupBuy,
  groupBuyProgress,
  deadline,
}: ProductCardProps) {
  const [liked, setLiked] = useState(false)

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR")
  }

  const linkHref = isGroupBuy ? `/groupbuy/${id}` : `/product/${id}`

  return (
    <Link href={linkHref} className="block">
      <div className="bg-card rounded-2xl shadow-sm overflow-hidden relative">
        {/* Image Container */}
        <div className="relative aspect-square bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent to-muted flex items-center justify-center">
            <span className="text-4xl">🌸</span>
          </div>
        )}
        
        {/* Category Badge - Top Left */}
        {category && (
          <span 
            suppressHydrationWarning
            className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-medium px-2 py-1 rounded-full"
          >
            {category}
          </span>
        )}
        
        {/* Group Buy Badge - Top Right */}
        {isGroupBuy && (
          <span 
            suppressHydrationWarning
            className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full"
          >
            공동구매
          </span>
        )}
        
        {/* Heart Button - Bottom Right */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLiked(!liked)
          }}
          className="absolute bottom-2 right-2 w-8 h-8 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart
            className={`w-4 h-4 ${
              liked ? "fill-destructive text-destructive" : "text-muted-foreground"
            }`}
          />
        </button>
        
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded">
            {discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 suppressHydrationWarning className="font-medium text-sm text-foreground line-clamp-2 mb-1">
          {name}
        </h3>
        
        <div className="flex items-baseline gap-2">
          {originalPrice !== salePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(originalPrice)}원
            </span>
          )}
          <span className="text-sm font-bold text-primary">
            {formatPrice(salePrice)}원
          </span>
        </div>

        {/* Group Buy Progress */}
        {groupBuyProgress && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">
                {groupBuyProgress.current}/{groupBuyProgress.total}명
              </span>
              {deadline && (
                <span className="text-destructive font-medium">{deadline}</span>
              )}
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${(groupBuyProgress.current / groupBuyProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
        </div>
      </div>
    </Link>
  )
}

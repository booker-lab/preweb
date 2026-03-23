"use client"

import { Heart, Star } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface BestProductCardProps {
  id: number
  rank: number
  name: string
  price: number
  rating: number
  reviewCount: number
  imageUrl?: string
}

export function BestProductCard({
  id,
  rank,
  name,
  price,
  rating,
  reviewCount,
  imageUrl,
}: BestProductCardProps) {
  const [liked, setLiked] = useState(false)

  const formatPrice = (p: number) => p.toLocaleString("ko-KR")

  return (
    <Link href={`/product/${id}`} className="block">
      <div className="bg-card rounded-2xl shadow-sm p-3 flex gap-3 relative">
      {/* Rank Badge */}
      <div className="absolute -top-1 -left-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-sm z-10">
        {rank}
      </div>

      {/* Image */}
      <div className="w-24 h-24 rounded-xl bg-muted flex-shrink-0 overflow-hidden relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent to-muted flex items-center justify-center">
            <span className="text-3xl">🌷</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
          {name}
        </h3>
        <p className="text-base font-bold text-primary mb-1">
          {formatPrice(price)}원
        </p>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-foreground font-medium">{rating}</span>
          <span className="text-xs text-muted-foreground">
            ({reviewCount.toLocaleString()})
          </span>
        </div>
      </div>

      {/* Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLiked(!liked)
          }}
          className="self-start w-8 h-8 rounded-full flex items-center justify-center"
        >
          <Heart
            className={`w-5 h-5 ${
              liked ? "fill-destructive text-destructive" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>
    </Link>
  )
}

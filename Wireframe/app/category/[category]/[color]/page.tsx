"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Home, Grid3X3, ShoppingCart, User, ArrowLeft, Heart, ChevronDown, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { NAV_LABELS } from "@/lib/constants"
import { BottomNav } from "@/components/bottom-nav"

type ProductCategory = "절화" | "난" | "관엽"
type ProductColor = "레드" | "핑크" | "화이트" | "옐로우" | "오렌지" | "퍼플" | "블루" | "무늬" | "브라운" | "베이지" | "그린"
type SortOption = "최신순" | "인기순" | "낮은가격순" | "높은가격순"

interface Product {
  id: number
  name: string
  originalPrice: number
  salePrice: number
  discount: number
  category: ProductCategory
  color: ProductColor
  isGroupBuy: boolean
  groupBuyProgress?: { current: number; total: number }
  deadlineText?: string
  deadlineUrgent?: boolean
  popularity: number
}

const products: Product[] = [
  { id: 1, name: "프리미엄 장미 꽃다발 레드", originalPrice: 75000, salePrice: 52000, discount: 31, category: "절화", color: "레드", isGroupBuy: false, popularity: 95 },
  { id: 2, name: "호접란 화이트 3대", originalPrice: 120000, salePrice: 89000, discount: 26, category: "난", color: "화이트", isGroupBuy: false, popularity: 88 },
  { id: 3, name: "몬스테라 대형 화분", originalPrice: 65000, salePrice: 48000, discount: 26, category: "관엽", color: "그린", isGroupBuy: false, popularity: 92 },
  { id: 4, name: "카네이션 100송이 세트", originalPrice: 85000, salePrice: 45000, discount: 47, category: "절화", color: "핑크", isGroupBuy: true, groupBuyProgress: { current: 18, total: 30 }, deadlineText: "마감 3월 26일", deadlineUrgent: false, popularity: 85 },
  { id: 5, name: "심비디움 옐로우", originalPrice: 95000, salePrice: 72000, discount: 24, category: "난", color: "옐로우", isGroupBuy: false, popularity: 78 },
  { id: 6, name: "아레카야자 중형", originalPrice: 45000, salePrice: 32000, discount: 29, category: "관엽", color: "그린", isGroupBuy: false, popularity: 80 },
  { id: 7, name: "튤립 믹스 50송이", originalPrice: 68000, salePrice: 42000, discount: 38, category: "절화", color: "무늬", isGroupBuy: false, popularity: 90 },
  { id: 8, name: "덴드로비움 핑크", originalPrice: 55000, salePrice: 39000, discount: 29, category: "난", color: "핑크", isGroupBuy: false, popularity: 72 },
  { id: 9, name: "스투키 3종 세트", originalPrice: 38000, salePrice: 25000, discount: 34, category: "관엽", color: "그린", isGroupBuy: true, groupBuyProgress: { current: 22, total: 40 }, deadlineText: "마감 18시간 전", deadlineUrgent: true, popularity: 88 },
  { id: 10, name: "수국 블루 한 다발", originalPrice: 55000, salePrice: 38000, discount: 31, category: "절화", color: "블루", isGroupBuy: false, popularity: 82 },
  { id: 11, name: "호접란 핑크 5대", originalPrice: 180000, salePrice: 135000, discount: 25, category: "난", color: "핑크", isGroupBuy: false, popularity: 75 },
  { id: 12, name: "금전수 대형", originalPrice: 72000, salePrice: 55000, discount: 24, category: "관엽", color: "그린", isGroupBuy: false, popularity: 70 },
  { id: 13, name: "프리지아 옐로우", originalPrice: 42000, salePrice: 28000, discount: 33, category: "절화", color: "옐로우", isGroupBuy: false, popularity: 68 },
  { id: 14, name: "온시디움 브랜치", originalPrice: 48000, salePrice: 35000, discount: 27, category: "난", color: "옐로우", isGroupBuy: false, popularity: 65 },
  { id: 15, name: "행운목 미니", originalPrice: 25000, salePrice: 18000, discount: 28, category: "관엽", color: "그린", isGroupBuy: false, popularity: 60 },
  { id: 16, name: "거베라 믹스 30송이", originalPrice: 52000, salePrice: 35000, discount: 33, category: "절화", color: "오렌지", isGroupBuy: false, popularity: 77 },
  { id: 17, name: "만천홍 레드", originalPrice: 88000, salePrice: 65000, discount: 26, category: "난", color: "레드", isGroupBuy: true, groupBuyProgress: { current: 12, total: 25 }, deadlineText: "마감 8시간 전", deadlineUrgent: true, popularity: 83 },
  { id: 18, name: "산세베리아 대형", originalPrice: 58000, salePrice: 42000, discount: 28, category: "관엽", color: "무늬", isGroupBuy: false, popularity: 79 },
  { id: 19, name: "안개꽃 화이트 대형", originalPrice: 35000, salePrice: 22000, discount: 37, category: "절화", color: "화이트", isGroupBuy: false, popularity: 86 },
  { id: 20, name: "파피오페딜럼", originalPrice: 78000, salePrice: 58000, discount: 26, category: "난", color: "퍼플", isGroupBuy: false, popularity: 71 },
  { id: 21, name: "빨간 장미 30송이", originalPrice: 55000, salePrice: 38000, discount: 31, category: "절화", color: "레드", isGroupBuy: false, popularity: 94 },
  { id: 22, name: "핑크 카라 부케", originalPrice: 48000, salePrice: 35000, discount: 27, category: "절화", color: "핑크", isGroupBuy: false, popularity: 81 },
  { id: 23, name: "화이트 튤립 20송이", originalPrice: 42000, salePrice: 28000, discount: 33, category: "절화", color: "화이트", isGroupBuy: false, popularity: 76 },
  { id: 24, name: "옐로우 거베라 믹스", originalPrice: 38000, salePrice: 25000, discount: 34, category: "절화", color: "옐로우", isGroupBuy: false, popularity: 73 },
]

const categoryColors: Record<ProductCategory, string> = {
  "절화": "bg-primary text-primary-foreground",
  "난": "bg-purple-500 text-white",
  "관엽": "bg-teal-500 text-white",
}

export default function ProductListingPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("category")
  const [sortOption, setSortOption] = useState<SortOption>("최신순")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const { toggleWishlist, isInWishlist, getCartCount } = useStore()

  // Decode URL parameters
  const category = decodeURIComponent(params.category as string) as ProductCategory
  const colorParam = decodeURIComponent(params.color as string)
  const color = colorParam === "all" ? null : colorParam as ProductColor

  // Filter products by category and color
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.category === category)
    if (color) {
      result = result.filter(p => p.color === color)
    }
    
    // Sort products
    switch (sortOption) {
      case "인기순":
        return result.sort((a, b) => b.popularity - a.popularity)
      case "낮은가격순":
        return result.sort((a, b) => a.salePrice - b.salePrice)
      case "높은가격순":
        return result.sort((a, b) => b.salePrice - a.salePrice)
      case "최신순":
      default:
        return result.sort((a, b) => b.id - a.id)
    }
  }, [category, color, sortOption])

  const router = useRouter()
  const headerTitle = color ? `${category} · ${color}` : `${category} · 전체`

  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <a href="/category" className="p-1">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </a>
        <h1 className="text-lg font-bold text-foreground">{headerTitle}</h1>
        <a href="/" className="p-1">
          <Home className="h-6 w-6 text-foreground" />
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {/* Sort Bar */}
        <div className="relative flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-sm text-muted-foreground">
            총 {filteredProducts.length}개
          </span>
          <button 
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            {sortOption} <ChevronDown className="h-4 w-4" />
          </button>
          
          {/* Sort Dropdown */}
          {showSortDropdown && (
            <div className="absolute right-4 top-full z-10 mt-1 w-32 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              {(["최신순", "인기순", "낮은가격순", "높은가격순"] as SortOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortOption(option)
                    setShowSortDropdown(false)
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm transition-colors",
                    sortOption === option
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 p-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl bg-card shadow-sm cursor-pointer"
              onClick={() => router.push(product.isGroupBuy ? `/groupbuy/${product.id}` : `/product/${product.id}`)}
            >
              <div className="relative aspect-square bg-muted">
                {/* Category Badge */}
                <span className={cn(
                  "absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium",
                  categoryColors[product.category]
                )}>
                  {product.category}
                </span>
                {/* Group Buy Badge */}
                {product.isGroupBuy && (
                  <span className="absolute right-2 top-2 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">
                    공동구매
                  </span>
                )}
                {/* Wishlist Icon */}
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute bottom-2 right-2 rounded-full bg-background/80 p-1.5 transition-colors hover:bg-background"
                >
                  <Heart className={cn(
                    "h-4 w-4",
                    isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                  )} />
                </button>
              </div>
              <div className="flex flex-col gap-1 p-3">
                {/* Product name - 2 lines max */}
                <span className="line-clamp-2 h-10 text-sm font-medium text-foreground">
                  {product.name}
                </span>
                {/* Discount + Sale price */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-destructive">{product.discount}%</span>
                  <span className="text-sm font-bold text-foreground">
                    {product.salePrice.toLocaleString()}원
                  </span>
                </div>
                {/* Original price strikethrough */}
                <span className="text-xs text-muted-foreground line-through">
                  {product.originalPrice.toLocaleString()}원
                </span>
                
                {/* Group Buy Info OR Empty Space for height consistency */}
                {product.isGroupBuy && product.groupBuyProgress ? (
                  <div className="mt-1 flex flex-col gap-1">
                    {/* Progress bar */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(product.groupBuyProgress.current / product.groupBuyProgress.total) * 100}%` }}
                      />
                    </div>
                    {/* Participant count */}
                    <span className="text-[10px] text-muted-foreground">
                      {product.groupBuyProgress.current}/{product.groupBuyProgress.total}명
                    </span>
                    {/* Deadline */}
                    {product.deadlineText && (
                      <span className={cn(
                        "text-[10px]",
                        product.deadlineUrgent ? "font-medium text-destructive" : "text-muted-foreground"
                      )}>
                        {product.deadlineText}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Empty reserved space - same height as group buy info */
                  <div className="mt-1 h-[42px]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

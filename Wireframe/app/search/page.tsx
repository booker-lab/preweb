"use client"

import { useState, useEffect, useRef } from "react"
import { Home, Grid3X3, ShoppingCart, User, Heart, ArrowLeft, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { NAV_LABELS } from "@/lib/constants"

type ProductCategory = "절화" | "난" | "관엽"

interface Product {
  id: number
  name: string
  originalPrice: number
  salePrice: number
  discount: number
  category: ProductCategory
  isGroupBuy: boolean
  groupBuyProgress?: { current: number; total: number }
  deadlineText?: string
  deadlineUrgent?: boolean
}

const products: Product[] = [
  { id: 1, name: "프리미엄 장미 꽃다발 레드", originalPrice: 75000, salePrice: 52000, discount: 31, category: "절화", isGroupBuy: false },
  { id: 2, name: "호접란 화이트 3대", originalPrice: 120000, salePrice: 89000, discount: 26, category: "난", isGroupBuy: false },
  { id: 3, name: "몬스테라 대형 화분", originalPrice: 65000, salePrice: 48000, discount: 26, category: "관엽", isGroupBuy: false },
  { id: 4, name: "카네이션 100송이 세트", originalPrice: 85000, salePrice: 45000, discount: 47, category: "절화", isGroupBuy: true, groupBuyProgress: { current: 18, total: 30 }, deadlineText: "마감 3월 26일", deadlineUrgent: false },
  { id: 5, name: "심비디움 옐로우", originalPrice: 95000, salePrice: 72000, discount: 24, category: "난", isGroupBuy: false },
  { id: 6, name: "아레카야자 중형", originalPrice: 45000, salePrice: 32000, discount: 29, category: "관엽", isGroupBuy: false },
  { id: 7, name: "튤립 믹스 50송이", originalPrice: 68000, salePrice: 42000, discount: 38, category: "절화", isGroupBuy: false },
  { id: 8, name: "덴드로비움 핑크", originalPrice: 55000, salePrice: 39000, discount: 29, category: "난", isGroupBuy: false },
  { id: 9, name: "스투키 3종 세트", originalPrice: 38000, salePrice: 25000, discount: 34, category: "관엽", isGroupBuy: true, groupBuyProgress: { current: 22, total: 40 }, deadlineText: "마감 18시간 전", deadlineUrgent: true },
  { id: 10, name: "수국 블루 한 다발", originalPrice: 55000, salePrice: 38000, discount: 31, category: "절화", isGroupBuy: false },
  { id: 11, name: "호접란 핑크 5대", originalPrice: 180000, salePrice: 135000, discount: 25, category: "난", isGroupBuy: false },
  { id: 12, name: "금전수 대형", originalPrice: 72000, salePrice: 55000, discount: 24, category: "관엽", isGroupBuy: false },
  { id: 13, name: "프리지아 옐로우", originalPrice: 42000, salePrice: 28000, discount: 33, category: "절화", isGroupBuy: false },
  { id: 14, name: "온시디움 브랜치", originalPrice: 48000, salePrice: 35000, discount: 27, category: "난", isGroupBuy: false },
  { id: 15, name: "행운목 미니", originalPrice: 25000, salePrice: 18000, discount: 28, category: "관엽", isGroupBuy: false },
  { id: 16, name: "거베라 믹스 30송이", originalPrice: 52000, salePrice: 35000, discount: 33, category: "절화", isGroupBuy: false },
  { id: 17, name: "만천홍 레드", originalPrice: 88000, salePrice: 65000, discount: 26, category: "난", isGroupBuy: true, groupBuyProgress: { current: 12, total: 25 }, deadlineText: "마감 8시간 전", deadlineUrgent: true },
  { id: 18, name: "산세베리아 대형", originalPrice: 58000, salePrice: 42000, discount: 28, category: "관엽", isGroupBuy: false },
  { id: 19, name: "안개꽃 화이트 대형", originalPrice: 35000, salePrice: 22000, discount: 37, category: "절화", isGroupBuy: false },
  { id: 20, name: "파피오페딜럼", originalPrice: 78000, salePrice: 58000, discount: 26, category: "난", isGroupBuy: false },
  { id: 21, name: "리시안셔스 화이트", originalPrice: 48000, salePrice: 32000, discount: 33, category: "절화", isGroupBuy: false },
  { id: 22, name: "동양란 선물세트", originalPrice: 150000, salePrice: 115000, discount: 23, category: "난", isGroupBuy: false },
  { id: 23, name: "피쿠스 벤자민", originalPrice: 55000, salePrice: 39000, discount: 29, category: "관엽", isGroupBuy: false },
  { id: 24, name: "작약 핑크 20송이", originalPrice: 72000, salePrice: 48000, discount: 33, category: "절화", isGroupBuy: true, groupBuyProgress: { current: 28, total: 50 }, deadlineText: "마감 3월 24일", deadlineUrgent: false },
  { id: 25, name: "카틀레야 퍼플", originalPrice: 98000, salePrice: 75000, discount: 23, category: "난", isGroupBuy: false },
  { id: 26, name: "테이블야자 미니", originalPrice: 28000, salePrice: 19000, discount: 32, category: "관엽", isGroupBuy: false },
  { id: 27, name: "백합 화이트 믹스", originalPrice: 58000, salePrice: 42000, discount: 28, category: "절화", isGroupBuy: false },
  { id: 28, name: "풍란 화이트", originalPrice: 65000, salePrice: 48000, discount: 26, category: "난", isGroupBuy: false },
  { id: 29, name: "고무나무 대형", originalPrice: 85000, salePrice: 62000, discount: 27, category: "관엽", isGroupBuy: true, groupBuyProgress: { current: 15, total: 35 }, deadlineText: "마감 12시간 전", deadlineUrgent: true },
  { id: 30, name: "유칼립투스 부케", originalPrice: 42000, salePrice: 28000, discount: 33, category: "절화", isGroupBuy: false },
]

// Popular search keywords with trends
const popularKeywords = [
  { rank: 1, keyword: "장미", trend: "up" as const },
  { rank: 2, keyword: "튤립", trend: "same" as const },
  { rank: 3, keyword: "수국", trend: "up" as const },
  { rank: 4, keyword: "호접란", trend: "down" as const },
  { rank: 5, keyword: "안개꽃", trend: "same" as const },
  { rank: 6, keyword: "카네이션", trend: "up" as const },
  { rank: 7, keyword: "거베라", trend: "down" as const },
  { rank: 8, keyword: "프리지아", trend: "same" as const },
  { rank: 9, keyword: "해바라기", trend: "up" as const },
  { rank: 10, keyword: "백합", trend: "down" as const },
]

const categoryColors: Record<ProductCategory, string> = {
  "절화": "bg-primary text-primary-foreground",
  "난": "bg-purple-500 text-white",
  "관엽": "bg-teal-500 text-white",
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { toggleWishlist, isInWishlist, getCartCount } = useStore()

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Filter products based on search query
  const searchResults = searchQuery.trim()
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.includes(searchQuery)
      )
    : []

  const hasQuery = searchQuery.trim().length > 0

  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <a href="/" className="shrink-0 p-1">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </a>
        <div className="flex flex-1 items-center rounded-full bg-muted px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색어를 입력해 주세요"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {!hasQuery ? (
          /* Default State - Popular Keywords */
          <section className="p-4">
            <h2 className="mb-4 text-lg font-bold text-foreground">인기 검색어</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {/* Left column (1-5) */}
              <div className="flex flex-col gap-3">
                {popularKeywords.slice(0, 5).map((item) => (
                  <button
                    key={item.rank}
                    onClick={() => setSearchQuery(item.keyword)}
                    className="flex items-center gap-3 text-left"
                  >
                    <span className={cn(
                      "w-5 text-sm font-bold",
                      item.rank <= 3 ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.rank}
                    </span>
                    <span className="flex-1 text-sm text-foreground">{item.keyword}</span>
                    <span className={cn(
                      "text-xs",
                      item.trend === "up" && "text-red-500",
                      item.trend === "down" && "text-blue-500",
                      item.trend === "same" && "text-muted-foreground"
                    )}>
                      {item.trend === "up" && "▲"}
                      {item.trend === "down" && "▼"}
                      {item.trend === "same" && "–"}
                    </span>
                  </button>
                ))}
              </div>
              {/* Right column (6-10) */}
              <div className="flex flex-col gap-3">
                {popularKeywords.slice(5, 10).map((item) => (
                  <button
                    key={item.rank}
                    onClick={() => setSearchQuery(item.keyword)}
                    className="flex items-center gap-3 text-left"
                  >
                    <span className="w-5 text-sm font-bold text-muted-foreground">
                      {item.rank}
                    </span>
                    <span className="flex-1 text-sm text-foreground">{item.keyword}</span>
                    <span className={cn(
                      "text-xs",
                      item.trend === "up" && "text-red-500",
                      item.trend === "down" && "text-blue-500",
                      item.trend === "same" && "text-muted-foreground"
                    )}>
                      {item.trend === "up" && "▲"}
                      {item.trend === "down" && "▼"}
                      {item.trend === "same" && "–"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : searchResults.length > 0 ? (
          /* Search Results */
          <section className="p-4">
            <p className="mb-3 text-sm text-muted-foreground">총 {searchResults.length}개</p>
            <div className="grid grid-cols-2 gap-3">
              {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-xl bg-card shadow-sm"
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
          </section>
        ) : (
          /* No Results */
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
            <p className="text-lg font-medium text-foreground">검색 결과가 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">다른 검색어로 시도해보세요</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation - No active tab for search */}
      <nav className="fixed bottom-0 left-1/2 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around py-2">
          {[
            { id: "home", icon: Home, label: NAV_LABELS.home, href: "/" },
            { id: "category", icon: Grid3X3, label: NAV_LABELS.category, href: "/category" },
            { id: "groupbuy", icon: Users, label: NAV_LABELS.groupbuy, href: "/groupbuy" },
            { id: "cart", icon: ShoppingCart, label: NAV_LABELS.cart, href: "/cart" },
            { id: "mypage", icon: User, label: NAV_LABELS.mypage },
          ].map((tab) => (
            <a
              key={tab.id}
              href={tab.href || "#"}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <div className="relative">
                <tab.icon className="h-6 w-6 text-muted-foreground transition-colors" />
                {tab.id === "cart" && getCartCount() > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {getCartCount()}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {tab.label}
              </span>
            </a>
          ))}
        </div>
        {/* Safe area padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Home, Grid3X3, ShoppingCart, User, Search, ChevronDown, ChevronUp, Flower2, Leaf, Users, ChevronRight, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { NAV_LABELS } from "@/lib/constants"
import { BottomNav } from "@/components/bottom-nav"

type CategoryType = "절화" | "난" | "관엽"
type ProductColor = "전체" | "레드" | "핑크" | "화이트" | "옐로우" | "오렌지" | "퍼플" | "블루" | "무늬" | "브라운" | "베이지" | "그린"
type ProductCategory = "절화" | "난" | "관엽"

interface CategoryData {
  id: CategoryType
  name: string
  icon: typeof Flower2
  colors: ProductColor[]
}

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
  isSoldOut?: boolean
}

const categories: CategoryData[] = [
  {
    id: "절화",
    name: "절화",
    icon: Flower2,
    colors: ["전체", "레드", "핑크", "화이트", "옐로우", "오렌지", "퍼플", "블루", "무늬", "브라운", "베이지", "그린"]
  },
  {
    id: "난",
    name: "난",
    icon: Flower2,
    colors: ["전체", "화이트", "핑크", "퍼플", "옐로우", "무늬"]
  },
  {
    id: "관엽",
    name: "관엽",
    icon: Leaf,
    colors: ["전체", "그린", "무늬", "레드", "옐로우", "화이트"]
  }
]

const colorStyles: Record<ProductColor, { bg: string; border?: string }> = {
  "전체": { bg: "bg-gradient-to-br from-pink-400 via-yellow-300 to-green-400" },
  "레드": { bg: "bg-red-500" },
  "핑크": { bg: "bg-pink-400" },
  "화이트": { bg: "bg-white", border: "border border-gray-300" },
  "옐로우": { bg: "bg-yellow-400" },
  "오렌지": { bg: "bg-orange-500" },
  "퍼플": { bg: "bg-purple-500" },
  "블루": { bg: "bg-blue-500" },
  "무늬": { bg: "bg-gradient-to-br from-pink-400 via-yellow-300 to-green-400" },
  "브라운": { bg: "bg-amber-700" },
  "베이지": { bg: "bg-amber-100", border: "border border-gray-200" },
  "그린": { bg: "bg-green-500" },
}

const categoryColors: Record<ProductCategory, string> = {
  "절화": "bg-primary/10 text-primary",
  "난": "bg-purple-100 text-purple-700",
  "관엽": "bg-teal-100 text-teal-700",
}

// Popular products for section
const popularProducts = [
  { id: 1, name: "프리미엄 장미 꽃다발", price: 52000, discount: 31 },
  { id: 2, name: "호접란 화이트 3대", price: 89000, discount: 26 },
  { id: 3, name: "몬스테라 대형", price: 48000, discount: 26 },
]

// Latest products (30 items including sold-out)
const latestProducts: Product[] = [
  { id: 1, name: "프리미엄 장미 꽃다발 레드", originalPrice: 75000, salePrice: 52000, discount: 31, category: "절화", isGroupBuy: false },
  { id: 2, name: "호접란 화이트 3대", originalPrice: 120000, salePrice: 89000, discount: 26, category: "난", isGroupBuy: false },
  { id: 3, name: "몬스테라 대형 화분", originalPrice: 65000, salePrice: 48000, discount: 26, category: "관엽", isGroupBuy: false },
  { id: 4, name: "카네이션 100송이 세트", originalPrice: 85000, salePrice: 45000, discount: 47, category: "절화", isGroupBuy: true, groupBuyProgress: { current: 18, total: 30 }, deadlineText: "마감 3월 26일", deadlineUrgent: false },
  { id: 5, name: "심비디움 옐로우", originalPrice: 95000, salePrice: 72000, discount: 24, category: "난", isGroupBuy: false, isSoldOut: true },
  { id: 6, name: "아레카야자 중형", originalPrice: 45000, salePrice: 32000, discount: 29, category: "관엽", isGroupBuy: false },
  { id: 7, name: "튤립 믹스 50송이", originalPrice: 68000, salePrice: 42000, discount: 38, category: "절화", isGroupBuy: false },
  { id: 8, name: "덴드로비움 핑크", originalPrice: 55000, salePrice: 39000, discount: 29, category: "난", isGroupBuy: false, isSoldOut: true },
  { id: 9, name: "스투키 3종 세트", originalPrice: 38000, salePrice: 25000, discount: 34, category: "관엽", isGroupBuy: true, groupBuyProgress: { current: 22, total: 40 }, deadlineText: "마감 18시간 전", deadlineUrgent: true },
  { id: 10, name: "수국 블루 한 다발", originalPrice: 55000, salePrice: 38000, discount: 31, category: "절화", isGroupBuy: false },
  { id: 11, name: "호접란 핑크 5대", originalPrice: 180000, salePrice: 135000, discount: 25, category: "난", isGroupBuy: false },
  { id: 12, name: "금전수 대형", originalPrice: 72000, salePrice: 55000, discount: 24, category: "관엽", isGroupBuy: false, isSoldOut: true },
  { id: 13, name: "프리지아 옐로우", originalPrice: 42000, salePrice: 28000, discount: 33, category: "절화", isGroupBuy: false },
  { id: 14, name: "온시디움 브랜치", originalPrice: 48000, salePrice: 35000, discount: 27, category: "난", isGroupBuy: false },
  { id: 15, name: "행운목 미니", originalPrice: 25000, salePrice: 18000, discount: 28, category: "관엽", isGroupBuy: false },
  { id: 16, name: "거베라 믹스 30송이", originalPrice: 52000, salePrice: 35000, discount: 33, category: "절화", isGroupBuy: false, isSoldOut: true },
  { id: 17, name: "만천홍 레드", originalPrice: 88000, salePrice: 65000, discount: 26, category: "난", isGroupBuy: true, groupBuyProgress: { current: 12, total: 25 }, deadlineText: "마감 8시간 전", deadlineUrgent: true },
  { id: 18, name: "산세베리아 대형", originalPrice: 58000, salePrice: 42000, discount: 28, category: "관엽", isGroupBuy: false },
  { id: 19, name: "안개꽃 화이트 대형", originalPrice: 35000, salePrice: 22000, discount: 37, category: "절화", isGroupBuy: false },
  { id: 20, name: "파피오페딜럼", originalPrice: 78000, salePrice: 58000, discount: 26, category: "난", isGroupBuy: false, isSoldOut: true },
  { id: 21, name: "리시안셔스 화이트", originalPrice: 48000, salePrice: 32000, discount: 33, category: "절화", isGroupBuy: false },
  { id: 22, name: "동양란 선물세트", originalPrice: 150000, salePrice: 115000, discount: 23, category: "난", isGroupBuy: false },
  { id: 23, name: "피쿠스 벤자민", originalPrice: 55000, salePrice: 39000, discount: 29, category: "관엽", isGroupBuy: false, isSoldOut: true },
  { id: 24, name: "작약 핑크 20송이", originalPrice: 72000, salePrice: 48000, discount: 33, category: "절화", isGroupBuy: true, groupBuyProgress: { current: 28, total: 50 }, deadlineText: "마감 3월 24일", deadlineUrgent: false },
  { id: 25, name: "카틀레야 퍼플", originalPrice: 98000, salePrice: 75000, discount: 23, category: "난", isGroupBuy: false },
  { id: 26, name: "테이블야자 미니", originalPrice: 28000, salePrice: 19000, discount: 32, category: "관엽", isGroupBuy: false },
  { id: 27, name: "백합 화이트 믹스", originalPrice: 58000, salePrice: 42000, discount: 28, category: "절화", isGroupBuy: false, isSoldOut: true },
  { id: 28, name: "풍란 화이트", originalPrice: 65000, salePrice: 48000, discount: 26, category: "난", isGroupBuy: false },
  { id: 29, name: "고무나무 대형", originalPrice: 85000, salePrice: 62000, discount: 27, category: "관엽", isGroupBuy: true, groupBuyProgress: { current: 15, total: 35 }, deadlineText: "마감 12시간 전", deadlineUrgent: true },
  { id: 30, name: "유칼��투스 부케", originalPrice: 42000, salePrice: 28000, discount: 33, category: "절화", isGroupBuy: false },
]

export default function CategoryPage() {
  const [activeTab, setActiveTab] = useState("category")
  const [openCategories, setOpenCategories] = useState<Set<CategoryType>>(new Set())
  const { getCartCount, toggleWishlist, isInWishlist } = useStore()

  const handleCategoryToggle = (categoryId: CategoryType) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleColorClick = (category: CategoryType, color: ProductColor) => {
    const colorParam = color === "전체" ? "all" : color
    window.location.href = `/category/${category}/${colorParam}`
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="w-6" />
        <h1 className="text-lg font-bold text-foreground">카테고리</h1>
        <a href="/search" className="p-1">
          <Search className="h-6 w-6 text-foreground" />
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {/* Accordion List */}
        <div className="divide-y divide-border">
          {categories.map((category) => {
            const isOpen = openCategories.has(category.id)
            const Icon = category.icon
            
            return (
              <div key={category.id}>
                {/* Category Header Row */}
                <button
                  onClick={() => handleCategoryToggle(category.id)}
                  className="flex w-full items-center justify-between px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-base font-medium text-foreground">{category.name}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {/* Color Subcategories Grid */}
                {isOpen && (
                  <div className="bg-muted/30 px-4 pb-4">
                    <div className="grid grid-cols-4 gap-3">
                      {category.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorClick(category.id, color)}
                          className="flex flex-col items-center gap-2 py-2"
                        >
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full",
                              colorStyles[color].bg,
                              colorStyles[color].border
                            )}
                          />
                          <span className="text-xs text-muted-foreground">{color}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Popular Products Section */}
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between pb-3">
            <h3 className="flex items-center gap-1 text-base font-bold">
              지금 인기있는 꽃
            </h3>
            <button className="flex items-center text-sm text-muted-foreground">
              더보기 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          {/* 3 Cards in Single Row - No Scroll */}
          <div className="grid grid-cols-3 gap-2">
            {popularProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-xl bg-card shadow-sm"
              >
                <div className="relative aspect-square bg-muted">
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-destructive px-1.5 py-0.5 text-xs font-bold text-destructive-foreground">
                    {product.discount}%
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 p-2">
                  <span className="truncate text-xs font-medium text-foreground">{product.name}</span>
                  <span className="text-sm font-bold text-primary">
                    {product.price.toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Latest Products Section */}
        <section className="mt-6 px-4">
          <h3 className="pb-3 text-base font-bold">최신 상품</h3>
          
          {/* 2-Column Product Grid */}
          <div className="grid grid-cols-2 gap-3">
            {latestProducts.map((product) => (
              <div
                key={product.id}
                className={cn(
                  "overflow-hidden rounded-xl bg-card shadow-sm",
                  product.isSoldOut && "opacity-70"
                )}
              >
                <div className={cn(
                  "relative aspect-square bg-muted",
                  product.isSoldOut && "grayscale"
                )}>
                  {/* Category Badge */}
                  <span className={cn(
                    "absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium",
                    categoryColors[product.category]
                  )}>
                    {product.category}
                  </span>
                  {/* Group Buy Badge */}
                  {product.isGroupBuy && !product.isSoldOut && (
                    <span className="absolute right-2 top-2 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">
                      공동구매
                    </span>
                  )}
                  {/* Sold Out Badge */}
                  {product.isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded bg-gray-500/80 px-3 py-1.5 text-sm font-bold text-white">
                        판매종료
                      </span>
                    </div>
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
                    <span className={cn(
                      "text-sm font-bold",
                      product.isSoldOut ? "text-muted-foreground" : "text-destructive"
                    )}>{product.discount}%</span>
                    <span className={cn(
                      "text-sm font-bold",
                      product.isSoldOut ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {product.salePrice.toLocaleString()}원
                    </span>
                  </div>
                  {/* Original price strikethrough */}
                  <span className="text-xs text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                  
                  {/* Group Buy Info OR Empty Space for height consistency */}
                  {product.isGroupBuy && product.groupBuyProgress && !product.isSoldOut ? (
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
      </main>

      <BottomNav />
    </div>
  )
}

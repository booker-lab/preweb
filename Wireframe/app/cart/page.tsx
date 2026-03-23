"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Home, Grid3X3, ShoppingCart, User, Heart, ArrowLeft, X, Minus, Plus, ChevronRight, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { NAV_LABELS } from "@/lib/constants"
import { BottomNav } from "@/components/bottom-nav"

type ProductCategory = "절화" | "난" | "관엽"
interface Product {
  id: number; name: string; originalPrice: number; salePrice: number
  discount: number; category: ProductCategory; isGroupBuy: boolean
  groupBuyProgress?: { current: number; total: number }
  deadlineDate?: Date
}
interface CartItem { product: Product; quantity: number }

// Static deadline dates (to avoid hydration mismatch)
const deadlines = {
  fiveDays: new Date("2026-03-26T18:00:00"),
  threeDays: new Date("2026-03-24T18:00:00"),
  eighteenHours: new Date("2026-03-22T12:00:00"),
  twelveHours: new Date("2026-03-22T06:00:00"),
  eightHours: new Date("2026-03-22T02:00:00"),
}

// All products (shared across app - in production this would come from API)
const allProducts: Product[] = [
  { id: 1, name: "프리미엄 장미 꽃다발 레드", originalPrice: 75000, salePrice: 52000, discount: 31, category: "절화", isGroupBuy: false },
  { id: 2, name: "호접란 화이트 3대", originalPrice: 120000, salePrice: 89000, discount: 26, category: "난", isGroupBuy: false },
  { id: 3, name: "몬스테라 대형 화분", originalPrice: 65000, salePrice: 48000, discount: 26, category: "관엽", isGroupBuy: false },
  { id: 4, name: "카네이션 100송이 세트", originalPrice: 85000, salePrice: 45000, discount: 47, category: "절화", isGroupBuy: true, groupBuyProgress: { current: 18, total: 30 }, deadlineDate: deadlines.fiveDays },
  { id: 5, name: "심비디움 옐로우", originalPrice: 95000, salePrice: 72000, discount: 24, category: "난", isGroupBuy: false },
  { id: 6, name: "아레카야자 중형", originalPrice: 45000, salePrice: 32000, discount: 29, category: "관엽", isGroupBuy: false },
  { id: 7, name: "튤립 믹스 50송이", originalPrice: 68000, salePrice: 42000, discount: 38, category: "절화", isGroupBuy: false },
  { id: 8, name: "덴드로비움 핑크", originalPrice: 55000, salePrice: 39000, discount: 29, category: "난", isGroupBuy: false },
  { id: 9, name: "스투키 3종 세트", originalPrice: 38000, salePrice: 25000, discount: 34, category: "관엽", isGroupBuy: true, groupBuyProgress: { current: 22, total: 40 }, deadlineDate: deadlines.eighteenHours },
  { id: 10, name: "수국 블루 한 다발", originalPrice: 55000, salePrice: 38000, discount: 31, category: "절화", isGroupBuy: false },
  { id: 11, name: "호접란 핑크 5대", originalPrice: 180000, salePrice: 135000, discount: 25, category: "난", isGroupBuy: false },
  { id: 12, name: "금전수 대형", originalPrice: 72000, salePrice: 55000, discount: 24, category: "관엽", isGroupBuy: false },
]

// Popular recommendations
const popularProducts: Product[] = [
  { id: 21, name: "리시안셔스 화이트", originalPrice: 48000, salePrice: 32000, discount: 33, category: "절화", isGroupBuy: false },
  { id: 22, name: "동양란 선물세트", originalPrice: 150000, salePrice: 115000, discount: 23, category: "난", isGroupBuy: false },
  { id: 23, name: "피쿠스 벤자민", originalPrice: 55000, salePrice: 39000, discount: 29, category: "관엽", isGroupBuy: false },
]

// Static reference date for hydration consistency (March 21, 2026)
const referenceDate = new Date("2026-03-21T12:00:00")

// Helper to format deadline using static reference date
const formatDeadline = (deadlineDate: Date): { text: string; isUrgent: boolean } => {
  const diffMs = deadlineDate.getTime() - referenceDate.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHours < 24) {
    return { text: `마감 ${diffHours}시간 전`, isUrgent: true }
  }
  
  const month = deadlineDate.getMonth() + 1
  const day = deadlineDate.getDate()
  return { text: `마감 ${month}월 ${day}일`, isUrgent: false }
}

const categoryColors: Record<ProductCategory, string> = {
  "절화": "bg-primary text-primary-foreground",
  "난": "bg-purple-500 text-white",
  "관엽": "bg-teal-500 text-white",
}

// Mock cart data
const initialCart: CartItem[] = [
  { product: allProducts[0], quantity: 1 },
  { product: allProducts[1], quantity: 2 },
  { product: allProducts[6], quantity: 1 },
]

export default function CartPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"cart" | "wishlist">("cart")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [cart, setCart] = useState<CartItem[]>(initialCart)

  const { wishlist, toggleWishlist, isInWishlist } = useStore()

  // Get wishlist products
  const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id))

  const removeFromCart = (productId: number) =>
    setCart(prev => prev.filter(item => item.product.id !== productId))

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ))
  }

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cart.map(item => item.product.id))
    }
  }

  // Delete selected items
  const deleteSelected = () => {
    setCart(prev => prev.filter(item => !selectedItems.includes(item.product.id)))
    setSelectedItems([])
  }

  // Toggle individual item selection
  const toggleSelect = (productId: number) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter(id => id !== productId))
    } else {
      setSelectedItems([...selectedItems, productId])
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0)

  // Calculate selected total
  const selectedTotal = cart
    .filter(item => selectedItems.includes(item.product.id))
    .reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0)

  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center border-b border-border bg-background px-4 py-3">
        <a href="/" className="shrink-0 p-1">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </a>
        <h1 className="flex-1 text-center text-xl font-bold text-foreground">장바구니</h1>
        <div className="w-8" /> {/* Spacer for centering */}
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("cart")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-colors",
            activeTab === "cart"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground"
          )}
        >
          담은 상품 ({cart.length})
        </button>
        <button
          onClick={() => setActiveTab("wishlist")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-colors",
            activeTab === "wishlist"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground"
          )}
        >
          찜한 상품 ({wishlist.length})
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-40">
        {activeTab === "cart" ? (
          /* Cart Tab */
          cart.length > 0 ? (
            <div>
              {/* Select All / Delete */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <button 
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border",
                    selectedItems.length === cart.length ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {selectedItems.length === cart.length && (
                      <span className="text-xs text-primary-foreground">✓</span>
                    )}
                  </div>
                  전체선택
                </button>
                <button 
                  onClick={deleteSelected}
                  className="text-sm text-muted-foreground"
                  disabled={selectedItems.length === 0}
                >
                  선택삭제
                </button>
              </div>
              
              {/* Cart Items */}
              <div className="divide-y divide-border">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 px-4 py-4">
                    {/* Checkbox */}
                    <button 
                      onClick={() => toggleSelect(item.product.id)}
                      className="shrink-0"
                    >
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border",
                        selectedItems.includes(item.product.id) ? "border-primary bg-primary" : "border-muted-foreground"
                      )}>
                        {selectedItems.includes(item.product.id) && (
                          <span className="text-xs text-primary-foreground">✓</span>
                        )}
                      </div>
                    </button>
                    
                    {/* Product Image */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted" />
                    
                    {/* Product Info */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <span className="line-clamp-2 flex-1 text-sm font-medium text-foreground">
                          {item.product.name}
                        </span>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="shrink-0 p-0.5"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                      
                      <span className={cn(
                        "mt-1 w-fit rounded px-1.5 py-0.5 text-[10px] font-medium",
                        categoryColors[item.product.category]
                      )}>
                        {item.product.category}
                      </span>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-primary">
                            {item.product.salePrice.toLocaleString()}원
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {item.product.originalPrice.toLocaleString()}원
                          </span>
                        </div>
                        
                        {/* Quantity Control */}
                        <div className="flex items-center gap-2 rounded-lg border border-border">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5"
                          >
                            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <span className="w-6 text-center text-sm text-foreground">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5"
                          >
                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty Cart */
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-lg font-medium text-foreground">담은 상품이 없습니다</p>
              <a href="/" className="mt-2 text-sm font-medium text-primary">
                쇼핑하러 가기
              </a>
            </div>
          )
        ) : (
          /* Wishlist Tab */
          wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 p-4">
              {wishlistProducts.map((product) => {
                const deadline = product.deadlineDate ? formatDeadline(product.deadlineDate) : null
                
                return (
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
                      {/* Wishlist Icon - Filled Red */}
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute bottom-2 right-2 rounded-full bg-background/80 p-1.5 transition-colors hover:bg-background"
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 p-3">
                      <span className="line-clamp-2 h-10 text-sm font-medium text-foreground">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-destructive">{product.discount}%</span>
                        <span className="text-sm font-bold text-foreground">
                          {product.salePrice.toLocaleString()}원
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground line-through">
                        {product.originalPrice.toLocaleString()}원
                      </span>
                      
                      {product.isGroupBuy && product.groupBuyProgress ? (
                        <div className="mt-1 flex flex-col gap-1">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${(product.groupBuyProgress.current / product.groupBuyProgress.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {product.groupBuyProgress.current}/{product.groupBuyProgress.total}명
                          </span>
                          {deadline && (
                            <span className={cn(
                              "text-[10px]",
                              deadline.isUrgent ? "font-medium text-destructive" : "text-muted-foreground"
                            )}>
                              {deadline.text}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="mt-1 h-[42px]" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Empty Wishlist */
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-lg font-medium text-foreground">찜한 상품이 없습니다</p>
              <a href="/" className="mt-2 text-sm font-medium text-primary">
                상품 둘러보기
              </a>
            </div>
          )
        )}

        {/* Popular Products Recommendation */}
        <section className="mt-6 py-4">
          <div className="flex items-center justify-between px-4 pb-3">
            <h3 className="text-lg font-bold">지금 인기 있는 꽃</h3>
            <button className="flex items-center text-sm text-muted-foreground">
              더보기 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
            {popularProducts.map((product) => (
              <div
                key={product.id}
                className="w-32 shrink-0 overflow-hidden rounded-xl bg-card shadow-sm"
              >
                <div className="relative aspect-square bg-muted">
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
                <div className="flex flex-col gap-0.5 p-2">
                  <span className="truncate text-xs font-medium text-foreground">
                    {product.name}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {product.salePrice.toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Purchase Bar (only for cart tab with items) */}
      {activeTab === "cart" && cart.length > 0 && (
        <div className="fixed bottom-[72px] left-1/2 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-background px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">총 결제금액</span>
            <span className="text-lg font-bold text-foreground">
              {(selectedItems.length > 0 ? selectedTotal : cartTotal).toLocaleString()}원
            </span>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full rounded-xl bg-primary py-3.5 text-center font-bold text-primary-foreground"
          >
            구매하기 ({selectedItems.length > 0 ? selectedItems.length : cart.length})
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, BellOff, ShoppingCart } from "lucide-react"

interface WishProduct {
  id: number
  name: string
  discount: number
  price: number
  freeShipping: boolean
  emoji: string
}

const mockWishlist: WishProduct[] = [
  { id: 1, name: "프리미엄 장미 꽃다발 레드", discount: 31, price: 52000, freeShipping: true, emoji: "🌹" },
  { id: 2, name: "호접란 화이트 3대 세트", discount: 26, price: 89000, freeShipping: true, emoji: "🌸" },
  { id: 3, name: "수국 블루 한 다발", discount: 31, price: 38000, freeShipping: true, emoji: "💐" },
]

export default function WishlistPage() {
  const router = useRouter()

  // 와이어프레임: 빈 상태 / 상품 있는 상태 토글
  const [hasItems, setHasItems] = useState(true)
  const [wishlisted, setWishlisted] = useState<number[]>(mockWishlist.map((p) => p.id))

  const toggleHeart = (id: number) => {
    setWishlisted((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const visibleProducts = hasItems ? mockWishlist : []
  const fmt = (n: number) => n.toLocaleString("ko-KR")

  return (
    <div className="min-h-screen bg-muted/30 max-w-[390px] mx-auto relative">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-foreground">찜한 상품</h1>
          {/* 장바구니 아이콘 */}
          <button onClick={() => router.push("/cart")} className="p-1 relative">
            <ShoppingCart className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      <main className="pt-14 pb-6">
        {visibleProducts.length > 0 ? (
          <>
            {/* 총 개수 + 와이어프레임 토글 */}
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm text-muted-foreground">총 {visibleProducts.length}개</p>
              <button
                onClick={() => setHasItems(false)}
                className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5"
              >
                빈 상태 보기
              </button>
            </div>

            {/* 3열 그리드 */}
            <div className="grid grid-cols-3 gap-2 px-3">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-card rounded-xl overflow-hidden shadow-sm"
                >
                  {/* 이미지 영역 */}
                  <div className="relative aspect-square bg-accent flex items-center justify-center">
                    <span className="text-3xl">{product.emoji}</span>
                    {/* 하트 버튼 */}
                    <button
                      onClick={() => toggleHeart(product.id)}
                      className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-card/80 flex items-center justify-center shadow-sm"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          wishlisted.includes(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>

                  {/* 상품 정보 */}
                  <div className="p-2 space-y-1">
                    <p className="text-[11px] text-foreground font-medium line-clamp-2 leading-tight">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[11px] font-bold text-destructive">{product.discount}%</span>
                      <span className="text-[11px] font-bold text-foreground">{fmt(product.price)}원</span>
                    </div>
                    {product.freeShipping && (
                      <span className="inline-block text-[10px] text-muted-foreground border border-border rounded px-1 py-0.5">
                        무료배송
                      </span>
                    )}
                    {/* 장바구니 담기 버튼 */}
                    <button
                      onClick={() => router.push("/cart")}
                      className="w-full mt-1 h-7 rounded-lg border border-border text-[11px] font-medium text-foreground hover:bg-muted/50 transition-colors"
                    >
                      장바구니 담기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center gap-3">
            {/* 아이콘 */}
            <div className="relative w-16 h-16 mb-2">
              <BellOff className="w-16 h-16 text-muted-foreground/30" />
              <Heart className="w-7 h-7 fill-muted-foreground/30 text-muted-foreground/30 absolute -bottom-1 -right-1" />
            </div>
            <p className="text-base font-bold text-foreground">찜한 상품이 없습니다.</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              찜한 상품의 특가 할인이 시작되면<br />알림을 보내드려요
            </p>
            <button
              onClick={() => {
                setHasItems(true)
                setWishlisted(mockWishlist.map((p) => p.id))
              }}
              className="mt-2 h-11 px-8 bg-primary rounded-xl text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              베스트 상품 보기
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

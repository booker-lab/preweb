"use client"

import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { EventBanner } from "@/components/event-banner"
import { SectionHeader } from "@/components/section-header"
import { BottomNav } from "@/components/bottom-nav"

const ProductCard = dynamic(
  () => import("@/components/product-card").then((mod) => ({ default: mod.ProductCard })),
  { ssr: false }
)

const BestProductCard = dynamic(
  () => import("@/components/best-product-card").then((mod) => ({ default: mod.BestProductCard })),
  { ssr: false }
)

// 시세 급변동 상품
const priceChangeProducts = [
  {
    id: 1,
    name: "장미 50송이 프리미엄",
    category: "장미",
    originalPrice: 89000,
    salePrice: 59000,
    discount: 34,
  },
  {
    id: 2,
    name: "튤립 30송이 봄 에디션",
    category: "튤립",
    originalPrice: 65000,
    salePrice: 45000,
    discount: 31,
  },
  {
    id: 3,
    name: "수국 한 다발 블루밍",
    category: "수국",
    originalPrice: 55000,
    salePrice: 39000,
    discount: 29,
  },
]

// 공동구매 상품
const groupBuyProducts = [
  {
    id: 1,
    name: "프리미엄 작약 100송이 공동구매",
    category: "작약",
    originalPrice: 150000,
    salePrice: 89000,
    discount: 41,
    isGroupBuy: true,
    groupBuyProgress: { current: 18, total: 30 },
    deadline: "마감 1일 12시간",
  },
  {
    id: 2,
    name: "네덜란드 직수입 튤립 특가",
    category: "튤립",
    originalPrice: 120000,
    salePrice: 75000,
    discount: 38,
    isGroupBuy: true,
    groupBuyProgress: { current: 24, total: 30 },
    deadline: "마감 6시간",
  },
]

// 베스트 상품
const bestProducts = [
  {
    id: 1,
    name: "프리지아 꽃다발 시그니처",
    price: 42000,
    rating: 4.9,
    reviewCount: 2847,
  },
  {
    id: 2,
    name: "카네이션 바구니 스페셜",
    price: 58000,
    rating: 4.8,
    reviewCount: 1923,
  },
  {
    id: 3,
    name: "해바라기 믹스 부케",
    price: 35000,
    rating: 4.7,
    reviewCount: 1456,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background max-w-[390px] mx-auto relative">
      <Header />

      <main className="pb-24">
        {/* Event Banner */}
        <section className="py-4">
          <EventBanner />
        </section>

        {/* 오늘의 시세 급변동 */}
        <section className="py-4">
          <SectionHeader emoji="🌸" title="오늘의 시세 급변동" showMore />
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {priceChangeProducts.map((product) => (
              <div key={product.id} className="w-[140px] flex-shrink-0">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  originalPrice={product.originalPrice}
                  salePrice={product.salePrice}
                  discount={product.discount}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 공동구매 진행 중 */}
        <section className="py-4">
          <SectionHeader emoji="👥" title="공동구매 진행 중" showMore />
          <div className="grid grid-cols-2 gap-3 px-4">
            {groupBuyProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                category={product.category}
                originalPrice={product.originalPrice}
                salePrice={product.salePrice}
                discount={product.discount}
                isGroupBuy={product.isGroupBuy}
                groupBuyProgress={product.groupBuyProgress}
                deadline={product.deadline}
              />
            ))}
          </div>
        </section>

        {/* 오늘의 베스트 */}
        <section className="py-4">
          <SectionHeader emoji="🏆" title="오늘의 베스트" showMore />
          <div className="flex flex-col gap-3 px-4">
            {bestProducts.map((product, index) => (
              <BestProductCard
                key={product.id}
                id={product.id}
                rank={index + 1}
                name={product.name}
                price={product.price}
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

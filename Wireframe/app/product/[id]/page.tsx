"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft,
  Home,
  ShoppingCart,
  Share2,
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Truck,
  Calendar,
  CreditCard,
  MapPin,
  Package,
} from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { ProductOptionSheet } from "@/components/product-option-sheet"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

interface ProductData {
  id: string
  name: string
  category: string
  seller: string
  originalPrice: number
  salePrice: number
  discount: number
  rating: number
  reviewCount: number
  images: string[]
  description: string
  sourcingInfo: string
  producerInfo: string
  saleType: "normal" | "group"
}

const mockProduct: ProductData = {
  id: "1",
  name: "프리미엄 호접란 3대 세트 - 화이트 에디션",
  category: "난",
  seller: "디어 오키드",
  originalPrice: 75000,
  salePrice: 52000,
  discount: 31,
  rating: 4.9,
  reviewCount: 2341,
  images: ["/placeholder-orchid.jpg", "/placeholder-orchid-2.jpg", "/placeholder-orchid-3.jpg"],
  description:
    "고급스러운 화이트 호접란 3대 세트입니다. 각 화분은 엄선된 최상급 호접란으로 구성되어 있으며, 개업 선물이나 승진 축하 선물로 인기가 높습니다. 약 2-3개월간 아름다운 꽃을 감상하실 수 있습니다.",
  sourcingInfo: "가장 신선한 상품을 선별하여 지정하신 날짜에 배송합니다",
  producerInfo: "충남 서산시 소재 30년 전통 난 농장에서 직접 재배한 최상급 호접란입니다.",
  saleType: "normal",
}

const relatedProducts = [
  {
    id: 2,
    name: "미니 호접란 화이트",
    originalPrice: 35000,
    salePrice: 28000,
    discount: 20,
    category: "난",
  },
  {
    id: 3,
    name: "장미 꽃다발 20송이",
    originalPrice: 45000,
    salePrice: 38000,
    discount: 15,
    category: "절화",
    isGroupBuy: true,
    groupBuyProgress: { current: 12, total: 20 },
    deadline: "D-3",
  },
  {
    id: 4,
    name: "몬스테라 대형",
    originalPrice: 55000,
    salePrice: 45000,
    discount: 18,
    category: "관엽",
  },
  {
    id: 5,
    name: "수국 믹스 꽃다발",
    originalPrice: 42000,
    salePrice: 35000,
    discount: 17,
    category: "절화",
  },
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info")
  const [scrolledPastImages, setScrolledPastImages] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  const product = mockProduct

  useEffect(() => {
    const handleScroll = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect()
        setScrolledPastImages(rect.bottom < 56)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const formatPrice = (price: number) => price.toLocaleString("ko-KR")

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          url: window.location.href,
        })
      } catch {
        // User cancelled or permission denied - ignore silently
      }
    }
  }

  const handleAddToCart = (quantity: number) => {
    // TODO: Implement add to cart logic
    setIsSheetOpen(false)
    alert(`장바구니에 ${quantity}개 상품이 추가되었습니다.`)
  }

  const handleBuyNow = (quantity: number) => {
    // TODO: Implement buy now logic
    setIsSheetOpen(false)
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-background max-w-[390px] mx-auto relative pb-24">
      {/* Fixed Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-sm font-medium text-foreground truncate max-w-[180px]">
            {scrolledPastImages ? product.name : "상품 상세"}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/")} className="p-1">
              <Home className="w-5 h-5 text-foreground" />
            </button>
            <button className="p-1 relative">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </button>
            <button onClick={handleShare} className="p-1">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-14">
        {/* Image Carousel */}
        <div ref={imageRef} className="relative w-full h-80 bg-muted">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-muted">
            <span className="text-8xl">🌸</span>
          </div>
          {/* Category Badge */}
          <span className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded-full">
            {product.category}
          </span>
          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-primary" : "bg-card/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button className="flex items-center gap-1 text-muted-foreground text-sm">
            <span>🌿</span>
            <span>{product.seller}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={handleShare}>
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Product Info */}
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold text-foreground line-clamp-2 mb-2">
            {product.name}
          </h2>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-foreground font-medium">
              {product.rating}
            </span>
            <button className="text-sm text-primary">
              ({formatPrice(product.reviewCount)}개 후기 보기)
            </button>
          </div>
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-destructive font-bold text-lg">
              {product.discount}%
            </span>
            <span className="text-muted-foreground line-through text-sm">
              {formatPrice(product.originalPrice)}원
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {formatPrice(product.salePrice)}원
          </div>
        </div>

        {/* Delivery Info - Always Visible */}
        <div className="mx-4 mb-4 bg-muted rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">배송 안내</h3>
          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">직배송:</span> 서울/경기 일부 지역 당일 배송 가능
              </p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">거점픽업:</span> 지정 거점에서 직접 수령
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">택배:</span> 전국 배송 (도서산간 제외)
              </p>
            </div>
          </div>
          <p className="text-sm text-primary font-medium">
            배송 희망일을 선택해주시면 해당 날짜에 맞춰 신선하게 배송해드립니다
          </p>
        </div>

        {/* Delivery Details */}
        <div className="mx-4 mb-4 bg-muted rounded-xl p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">배송 예정일</p>
                <p className="text-sm text-muted-foreground">선택하신 날짜에 배송</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">배송 수단</p>
                <p className="text-sm text-muted-foreground">주소 입력 후 자동 결정</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">배송비</p>
                <p className="text-sm text-muted-foreground">수단별 자동 계산</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-14 bg-card border-b border-border z-30">
          <div className="flex">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-3 text-sm font-medium relative ${
                activeTab === "info" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              상품 정보
              {activeTab === "info" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 py-3 text-sm font-medium relative ${
                activeTab === "reviews" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              후기 93개
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "info" ? (
          <div className="px-4 py-4">
            {/* Description */}
            <div className="mb-4">
              <p
                className={`text-sm text-muted-foreground leading-relaxed ${
                  !showFullDescription ? "line-clamp-3" : ""
                }`}
              >
                {product.description}
              </p>
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="flex items-center gap-1 text-primary text-sm font-medium mt-2"
              >
                {showFullDescription ? (
                  <>
                    접기 <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    상품정보 더보기 <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Sourcing Info */}
            <div className="bg-accent/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-foreground font-medium mb-1">소싱 정보</p>
              <p className="text-sm text-muted-foreground">{product.sourcingInfo}</p>
            </div>

            {/* Producer Info */}
            <div className="mb-6">
              <p className="text-sm text-foreground font-medium mb-1">생산자 정보</p>
              <p className="text-sm text-muted-foreground">{product.producerInfo}</p>
            </div>

            {/* Accordion Sections */}
            <Accordion type="single" collapsible className="mb-6">
              <AccordionItem value="exchange">
                <AccordionTrigger className="text-sm font-medium">
                  교환 / 반품 안내
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>신선 상품 특성상 단순 변심에 의한 교환/반품은 불가합니다.</p>
                    <p>상품 하자 시 수령 후 24시간 내 문의해주세요.</p>
                    <p>사진과 함께 문의주시면 빠르게 처리해드립니다.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sourcing">
                <AccordionTrigger className="text-sm font-medium">
                  소싱 프로세스 안내
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>1. 산지 직소싱:</strong> 전국 우수 농가에서 직접 소싱</p>
                    <p><strong>2. 당일 출하:</strong> 주문 확인 후 당일 출하</p>
                    <p><strong>3. 신선 배송:</strong> 최적의 온도로 안전하게 배송</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Customer Inquiry */}
            <div className="border border-border rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">채팅 문의하기</span>
                </div>
                <button className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium">
                  문의하기
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                상품/배송/기타 궁금하신 내용을 문의하세요
              </p>
            </div>

            {/* Related Products */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground mb-4">최신 상품</h3>
              <div className="grid grid-cols-2 gap-3">
                {relatedProducts.map((item) => (
                  <ProductCard key={item.id} {...item} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-muted-foreground">후기 탭 내용은 추후 구현됩니다.</p>
          </div>
        )}
      </main>

      {/* Bottom Bar - Normal Sale */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card border-t border-border z-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLiked(!liked)}
            className="w-12 h-12 flex items-center justify-center border border-border rounded-xl"
          >
            <Heart
              className={`w-6 h-6 ${
                liked ? "fill-destructive text-destructive" : "text-muted-foreground"
              }`}
            />
          </button>
          <button 
            onClick={() => setIsSheetOpen(true)}
            className="w-12 h-12 flex items-center justify-center border border-border rounded-xl"
          >
            <ShoppingCart className="w-6 h-6 text-muted-foreground" />
          </button>
          <button 
            onClick={() => setIsSheetOpen(true)}
            className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-bold text-base"
          >
            구매하기
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* Product Option Sheet */}
      <ProductOptionSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        productName={product.name}
        price={product.salePrice}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </div>
  )
}

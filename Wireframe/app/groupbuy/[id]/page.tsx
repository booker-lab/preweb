"use client"

import { use, useState } from "react"
import { ArrowLeft, Share2, MoreVertical, Heart, Calendar, Truck, Coins, ThumbsUp, MessageCircle, ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GroupBuyOptionSheet } from "@/components/group-buy-option-sheet"

// Group buy data
const groupBuyData: Record<string, {
  id: number
  name: string
  originalPrice: number
  salePrice: number
  discount: number
  deadlineText: string
  daysLeft: number
  deliveryDate: string
  deliveryMethod: string
  deliveryFee: string
  description: string
  current: number
  total: number
  likes: number
  comments: number
  interests: number
  views: number
  status: "active" | "ended"
}> = {
  "1": {
    id: 1,
    name: "프리미엄 장미 100송이",
    originalPrice: 89000,
    salePrice: 52000,
    discount: 42,
    deadlineText: "3월 28일",
    daysLeft: 7,
    deliveryDate: "4월 5일 (토)",
    deliveryMethod: "꽃차 직배송 (서울/경기) / 택배 (기타)",
    deliveryFee: "1,500원 (일반 대비 50% 할인)",
    description: "최상급 에콰도르산 장미 100송이를 공동구매 특가로 만나보세요. 신선도 유지를 위해 냉장 꽃차로 직배송됩니다. 결혼식, 프로포즈, 기념일 선물로 최고의 선택입니다.",
    current: 18,
    total: 30,
    likes: 4,
    comments: 2,
    interests: 0,
    views: 128,
    status: "active",
  },
  "2": {
    id: 2,
    name: "카네이션 대형 세트",
    originalPrice: 75000,
    salePrice: 45000,
    discount: 40,
    deadlineText: "3월 30일",
    daysLeft: 9,
    deliveryDate: "4월 8일 (수)",
    deliveryMethod: "꽃차 직배송 (서울/경기) / 택배 (기타)",
    deliveryFee: "2,000원 (일반 대비 40% 할인)",
    description: "어버이날을 앞두고 카네이션 대형 세트를 특가로 준비했습니다. 빨강, 분홍 믹스 구성으로 정성 가득한 선물이 됩니다.",
    current: 25,
    total: 40,
    likes: 8,
    comments: 5,
    interests: 3,
    views: 256,
    status: "active",
  },
  "3": {
    id: 3,
    name: "호접란 3대 세트",
    originalPrice: 150000,
    salePrice: 98000,
    discount: 35,
    deadlineText: "4월 2일",
    daysLeft: 12,
    deliveryDate: "4월 10일 (목)",
    deliveryMethod: "전문 배송 (전국)",
    deliveryFee: "무료배송",
    description: "고급 호접란 3대 세트입니다. 개업, 승진 축하 선물로 인기 있는 상품을 공동구매 특가로 제공합니다.",
    current: 12,
    total: 25,
    likes: 2,
    comments: 1,
    interests: 1,
    views: 89,
    status: "active",
  },
  "101": {
    id: 101,
    name: "튤립 믹스 50송이",
    originalPrice: 68000,
    salePrice: 42000,
    discount: 38,
    deadlineText: "3월 15일",
    daysLeft: 0,
    deliveryDate: "3월 22일 (토)",
    deliveryMethod: "꽃차 직배송 (서울/경기) / 택배 (기타)",
    deliveryFee: "1,500원",
    description: "네덜란드산 프리미엄 튤립 50송이입니다. 다양한 컬러 믹스로 화사한 봄을 선물하세요.",
    current: 30,
    total: 30,
    likes: 12,
    comments: 8,
    interests: 5,
    views: 420,
    status: "ended",
  },
  "102": {
    id: 102,
    name: "수국 블루 한 다발",
    originalPrice: 55000,
    salePrice: 38000,
    discount: 31,
    deadlineText: "3월 10일",
    daysLeft: 0,
    deliveryDate: "3월 17일 (일)",
    deliveryMethod: "꽃차 직배송 (서울/경기)",
    deliveryFee: "2,000원",
    description: "청초한 블루 수국 한 다발입니다. 인테리어 소품으로도 좋고 선물용으로도 인기 만점입니다.",
    current: 40,
    total: 40,
    likes: 15,
    comments: 10,
    interests: 8,
    views: 512,
    status: "ended",
  },
  "103": {
    id: 103,
    name: "백합 화이트 믹스",
    originalPrice: 58000,
    salePrice: 42000,
    discount: 28,
    deadlineText: "3월 5일",
    daysLeft: 0,
    deliveryDate: "3월 12일 (수)",
    deliveryMethod: "택배 (전국)",
    deliveryFee: "2,500원",
    description: "순백의 백합 믹스 꽃다발입니다. 향기로운 백합으로 특별한 날을 더욱 빛내보세요.",
    current: 20,
    total: 20,
    likes: 6,
    comments: 3,
    interests: 2,
    views: 198,
    status: "ended",
  },
}

// Avatar placeholders
const avatars = Array(6).fill(null)

export default function GroupBuyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { toggleWishlist, isInWishlist } = useStore()
  
  const item = groupBuyData[id] || groupBuyData["1"]
  const isEnded = item.status === "ended"
  const remaining = item.total - item.current
  const progressPercent = (item.current / item.total) * 100

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          url: window.location.href,
        })
      } catch {
        // User cancelled or permission denied - ignore silently
      }
    }
  }

  const handleParticipate = () => {
    setIsSheetOpen(false)
    router.push("/checkout/group")
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <Link href="/groupbuy" className="p-1">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </Link>
        <h1 className="max-w-[200px] truncate text-base font-medium text-foreground">{item.name}</h1>
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1">
            <Home className="h-5 w-5 text-foreground" />
          </Link>
          <button onClick={handleShare} className="p-1">
            <Share2 className="h-5 w-5 text-foreground" />
          </button>
          <button className="p-1">
            <MoreVertical className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24">
        {/* Product Image */}
        <div className={cn(
          "relative h-60 w-full bg-muted",
          isEnded && "grayscale"
        )}>
          {isEnded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="rounded-lg bg-muted-foreground/80 px-4 py-2 text-lg font-bold text-white">
                모집 종료
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Status Badge + Name */}
          <div className="flex items-start gap-2">
            <span className={cn(
              "shrink-0 rounded px-2 py-0.5 text-xs font-medium",
              isEnded 
                ? "bg-muted text-muted-foreground" 
                : "bg-orange-100 text-orange-600"
            )}>
              {isEnded ? "종료" : "모집중"}
            </span>
            <h2 className="text-lg font-bold text-foreground">{item.name}</h2>
          </div>

          {/* Price Row */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {item.originalPrice.toLocaleString()}원
            </span>
            <span className="text-xl font-bold text-primary">
              {item.salePrice.toLocaleString()}원
            </span>
            <span className="rounded bg-destructive px-1.5 py-0.5 text-xs font-bold text-destructive-foreground">
              {item.discount}%
            </span>
          </div>

          <div className="my-4 h-px bg-border" />

          {/* Delivery Info */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">배송 예정일: </span>
                <span className="text-foreground">{item.deliveryDate}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">배송 방법: </span>
                <span className="text-foreground">{item.deliveryMethod}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Coins className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">배송비: </span>
                <span className="text-foreground">{item.deliveryFee}</span>
              </div>
            </div>
          </div>

          <div className="my-4 h-px bg-border" />

          {/* Description */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              목표 미달 시 자동환불
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              즉시결제
            </span>
          </div>

          <div className="my-4 h-px bg-border" />

          {/* Reactions Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-muted-foreground">
                <ThumbsUp className="h-4 w-4" /> {item.likes}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" /> {item.comments}
              </span>
              <button onClick={handleShare} className="flex items-center gap-1 text-muted-foreground">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              관심 {item.interests} · 조회 {item.views}
            </span>
          </div>

          <div className="my-4 h-px bg-border" />

          {/* Participants Section */}
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                참여중인 이웃 <span className={cn(isEnded ? "text-muted-foreground" : "text-primary")}>{item.current}/{item.total}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            
            {/* Avatar Row */}
            <div className="flex items-center gap-2">
              {avatars.map((_, i) => (
                <div key={i} className="h-10 w-10 rounded-full bg-muted" />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isEnded ? "bg-muted-foreground/40" : "bg-primary"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className={cn(
                "text-sm",
                isEnded ? "text-muted-foreground" : "text-foreground"
              )}>
                {isEnded 
                  ? "모집 종료" 
                  : `${item.current}/${item.total}명 참여중, 목표까지 ${remaining}명 남았어요!`
                }
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Bar (fixed) */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-background">
        <div className="flex items-center gap-3 p-4">
          {/* Wishlist Button */}
          <button 
            onClick={() => toggleWishlist(item.id)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border"
          >
            <Heart className={cn(
              "h-6 w-6",
              isInWishlist(item.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
            )} />
          </button>
          
          {/* CTA Button */}
          {isEnded ? (
            <button 
              disabled
              className="flex flex-1 flex-col items-center justify-center rounded-lg bg-muted py-3"
            >
              <span className="font-medium text-muted-foreground">공동구매 종료</span>
              <span className="text-xs text-muted-foreground/70">해당 공동구매가 종료되었습니다</span>
            </button>
          ) : (
            <button 
              onClick={() => setIsSheetOpen(true)}
              className="flex flex-1 flex-col items-center justify-center rounded-lg bg-primary py-3"
            >
              <span className="font-medium text-primary-foreground">공동구매 참여하기</span>
              <span className="text-xs text-primary-foreground/80">
                {item.salePrice.toLocaleString()}원 · 마감 D-{item.daysLeft}
              </span>
            </button>
          )}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* Group Buy Option Sheet */}
      {!isEnded && (
        <GroupBuyOptionSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          productName={item.name}
          price={item.salePrice}
          deliveryDate={item.deliveryDate}
          deliveryMethod={item.deliveryMethod}
          deliveryFee={item.deliveryFee}
          currentParticipants={item.current}
          totalParticipants={item.total}
          daysLeft={item.daysLeft}
          onParticipate={handleParticipate}
        />
      )}
    </div>
  )
}

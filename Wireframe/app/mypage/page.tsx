"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  User,
  Package,
  Heart,
  MapPin,
  Star,
  LogOut,
  MessageCircle,
  Phone,
  HelpCircle,
  Users,
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

// Mock user data
const mockUser = {
  name: "홍길동",
  phone: "010-1234-5678",
}

// Mock order status counts (일반 주문)
const orderStatusCounts = {
  confirmed: 1,
  preparing: 0,
  inTransit: 2,
  delivered: 5,
}

// Mock group buy status counts (공동구매)
const groupBuyStatusCounts = {
  recruiting: 2,
  confirmed: 1,
  delivering: 1,
  completed: 3,
}

// Mock recent order
const recentOrder = {
  id: "ORD20240323001",
  status: "DELIVERING",
  statusLabel: "배송 중",
  statusColor: "bg-blue-100 text-blue-700",
  name: "프리미엄 호접란 3대 세트 - 화이트 에디션",
  option: "화이트 / 대형",
  quantity: 1,
  price: 52000,
}

const orderSteps = [
  { key: "confirmed",  label: "결제 완료",    count: orderStatusCounts.confirmed },
  { key: "preparing",  label: "상품 준비 중", count: orderStatusCounts.preparing },
  { key: "inTransit",  label: "배송 중",      count: orderStatusCounts.inTransit },
  { key: "delivered",  label: "배송 완료",    count: orderStatusCounts.delivered },
]

const groupBuySteps = [
  { key: "recruiting",  label: "모집 중",   count: groupBuyStatusCounts.recruiting },
  { key: "confirmed",   label: "주문 확정", count: groupBuyStatusCounts.confirmed },
  { key: "delivering",  label: "배송 중",   count: groupBuyStatusCounts.delivering },
  { key: "completed",   label: "완료",      count: groupBuyStatusCounts.completed },
]

const menuItems = [
  { label: "주문 내역",   icon: Package, href: "/mypage/orders" },
  { label: "찜 목록",    icon: Heart,   href: "/mypage/wishlist" },
  { label: "배송지 관리", icon: MapPin,  href: "/mypage/addresses" },
  { label: "후기",       icon: Star,    href: "/mypage/reviews" },
]

const supportItems = [
  { label: "채팅 문의하기", icon: MessageCircle, sub: "평일 09:30 ~ 17:00" },
  { label: "전화 문의하기", icon: Phone,         sub: "평일 09:30 ~ 17:30" },
  { label: "자주 묻는 질문", icon: HelpCircle,   sub: "" },
]

export default function MyPage() {
  const router = useRouter()
  // 와이어프레임용 로그인 상태 토글
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const fmt = (n: number) => n.toLocaleString("ko-KR")

  return (
    <div className="min-h-screen bg-muted/30 max-w-[390px] mx-auto relative pb-16">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-base font-bold text-foreground">마이페이지</h1>
          {/* 와이어프레임 토글 */}
          <button
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className="absolute right-4 text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5"
          >
            {isLoggedIn ? "로그아웃 상태" : "로그인 상태"}
          </button>
        </div>
      </header>

      <main className="pt-14 space-y-2">
        {isLoggedIn ? (
          <>
            {/* 프로필 */}
            <section className="bg-card px-4 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-foreground">{mockUser.name}</p>
                  <p className="text-sm text-muted-foreground">{mockUser.phone}</p>
                </div>
                <button
                  onClick={() => router.push("/mypage/profile")}
                  className="flex items-center gap-0.5 text-xs text-muted-foreground"
                >
                  <span>정보 수정</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* 주문 현황 4칸 */}
            <section className="bg-card px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-foreground">주문 현황</h2>
                <button
                  onClick={() => router.push("/mypage/orders")}
                  className="flex items-center gap-0.5 text-xs text-primary"
                >
                  <span>전체 보기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 divide-x divide-border">
                {orderSteps.map((step) => (
                  <button
                    key={step.key}
                    onClick={() => router.push("/mypage/orders")}
                    className="flex flex-col items-center py-2 gap-1 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <span className={`text-xl font-bold ${step.count > 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {step.count}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{step.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 공동구매 참여 현황 */}
            <section className="bg-card px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  공동구매 참여 현황
                </h2>
                <button
                  onClick={() => router.push("/mypage/orders?tab=groupbuy")}
                  className="flex items-center gap-0.5 text-xs text-primary"
                >
                  <span>전체 보기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 divide-x divide-border">
                {groupBuySteps.map((step) => (
                  <button
                    key={step.key}
                    onClick={() => router.push("/mypage/orders?tab=groupbuy")}
                    className="flex flex-col items-center py-2 gap-1 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <span className={`text-xl font-bold ${step.count > 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {step.count}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{step.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 최근 주문 */}
            <section className="bg-card px-4 py-4">
              <h2 className="text-sm font-bold text-foreground mb-3">최근 주문</h2>
              <div className="flex gap-3 mb-3">
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🌸</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${recentOrder.statusColor} inline-block mb-1`}>
                    {recentOrder.statusLabel}
                  </span>
                  <p className="text-sm font-medium text-foreground line-clamp-1">{recentOrder.name}</p>
                  <p className="text-xs text-muted-foreground">{recentOrder.option} / {recentOrder.quantity}개</p>
                  <p className="text-sm font-bold text-foreground">{fmt(recentOrder.price)}원</p>
                </div>
              </div>
              <button
                onClick={() => router.push("/mypage/orders")}
                className="w-full h-10 border border-border rounded-xl text-sm text-foreground font-medium hover:bg-muted/50 transition-colors"
              >
                주문 내역 모두 보기
              </button>
            </section>

            {/* 메뉴 리스트 */}
            <section className="bg-card">
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors ${
                    index < menuItems.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <item.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm text-foreground text-left">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </section>

            {/* 고객센터 */}
            <section className="bg-card">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-xs font-bold text-muted-foreground">고객센터</h2>
              </div>
              {supportItems.map((item, index) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors ${
                    index < supportItems.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <item.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm text-foreground text-left">{item.label}</span>
                  {item.sub && <span className="text-xs text-muted-foreground">{item.sub}</span>}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </section>

            {/* 로그아웃 */}
            <section className="bg-card">
              <button
                onClick={() => setIsLoggedIn(false)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors"
              >
                <LogOut className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 text-sm text-foreground text-left">로그아웃</span>
              </button>
            </section>
          </>
        ) : (
          <>
            {/* 로그인 전 — 유도 섹션 */}
            <section className="bg-card px-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-base font-bold text-foreground mb-1">로그인이 필요해요</p>
              <p className="text-sm text-muted-foreground mb-6">
                Green Hub 회원이라면<br />신선한 꽃을 더 편리하게!
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-[#FEE500] rounded-xl font-bold text-[#191919] flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                카카오로 3초 만에 시작하기
              </button>
              <button
                onClick={() => router.push("/login")}
                className="mt-3 text-sm text-muted-foreground underline underline-offset-2"
              >
                휴대폰 번호로 시작
              </button>
            </section>

            {/* 고객센터 (로그인 전에도 노출) */}
            <section className="bg-card">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-xs font-bold text-muted-foreground">고객센터</h2>
              </div>
              {supportItems.map((item, index) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors ${
                    index < supportItems.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <item.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm text-foreground text-left">{item.label}</span>
                  {item.sub && <span className="text-xs text-muted-foreground">{item.sub}</span>}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

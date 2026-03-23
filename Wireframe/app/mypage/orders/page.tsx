"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  Check,
  MapPin,
  Users,
  Clock,
} from "lucide-react"

// Order statuses — 설계 문서(IA) 확정 코드 기준
const orderStatuses = {
  // 내부 처리 상태 (소비자 미노출 — Portone webhook 수신 전)
  PENDING:    { label: "결제 처리 중", color: "bg-muted text-muted-foreground" },
  // 공동구매 전용
  RECRUITING: { label: "모집 중",    color: "bg-violet-100 text-violet-700" },
  CONFIRMED:  { label: "주문 확정",  color: "bg-primary/10 text-primary" },
  // 공통
  ACCEPTED:   { label: "결제 완료",  color: "bg-primary/10 text-primary" },
  PREPARING:  { label: "상품 준비 중", color: "bg-amber-100 text-amber-700" },
  DELIVERING: { label: "배송 중",    color: "bg-blue-100 text-blue-700" },
  // 거점 픽업 전용
  HUB_ARRIVED: { label: "거점 도착", color: "bg-amber-100 text-amber-700" },
  PICKED_UP:   { label: "픽업 완료", color: "bg-primary/10 text-primary" },
  // 직배송·택배
  DELIVERED:  { label: "배송 완료",  color: "bg-primary/10 text-primary" },
  // 공통
  REVIEWED:   { label: "구매 확정",  color: "bg-muted text-muted-foreground" },
  CANCELLED:  { label: "주문 취소",  color: "bg-destructive/10 text-destructive" },
}

type OrderStatus = keyof typeof orderStatuses

// 직배송·택배 진행 단계
const deliverySteps = [
  { key: "ACCEPTED",   label: "결제 완료" },
  { key: "PREPARING",  label: "상품 준비 중" },
  { key: "DELIVERING", label: "배송 중" },
  { key: "DELIVERED",  label: "배송 완료" },
]

// 거점 픽업 진행 단계
const pickupDeliverySteps = [
  { key: "ACCEPTED",    label: "결제 완료" },
  { key: "PREPARING",   label: "상품 준비 중" },
  { key: "DELIVERING",  label: "배송 중" },
  { key: "HUB_ARRIVED", label: "거점 도착" },
  { key: "PICKED_UP",   label: "픽업 완료" },
]

// Mock orders data
const mockOrders = [
  {
    id: "ORD20240323001",
    date: "2024.03.23",
    status: "DELIVERING" as OrderStatus,
    deliveryType: "direct",
    expectedDate: "3월 25일",
    items: [
      {
        id: 1,
        name: "프리미엄 호접란 3대 세트 - 화이트 에디션",
        option: "화이트 / 대형",
        quantity: 1,
        price: 52000,
      },
    ],
    total: 55000,
    canCancel: false,
  },
  {
    id: "ORD20240322001",
    date: "2024.03.22",
    status: "HUB_ARRIVED" as OrderStatus,
    deliveryType: "pickup",
    pickupCode: "123456",
    pickupLocation: "강남역 2번출구 픽업존",
    items: [
      {
        id: 2,
        name: "미니 호접란 화이트",
        option: "미니",
        quantity: 2,
        price: 28000,
      },
    ],
    total: 57000,
    canCancel: false,
  },
  {
    id: "ORD20240320001",
    date: "2024.03.20",
    status: "ACCEPTED" as OrderStatus,
    deliveryType: "courier",
    expectedDate: "3월 24일",
    items: [
      {
        id: 3,
        name: "장미 꽃다발 20송이",
        option: "레드",
        quantity: 1,
        price: 38000,
      },
    ],
    total: 42000,
    canCancel: true,
  },
  {
    id: "ORD20240318001",
    date: "2024.03.18",
    status: "DELIVERED" as OrderStatus,
    deliveryType: "direct",
    items: [
      {
        id: 4,
        name: "몬스테라 대형",
        option: "대형",
        quantity: 1,
        price: 45000,
      },
    ],
    total: 48000,
    canCancel: false,
  },
]

function getStepIndex(status: OrderStatus, isPickup: boolean): number {
  const steps = isPickup ? pickupDeliverySteps : deliverySteps
  const index = steps.findIndex(step => step.key === status)
  return index >= 0 ? index : 0
}

// ─── 공동구매 타입 & 데이터 ───────────────────────────────────────────

type GroupBuyStatus = "RECRUITING" | "CONFIRMED" | "PREPARING" | "DELIVERING" | "DELIVERED" | "CANCELLED"

const groupBuyStatuses: Record<GroupBuyStatus, { label: string; color: string }> = {
  RECRUITING: { label: "모집 중",   color: "bg-violet-100 text-violet-700" },
  CONFIRMED:  { label: "주문 확정", color: "bg-primary/10 text-primary" },
  PREPARING:  { label: "상품 준비 중", color: "bg-amber-100 text-amber-700" },
  DELIVERING: { label: "배송 중",   color: "bg-blue-100 text-blue-700" },
  DELIVERED:  { label: "배송 완료", color: "bg-primary/10 text-primary" },
  CANCELLED:  { label: "취소됨",   color: "bg-destructive/10 text-destructive" },
}

const groupBuySteps = [
  { key: "RECRUITING", label: "모집 중" },
  { key: "CONFIRMED",  label: "주문 확정" },
  { key: "PREPARING",  label: "상품 준비" },
  { key: "DELIVERING", label: "배송 중" },
  { key: "DELIVERED",  label: "배송 완료" },
]

const mockGroupOrders = [
  {
    id: "GRP20240325001",
    date: "2024.03.25",
    status: "RECRUITING" as GroupBuyStatus,
    name: "카네이션 100송이 세트",
    option: "핑크 / 대형",
    quantity: 1,
    price: 45000,
    progress: { current: 18, total: 30 },
    deadline: "3월 26일 마감",
    deliveryDate: "3월 30일",
    canCancel: true,
  },
  {
    id: "GRP20240322001",
    date: "2024.03.22",
    status: "CONFIRMED" as GroupBuyStatus,
    name: "스투키 3종 세트",
    option: "혼합",
    quantity: 1,
    price: 25000,
    progress: { current: 40, total: 40 },
    deadline: null,
    deliveryDate: "4월 2일",
    canCancel: false,
  },
  {
    id: "GRP20240318001",
    date: "2024.03.18",
    status: "DELIVERING" as GroupBuyStatus,
    name: "만천홍 레드",
    option: "레드",
    quantity: 1,
    price: 65000,
    progress: { current: 25, total: 25 },
    deadline: null,
    deliveryDate: "3월 22일",
    canCancel: false,
  },
  {
    id: "GRP20240310001",
    date: "2024.03.10",
    status: "DELIVERED" as GroupBuyStatus,
    name: "수국 블루 한 다발",
    option: "블루",
    quantity: 2,
    price: 38000,
    progress: { current: 50, total: 50 },
    deadline: null,
    deliveryDate: "3월 15일",
    canCancel: false,
  },
]

// ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"normal" | "groupbuy">("normal")

  useEffect(() => {
    if (searchParams.get("tab") === "groupbuy") setActiveTab("groupbuy")
  }, [searchParams])

  const formatPrice = (price: number) => price.toLocaleString("ko-KR")

  // Group orders by date
  const groupedOrders = mockOrders.reduce((acc, order) => {
    if (!acc[order.date]) {
      acc[order.date] = []
    }
    acc[order.date].push(order)
    return acc
  }, {} as Record<string, typeof mockOrders>)

  return (
    <div className="min-h-screen bg-background max-w-[390px] mx-auto relative pb-6">
      {/* Fixed Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-foreground pr-6">
            주문 내역
          </h1>
        </div>
        {/* 탭 */}
        <div className="flex border-t border-border">
          <button
            onClick={() => setActiveTab("normal")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "normal"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            일반 주문
          </button>
          <button
            onClick={() => setActiveTab("groupbuy")}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "groupbuy"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            공동구매
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="pt-[calc(3.5rem+2.5rem)] px-4 py-4 space-y-6">

        {/* ── 일반 주문 탭 ── */}
        {activeTab === "normal" && Object.entries(groupedOrders).map(([date, orders]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">{date}</h2>
              <button
                onClick={() => router.push(`/mypage/orders/${orders[0].id}`)}
                className="flex items-center gap-0.5 text-xs text-primary"
              >
                <span>주문 상세 보기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Order Cards */}
            <div className="space-y-3">
              {orders.map((order) => {
                const isPickup = order.deliveryType === "pickup"
                const steps = isPickup ? pickupDeliverySteps : deliverySteps
                const currentStepIndex = getStepIndex(order.status, isPickup)
                const statusInfo = orderStatuses[order.status]

                return (
                  <div key={order.id} className="bg-card rounded-2xl p-4 shadow-sm">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {order.expectedDate && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                        <span className="text-sm text-primary font-medium">
                          {order.expectedDate} 도착 예정
                        </span>
                      )}
                    </div>

                    {/* Pickup Code (for pickup orders) */}
                    {isPickup && order.status === "HUB_ARRIVED" && order.pickupCode && (
                      <div className="bg-primary/10 rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-xs text-muted-foreground">{order.pickupLocation}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">픽업 코드</span>
                          <span className="text-lg font-bold text-primary tracking-wider">{order.pickupCode}</span>
                        </div>
                      </div>
                    )}

                    {/* Product Info */}
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-3 mb-4">
                        <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🌸</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground mb-1">
                            {item.option} / {item.quantity}개
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {formatPrice(item.price)}원
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Delivery Progress */}
                    {order.status !== "CANCELLED" && order.status !== "RECRUITING" && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex
                            const isCurrent = index === currentStepIndex

                            return (
                              <div key={step.key} className="flex flex-col items-center flex-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                                  isCompleted
                                    ? "bg-primary"
                                    : "bg-muted"
                                }`}>
                                  {isCompleted ? (
                                    isCurrent && step.key === "DELIVERING" ? (
                                      <Truck className="w-3.5 h-3.5 text-primary-foreground" />
                                    ) : isCurrent && step.key === "HUB_ARRIVED" ? (
                                      <MapPin className="w-3.5 h-3.5 text-primary-foreground" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                                    )
                                  ) : (
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                  )}
                                </div>
                                <span className={`text-[10px] text-center ${
                                  isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        {/* Progress Line */}
                        <div className="relative h-0.5 bg-muted mx-3 -mt-[26px] mb-6">
                          <div
                            className="absolute h-full bg-primary transition-all"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 구매 확정 / 후기 작성 버튼 (DELIVERED 또는 PICKED_UP 상태) */}
                    {(order.status === "DELIVERED" || order.status === "PICKED_UP") && (
                      <div className="flex gap-2 mt-1">
                        <button className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                          구매 확정
                        </button>
                        <button
                          onClick={() => router.push("/mypage/reviews")}
                          className="flex-1 h-10 border border-primary text-primary rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors"
                        >
                          후기 작성
                        </button>
                      </div>
                    )}

                    {/* Cancel Button */}
                    {order.canCancel && (
                      <button
                        onClick={() => router.push(`/mypage/orders/cancel?orderId=${order.id}`)}
                        className="w-full h-10 border border-border text-muted-foreground rounded-xl text-sm font-medium hover:border-destructive hover:text-destructive transition-colors"
                      >
                        주문 취소하기
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* ── 공동구매 탭 ── */}
        {activeTab === "groupbuy" && (
          <div className="space-y-4">
            {mockGroupOrders.map((order) => {
              const statusInfo = groupBuyStatuses[order.status]
              const currentStepIndex = groupBuySteps.findIndex(s => s.key === order.status)
              const progressPercent = (order.progress.current / order.progress.total) * 100

              return (
                <div key={order.id} className="bg-card rounded-2xl p-4 shadow-sm">
                  {/* 상태 뱃지 + 날짜 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{order.date}</span>
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex gap-3 mb-3">
                    <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🌸</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1 mb-0.5">{order.name}</p>
                      <p className="text-xs text-muted-foreground mb-1">{order.option} / {order.quantity}개</p>
                      <p className="text-sm font-bold text-foreground">{formatPrice(order.price)}원</p>
                    </div>
                  </div>

                  {/* 모집 현황 (RECRUITING 상태) */}
                  {order.status === "RECRUITING" && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          <span className="text-primary font-bold">{order.progress.current}</span>/{order.progress.total}명 참여 중
                        </span>
                        {order.deadline && (
                          <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                            <Clock className="w-3 h-3" />
                            {order.deadline}
                          </span>
                        )}
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 배송 진행 바 (CONFIRMED 이후) */}
                  {order.status !== "RECRUITING" && order.status !== "CANCELLED" && (
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-1">
                        {groupBuySteps.map((step, index) => {
                          const isCompleted = index <= currentStepIndex
                          const isCurrent = index === currentStepIndex
                          return (
                            <div key={step.key} className="flex flex-col items-center flex-1">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 ${
                                isCompleted ? "bg-primary" : "bg-muted"
                              }`}>
                                {isCompleted ? (
                                  isCurrent && step.key === "DELIVERING"
                                    ? <Truck className="w-3 h-3 text-primary-foreground" />
                                    : <Check className="w-3 h-3 text-primary-foreground" />
                                ) : (
                                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                )}
                              </div>
                              <span className={`text-[9px] text-center leading-tight ${
                                isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="relative h-0.5 bg-muted mx-2 -mt-[22px] mb-5">
                        <div
                          className="absolute h-full bg-primary transition-all"
                          style={{ width: `${(currentStepIndex / (groupBuySteps.length - 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 배송 예정일 */}
                  {order.status !== "CANCELLED" && (
                    <p className="text-xs text-muted-foreground mb-3">
                      배송 예정일: <span className="text-foreground font-medium">{order.deliveryDate}</span>
                    </p>
                  )}

                  {/* 구매 확정 / 후기 버튼 */}
                  {order.status === "DELIVERED" && (
                    <div className="flex gap-2">
                      <button className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                        구매 확정
                      </button>
                      <button
                        onClick={() => router.push("/mypage/reviews")}
                        className="flex-1 h-10 border border-primary text-primary rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors"
                      >
                        후기 작성
                      </button>
                    </div>
                  )}

                  {/* 취소 버튼 (모집 중일 때만) */}
                  {order.canCancel && (
                    <button className="w-full h-10 border border-border text-muted-foreground rounded-xl text-sm font-medium hover:border-destructive hover:text-destructive transition-colors">
                      참여 취소하기
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

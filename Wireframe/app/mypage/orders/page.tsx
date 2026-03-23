"use client"

import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  Check,
  MapPin,
} from "lucide-react"

// Order statuses
const orderStatuses = {
  PENDING: { label: "결제대기", color: "bg-muted text-muted-foreground" },
  CONFIRMED: { label: "결제완료", color: "bg-primary/10 text-primary" },
  PREPARING: { label: "배송준비", color: "bg-amber-100 text-amber-700" },
  SHIPPED: { label: "배송시작", color: "bg-blue-100 text-blue-700" },
  IN_TRANSIT: { label: "배송중", color: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "배송완료", color: "bg-primary/10 text-primary" },
  PICKUP_READY: { label: "거점도착", color: "bg-amber-100 text-amber-700" },
  CANCELLED: { label: "취소완료", color: "bg-destructive/10 text-destructive" },
}

type OrderStatus = keyof typeof orderStatuses

// Delivery progress steps
const deliverySteps = [
  { key: "CONFIRMED", label: "결제완료" },
  { key: "PREPARING", label: "배송준비" },
  { key: "SHIPPED", label: "배송시작" },
  { key: "IN_TRANSIT", label: "배송중" },
  { key: "DELIVERED", label: "배송완료" },
]

// Pickup delivery steps (for 거점 픽업)
const pickupDeliverySteps = [
  { key: "CONFIRMED", label: "결제완료" },
  { key: "PREPARING", label: "배송준비" },
  { key: "SHIPPED", label: "배송시작" },
  { key: "PICKUP_READY", label: "거점도착" },
  { key: "DELIVERED", label: "수령완료" },
]

// Mock orders data
const mockOrders = [
  {
    id: "ORD20240323001",
    date: "2024.03.23",
    status: "IN_TRANSIT" as OrderStatus,
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
    status: "PICKUP_READY" as OrderStatus,
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
    status: "CONFIRMED" as OrderStatus,
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

export default function OrdersPage() {
  const router = useRouter()

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
      </header>

      {/* Content */}
      <main className="pt-14 px-4 py-4 space-y-6">
        {Object.entries(groupedOrders).map(([date, orders]) => (
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
                    {isPickup && order.status === "PICKUP_READY" && order.pickupCode && (
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
                    {order.status !== "CANCELLED" && order.status !== "PENDING" && (
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
                                    index === currentStepIndex && step.key === "IN_TRANSIT" ? (
                                      <Truck className="w-3.5 h-3.5 text-primary-foreground" />
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
      </main>
    </div>
  )
}

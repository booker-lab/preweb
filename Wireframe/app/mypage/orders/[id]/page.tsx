"use client"

import { useRouter, useParams } from "next/navigation"
import {
  ChevronLeft,
  Truck,
  Check,
  MapPin,
  Package,
} from "lucide-react"

// 주문 상태 — 설계 문서(IA) 확정 코드 기준
const orderStatuses = {
  // 내부 처리 상태 (소비자 미노출 — Portone webhook 수신 전)
  PENDING:     { label: "결제 처리 중", color: "bg-muted text-muted-foreground" },
  RECRUITING:  { label: "모집 중",     color: "bg-violet-100 text-violet-700" },
  CONFIRMED:   { label: "주문 확정",   color: "bg-primary/10 text-primary" },
  ACCEPTED:    { label: "결제 완료",   color: "bg-primary/10 text-primary" },
  PREPARING:   { label: "상품 준비 중", color: "bg-amber-100 text-amber-700" },
  DELIVERING:  { label: "배송 중",     color: "bg-blue-100 text-blue-700" },
  HUB_ARRIVED: { label: "거점 도착",   color: "bg-amber-100 text-amber-700" },
  PICKED_UP:   { label: "픽업 완료",   color: "bg-primary/10 text-primary" },
  DELIVERED:   { label: "배송 완료",   color: "bg-primary/10 text-primary" },
  REVIEWED:    { label: "구매 확정",   color: "bg-muted text-muted-foreground" },
  CANCELLED:   { label: "주문 취소",   color: "bg-destructive/10 text-destructive" },
}

type OrderStatus = keyof typeof orderStatuses

const deliverySteps = [
  { key: "ACCEPTED",   label: "결제 완료" },
  { key: "PREPARING",  label: "상품 준비 중" },
  { key: "DELIVERING", label: "배송 중" },
  { key: "DELIVERED",  label: "배송 완료" },
]

const pickupDeliverySteps = [
  { key: "ACCEPTED",    label: "결제 완료" },
  { key: "PREPARING",   label: "상품 준비 중" },
  { key: "DELIVERING",  label: "배송 중" },
  { key: "HUB_ARRIVED", label: "거점 도착" },
  { key: "PICKED_UP",   label: "픽업 완료" },
]

const mockOrders = [
  {
    id: "ORD20240323001",
    date: "2024.03.23 14:30",
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
    delivery: {
      name: "홍길동",
      phone: "010-1234-5678",
      address: "서울특별시 강남구 테헤란로 123 그린타워 1층",
      memo: "배송 전 연락바랍니다",
    },
    payment: {
      method: "신용/체크카드",
      productTotal: 52000,
      deliveryFee: 3000,
      total: 55000,
    },
    canCancel: false,
  },
  {
    id: "ORD20240322001",
    date: "2024.03.22 11:10",
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
    delivery: {
      name: "김영희",
      phone: "010-9876-5432",
      address: "거점 픽업 — 강남역 2번출구 픽업존",
      memo: "",
    },
    payment: {
      method: "카카오페이",
      productTotal: 56000,
      deliveryFee: 0,
      total: 56000,
    },
    canCancel: false,
  },
  {
    id: "ORD20240320001",
    date: "2024.03.20 09:45",
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
    delivery: {
      name: "이철수",
      phone: "010-5555-1234",
      address: "서울특별시 서초구 반포대로 200 반포아파트 101동 502호",
      memo: "문 앞에 놓아주세요",
    },
    payment: {
      method: "신용/체크카드",
      productTotal: 38000,
      deliveryFee: 4000,
      total: 42000,
    },
    canCancel: true,
  },
  {
    id: "ORD20240318001",
    date: "2024.03.18 16:20",
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
    delivery: {
      name: "홍길동",
      phone: "010-1234-5678",
      address: "서울특별시 강남구 테헤란로 123 그린타워 1층",
      memo: "",
    },
    payment: {
      method: "네이버페이",
      productTotal: 45000,
      deliveryFee: 3000,
      total: 48000,
    },
    canCancel: false,
  },
]

function getStepIndex(status: OrderStatus, isPickup: boolean): number {
  const steps = isPickup ? pickupDeliverySteps : deliverySteps
  const index = steps.findIndex((s) => s.key === status)
  return index >= 0 ? index : 0
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const order = mockOrders.find((o) => o.id === orderId) ?? mockOrders[0]

  const isPickup = order.deliveryType === "pickup"
  const steps = isPickup ? pickupDeliverySteps : deliverySteps
  const currentStepIndex = getStepIndex(order.status, isPickup)
  const statusInfo = orderStatuses[order.status]

  const fmt = (n: number) => n.toLocaleString("ko-KR")

  return (
    <div className="min-h-screen bg-background max-w-[390px] mx-auto relative pb-10">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-foreground pr-6">
            주문 상세 내역
          </h1>
        </div>
      </header>

      <main className="pt-14 space-y-2">

        {/* 주문 정보 */}
        <section className="bg-card px-4 py-4">
          <h2 className="text-sm font-bold text-foreground mb-3">주문 정보</h2>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">주문번호</span>
              <span className="font-medium text-foreground">{order.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">결제 일시</span>
              <span className="font-medium text-foreground">{order.date}</span>
            </div>
          </div>
        </section>

        {/* 상품 정보 */}
        <section className="bg-card px-4 py-4">
          <h2 className="text-sm font-bold text-foreground mb-3">상품 정보</h2>

          {/* 배송 상태 + 도착예정일 */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {"expectedDate" in order && order.expectedDate && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
              <span className="text-sm text-primary font-medium">
                {order.expectedDate} 도착 예정
              </span>
            )}
          </div>

          {/* 픽업 코드 */}
          {isPickup && order.status === "HUB_ARRIVED" && "pickupCode" in order && (
            <div className="bg-primary/10 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{"pickupLocation" in order ? order.pickupLocation : ""}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">픽업 코드</span>
                <span className="text-2xl font-bold text-primary tracking-widest">
                  {"pickupCode" in order ? order.pickupCode : ""}
                </span>
              </div>
            </div>
          )}

          {/* 상품 목록 */}
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 mb-4">
              <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🌸</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">{item.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{item.option} / {item.quantity}개</p>
                <p className="text-sm font-bold text-foreground">{fmt(item.price)}원</p>
              </div>
            </div>
          ))}

          {/* 배송 진행 바 */}
          {order.status !== "CANCELLED" && order.status !== "RECRUITING" && (
            <div className="mb-2">
              <div className="flex items-start justify-between mb-2">
                {steps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                        isCompleted ? "bg-primary" : "bg-muted"
                      }`}>
                        {isCompleted ? (
                          isCurrent && step.key === "DELIVERING" ? (
                            <Truck className="w-3.5 h-3.5 text-primary-foreground" />
                          ) : isCurrent && step.key === "HUB_ARRIVED" ? (
                            <Package className="w-3.5 h-3.5 text-primary-foreground" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          )
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      <span className={`text-[10px] text-center leading-tight ${
                        isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Progress line */}
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

          {/* 주문 취소 버튼 */}
          {order.canCancel && (
            <button
              onClick={() => router.push(`/mypage/orders/cancel?orderId=${order.id}`)}
              className="w-full h-10 border border-border text-muted-foreground rounded-xl text-sm font-medium hover:border-destructive hover:text-destructive transition-colors"
            >
              주문 취소하기
            </button>
          )}
        </section>

        {/* 배송 정보 */}
        <section className="bg-card px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">배송 정보</h2>
            {!isPickup && (
              <button className="text-xs text-primary">
                배송지 변경 &gt;
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">받는 분</span>
              <span className="font-medium text-foreground">{order.delivery.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">연락처</span>
              <span className="font-medium text-foreground">{order.delivery.phone}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-muted-foreground flex-shrink-0">주소</span>
              <span className="font-medium text-foreground text-right">{order.delivery.address}</span>
            </div>
            {order.delivery.memo && (
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground flex-shrink-0">배송 요청사항</span>
                <span className="font-medium text-foreground text-right">{order.delivery.memo}</span>
              </div>
            )}
          </div>
        </section>

        {/* 결제 정보 */}
        <section className="bg-card px-4 py-4">
          <h2 className="text-sm font-bold text-foreground mb-3">결제 정보</h2>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">총 상품금액</span>
              <span className="text-foreground">{fmt(order.payment.productTotal)}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">배송비</span>
              <span className="text-foreground">
                {order.payment.deliveryFee === 0 ? "무료" : `+${fmt(order.payment.deliveryFee)}원`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">결제수단</span>
              <span className="text-foreground">{order.payment.method}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-foreground">총 결제금액</span>
              <span className="text-primary">{fmt(order.payment.total)}원</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

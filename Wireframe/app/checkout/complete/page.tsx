"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  CheckCircle,
  Users,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Truck,
  Lock,
} from "lucide-react"
import { useState, useEffect, Suspense } from "react"

// Mock order data
const mockOrder = {
  id: "ORD20240323001",
  createdAt: "2024-03-23 14:30",
  status: "CONFIRMED",
  delivery: {
    name: "홍길동",
    phone: "010-1234-5678",
    zipCode: "06241",
    address: "서울특별시 강남구 테헤란로 123",
    detail: "그린타워 1층",
    memo: "배송 전 연락바랍니다",
  },
  groupBuy: {
    deliveryDate: "4월 10일 (판매자 지정)",
    deliveryMethod: "꽃차 직배송",
  },
  items: [
    {
      id: 1,
      name: "프리미엄 호접란 3대 세트 - 화이트 에디션",
      option: "화이트 / 대형",
      quantity: 1,
      price: 52000,
    },
  ],
  payment: {
    method: "신용/체크카드",
    productTotal: 52000,
    deliveryFee: 3000,
    discount: 0,
    total: 55000,
  },
}

function CheckoutCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isGroupBuy, setIsGroupBuy] = useState(searchParams.get("type") === "group")
  const [isProductExpanded, setIsProductExpanded] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("checkoutType") === "group") {
      setIsGroupBuy(true)
    }
  }, [])

  const formatPrice = (price: number) => price.toLocaleString("ko-KR")

  return (
    <div className="min-h-screen bg-background max-w-[390px] mx-auto relative pb-28">
      {/* Fixed Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.push("/")} className="p-1 -ml-1">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-foreground pr-6">
            주문 완료
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="pt-14 px-4 py-6 space-y-4">
        {/* Success Message */}
        <div className="flex flex-col items-center py-6">
          {isGroupBuy ? (
            <Users className="w-16 h-16 text-violet-500 mb-4" />
          ) : (
            <CheckCircle className="w-16 h-16 text-primary mb-4" />
          )}
          <h2 className="text-xl font-bold text-foreground mb-2">
            {isGroupBuy ? "공동구매 참여가 완료되었습니다" : "결제를 완료하였습니다"}
          </h2>
          <p className="text-sm text-muted-foreground">주문번호: {mockOrder.id}</p>
        </div>

        {/* 공동구매 안내 배너 */}
        {isGroupBuy && (
          <section className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-violet-500 text-lg mt-0.5">🌿</span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-violet-800">모집이 완료되면 주문이 확정됩니다</p>
                <p className="text-xs text-violet-600 leading-relaxed">
                  목표 인원이 모이면 카카오톡으로 확정 알림을 보내드립니다.
                  모집 기한까지 인원이 미달될 경우 자동으로 취소되며 결제 금액은 전액 환불됩니다.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Section 1: 배송 정보 */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">배송 정보</h2>
            <button className="flex items-center gap-0.5 text-sm text-primary">
              <span>배송지 변경</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex">
              <span className="text-sm text-muted-foreground w-20 flex-shrink-0">수령인</span>
              <span className="text-sm text-foreground">{mockOrder.delivery.name}</span>
            </div>
            <div className="flex">
              <span className="text-sm text-muted-foreground w-20 flex-shrink-0">연락처</span>
              <span className="text-sm text-foreground">{mockOrder.delivery.phone}</span>
            </div>
            <div className="flex">
              <span className="text-sm text-muted-foreground w-20 flex-shrink-0">주소</span>
              <span className="text-sm text-foreground">
                ({mockOrder.delivery.zipCode}) {mockOrder.delivery.address}, {mockOrder.delivery.detail}
              </span>
            </div>
            <div className="flex">
              <span className="text-sm text-muted-foreground w-20 flex-shrink-0">배송요청</span>
              <span className="text-sm text-foreground">{mockOrder.delivery.memo}</span>
            </div>
          </div>

          {/* 공동구매 전용: 판매자 지정 배송일·수단 */}
          {isGroupBuy && (
            <div className="mt-4 bg-muted rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">판매자 지정 배송 (변경 불가)</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground w-16 flex-shrink-0">배송 예정일</span>
                <span className="text-sm font-medium text-foreground">{mockOrder.groupBuy.deliveryDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground w-16 flex-shrink-0">배송 수단</span>
                <span className="text-sm font-medium text-foreground">{mockOrder.groupBuy.deliveryMethod}</span>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: 주문 정보 */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-3">주문 정보</h2>
          
          {/* Accordion */}
          <div className="border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setIsProductExpanded(!isProductExpanded)}
              className="w-full p-3 flex items-center justify-between bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🌸</span>
                </div>
                <span className="text-sm font-medium text-foreground text-left line-clamp-1">
                  {mockOrder.items[0].name}
                  {mockOrder.items.length > 1 && ` 외 ${mockOrder.items.length - 1}건`}
                </span>
              </div>
              {isProductExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
            
            {isProductExpanded && (
              <div className="p-3 space-y-3 border-t border-border">
                {mockOrder.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🌸</span>
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
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">결제금액</span>
            <span className="text-lg font-bold text-foreground">{formatPrice(mockOrder.payment.total)}원</span>
          </div>
        </section>

        {/* Section 3: 결제 정보 */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-3">결제 정보</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">총 상품금액</span>
              <span className="text-sm text-foreground">{formatPrice(mockOrder.payment.productTotal)}원</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">배송비</span>
              <span className="text-sm text-foreground">
                {mockOrder.payment.deliveryFee === 0 ? "무료" : `${formatPrice(mockOrder.payment.deliveryFee)}원`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">결제수단</span>
              <span className="text-sm text-foreground">{mockOrder.payment.method}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">총 결제금액</span>
              <span className="text-xl font-bold text-primary">{formatPrice(mockOrder.payment.total)}원</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card border-t border-border z-50 px-4 py-3">
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/mypage/orders")}
            className="flex-1 h-12 border border-primary text-primary rounded-xl font-bold text-base bg-card"
          >
            주문내역 보기
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-bold text-base"
          >
            쇼핑 계속하기
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  )
}

export default function CheckoutCompletePage() {
  return (
    <Suspense>
      <CheckoutCompleteContent />
    </Suspense>
  )
}

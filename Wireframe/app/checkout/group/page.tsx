"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  MapPin,
  Check,
  Users,
  Calendar,
  Truck,
  Lock,
  AlertCircle,
} from "lucide-react"

// Mock user data
const mockUser = {
  name: "홍길동",
  phone: "010-1234-5678",
}

// Mock address data
const mockAddress = {
  id: 1,
  name: "홍길동",
  phone: "010-1234-5678",
  zipCode: "06241",
  address: "서울특별시 강남구 테헤란로 123",
  detail: "그린타워 1층",
  isDefault: true,
}

// Mock product data (group buy)
const mockProduct = {
  id: 1,
  name: "프리미엄 호접란 3대 세트 - 화이트 에디션",
  option: "화이트 / 대형",
  quantity: 1,
  originalPrice: 75000,
  price: 45000,
  discount: 40,
  seller: "디어 오키드",
  groupBuy: {
    current: 18,
    total: 30,
    daysLeft: 7,
    deliveryDate: "4월 10일",
    deliveryMethod: "꽃차 직배송",
    deliveryFee: 1500,
  },
}

// Payment methods — 설계 문서(IA) 확정 수단 (무통장 미지원)
const paymentMethods = [
  { id: "kakao", name: "카카오페이" },
  { id: "naver", name: "네이버페이" },
  { id: "card",  name: "신용/체크카드" },
]

// Delivery memos
const deliveryMemos = [
  "배송 전 연락바랍니다",
  "부재 시 문 앞에 놓아주세요",
  "경비실에 맡겨주세요",
  "직접 받겠습니다",
  "직접 입력",
]

export default function GroupCheckoutPage() {
  const router = useRouter()
  
  const [ordererName, setOrdererName] = useState(mockUser.name)
  const [selectedMemo, setSelectedMemo] = useState("")
  const [selectedPayment, setSelectedPayment] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  const hasAddress = !!mockAddress

  const formatPrice = (price: number) => price.toLocaleString("ko-KR")

  // Calculate prices
  const productTotal = mockProduct.price * mockProduct.quantity
  const discountAmount = (mockProduct.originalPrice - mockProduct.price) * mockProduct.quantity
  const deliveryFee = mockProduct.groupBuy.deliveryFee
  const totalPrice = productTotal + deliveryFee

  // Progress
  const progressPercent = (mockProduct.groupBuy.current / mockProduct.groupBuy.total) * 100

  // Check if can submit
  const canSubmit = 
    ordererName.trim() !== "" &&
    hasAddress &&
    selectedPayment !== "" &&
    agreedToTerms

  const handleSubmit = () => {
    if (!canSubmit) return
    sessionStorage.setItem("checkoutType", "group")
    router.push("/checkout/complete?type=group")
  }

  return (
    <div className="min-h-screen bg-background max-w-[390px] mx-auto relative pb-24">
      {/* Fixed Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-foreground pr-6">
            공동구매 결제
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="pt-14 px-4 py-4 space-y-3">
        {/* Group Buy Progress Banner */}
        <section className="bg-primary/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              공동구매 모집 현황
            </span>
            <span className="text-sm text-destructive font-bold">
              마감 D-{mockProduct.groupBuy.daysLeft}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            <span className="text-primary font-bold">{mockProduct.groupBuy.current}</span>
            /{mockProduct.groupBuy.total}명 참여중
          </p>
        </section>

        {/* Section 1: 주문자 정보 */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-3">주문자 정보</h2>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">주문자명</label>
            <input
              type="text"
              value={ordererName}
              onChange={(e) => setOrdererName(e.target.value)}
              className="w-full h-11 px-3 border border-border rounded-xl text-sm text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="주문자명을 입력하세요"
            />
          </div>
        </section>

        {/* Section 2: 배송 정보 */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">배송 정보</h2>
            <button className="flex items-center gap-1 text-sm text-primary">
              <MapPin className="w-4 h-4" />
              <span>배송지 목록 (1)</span>
            </button>
          </div>

          {hasAddress ? (
            <div className="bg-muted rounded-xl p-3 mb-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{mockAddress.name}</span>
                {mockAddress.isDefault && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">기본</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                ({mockAddress.zipCode}) {mockAddress.address}
              </p>
              <p className="text-sm text-muted-foreground mb-1">{mockAddress.detail}</p>
              <p className="text-sm text-muted-foreground">{mockAddress.phone}</p>
            </div>
          ) : (
            <div className="bg-muted rounded-xl p-4 mb-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">등록된 배송지가 없습니다</p>
              <button className="text-sm text-primary font-medium">+ 배송지 추가</button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">배송 메모</label>
            <select
              value={selectedMemo}
              onChange={(e) => setSelectedMemo(e.target.value)}
              className="w-full h-11 px-3 border border-border rounded-xl text-sm text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="">배송 메모를 선택하세요</option>
              {deliveryMemos.map((memo) => (
                <option key={memo} value={memo}>{memo}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Section 3: 주문 정보 (배송 정보 읽기 전용) */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-3">주문 정보</h2>

          {/* Seller */}
          <p className="text-sm text-muted-foreground mb-3">{mockProduct.seller}</p>

          {/* Fixed Delivery Info (판매자 지정) */}
          <div className="bg-muted rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">판매자 지정 배송</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">배송일:</span>
                <span className="text-sm font-medium text-foreground">{mockProduct.groupBuy.deliveryDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">배송:</span>
                <span className="text-sm font-medium text-foreground">{mockProduct.groupBuy.deliveryMethod}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground ml-6">배송비:</span>
                <span className="text-sm font-medium text-foreground">{formatPrice(mockProduct.groupBuy.deliveryFee)}원</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex gap-3 p-3 bg-muted rounded-xl">
            <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🌸</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                {mockProduct.name}
              </p>
              <p className="text-xs text-muted-foreground mb-1">
                {mockProduct.option} / {mockProduct.quantity}개
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-foreground">
                  {formatPrice(mockProduct.price)}원
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(mockProduct.originalPrice)}원
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: 결제 수단 */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-3">결제 수단</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  selectedPayment === method.id
                    ? "bg-primary/5 border-primary"
                    : "bg-card border-border hover:border-primary"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPayment === method.id ? "border-primary bg-primary" : "border-border"
                }`}>
                  {selectedPayment === method.id && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium text-foreground">{method.name}</span>
              </button>
            ))}
          </div>

          {/* Refund Notice */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              목표 인원 미달성 시 자동으로 전액 환불됩니다
            </p>
          </div>
        </section>

        {/* Section 5: 결제 정보 */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-3">결제 정보</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">총 상품금액</span>
              <span className="text-sm text-foreground">{formatPrice(mockProduct.originalPrice * mockProduct.quantity)}원</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary font-medium">공동구매 할인</span>
              <span className="text-sm text-primary font-medium">-{formatPrice(discountAmount)}원</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">배송비</span>
              <span className="text-sm text-foreground">{formatPrice(deliveryFee)}원</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">총 결제금액</span>
              <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}원</span>
            </div>
          </div>
        </section>

        {/* Section 6: 약관 동의 */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <button
            onClick={() => setAgreedToTerms(!agreedToTerms)}
            className="flex items-center gap-3 w-full"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              agreedToTerms ? "border-primary bg-primary" : "border-border"
            }`}>
              {agreedToTerms && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className="text-sm text-foreground flex-1 text-left">
              약관에 동의하고 결제를 진행하겠습니다
            </span>
          </button>
          <button className="text-xs text-primary mt-2 ml-8">약관 보기</button>
        </section>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card border-t border-border z-50 px-4 py-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full h-12 rounded-xl font-bold text-base transition-colors ${
            canSubmit
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          공동구매 참여하기
        </button>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  )
}

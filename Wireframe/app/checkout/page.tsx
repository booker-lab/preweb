"use client"

import { useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  MapPin,
  ChevronRight,
  Check,
  Truck,
  Package,
  Lock,
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
  isMetro: true, // 수도권 여부
}

// Mock product data
const mockProduct = {
  id: 1,
  name: "프리미엄 호접란 3대 세트 - 화이트 에디션",
  option: "화이트 / 대형",
  quantity: 1,
  price: 52000,
  seller: "디어 오키드",
}

// Delivery methods
const deliveryMethods = [
  {
    id: "direct",
    name: "꽃차 직배송",
    description: "수도권 전용",
    fee: 3000,
    freeThreshold: 50000,
    metroOnly: true,
  },
  {
    id: "pickup",
    name: "거점 픽업",
    description: "수도권 전용",
    fee: 1000,
    freeThreshold: 30000,
    metroOnly: true,
  },
  {
    id: "courier",
    name: "택배",
    description: "전국",
    fee: 4000,
    freeThreshold: 50000,
    metroOnly: false,
  },
]

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

// Generate date options (tomorrow ~ 14 days)
function generateDateOptions() {
  const dates = []
  const today = new Date()
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()]
    
    dates.push({
      date: date.toISOString().split("T")[0],
      label: `${month}/${day}`,
      dayOfWeek,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    })
  }
  
  return dates
}

export default function CheckoutPage() {
  const router = useRouter()
  const dateScrollRef = useRef<HTMLDivElement>(null)
  
  const [ordererName, setOrdererName] = useState(mockUser.name)
  const [selectedMemo, setSelectedMemo] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedDelivery, setSelectedDelivery] = useState("")
  const [selectedPayment, setSelectedPayment] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  // 와이어프레임용 기상 조건 제한 토글
  const [weatherRestricted, setWeatherRestricted] = useState(false)

  const dateOptions = useMemo(() => generateDateOptions(), [])
  const hasAddress = !!mockAddress
  const isMetro = mockAddress?.isMetro ?? false

  const formatPrice = (price: number) => price.toLocaleString("ko-KR")

  // Calculate delivery fee
  const productTotal = mockProduct.price * mockProduct.quantity
  const selectedMethod = deliveryMethods.find(m => m.id === selectedDelivery)
  const deliveryFee = useMemo(() => {
    if (!selectedMethod) return 0
    return productTotal >= selectedMethod.freeThreshold ? 0 : selectedMethod.fee
  }, [selectedMethod, productTotal])
  
  const totalPrice = productTotal + deliveryFee

  // Check if can submit
  const canSubmit = 
    ordererName.trim() !== "" &&
    hasAddress &&
    selectedDate !== "" &&
    selectedDelivery !== "" &&
    selectedPayment !== "" &&
    agreedToTerms

  const handleSubmit = () => {
    if (!canSubmit) return
    router.push("/checkout/complete")
  }

  return (
    <div className="min-h-screen bg-background max-w-[390px] mx-auto relative pb-24">
      {/* Fixed Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-foreground">
            결제하기
          </h1>
          {/* 와이어프레임 토글 */}
          <button
            onClick={() => {
              setWeatherRestricted(!weatherRestricted)
              if (!weatherRestricted && selectedDelivery === "courier") setSelectedDelivery("")
            }}
            className={`text-[10px] border rounded-full px-2 py-0.5 flex-shrink-0 ${
              weatherRestricted
                ? "border-destructive text-destructive"
                : "border-border text-muted-foreground"
            }`}
          >
            {weatherRestricted ? "기상제한 ON" : "기상제한 OFF"}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="pt-14 px-4 py-4 space-y-3">
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

        {/* Section 3: 주문 정보 */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-3">주문 정보</h2>

          {/* Seller */}
          <p className="text-sm text-muted-foreground mb-3">{mockProduct.seller}</p>

          {/* Delivery Method Selection */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">배송 수단 선택</label>
            {!hasAddress ? (
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-sm text-muted-foreground">배송지를 먼저 입력해주세요</p>
              </div>
            ) : (
              <div className="space-y-2">
                {weatherRestricted && (
                  <div className="flex items-start gap-2 bg-destructive/10 rounded-xl p-3 mb-2">
                    <span className="text-destructive text-xs leading-relaxed">
                      현재 기온 조건으로 인해 택배 배송이 일시 중단되었습니다
                    </span>
                  </div>
                )}
                {deliveryMethods.map((method) => {
                  const isWeatherBlocked = weatherRestricted && method.id === "courier"
                  const isDisabled = (method.metroOnly && !isMetro) || isWeatherBlocked
                  const isFree = productTotal >= method.freeThreshold

                  return (
                    <button
                      key={method.id}
                      onClick={() => !isDisabled && setSelectedDelivery(method.id)}
                      disabled={isDisabled}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        isDisabled
                          ? "bg-muted border-border cursor-not-allowed opacity-50"
                          : selectedDelivery === method.id
                          ? "bg-primary/5 border-primary"
                          : "bg-card border-border hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedDelivery === method.id ? "border-primary bg-primary" : "border-border"
                        }`}>
                          {selectedDelivery === method.id && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            {method.id === "direct" && <Truck className="w-4 h-4 text-primary" />}
                            {method.id === "pickup" && <MapPin className="w-4 h-4 text-primary" />}
                            {method.id === "courier" && <Package className="w-4 h-4 text-primary" />}
                            <span className={`text-sm font-medium ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
                              {method.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isFree ? (
                          <span className="text-sm font-medium text-primary">무료</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{formatPrice(method.fee)}원</span>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {formatPrice(method.freeThreshold)}원 이상 무료
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">배송 희망일 선택</label>
            <div
              ref={dateScrollRef}
              className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
            >
              {dateOptions.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`flex-shrink-0 w-14 py-2 rounded-xl border text-center transition-colors ${
                    selectedDate === d.date
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-foreground hover:border-primary"
                  }`}
                >
                  <p className="text-xs font-medium">{d.label}</p>
                  <p className={`text-[10px] ${selectedDate === d.date ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {d.dayOfWeek}
                  </p>
                </button>
              ))}
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
              <p className="text-sm font-bold text-foreground">
                {formatPrice(mockProduct.price)}원
              </p>
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
        </section>

        {/* Section 5: 결제 정보 */}
        <section className="bg-card rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-3">결제 정보</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">총 상품금액</span>
              <span className="text-sm text-foreground">{formatPrice(productTotal)}원</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">배송비</span>
              <span className="text-sm text-foreground">
                {selectedDelivery ? (deliveryFee === 0 ? "무료" : `${formatPrice(deliveryFee)}원`) : "-"}
              </span>
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
          {formatPrice(totalPrice)}원 결제
        </button>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  )
}

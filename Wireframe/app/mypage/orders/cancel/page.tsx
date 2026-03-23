"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  Check,
  CheckCircle,
  Receipt,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Cancel reasons
const cancelReasons = [
  "단순 변심",
  "주문 실수",
  "배송 지연",
  "옵션 변경",
  "다른 상품 추가 주문",
  "배송 정보 변경",
  "상품 가격",
  "기타",
]

// Mock order data
const mockOrder = {
  id: "ORD20240320001",
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
  payment: {
    productTotal: 38000,
    deliveryFee: 4000,
    couponDiscount: 0,
    pointDiscount: 0,
    bundleDiscount: 0,
    total: 42000,
  },
}

type Step = "reason" | "confirm" | "complete"

export default function OrderCancelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [step, setStep] = useState<Step>("reason")
  const [selectedReason, setSelectedReason] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const formatPrice = (price: number) => price.toLocaleString("ko-KR")

  const handleNext = () => {
    if (step === "reason" && selectedReason) {
      setStep("confirm")
    }
  }

  const handleCancel = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false)
    setStep("complete")
  }

  // Step 1: Reason Selection
  if (step === "reason") {
    return (
      <div className="min-h-screen bg-background max-w-[390px] mx-auto relative pb-24">
        {/* Fixed Header */}
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
          <div className="flex items-center h-14 px-4">
            <button onClick={() => router.back()} className="p-1 -ml-1">
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="flex-1 text-center text-base font-bold text-foreground pr-6">
              주문 취소
            </h1>
          </div>
        </header>

        {/* Content */}
        <main className="pt-14 px-4 py-4 space-y-4">
          {/* Product Info */}
          <section className="bg-card rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3">취소 대상 상품</h2>
            {mockOrder.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🌹</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.option} / {item.quantity}개 / {formatPrice(item.price)}원
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* Cancel Reason */}
          <section className="bg-card rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3">취소 사유 선택</h2>
            <div className="space-y-2">
              {cancelReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                    selectedReason === reason
                      ? "bg-primary/5 border-primary"
                      : "bg-card border-border hover:border-primary"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedReason === reason ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {selectedReason === reason && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm text-foreground">{reason}</span>
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card border-t border-border z-50 px-4 py-3">
          <button
            onClick={handleNext}
            disabled={!selectedReason}
            className={`w-full h-12 rounded-xl font-bold text-base transition-colors ${
              selectedReason
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            다음
          </button>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    )
  }

  // Step 2: Confirm
  if (step === "confirm") {
    const refundAmount = mockOrder.payment.total

    return (
      <div className="min-h-screen bg-background max-w-[390px] mx-auto relative pb-24">
        {/* Fixed Header */}
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
          <div className="flex items-center h-14 px-4">
            <button onClick={() => setStep("reason")} className="p-1 -ml-1">
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="flex-1 text-center text-base font-bold text-foreground pr-6">
              취소 요청
            </h1>
          </div>
        </header>

        {/* Content */}
        <main className="pt-14 px-4 py-4 space-y-4">
          {/* Product Info */}
          <section className="bg-card rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-primary font-medium">{mockOrder.expectedDate} 도착 예정</span>
            </div>
            {mockOrder.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌹</span>
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
          </section>

          {/* Refund Info */}
          <section className="bg-card rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3">예상 환불 정보</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">총 상품금액</span>
                <span className="text-sm text-foreground">{formatPrice(mockOrder.payment.productTotal)}원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">총 배송비</span>
                <span className="text-sm text-foreground">{formatPrice(mockOrder.payment.deliveryFee)}원</span>
              </div>
              {mockOrder.payment.couponDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">쿠폰 할인</span>
                  <span className="text-sm text-foreground">-{formatPrice(mockOrder.payment.couponDiscount)}원</span>
                </div>
              )}
              {mockOrder.payment.pointDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">적립금 사용</span>
                  <span className="text-sm text-foreground">-{formatPrice(mockOrder.payment.pointDiscount)}원</span>
                </div>
              )}
              {mockOrder.payment.bundleDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">묶음 할인</span>
                  <span className="text-sm text-foreground">-{formatPrice(mockOrder.payment.bundleDiscount)}원</span>
                </div>
              )}
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-foreground">예상 환불 금액</span>
                <span className="text-xl font-bold text-primary">{formatPrice(refundAmount)}원</span>
              </div>
            </div>
          </section>

          {/* Cancel Reason */}
          <section className="bg-muted rounded-xl p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">취소 사유:</span>
              <span className="text-sm text-foreground font-medium">{selectedReason}</span>
            </div>
          </section>
        </main>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card border-t border-border z-50 px-4 py-3">
          <button
            onClick={handleCancel}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold text-base"
          >
            취소 요청
          </button>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>

        {/* Confirm Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="max-w-[340px] rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center">취소 요청</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                취소 요청을 하시겠습니까?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-3">
              <AlertDialogCancel className="flex-1 mt-0">아니요</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmCancel}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                네
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Step 3: Complete
  return (
    <div className="min-h-screen bg-background max-w-[390px] mx-auto relative pb-24 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <div className="w-6" />
          <h1 className="flex-1 text-center text-base font-bold text-foreground">
            취소 완료
          </h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-14">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Receipt className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">주문 취소가 완료되었습니다</h2>
        <p className="text-sm text-muted-foreground text-center">
          환불은 결제 수단에 따라 3-5일 소요될 수 있습니다
        </p>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card border-t border-border z-50 px-4 py-3">
        <button
          onClick={() => router.push("/")}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold text-base"
        >
          쇼핑 계속하기
        </button>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  )
}

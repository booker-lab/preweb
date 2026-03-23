"use client"

import { X, Calendar, Truck, CreditCard, AlertTriangle, Users } from "lucide-react"

interface GroupBuyOptionSheetProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  price: number
  deliveryDate: string
  deliveryMethod: string
  deliveryFee: number
  currentParticipants: number
  totalParticipants: number
  daysLeft: number
  onParticipate: () => void
}

export function GroupBuyOptionSheet({
  isOpen,
  onClose,
  productName,
  price,
  deliveryDate,
  deliveryMethod,
  deliveryFee,
  currentParticipants,
  totalParticipants,
  daysLeft,
  onParticipate,
}: GroupBuyOptionSheetProps) {
  const formatPrice = (p: number) => p.toLocaleString("ko-KR")
  const totalPrice = price + deliveryFee

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card rounded-t-3xl z-50 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">참여 옵션</h3>
          <button onClick={onClose} className="p-1">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Product Row */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium truncate">{productName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">수량: 1개 (공동구매는 1인 1개)</p>
            </div>
            <span className="text-base font-bold text-foreground ml-4 flex-shrink-0">
              {formatPrice(price)}원
            </span>
          </div>

          {/* Delivery Info */}
          <div className="py-4 border-b border-border space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-foreground">배송 예정일:</span>
                <span className="text-sm font-medium text-foreground">{deliveryDate}</span>
                <span className="text-xs text-muted-foreground">판매자 지정, 변경 불가</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">배송 수단:</span>
                <span className="text-sm font-medium text-foreground">{deliveryMethod}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">배송비:</span>
                <span className="text-sm font-medium text-foreground">{formatPrice(deliveryFee)}원</span>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className="my-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 font-medium">
              목표 인원 미달 시 결제 금액이 자동 환불됩니다
            </p>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-4 border-t border-border">
            <span className="text-sm text-muted-foreground">1개 상품</span>
            <span className="text-xl font-bold text-foreground">
              총 {formatPrice(totalPrice)}원
            </span>
          </div>

          {/* Participate Button */}
          <button
            onClick={onParticipate}
            className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold text-base"
          >
            공동구매 참여하기
          </button>

          {/* Status Text */}
          <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Users className="w-3 h-3" />
            마감 D-{daysLeft} · {currentParticipants}/{totalParticipants}명 참여중
          </p>
        </div>

        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </>
  )
}

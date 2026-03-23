"use client"

import { X, Minus, Plus } from "lucide-react"
import { useState, useEffect } from "react"

interface ProductOptionSheetProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  price: number
  onAddToCart: (quantity: number) => void
  onBuyNow: (quantity: number) => void
}

export function ProductOptionSheet({
  isOpen,
  onClose,
  productName,
  price,
  onAddToCart,
  onBuyNow,
}: ProductOptionSheetProps) {
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const formatPrice = (value: number) => value.toLocaleString("ko-KR")

  const totalPrice = price * quantity

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleIncrease = () => {
    setQuantity(quantity + 1)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Dimmed Background */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card rounded-t-2xl z-50 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">옵션 선택</h3>
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Product Row */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-foreground font-medium flex-1 truncate">
              {productName}
            </p>
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 border border-border rounded-lg flex items-center justify-center"
                disabled={quantity <= 1}
              >
                <Minus className={`w-4 h-4 ${quantity <= 1 ? "text-muted-foreground/50" : "text-foreground"}`} />
              </button>
              <span className="w-8 text-center text-sm font-medium text-foreground">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 border border-border rounded-lg flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Unit Price */}
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              {formatPrice(price)}원
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border my-4" />

          {/* Total */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{quantity}개 상품</p>
            <p className="text-lg font-bold text-foreground">
              총 {formatPrice(totalPrice)}원
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onAddToCart(quantity)}
              className="flex-1 h-12 border border-primary text-primary rounded-xl font-bold text-base bg-card"
            >
              장바구니
            </button>
            <button
              onClick={() => onBuyNow(quantity)}
              className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-bold text-base"
            >
              구매하기
            </button>
          </div>
        </div>

        {/* Safe Area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </>
  )
}

"use client"

import { useState } from "react"

interface BannerItem {
  id: number
  title: string
  subtitle: string
}

const banners: BannerItem[] = [
  {
    id: 1,
    title: "오늘의 특가 꽃 배송",
    subtitle: "신선한 꽃을 가장 빠르게",
  },
  {
    id: 2,
    title: "봄맞이 튤립 대전",
    subtitle: "최대 40% 할인 혜택",
  },
  {
    id: 3,
    title: "결혼식 꽃 패키지",
    subtitle: "부케부터 장식까지 한번에",
  },
]

export function EventBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <div className="relative px-4">
      <div className="relative h-[180px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-emerald-600">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/20 blur-xl" />
          <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-white/10 blur-xl" />
        </div>
        
        {/* Flower Illustration */}
        <div className="absolute right-4 bottom-4 text-6xl opacity-80">
          💐
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6">
          <h2 className="text-2xl font-bold text-white mb-2 text-balance">
            {banners[currentIndex].title}
          </h2>
          <p className="text-white/90 text-sm">
            {banners[currentIndex].subtitle}
          </p>
        </div>

        {/* Swipe Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

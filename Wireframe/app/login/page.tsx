"use client"

import { useRouter } from "next/navigation"
import { Phone } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background max-w-[390px] mx-auto flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center h-14 border-b border-border px-4">
        <h1 className="text-base font-bold text-foreground">로그인 / 회원가입</h1>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
        {/* Brand Hero */}
        <div className="text-center mb-16">
          {/* Logo mark */}
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl">🌿</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground leading-snug mb-2">
            하나만 사도{" "}
            <span className="text-primary">무료배송</span>
          </h2>
          <h2 className="text-2xl font-bold text-foreground leading-snug">
            품질 불만족 시{" "}
            <span className="text-primary">100% 환불</span>
          </h2>
        </div>

        {/* CTA Bubble */}
        <div className="relative mb-4">
          <div className="bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full border border-primary/20">
            지금 가입하면 첫 주문 배송비 무료 🎉
          </div>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/10 border-r border-b border-primary/20 rotate-45" />
        </div>

        {/* Kakao Login Button */}
        <button
          onClick={() => router.push("/")}
          className="w-full h-14 bg-[#FEE500] rounded-2xl flex items-center justify-center gap-3 font-bold text-[#191919] text-base mb-4 shadow-sm active:scale-[0.98] transition-transform"
        >
          {/* Kakao chat bubble icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.608 5.07 4.05 6.51l-.9 3.33a.3.3 0 0 0 .45.33l3.81-2.52c.84.12 1.71.18 2.59.18 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3Z"
              fill="#191919"
            />
          </svg>
          카카오로 3초 만에 시작하기
        </button>

        {/* Phone Login */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Phone className="w-4 h-4" />
          <span>휴대폰 번호로 시작</span>
        </button>
      </main>

      {/* Bottom safe area */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  )
}

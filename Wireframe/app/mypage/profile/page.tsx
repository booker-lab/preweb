"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

const MAX_NICKNAME = 20

const mockUser = {
  nickname: "홍길동",
  phone: "010-1234-5678",
}

export default function ProfileEditPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState(mockUser.nickname)
  const [phone, setPhone] = useState(mockUser.phone)

  const isChanged =
    nickname.trim() !== mockUser.nickname || phone.trim() !== mockUser.phone
  const isValid = nickname.trim().length > 0 && phone.trim().length > 0

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }

  const handleComplete = () => {
    // 와이어프레임: 저장 없이 뒤로 이동
    router.back()
  }

  return (
    <div className="min-h-screen bg-muted/30 max-w-[390px] mx-auto relative">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1 mr-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground">정보 수정</h1>
        </div>
      </header>

      <main className="pt-14 pb-24 space-y-2">
        {/* 닉네임 */}
        <section className="bg-card px-4 py-5">
          <label className="block text-sm font-medium text-foreground mb-2">
            닉네임
          </label>
          <input
            type="text"
            value={nickname}
            maxLength={MAX_NICKNAME}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            placeholder="닉네임을 입력해주세요"
          />
          <p className="text-right text-xs text-muted-foreground mt-1.5">
            {nickname.length} / 최대 {MAX_NICKNAME}자
          </p>
        </section>

        {/* 전화번호 */}
        <section className="bg-card px-4 py-5">
          <label className="block text-sm font-medium text-foreground mb-2">
            전화번호
          </label>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            inputMode="numeric"
            className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            placeholder="010-0000-0000"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            본인 명의의 휴대폰 번호를 입력해주세요
          </p>
        </section>
      </main>

      {/* 완료 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 py-4 bg-card border-t border-border">
        <button
          onClick={handleComplete}
          disabled={!isChanged || !isValid}
          className="w-full h-12 rounded-xl text-sm font-bold transition-colors disabled:bg-muted disabled:text-muted-foreground bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed"
        >
          완료
        </button>
      </div>
    </div>
  )
}

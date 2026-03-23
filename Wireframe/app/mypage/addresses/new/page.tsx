"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"

const DELIVERY_NOTES = [
  "배송 요청사항을 선택해주세요",
  "부재시 문앞에 놓아주세요.",
  "부재시 경비실에 맡겨주세요.",
  "부재시 택배함에 넣어주세요.",
  "배송 전 연락 부탁드려요.",
  "직접 받겠습니다.",
]

// Mock edit data (mode=edit 일 때 채워짐)
const mockEditData = {
  name: "홍길동",
  phone: "010-1234-5678",
  zipCode: "06236",
  address: "서울 강남구 테헤란로 427 (삼성동, 위워크타워)",
  detailAddress: "8층 Green Hub",
  note: "부재시 문앞에 놓아주세요.",
  isDefault: true,
}

function AddressForm() {
  const router = useRouter()
  const params = useSearchParams()
  const isEdit = params.get("mode") === "edit"

  const [form, setForm] = useState({
    name: isEdit ? mockEditData.name : "",
    phone: isEdit ? mockEditData.phone : "010-1234-5678",
    zipCode: isEdit ? mockEditData.zipCode : "",
    address: isEdit ? mockEditData.address : "",
    detailAddress: isEdit ? mockEditData.detailAddress : "",
    note: isEdit ? mockEditData.note : DELIVERY_NOTES[0],
    isDefault: isEdit ? mockEditData.isDefault : false,
  })

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
  }

  // 와이어프레임: 주소 검색 mock
  const handleAddressSearch = () => {
    set("zipCode", "06236")
    set("address", "서울 강남구 테헤란로 427 (삼성동, 위워크타워)")
  }

  const isValid = form.name.trim() && form.phone.length >= 12 && form.address.trim()

  return (
    <div className="min-h-screen bg-muted/30 max-w-[390px] mx-auto relative">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-foreground">
            {isEdit ? "배송지 수정" : "배송지 추가"}
          </h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="pt-14 pb-24 px-4">
        {/* 배송 정보 섹션 */}
        <div className="mt-4 mb-2">
          <p className="text-base font-bold text-foreground">배송 정보</p>
        </div>

        <div className="space-y-4">
          {/* 받는 사람 */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">받는 사람</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="이름을 입력해주세요"
              className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* 휴대폰 */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">휴대폰</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", formatPhone(e.target.value))}
              inputMode="numeric"
              placeholder="010-0000-0000"
              className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* 주소 */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">주소</label>
            {/* 우편번호 + 주소 검색 버튼 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={form.zipCode}
                readOnly
                placeholder="우편번호"
                className="flex-1 h-12 px-4 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none cursor-default"
              />
              <button
                onClick={handleAddressSearch}
                className="h-12 px-4 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap"
              >
                주소 검색
              </button>
            </div>
            {/* 기본 주소 */}
            <input
              type="text"
              value={form.address}
              readOnly
              placeholder="주소를 입력해주세요"
              className="w-full h-12 px-4 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none cursor-default"
            />
            {/* 상세 주소 */}
            <input
              type="text"
              value={form.detailAddress}
              onChange={(e) => set("detailAddress", e.target.value)}
              placeholder="상세주소를 입력해주세요 (동/호수 등)"
              className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* 배송 요청사항 */}
          <div className="space-y-1.5">
            <select
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none"
            >
              {DELIVERY_NOTES.map((note) => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </div>

          {/* 기본 배송지로 저장 */}
          <button
            onClick={() => set("isDefault", !form.isDefault)}
            className="flex items-center gap-2.5 py-1"
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              form.isDefault ? "border-primary bg-primary" : "border-muted-foreground"
            }`}>
              {form.isDefault && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <span className="text-sm text-foreground">기본 배송지로 저장</span>
          </button>
        </div>
      </main>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 py-4 bg-card border-t border-border">
        <button
          onClick={() => router.push("/mypage/addresses")}
          disabled={!isValid}
          className="w-full h-12 rounded-xl text-sm font-bold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
          저장
        </button>
      </div>
    </div>
  )
}

export default function AddressNewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30 max-w-[390px] mx-auto" />}>
      <AddressForm />
    </Suspense>
  )
}

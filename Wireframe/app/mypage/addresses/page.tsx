"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"

interface Address {
  id: number
  name: string
  zipCode: string
  address: string
  detailAddress: string
  phone: string
  note: string
  isDefault: boolean
}

const mockAddresses: Address[] = [
  {
    id: 1,
    name: "홍길동",
    zipCode: "06236",
    address: "서울 강남구 테헤란로 427 (삼성동, 위워크타워)",
    detailAddress: "8층 Green Hub",
    phone: "010-1234-5678",
    note: "부재시 문앞에 놓아주세요.",
    isDefault: true,
  },
  {
    id: 2,
    name: "홍길동 (회사)",
    zipCode: "04524",
    address: "서울 중구 을지로 100 (을지로2가)",
    detailAddress: "3층 302호",
    phone: "010-1234-5678",
    note: "",
    isDefault: false,
  },
]

export default function AddressesPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const confirmDelete = () => {
    if (deleteTargetId !== null) {
      setAddresses((prev) => prev.filter((a) => a.id !== deleteTargetId))
    }
    setDeleteTargetId(null)
  }

  return (
    <div className="min-h-screen bg-muted/30 max-w-[390px] mx-auto relative">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-foreground">배송지 목록</h1>
          <button
            onClick={() => router.push("/mypage/addresses/new")}
            className="text-sm font-medium text-primary"
          >
            배송지 추가
          </button>
        </div>
      </header>

      <main className="pt-14 pb-6 px-4 space-y-3 mt-2">
        {addresses.length === 0 ? (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <p className="text-base font-medium text-foreground">등록된 배송지가 없습니다.</p>
            <button
              onClick={() => router.push("/mypage/addresses/new")}
              className="flex items-center gap-1.5 h-11 px-6 bg-primary rounded-xl text-sm font-bold text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              배송지 추가하기
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="bg-card rounded-2xl shadow-sm px-4 py-4 space-y-1.5">
              {/* 이름 + 기본배송지 뱃지 */}
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">{addr.name}</p>
                {addr.isDefault && (
                  <span className="text-[10px] font-medium text-primary border border-primary rounded-full px-2 py-0.5">
                    기본
                  </span>
                )}
              </div>

              {/* 주소 */}
              <p className="text-sm text-foreground">
                ({addr.zipCode}) {addr.address} {addr.detailAddress}
              </p>

              {/* 전화번호 */}
              <p className="text-sm text-muted-foreground">{addr.phone}</p>

              {/* 배송 요청사항 */}
              {addr.note && (
                <div className="pt-1 border-t border-border">
                  <p className="text-xs text-muted-foreground">배송 요청사항</p>
                  <p className="text-sm text-foreground mt-0.5">{addr.note}</p>
                </div>
              )}

              {/* 삭제 / 수정 버튼 */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDeleteTargetId(addr.id)}
                  className="h-9 px-5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => router.push(`/mypage/addresses/new?mode=edit&id=${addr.id}`)}
                  className="h-9 px-5 rounded-xl border border-border text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  수정
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* 삭제 확인 모달 */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-2xl shadow-xl mx-6 w-full max-w-[300px] overflow-hidden">
            <div className="px-6 py-6 text-center">
              <p className="text-base font-bold text-foreground">배송지를 삭제하시겠어요?</p>
            </div>
            <div className="flex border-t border-border">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 h-12 text-sm text-muted-foreground font-medium hover:bg-muted/50 transition-colors border-r border-border"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-12 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

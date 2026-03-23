"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Home, MessageSquare, FileText, Star } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "write" | "written"

// 와이어프레임용 mock — 후기 쓸 수 있는 주문
const mockWritable = [
  { id: 1, name: "프리미엄 장미 꽃다발 레드", option: "레드 / 대형", emoji: "🌹", orderedAt: "2026.03.18", deadline: "2026.04.17" },
  { id: 2, name: "호접란 화이트 3대 세트", option: "화이트", emoji: "🌸", orderedAt: "2026.03.15", deadline: "2026.04.14" },
]

// 와이어프레임용 mock — 내가 쓴 후기
const mockWritten = [
  {
    id: 1,
    name: "수국 블루 한 다발",
    option: "블루 / 중형",
    emoji: "💐",
    rating: 5,
    body: "정말 싱싱하고 예쁘게 왔어요. 포장도 꼼꼼하고 좋았습니다!",
    hasPhoto: false,
    writtenAt: "2026.03.10",
    point: 100,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("write")

  // 와이어프레임 토글
  const [showWritable, setShowWritable] = useState(false)
  const [showWritten, setShowWritten] = useState(false)

  const writableList = showWritable ? mockWritable : []
  const writtenList = showWritten ? mockWritten : []

  return (
    <div className="min-h-screen bg-muted/30 max-w-[390px] mx-auto relative">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card/95 backdrop-blur-sm z-50 border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-foreground">후기</h1>
          <button onClick={() => router.push("/")} className="p-1">
            <Home className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-border">
          {(["write", "written"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                tab === t
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {t === "write" ? "후기 쓰기" : "내가 쓴 후기"}
            </button>
          ))}
        </div>
      </header>

      <main className="pt-[108px] pb-6">
        {tab === "write" ? (
          <>
            {/* 적립금 안내 배너 */}
            <div className="bg-card border-b border-border px-4 py-3 text-center">
              <p className="text-sm text-foreground">
                후기 쓰고 최대{" "}
                <span className="font-bold text-primary">500원</span> 적립 받으세요!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                (글 후기 100원, 사진 후기 500원)
              </p>
            </div>

            {/* 와이어프레임 토글 */}
            <div className="flex justify-end px-4 pt-3">
              <button
                onClick={() => setShowWritable(!showWritable)}
                className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5"
              >
                {showWritable ? "빈 상태 보기" : "후기 목록 보기"}
              </button>
            </div>

            {writableList.length > 0 ? (
              <div className="mt-2 divide-y divide-border">
                {writableList.map((item) => (
                  <div key={item.id} className="bg-card px-4 py-4 flex gap-3">
                    {/* 상품 이미지 */}
                    <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{item.emoji}</span>
                    </div>
                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.option}</p>
                      <p className="text-xs text-muted-foreground">구매일 {item.orderedAt}</p>
                      <p className="text-xs text-muted-foreground">
                        작성 가능 기간 ~{item.deadline}
                      </p>
                    </div>
                    {/* 후기 쓰기 버튼 */}
                    <button className="flex-shrink-0 self-center h-8 px-3 rounded-lg border border-primary text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                      후기 쓰기
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* 빈 상태 */
              <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 px-8 text-center">
                <MessageSquare className="w-14 h-14 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="text-base font-medium text-foreground">
                  아직 작성할 수 있는 후기가 없어요.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-1 h-11 px-8 bg-primary rounded-xl text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  홈에서 상품 둘러보기
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* 와이어프레임 토글 */}
            <div className="flex justify-end px-4 pt-3">
              <button
                onClick={() => setShowWritten(!showWritten)}
                className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5"
              >
                {showWritten ? "빈 상태 보기" : "후기 목록 보기"}
              </button>
            </div>

            {writtenList.length > 0 ? (
              <div className="mt-2 divide-y divide-border">
                {writtenList.map((review) => (
                  <div key={review.id} className="bg-card px-4 py-4 space-y-2">
                    {/* 상품 정보 */}
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">{review.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.option}</p>
                      </div>
                    </div>
                    {/* 별점 + 날짜 */}
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-muted-foreground">{review.writtenAt}</span>
                      {review.point > 0 && (
                        <span className="text-xs font-medium text-primary ml-auto">
                          +{review.point}원 적립
                        </span>
                      )}
                    </div>
                    {/* 후기 내용 */}
                    <p className="text-sm text-foreground leading-relaxed">{review.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* 빈 상태 */
              <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <FileText className="w-14 h-14 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="text-base font-medium text-foreground">후기가 없습니다.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

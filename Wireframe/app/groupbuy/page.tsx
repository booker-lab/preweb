"use client"

import { useState } from "react"
import { Home, Grid3X3, ShoppingCart, User, Search, Users, Clock, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { NAV_LABELS } from "@/lib/constants"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"

// Active group buy items
const activeGroupBuys = [
  {
    id: 1,
    name: "프리미엄 장미 100송이",
    month: "3",
    day: "28",
    deadlineText: "3월 28일",
    current: 18,
    total: 30,
    status: "active" as const,
  },
  {
    id: 2,
    name: "카네이션 대형 세트",
    month: "3",
    day: "30",
    deadlineText: "3월 30일",
    current: 25,
    total: 40,
    status: "active" as const,
  },
  {
    id: 3,
    name: "호접란 3대 세트",
    month: "4",
    day: "2",
    deadlineText: "4월 2일",
    current: 12,
    total: 25,
    status: "active" as const,
  },
]

// Ended group buy items
const endedGroupBuys = [
  {
    id: 101,
    name: "튤립 믹스 50송이",
    month: "3",
    day: "15",
    deadlineText: "3월 15일",
    current: 30,
    total: 30,
    status: "ended" as const,
  },
  {
    id: 102,
    name: "수국 블루 한 다발",
    month: "3",
    day: "10",
    deadlineText: "3월 10일",
    current: 40,
    total: 40,
    status: "ended" as const,
  },
  {
    id: 103,
    name: "백합 화이트 믹스",
    month: "3",
    day: "5",
    deadlineText: "3월 5일",
    current: 20,
    total: 20,
    status: "ended" as const,
  },
]

export default function GroupBuyListPage() {
  const [activeTab, setActiveTab] = useState("groupbuy")
  const { getCartCount } = useStore()

  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="w-6" />
        <h1 className="text-lg font-bold text-foreground">공동구매</h1>
        <Link href="/search" className="p-1">
          <Search className="h-6 w-6 text-foreground" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {/* Active Group Buys Section */}
        <section className="py-4">
          <div className="px-4 pb-3">
            <h3 className="text-lg font-bold">진행중인 공동구매</h3>
          </div>
          <div className="flex flex-col gap-3 px-4">
            {activeGroupBuys.map((item) => (
              <Link
                key={item.id}
                href={`/groupbuy/${item.id}`}
                className="flex gap-3 rounded-xl bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Date Block */}
                <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted">
                  <span className="text-xs text-muted-foreground">{item.month}월</span>
                  <span className="text-xl font-bold text-foreground">{item.day}</span>
                </div>
                {/* Content */}
                <div className="flex flex-1 flex-col gap-1.5">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      마감 {item.deadlineText}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      {item.current}/{item.total}명
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(item.current / item.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-orange-400 px-2 py-0.5 text-[10px] font-medium text-orange-500">
                      모집중
                    </span>
                    <span className="text-xs text-muted-foreground">{item.current}명 참여중</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Ended Group Buys Section */}
        <section className="py-4">
          <div className="px-4 pb-3">
            <h3 className="text-lg font-bold">종료된 공동구매</h3>
          </div>
          <div className="flex flex-col gap-3 px-4">
            {endedGroupBuys.map((item) => (
              <Link
                key={item.id}
                href={`/groupbuy/${item.id}`}
                className="flex gap-3 rounded-xl bg-card p-3 opacity-70 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Date Block */}
                <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground/70">{item.month}월</span>
                  <span className="text-xl font-bold text-muted-foreground">{item.day}</span>
                </div>
                {/* Content */}
                <div className="flex flex-1 flex-col gap-1.5">
                  <span className="font-medium text-muted-foreground">{item.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      마감 {item.deadlineText}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      {item.current}/{item.total}명
                    </span>
                  </div>
                  {/* Progress Bar - Full gray */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-full rounded-full bg-muted-foreground/30" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-muted-foreground/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      종료
                    </span>
                    <span className="text-xs text-muted-foreground/70">{item.current}명 참여완료</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

"use client"

import { Home, Grid3X3, Users, ShoppingCart, User } from "lucide-react"
import { useState } from "react"

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  badge?: number
}

const navItems: NavItem[] = [
  { id: "home", label: "홈", icon: Home },
  { id: "category", label: "카테고리", icon: Grid3X3 },
  { id: "group", label: "공동구매", icon: Users },
  { id: "cart", label: "장바구니", icon: ShoppingCart, badge: 2 },
  { id: "mypage", label: "마이페이지", icon: User },
]

export function BottomNavigation() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}

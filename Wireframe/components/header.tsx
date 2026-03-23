import { Bell } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <h1 className="text-xl font-bold text-primary">
          Green Hub
        </h1>

        {/* Notification */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          {/* Notification Dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </button>
      </div>
    </header>
  )
}

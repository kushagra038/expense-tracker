"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Moon, Sun, FileText } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface AppHeaderProps {
  onReportsClick?: () => void
}

export function AppHeader({ onReportsClick }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-foreground">ExpenseTracker</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <>
              {onReportsClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReportsClick}
                  className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="Download reports"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Reports</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 p-0"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

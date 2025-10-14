"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Compass, Bookmark, Settings, Menu, X, LogOut } from "lucide-react"

// Utility function to merge class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const sidebarItems = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "saved", label: "Saved", icon: Bookmark, showBadge: true },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userName, setUserName] = useState("")
  const [savedCount, setSavedCount] = useState(0)

  // Load user name and saved articles count from localStorage
  useEffect(() => {
    const loadUserData = () => {
      // Load user name
      const savedSettings = localStorage.getItem('newsChat-settings')
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          setUserName(parsed.name || "")
        } catch (e) {
          console.error("Failed to load user name:", e)
        }
      }

      // Load saved articles count
      const savedArticles = localStorage.getItem('newsChat-saved-articles')
      if (savedArticles) {
        try {
          const articles = JSON.parse(savedArticles)
          setSavedCount(Array.isArray(articles) ? articles.length : 0)
        } catch (e) {
          console.error("Failed to load saved articles:", e)
        }
      }
    }

    loadUserData()

    // Listen for storage changes and custom events
    const handleStorageChange = () => loadUserData()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('newsChat-update', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('newsChat-update', handleStorageChange)
    }
  }, [])

  // ✅ Modified Sign Out — no confirmation popup
  const handleSignOut = async () => {
    try {
      // Try to sign out from Firebase if available
      if (typeof window !== 'undefined') {
        const authModule = await import('@/lib/firebase').catch(() => null)
        const firebaseAuthModule = await import('firebase/auth').catch(() => null)

        if (authModule && firebaseAuthModule && authModule.auth) {
          await firebaseAuthModule.signOut(authModule.auth)
        }
      }
    } catch (error) {
      console.error("Firebase sign out error:", error)
    }

    // Clear all user data from localStorage
    localStorage.removeItem('newsChat-settings')
    localStorage.removeItem('newsChat-saved-articles')
    localStorage.removeItem('newsChat-cache')
    localStorage.removeItem('newsChat-theme')

    // Redirect to landing page
    window.location.href = "/"
  }

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "U"
    const words = name.trim().split(/\s+/)
    return words.length === 1
      ? words[0].charAt(0).toUpperCase()
      : (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
  }

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    if (!name) return "bg-gradient-to-br from-blue-500 to-blue-600"

    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
      "bg-gradient-to-br from-teal-500 to-teal-600",
      "bg-gradient-to-br from-red-500 to-red-600",
    ]

    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and User Avatar */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-sidebar-foreground">NewsChat</span>
            </div>

            {/* User Avatar */}
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer hover:scale-105 transition-transform",
                getAvatarColor(userName)
              )}
              title={userName || "User"}
            >
              {getInitials(userName)}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id

                return (
                  <li key={item.id}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-11",
                        isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                      )}
                      onClick={() => {
                        onSectionChange(item.id)
                        setIsCollapsed(true)
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1 text-left text-lg">{item.label}</span>
                      {item.showBadge && savedCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {savedCount}
                        </Badge>
                      )}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Sign Out Button */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span className="flex-1 text-left text-lg">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  )
}

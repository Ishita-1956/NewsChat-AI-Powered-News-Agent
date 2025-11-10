"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopFilterBar } from "@/components/top-filter-bar"
import { NewsSection } from "@/components/news-section"
import { ChatSection } from "@/components/chat-section"
import { SavedSection } from "@/components/saved-section"
import { NotificationsSection } from "@/components/notifications-section"
import { SettingsSection } from "@/components/settings-section"

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("discover")
  const [activeCategory, setActiveCategory] = useState("general")

  const renderMainContent = () => {
    switch (activeSection) {
      case "chat":
        return <ChatSection />
      case "discover":
        // Always show US news with publishedAt sorting
        return <NewsSection category={activeCategory} region="us" sortBy="publishedAt" />
      case "saved":
        return <SavedSection />
      case "notifications":
        return <NotificationsSection />
      case "settings":
        return <SettingsSection />
      default:
        return <NewsSection category={activeCategory} region="us" sortBy="publishedAt" />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 md:ml-64 flex flex-col overflow-hidden">
        {activeSection === "discover" && (
          <TopFilterBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        )}

        <div className="flex-1 overflow-auto">{renderMainContent()}</div>
      </main>
    </div>
  )
}
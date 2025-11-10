"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TopFilterBarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  { id: "general", label: "All" },
  { id: "technology", label: "Tech" },
  { id: "business", label: "Business" },
  { id: "sports", label: "Sports" },
  { id: "science", label: "Science" },
  { id: "entertainment", label: "Entertainment" },
  { id: "health", label: "Health" },
]

export function TopFilterBar({
  activeCategory,
  onCategoryChange,
}: TopFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-background border-b border-border">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            className={cn(
              "text-sm",
              activeCategory === category.id && "bg-primary text-primary-foreground"
            )}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
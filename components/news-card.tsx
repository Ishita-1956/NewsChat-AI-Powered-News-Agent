"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Bookmark, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import { summarizeArticle, type Article } from "@/lib/news-api"
import { useSavedArticles } from "@/hooks/use-saved-articles"

interface NewsCardProps {
  article: Article
}

export function NewsCard({ article }: NewsCardProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { saveArticle, unsaveArticle, isArticleSaved } = useSavedArticles()

  const isSaved = isArticleSaved(article.url)

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "Date not available"
    }

    const date = new Date(dateString)

    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString)
      return dateString
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSave = () => {
    if (isSaved) {
      unsaveArticle(article.url)
    } else {
      saveArticle(article)
    }
  }

  const handleSummarize = async () => {
    if (summary) {
      setSummary(null)
      return
    }

    setLoadingSummary(true)
    try {
      const content = article.content || article.description || ""
      const generatedSummary = await summarizeArticle(article.title, content)
      setSummary(generatedSummary)
      setIsExpanded(true)
    } catch (error) {
      setSummary("Failed to generate summary. Please try again.")
      setIsExpanded(true)
    } finally {
      setLoadingSummary(false)
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className="w-full bg-card hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <CardContent className="p-4">
        {/* Main Content Row */}
        <div className="flex gap-4">
          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.source.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(article.publishedAt)}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-card-foreground mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.description}
                </p>
              </div>
              
              {/* Image Thumbnail */}
              <div className="relative w-32 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                <Image
                  src={article.urlToImage || "/placeholder.svg?height=96&width=128&text=News"}
                  alt={article.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=96&width=128&text=News"
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(article.url, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Read More
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSummarize}
                disabled={loadingSummary}
              >
                {loadingSummary ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    AI Summary
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className={isSaved ? "text-primary" : ""}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpand}
                className="ml-auto"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    More
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            {/* Full Description */}
            {article.description && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground">
                  {article.description}
                </p>
              </div>
            )}

            {/* Author Info */}
            {article.author && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground">
                  By {article.author}
                </p>
              </div>
            )}

            {/* AI Summary Section */}
            {(summary || loadingSummary) && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Summary</span>
                </div>
                {loadingSummary ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Generating summary...
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{summary}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
// app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server"

const NEWS_API_KEY = process.env.NEWS_API_KEY
const NEWS_API_BASE_URL = "https://newsapi.org/v2"

// Map of supported countries for NewsAPI top-headlines endpoint
const SUPPORTED_COUNTRIES = new Set([
  'ae', 'ar', 'at', 'au', 'be', 'bg', 'br', 'ca', 'ch', 'cn', 'co', 'cu', 
  'cz', 'de', 'eg', 'fr', 'gb', 'gr', 'hk', 'hu', 'id', 'ie', 'il', 'in', 
  'it', 'jp', 'kr', 'lt', 'lv', 'ma', 'mx', 'my', 'ng', 'nl', 'no', 'nz', 
  'ph', 'pl', 'pt', 'ro', 'rs', 'ru', 'sa', 'se', 'sg', 'si', 'sk', 'th', 
  'tr', 'tw', 'ua', 'us', 've', 'za'
])

export async function GET(request: NextRequest) {
  if (!NEWS_API_KEY) {
    return NextResponse.json(
      { error: "NEWS_API_KEY is not configured. Please add it to your environment variables." },
      { status: 500 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const country = searchParams.get("country") || "us"
  const category = searchParams.get("category") || ""
  const sortBy = searchParams.get("sortBy") || "publishedAt"
  const pageSize = searchParams.get("pageSize") || "100"

  try {
    const countryCode = country.toLowerCase()
    
    // Check if country is supported
    if (!SUPPORTED_COUNTRIES.has(countryCode)) {
      console.warn(`⚠️ Country "${countryCode}" not supported by NewsAPI`)
      return NextResponse.json({
        error: `Country "${country}" is not supported. Please select a different region.`,
        articles: [],
        totalResults: 0
      }, { status: 400 })
    }

    // Build params object
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      pageSize: pageSize,
    })

    // Always add country parameter
    params.append("country", countryCode)

    // Add category if provided and not "general" or "all"
    if (category && category !== "general" && category !== "all") {
      params.append("category", category)
    }

    const url = `${NEWS_API_BASE_URL}/top-headlines?${params.toString()}`
    
    console.log("📡 Fetching news:", {
      country: countryCode,
      category: category || "all",
      sortBy: sortBy,
      url: url.replace(NEWS_API_KEY, "***")
    })
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ NewsAPI error:", errorData)
      return NextResponse.json(
        { 
          error: errorData.message || "Failed to fetch news from NewsAPI",
          articles: [],
          totalResults: 0
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Filter out articles with [Removed] content
    let articles = (data.articles || []).filter(
      (article: any) => 
        article.title !== "[Removed]" && 
        article.description !== "[Removed]" &&
        article.title &&
        article.description
    )

    // Handle client-side sorting
    if (sortBy === "popularity" && articles.length > 0) {
      // Sort by source name and author presence
      articles.sort((a: any, b: any) => {
        const aScore = (a.author ? 1 : 0) + (a.source?.name ? 1 : 0)
        const bScore = (b.author ? 1 : 0) + (b.source?.name ? 1 : 0)
        return bScore - aScore
      })
    } else if (sortBy === "relevancy" && articles.length > 0) {
      // Keep API order (already relevant)
    } else if (sortBy === "publishedAt" && articles.length > 0) {
      // Sort by date (most recent first)
      articles.sort((a: any, b: any) => {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
    }

    if (articles.length === 0) {
      console.warn(`⚠️ No articles found for ${countryCode.toUpperCase()} - ${category || 'all categories'}`)
      return NextResponse.json({
        articles: [],
        totalResults: 0,
        error: `No articles available for ${country.toUpperCase()} in this category. Try a different region or category.`
      })
    }

    console.log(`✅ Successfully fetched ${articles.length} articles for ${countryCode.toUpperCase()}`)

    return NextResponse.json({
      articles: articles,
      totalResults: articles.length,
    })
  } catch (error) {
    console.error("❌ Error fetching news:", error)
    return NextResponse.json(
      { 
        error: "An error occurred while fetching news",
        articles: [],
        totalResults: 0
      },
      { status: 500 }
    )
  }
}
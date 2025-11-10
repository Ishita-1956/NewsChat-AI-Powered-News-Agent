// lib/news-api.ts
export interface Article {
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

interface NewsResponse {
  articles: Article[]
  error?: string
}

export async function fetchNews(
  category: string,
  country: string,
  sortBy: string
): Promise<NewsResponse> {
  try {
    // Ensure country code is lowercase
    const countryCode = country.toLowerCase()
    
    const params = new URLSearchParams({
      country: countryCode,
      sortBy: sortBy,
      pageSize: "100",
    })

    // Only add category if it's not "general" or "all"
    if (category && category !== "general" && category !== "all") {
      params.append("category", category)
    }

    console.log("Fetching news with params:", {
      country: countryCode,
      category: category || "all",
      sortBy: sortBy
    })

    const response = await fetch(`/api/news?${params.toString()}`, {
      cache: 'no-store', // Ensure fresh data
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      return {
        articles: [],
        error: errorData.error || "Failed to fetch news"
      }
    }

    const data = await response.json()
    
    console.log(`✅ Received ${data.articles?.length || 0} articles`)
    
    return {
      articles: data.articles || [],
      error: data.error
    }
  } catch (error) {
    console.error("Error fetching news:", error)
    return {
      articles: [],
      error: "Network error occurred while fetching news"
    }
  }
}

export async function summarizeArticle(
  title: string,
  content: string
): Promise<string> {
  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate summary")
    }

    const data = await response.json()
    return data.summary
  } catch (error) {
    console.error("Error generating summary:", error)
    throw error
  }
}
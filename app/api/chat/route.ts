import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Country code mapping for better NewsAPI results
const COUNTRY_CODES: { [key: string]: string } = {
  usa: "us", "united states": "us", america: "us", us: "us",
  uk: "gb", "united kingdom": "gb", britain: "gb", england: "gb",
  india: "in", bharat: "in",
  china: "cn", japan: "jp", france: "fr", germany: "de",
  canada: "ca", australia: "au", russia: "ru", brazil: "br",
  italy: "it", spain: "es", mexico: "mx", korea: "kr",
  indonesia: "id", turkey: "tr", netherlands: "nl", switzerland: "ch",
  argentina: "ar", egypt: "eg", pakistan: "pk", bangladesh: "bd",
};

// Category mapping
const CATEGORIES = ["business", "entertainment", "general", "health", "science", "sports", "technology"];

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
}

// Extract parameters from user query using AI
async function extractNewsParameters(userMessage: string) {
  try {
    const systemPrompt = `You are a news query analyzer. Extract the following from the user's message:
1. Country/region (if mentioned)
2. Date range (e.g., "today", "yesterday", "last week", "last 3 days")
3. Topic/category (technology, business, sports, etc.)
4. Specific keywords

Respond ONLY with a JSON object like:
{
  "country": "india" or null,
  "dateRange": "today" or "yesterday" or "last_week" or "last_3_days" or null,
  "category": "technology" or "business" or null,
  "keywords": "AI, GPT" or null,
  "query": "cleaned search query"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Error extracting parameters:", error);
    return { query: userMessage };
  }
}

// Calculate date based on user's date range
function calculateDateRange(dateRange: string | null): { from: string; to: string } {
  const now = new Date();
  let from = new Date();
  
  switch (dateRange) {
    case "today":
      from = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "yesterday":
      from = new Date(now.setDate(now.getDate() - 1));
      from.setHours(0, 0, 0, 0);
      break;
    case "last_week":
      from = new Date(now.setDate(now.getDate() - 7));
      break;
    case "last_3_days":
      from = new Date(now.setDate(now.getDate() - 3));
      break;
    default:
      from = new Date(now.setDate(now.getDate() - 2)); // Default to last 2 days
  }

  return {
    from: from.toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  };
}

// Fetch news from NewsAPI with intelligent parameters
async function fetchNews(params: any): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    throw new Error("NEWS_API_KEY not configured");
  }

  const { country, dateRange, category, keywords, query } = params;
  
  // Determine country code
  const countryCode = country ? COUNTRY_CODES[country.toLowerCase()] || null : null;
  
  // Calculate dates
  const dates = calculateDateRange(dateRange);
  
  // Build NewsAPI URL
  let apiUrl = "https://newsapi.org/v2/";
  
  // Use top-headlines if country is specified, otherwise use everything
  if (countryCode && !keywords) {
    apiUrl += "top-headlines";
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      country: countryCode,
      pageSize: "10",
    });
    
    if (category && CATEGORIES.includes(category.toLowerCase())) {
      params.append("category", category.toLowerCase());
    }
    
    if (query) {
      params.append("q", query);
    }
    
    apiUrl += `?${params.toString()}`;
  } else {
    // Use everything endpoint for more specific searches
    apiUrl += "everything";
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      pageSize: "10",
      sortBy: "publishedAt",
      language: "en",
      from: dates.from,
      to: dates.to,
    });
    
    // Build search query
    let searchQuery = query || keywords || "";
    if (country) {
      searchQuery += ` ${country}`;
    }
    if (category) {
      searchQuery += ` ${category}`;
    }
    
    params.append("q", searchQuery.trim() || "news");
    apiUrl += `?${params.toString()}`;
  }

  console.log("Fetching from NewsAPI:", apiUrl.replace(NEWS_API_KEY, "***"));

  const response = await fetch(apiUrl);
  const data = await response.json();

  if (data.status !== "ok") {
    throw new Error(data.message || "Failed to fetch news");
  }

  return data.articles?.slice(0, 8).map((article: any) => ({
    title: article.title,
    description: article.description || "",
    url: article.url,
    source: article.source.name,
    publishedAt: article.publishedAt,
    urlToImage: article.urlToImage,
  })) || [];
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Step 1: Extract parameters from user message
    const params = await extractNewsParameters(message);
    console.log("Extracted parameters:", params);

    // Step 2: Fetch relevant news articles
    let articles: NewsArticle[] = [];
    try {
      articles = await fetchNews(params);
      console.log(`Found ${articles.length} articles`);
    } catch (error: any) {
      console.error("News fetch error:", error);
      // Continue with AI response even if news fetch fails
    }

    // Step 3: Generate AI response with context
    const systemPrompt = `You are an intelligent news assistant. The user asked: "${message}"

${articles.length > 0 ? `I found ${articles.length} relevant news articles. Here are the details:

${articles.map((a, i) => `${i + 1}. **${a.title}**
   Source: ${a.source}
   Published: ${new Date(a.publishedAt).toLocaleDateString()}
   Summary: ${a.description || "No description available"}
`).join("\n")}` : "I couldn't find specific news articles for this query."}

Your task:
1. Directly answer the user's question based on the articles found
2. If they asked about a specific country/date/topic, acknowledge that in your response
3. Provide a clear, structured summary of the news
4. Mention the sources naturally in your response
5. If no articles found, explain why and suggest alternative queries
6. Keep response concise but informative (2-4 paragraphs)
7. Use a friendly, conversational tone

Do NOT say "based on the articles provided" or similar phrases. Just naturally incorporate the information.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history for context
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory.slice(-4));
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const aiResponse = completion.choices[0]?.message?.content || 
      "I'm having trouble generating a response. Please try again.";

    return NextResponse.json({
      response: aiResponse,
      articles: articles,
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
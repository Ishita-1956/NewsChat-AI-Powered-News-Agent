"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Bot, User, Loader2, AlertCircle, Newspaper, ExternalLink, Calendar, TrendingUp, History, Trash2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  articles?: NewsArticle[];
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

const suggestedQueries = [
  "Latest news from India",
  "Technology news from USA today",
  "Business headlines this week",
  "Breaking news from yesterday",
  "Science news from last 3 days",
  "Sports news worldwide",
];

export function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "👋 Hello! I'm your **NewsChat AI Assistant**. I can help you discover news from any country, date, or topic.\n\n**What I can do:**\n- Fetch news from specific countries (e.g., 'news from India', 'USA headlines')\n- Get news from specific dates (e.g., 'yesterday's news', 'news from last week')\n- Find news by topic and location (e.g., 'technology news from UK')\n- Provide detailed analysis with credible sources\n- Answer questions about current events\n\nJust ask me anything! Be specific about country, date, or topic for best results.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat histories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('newsChat-histories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const histories = parsed.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
          messages: h.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setChatHistories(histories);
      } catch (e) {
        console.error('Failed to load chat histories:', e);
      }
    }
    
    // Generate current chat ID
    const chatId = `chat-${Date.now()}`;
    setCurrentChatId(chatId);
  }, []);

  // Save current chat to history when messages change
  useEffect(() => {
    if (messages.length > 1 && currentChatId) {
      const chatTitle = messages[1]?.content.substring(0, 50) + '...';
      const currentChat: ChatHistory = {
        id: currentChatId,
        title: chatTitle,
        messages: messages,
        timestamp: new Date()
      };

      setChatHistories(prev => {
        const filtered = prev.filter(h => h.id !== currentChatId);
        const updated = [currentChat, ...filtered].slice(0, 20); // Keep last 20 chats
        localStorage.setItem('newsChat-histories', JSON.stringify(updated));
        return updated;
      });
    }
  }, [messages, currentChatId]);

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputValue.trim();
    if (!message || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    // Add placeholder bot message for streaming
    const botMessageId = (Date.now() + 1).toString();
    const placeholderMessage: Message = {
      id: botMessageId,
      content: "",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, placeholderMessage]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get response");
      }

      const data = await response.json();
      const fullResponse = data.response || "I'm having trouble responding right now. Please try again.";
      const articles = data.articles || [];

      // Stream the response character by character
      let currentText = "";
      const words = fullResponse.split(" ");
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? " " : "") + words[i];
        
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: currentText, articles: i === words.length - 1 ? articles : undefined }
              : msg
          )
        );
        
        // Adjust delay for smoother streaming (faster)
        await new Promise(resolve => setTimeout(resolve, 30));
      }

    } catch (error: any) {
      console.error("Chat error:", error);
      let errorMessage = "Unknown error";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Request timed out. The AI is taking too long to respond.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);

      setMessages((prev) => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { 
                ...msg, 
                content: error.name === "AbortError"
                  ? "⏱️ Sorry, that took too long to process. Please try asking in a different way."
                  : "😔 I'm experiencing technical difficulties. Please try again in a moment."
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatHistory = (history: ChatHistory) => {
    setMessages(history.messages);
    setCurrentChatId(history.id);
    setShowHistory(false);
  };

  const startNewChat = () => {
    setMessages([
      {
        id: "1",
        content:
          "👋 Hello! I'm your **NewsChat AI Assistant**. I can help you discover news from any country, date, or topic.\n\n**What I can do:**\n- Fetch news from specific countries (e.g., 'news from India', 'USA headlines')\n- Get news from specific dates (e.g., 'yesterday's news', 'news from last week')\n- Find news by topic and location (e.g., 'technology news from UK')\n- Provide detailed analysis with credible sources\n- Answer questions about current events\n\nJust ask me anything! Be specific about country, date, or topic for best results.",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setCurrentChatId(`chat-${Date.now()}`);
    setShowHistory(false);
  };

  const deleteChatHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistories(prev => {
      const updated = prev.filter(h => h.id !== id);
      localStorage.setItem('newsChat-histories', JSON.stringify(updated));
      return updated;
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatArticleDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: 'numeric' });
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2 last:mb-0 text-sm">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex h-full bg-gradient-to-b from-background to-muted/20">
      {/* Chat History Sidebar */}
      <div className={`${showHistory ? 'w-64' : 'w-0'} transition-all duration-300 border-r overflow-hidden`}>
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Chat History</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowHistory(false)}>✕</Button>
          </div>
          <Button onClick={startNewChat} size="sm" className="w-full mb-4 text-xs">
            + New Chat
          </Button>
          <div className="space-y-2">
            {chatHistories.map(history => (
              <div
                key={history.id}
                onClick={() => loadChatHistory(history)}
                className={`p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors ${currentChatId === history.id ? 'bg-muted' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium line-clamp-2 flex-1">{history.title}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => deleteChatHistory(history.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(history.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {error && error.includes("OPENAI_API_KEY") && (
          <Alert className="m-6 mb-0 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                  API Configuration Required
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Add <code className="bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded text-xs">OPENAI_API_KEY=your_key_here</code> to your environment
                  variables.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card className="flex-1 m-6 mb-0 flex flex-col shadow-lg border-2">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 py-4">
            <CardTitle className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-base font-bold">NewsChat AI Assistant</div>
                  <div className="text-xs font-normal text-muted-foreground mt-0.5">
                    Developed by Ishita • Real-time News • Global Coverage
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs"
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-6">
            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-300`}
                >
                  {message.sender === "bot" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%] gap-3">
                    <div
                      className={`rounded-2xl p-3 shadow-sm ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted/80 text-foreground rounded-tl-sm border"
                      }`}
                    >
                      <div className="leading-relaxed whitespace-pre-wrap">
                        {renderFormattedText(message.content)}
                      </div>

                      <p className={`text-xs mt-2 ${message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>

                    {message.articles && message.articles.length > 0 && (
                      <div className="space-y-3 w-full">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span>Related Articles ({message.articles.length})</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {message.articles.map((article, idx) => (
                            <Card key={idx} className="overflow-hidden hover:shadow-md transition-all duration-200 border hover:border-primary/50 flex flex-col">
                              <CardContent className="p-0 flex flex-col h-full">
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex flex-col h-full hover:bg-muted/50 transition-colors"
                                >
                                  {article.urlToImage && (
                                    <div className="relative h-28 w-full overflow-hidden bg-muted flex-shrink-0">
                                      <img
                                        src={article.urlToImage}
                                        alt={article.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
                                        <Newspaper className="h-3 w-3 inline mr-1" />
                                        {article.source}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="p-3 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h4 className="font-semibold text-xs leading-snug line-clamp-2 flex-1">
                                        {article.title}
                                      </h4>
                                      <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    </div>
                                    
                                    {article.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed flex-1">
                                        {article.description}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center justify-between text-xs mt-auto pt-2 border-t">
                                      <span className="text-muted-foreground font-medium truncate flex-1">
                                        {article.source}
                                      </span>
                                      <span className="flex items-center gap-1 text-muted-foreground flex-shrink-0 ml-2">
                                        <Calendar className="h-3 w-3" />
                                        {formatArticleDate(article.publishedAt)}
                                      </span>
                                    </div>
                                  </div>
                                </a>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {message.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted/80 rounded-2xl rounded-tl-sm p-3 border shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Searching news and analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20">
                <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  Try these examples:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-2"
                      onClick={() => handleSendMessage(query)}
                      disabled={isLoading}
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="E.g., 'News from India today', 'Technology news from USA last week', 'Breaking news yesterday'"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  className="pr-12 h-10 text-sm border-2 focus:border-primary shadow-sm"
                  disabled={isLoading}
                />
                <Newspaper className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <Button 
                onClick={() => handleSendMessage()} 
                size="icon" 
                disabled={isLoading || !inputValue.trim()}
                className="h-10 w-10 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
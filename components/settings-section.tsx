"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Moon, Sun, User, Globe, Zap, Download, Trash2, RefreshCw, Shield } from "lucide-react"
import { useState, useEffect } from "react"

export function SettingsSection() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // User profile
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [updating, setUpdating] = useState(false)

  // Preferences
  const [language, setLanguage] = useState("en")
  const [region, setRegion] = useState("us")
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)
  const [compactView, setCompactView] = useState(false)

  // Privacy
  const [analytics, setAnalytics] = useState(true)
  const [personalization, setPersonalization] = useState(true)

  useEffect(() => {
  setMounted(true)

  // Try to load theme from localStorage
  const savedTheme = localStorage.getItem('newsChat-theme') as 'light' | 'dark' | null

  if (savedTheme) {
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  } else {
    // ✅ Always default to light mode (ignore system theme)
    setTheme('light')
    document.documentElement.classList.remove('dark')
    localStorage.setItem('newsChat-theme', 'light')
  }

  // Load settings from localStorage
  const savedSettings = localStorage.getItem('newsChat-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      setName(parsed.name ?? "")
      setEmail(parsed.email ?? "")
      setLanguage(parsed.language ?? "en")
      setRegion(parsed.region ?? "us")
      setAutoRefresh(parsed.autoRefresh ?? false)
      setSoundEffects(parsed.soundEffects ?? true)
      setCompactView(parsed.compactView ?? false)
      setAnalytics(parsed.analytics ?? true)
      setPersonalization(parsed.personalization ?? true)
    } catch (e) {
      console.error("Failed to load settings:", e)
    }
  }
}, [])


  useEffect(() => {
    if (mounted) {
      // Save settings to localStorage
      const settings = {
        name,
        email,
        language,
        region,
        autoRefresh,
        soundEffects,
        compactView,
        analytics,
        personalization,
      }
      localStorage.setItem('newsChat-settings', JSON.stringify(settings))
      
      // Dispatch event so sidebar can update
      window.dispatchEvent(new Event('storage'))
    }
  }, [mounted, name, email, language, region, autoRefresh, soundEffects, compactView, analytics, personalization])

  const handleUpdateProfile = () => {
    if (!name.trim()) return

    setUpdating(true)
    // Simulate API call
    setTimeout(() => {
      setUpdating(false)
      alert("Profile updated successfully!")
    }, 500)
  }

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('newsChat-theme', newTheme)
    document.documentElement.classList.toggle('dark', checked)
  }

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear all cached data?")) {
      localStorage.removeItem('newsChat-cache')
      alert("Cache cleared successfully!")
    }
  }

  const handleResetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      localStorage.removeItem('newsChat-settings')
      setName("")
      setEmail("")
      setLanguage("en")
      setRegion("us")
      setAutoRefresh(false)
      setSoundEffects(true)
      setCompactView(false)
      setAnalytics(true)
      setPersonalization(true)
      alert("Settings reset to default!")
    }
  }

  const handleExportData = () => {
    const data = {
      settings: {
        name,
        email,
        language,
        region,
        autoRefresh,
        soundEffects,
        compactView,
        analytics,
        personalization,
      },
      theme,
      exportDate: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'newsChat-settings-export.json'
    a.click()
    URL.revokeObjectURL(url)
    alert("Settings exported successfully!")
  }

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        </div>
        <div className="space-y-6">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how NewsChat looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={theme === "dark"} 
                onCheckedChange={handleThemeChange}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-view" className="font-medium">Compact View</Label>
                <p className="text-sm text-muted-foreground">Show more content in less space</p>
              </div>
              <Switch 
                id="compact-view" 
                checked={compactView} 
                onCheckedChange={setCompactView}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <div className="flex gap-2">
                <Input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                />
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updating || !name.trim()}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updating ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Your initials will appear in the sidebar</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Control your data and privacy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics" className="font-medium">Analytics</Label>
                <p className="text-sm text-muted-foreground">Help improve NewsChat with usage data</p>
              </div>
              <Switch 
                id="analytics" 
                checked={analytics} 
                onCheckedChange={setAnalytics}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="personalization" className="font-medium">Personalization</Label>
                <p className="text-sm text-muted-foreground">Personalized recommendations based on your reading</p>
              </div>
              <Switch 
                id="personalization" 
                checked={personalization} 
                onCheckedChange={setPersonalization}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage your stored data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={handleClearCache}
            >
              <Trash2 className="h-4 w-4" />
              Clear Cache
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
              onClick={handleResetSettings}
            >
              <RefreshCw className="h-4 w-4" />
              Reset All Settings
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About NewsChat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Version:</strong> 1.0.0</p>
            <p><strong className="text-foreground">Powered by:</strong> Ishita</p>
            <p><strong className="text-foreground">Last Updated:</strong> October 2025</p>
            <p className="pt-2">
              NewsChat uses AI to provide intelligent news aggregation and analysis from sources worldwide.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
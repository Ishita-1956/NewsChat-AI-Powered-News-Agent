"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Settings, Moon, Sun, User, Zap, Download, Trash2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

export function SettingsSection() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // User profile
  const [name, setName] = useState("")
  const [updating, setUpdating] = useState(false)

  // Preferences
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)
  const [compactView, setCompactView] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load display name from localStorage
    const savedName = localStorage.getItem('newsChat-displayName')
    if (savedName) {
      setName(savedName)
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('newsChat-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setAutoRefresh(parsed.autoRefresh ?? false)
        setSoundEffects(parsed.soundEffects ?? true)
        setCompactView(parsed.compactView ?? false)
      } catch (e) {
        console.error("Failed to load settings:", e)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      // Save settings to localStorage
      const settings = {
        autoRefresh,
        soundEffects,
        compactView,
      }
      localStorage.setItem('newsChat-settings', JSON.stringify(settings))
      
      // Dispatch event so sidebar can update
      window.dispatchEvent(new Event('storage'))
    }
  }, [mounted, autoRefresh, soundEffects, compactView])

  const handleUpdateProfile = () => {
    if (!name.trim()) {
      alert("Please enter a display name")
      return
    }

    setUpdating(true)
    // Save display name to localStorage
    localStorage.setItem('newsChat-displayName', name.trim())
    
    // Dispatch event so sidebar can update
    window.dispatchEvent(new Event('storage'))
    
    setTimeout(() => {
      setUpdating(false)
      alert("✅ Display name updated successfully!")
    }, 300)
  }

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear all cached data?")) {
      localStorage.removeItem('newsChat-cache')
      localStorage.removeItem('newsChat-histories')
      alert("✅ Cache cleared successfully!")
    }
  }

  const handleResetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      localStorage.removeItem('newsChat-settings')
      localStorage.removeItem('newsChat-displayName')
      setName("")
      setAutoRefresh(false)
      setSoundEffects(true)
      setCompactView(false)
      setTheme('system')
      
      // Dispatch event so sidebar can update
      window.dispatchEvent(new Event('storage'))
      
      alert("✅ Settings reset to default!")
    }
  }

  const handleExportData = () => {
    const data = {
      settings: {
        name,
        autoRefresh,
        soundEffects,
        compactView,
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
    alert("✅ Settings exported successfully!")
  }

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
        </div>
        <div className="space-y-6 text-sm">Loading...</div>
      </div>
    )
  }

  const isDarkMode = theme === "dark"

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Appearance
            </CardTitle>
            <CardDescription className="text-sm">Customize how NewsChat looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="font-medium text-sm">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark theme (Current: {theme})
                </p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={isDarkMode} 
                onCheckedChange={handleThemeChange}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-view" className="font-medium text-sm">Compact View</Label>
                <p className="text-xs text-muted-foreground">Show more content in less space</p>
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
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Profile
            </CardTitle>
            <CardDescription className="text-sm">Manage your display name</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-sm">Display Name</Label>
              <div className="flex gap-2">
                <Input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  className="text-sm"
                />
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updating || !name.trim()}
                  size="default"
                  className="bg-green-600 hover:bg-green-700 text-sm"
                >
                  {updating ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Your initials will appear in the sidebar</p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Preferences
            </CardTitle>
            <CardDescription className="text-sm">Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-refresh" className="font-medium text-sm">Auto Refresh</Label>
                <p className="text-xs text-muted-foreground">Automatically refresh news feed</p>
              </div>
              <Switch 
                id="auto-refresh" 
                checked={autoRefresh} 
                onCheckedChange={setAutoRefresh}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound-effects" className="font-medium text-sm">Sound Effects</Label>
                <p className="text-xs text-muted-foreground">Play sounds for notifications</p>
              </div>
              <Switch 
                id="sound-effects" 
                checked={soundEffects} 
                onCheckedChange={setSoundEffects}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Data Management
            </CardTitle>
            <CardDescription className="text-sm">Manage your stored data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-sm"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-sm"
              onClick={handleClearCache}
            >
              <Trash2 className="h-4 w-4" />
              Clear Cache & History
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
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
            <CardTitle className="text-base">About NewsChat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">Version:</strong> 1.0.0</p>
            <p><strong className="text-foreground">Developed by:</strong> Ishita</p>
            <p><strong className="text-foreground">Last Updated:</strong> November 2025</p>
            <p className="pt-2">
              NewsChat uses AI to provide intelligent news aggregation and analysis from sources worldwide.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
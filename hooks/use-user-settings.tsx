// hooks/use-user-settings.ts
import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'

interface UserSettings {
  theme: 'light' | 'dark'
  autoRefresh: boolean
  soundEffects: boolean
  compactView: boolean
  displayName: string
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  autoRefresh: false,
  soundEffects: true,
  compactView: false,
  displayName: ''
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  // Load settings when user changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserSettings(user.email!)
      } else {
        setSettings(DEFAULT_SETTINGS)
        applyTheme('light')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loadUserSettings = (userEmail: string) => {
    const storageKey = `newsChat-settings-${userEmail}`
    const stored = localStorage.getItem(storageKey)
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSettings(parsed)
        applyTheme(parsed.theme)
      } catch (e) {
        console.error('Failed to parse settings:', e)
        setSettings(DEFAULT_SETTINGS)
      }
    } else {
      setSettings(DEFAULT_SETTINGS)
      applyTheme('light')
    }
  }

  const saveUserSettings = (newSettings: Partial<UserSettings>) => {
    const user = auth.currentUser
    if (!user) return

    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    const storageKey = `newsChat-settings-${user.email}`
    localStorage.setItem(storageKey, JSON.stringify(updated))

    // Apply theme if it changed
    if (newSettings.theme) {
      applyTheme(newSettings.theme)
    }

    // Dispatch event for other components
    window.dispatchEvent(new Event('storage'))
  }

  const applyTheme = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const resetSettings = () => {
    const user = auth.currentUser
    if (!user) return

    const storageKey = `newsChat-settings-${user.email}`
    localStorage.removeItem(storageKey)
    setSettings(DEFAULT_SETTINGS)
    applyTheme('light')
    window.dispatchEvent(new Event('storage'))
  }

  return {
    settings,
    loading,
    saveUserSettings,
    resetSettings
  }
}
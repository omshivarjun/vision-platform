import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface DNDContextType {
  isDNDEnabled: boolean
  toggleDND: () => void
  setDNDEnabled: (enabled: boolean) => void
  dndSettings: DNDSettings
  updateDNSSettings: (settings: Partial<DNDSettings>) => void
}

interface DNDSettings {
  suppressNotifications: boolean
  suppressSounds: boolean
  suppressVisualAlerts: boolean
  autoDisableAt: string | null // Time to automatically disable DND (e.g., "09:00")
  quietHours: {
    start: string
    end: string
  }
}

const DNDContext = createContext<DNDContextType | undefined>(undefined)

export function DNDProvider({ children }: { children: React.ReactNode }) {
  const [isDNDEnabled, setIsDNDEnabled] = useState(false)
  const [dndSettings, setDndSettings] = useState<DNDSettings>({
    suppressNotifications: true,
    suppressSounds: true,
    suppressVisualAlerts: false,
    autoDisableAt: null,
    quietHours: {
      start: '22:00',
      end: '08:00'
    }
  })

  // Load DND state from localStorage on mount
  useEffect(() => {
    const savedDNDState = localStorage.getItem('vision-dnd-enabled')
    const savedDNSSettings = localStorage.getItem('vision-dnd-settings')
    
    if (savedDNDState) {
      setIsDNDEnabled(JSON.parse(savedDNDState))
    }
    
    if (savedDNSSettings) {
      setDndSettings(JSON.parse(savedDNSSettings))
    }
  }, [])

  // Save DND state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('vision-dnd-enabled', JSON.stringify(isDNDEnabled))
  }, [isDNDEnabled])

  // Save DND settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('vision-dnd-settings', JSON.stringify(dndSettings))
  }, [dndSettings])

  // Check for quiet hours
  useEffect(() => {
    if (dndSettings.quietHours.start && dndSettings.quietHours.end) {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()
      
      const [startHour, startMinute] = dndSettings.quietHours.start.split(':').map(Number)
      const [endHour, endMinute] = dndSettings.quietHours.end.split(':').map(Number)
      
      const startTime = startHour * 60 + startMinute
      const endTime = endHour * 60 + endMinute
      
      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      let shouldBeQuiet = false
      if (startTime > endTime) {
        // Overnight range
        shouldBeQuiet = currentTime >= startTime || currentTime <= endTime
      } else {
        // Same day range
        shouldBeQuiet = currentTime >= startTime && currentTime <= endTime
      }
      
      if (shouldBeQuiet && !isDNDEnabled) {
        setIsDNDEnabled(true)
        toast.success('Quiet hours activated - DND mode enabled')
      } else if (!shouldBeQuiet && isDNDEnabled && dndSettings.autoDisableAt) {
        setIsDNDEnabled(false)
        toast.success('Quiet hours ended - DND mode disabled')
      }
    }
  }, [dndSettings.quietHours, isDNDEnabled, dndSettings.autoDisableAt])

  const toggleDND = () => {
    const newState = !isDNDEnabled
    setIsDNDEnabled(newState)
    
    if (newState) {
      toast.success('Do Not Disturb mode enabled', {
        icon: '🔇',
        duration: 2000
      })
    } else {
      toast.success('Do Not Disturb mode disabled', {
        icon: '🔊',
        duration: 2000
      })
    }
  }

  const setDNDEnabled = (enabled: boolean) => {
    setIsDNDEnabled(enabled)
    
    if (enabled) {
      toast.success('Do Not Disturb mode enabled', {
        icon: '🔇',
        duration: 2000
      })
    } else {
      toast.success('Do Not Disturb mode disabled', {
        icon: '🔊',
        duration: 2000
      })
    }
  }

  const updateDNSSettings = (settings: Partial<DNDSettings>) => {
    setDndSettings(prev => ({ ...prev, ...settings }))
  }

  const value: DNDContextType = {
    isDNDEnabled,
    toggleDND,
    setDNDEnabled,
    dndSettings,
    updateDNSSettings
  }

  return <DNDContext.Provider value={value}>{children}</DNDContext.Provider>
}

export function useDND() {
  const context = useContext(DNDContext)
  if (context === undefined) {
    throw new Error('useDND must be used within a DNDProvider')
  }
  return context
}

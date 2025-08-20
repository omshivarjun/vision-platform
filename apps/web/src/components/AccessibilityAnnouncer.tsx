import React, { useEffect, useRef } from 'react'

interface AccessibilityAnnouncerProps {
  message?: string
  priority?: 'polite' | 'assertive'
  className?: string
}

/**
 * Accessibility Announcer Component
 * Provides aria-live regions for screen reader announcements
 * This component ensures that important events are announced to screen readers
 * even when they might be missed by the toast system
 */
export const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({
  message = '',
  priority = 'polite',
  className = ''
}) => {
  const announcerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message && announcerRef.current) {
      // Force screen reader to announce the message
      announcerRef.current.textContent = message
      
      // Clear the message after a short delay to allow for announcement
      const timer = setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = ''
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div
      ref={announcerRef}
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    />
  )
}

/**
 * Hook for managing accessibility announcements
 * Provides a centralized way to announce important events to screen readers
 */
export const useAccessibilityAnnouncer = () => {
  const [announcement, setAnnouncement] = React.useState('')
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>('polite')

  const announce = React.useCallback((message: string, announcementPriority: 'polite' | 'assertive' = 'polite') => {
    setPriority(announcementPriority)
    setAnnouncement(message)
    
    // Clear the announcement after a short delay
    setTimeout(() => {
      setAnnouncement('')
    }, 100)
  }, [])

  const announcePolite = React.useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  const announceAssertive = React.useCallback((message: string) => {
    announce(message, 'assertive')
  }, [announce])

  return {
    announcement,
    priority,
    announce,
    announcePolite,
    announceAssertive
  }
}



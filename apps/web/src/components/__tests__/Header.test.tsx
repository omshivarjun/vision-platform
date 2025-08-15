import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../Header'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { AuthProvider } from '../../contexts/AuthContext'
import { DNDProvider } from '../../contexts/DNDContext'

// Mock the hooks
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: false,
    setTheme: jest.fn(),
  }),
}))

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: true,
  }),
}))

jest.mock('../../hooks/useDND', () => ({
  useDND: () => ({
    isDNDEnabled: false,
    toggleDND: jest.fn(),
    setDNDEnabled: jest.fn(),
    dndSettings: {
      suppressNotifications: false,
      suppressSounds: false,
      suppressVisualAlerts: false,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
      autoDisableAt: null,
    },
    updateDNSSettings: jest.fn(),
  }),
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DNDProvider>
            {component}
          </DNDProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('Header Component', () => {
  beforeEach(() => {
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    })
  })

  it('renders without crashing', () => {
    renderWithProviders(<Header />)
    expect(screen.getByText('Vision Platform')).toBeInTheDocument()
  })

  it('displays user information when authenticated', () => {
    renderWithProviders(<Header />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows navigation links', () => {
    renderWithProviders(<Header />)
    
    expect(screen.getByText('Translation')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Assistant')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Payment')).toBeInTheDocument()
    expect(screen.getByText('Accessibility')).toBeInTheDocument()
  })

  it('has a theme toggle button', () => {
    renderWithProviders(<Header />)
    const themeButton = screen.getByTitle('Switch to light mode')
    expect(themeButton).toBeInTheDocument()
  })

  it('has a user menu dropdown', () => {
    renderWithProviders(<Header />)
    const userButton = screen.getByText('John Doe')
    fireEvent.click(userButton)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('applies scrolled class when scrolling', async () => {
    renderWithProviders(<Header />)
    
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', {
      value: 100,
      writable: true,
    })
    
    // Trigger scroll event
    fireEvent.scroll(window)
    
    await waitFor(() => {
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('bg-white/95', 'backdrop-blur-sm', 'shadow-lg')
    })
  })

  it('navigates to correct routes when clicking navigation links', () => {
    renderWithProviders(<Header />)
    
    const translationLink = screen.getByText('Translation')
    fireEvent.click(translationLink)
    
    // Check if the link has the correct href
    expect(translationLink.closest('a')).toHaveAttribute('href', '/translation')
  })

  it('handles mobile menu toggle', () => {
    renderWithProviders(<Header />)
    
    const mobileMenuButton = screen.getByLabelText('Open main menu')
    fireEvent.click(mobileMenuButton)
    
    // Check if mobile menu is expanded
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes mobile menu when clicking outside', () => {
    renderWithProviders(<Header />)
    
    const mobileMenuButton = screen.getByLabelText('Open main menu')
    fireEvent.click(mobileMenuButton)
    
    // Click outside the menu
    fireEvent.click(document.body)
    
    // Check if mobile menu is closed
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('displays correct theme icon based on current theme', () => {
    renderWithProviders(<Header />)
    
    // Should show moon icon for light theme
    const themeButton = screen.getByTitle('Switch to light mode')
    expect(themeButton.querySelector('svg')).toBeInTheDocument()
  })

  it('handles user logout', () => {
    const mockLogout = jest.fn()
    jest.mocked(require('../../hooks/useAuth').useAuth).mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
      login: jest.fn(),
      logout: mockLogout,
      isAuthenticated: true,
    })

    renderWithProviders(<Header />)
    
    const userButton = screen.getByText('John Doe')
    fireEvent.click(userButton)
    
    const signOutButton = screen.getByText('Sign out')
    fireEvent.click(signOutButton)
    
    expect(mockLogout).toHaveBeenCalled()
  })

  it('handles profile navigation', () => {
    renderWithProviders(<Header />)
    
    const userButton = screen.getByText('John Doe')
    fireEvent.click(userButton)
    
    const profileButton = screen.getByText('Profile')
    expect(profileButton.closest('a')).toHaveAttribute('href', '/profile')
  })

  it('applies correct styling classes', () => {
    renderWithProviders(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass(
      'fixed',
      'top-0',
      'left-0',
      'right-0',
      'z-50',
      'transition-all',
      'duration-300'
    )
  })

  it('handles window resize events', () => {
    renderWithProviders(<Header />)
    
    // Simulate mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      value: 768,
      writable: true,
    })
    
    fireEvent.resize(window)
    
    // Should show mobile menu button
    expect(screen.getByLabelText('Open main menu')).toBeInTheDocument()
  })

  it('maintains accessibility features', () => {
    renderWithProviders(<Header />)
    
    // Check for proper ARIA labels
    expect(screen.getByLabelText('Open main menu')).toBeInTheDocument()
    expect(screen.getByLabelText('Close main menu')).toBeInTheDocument()
    
    // Check for proper roles
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})

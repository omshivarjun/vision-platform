import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMsal } from '@azure/msal-react'
import { authApi } from '../services/api'
import { isMsalConfigured } from '../auth/msalConfig'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin' | 'moderator'
  provider?: 'email' | 'microsoft'
  preferences?: {
    language: string
    theme: string
    accessibility: {
      highContrast: boolean
      largeText: boolean
      voiceSpeed: number
      hapticFeedback: boolean
    }
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  // Microsoft auth methods
  loginWithMicrosoft: () => Promise<void>
  isMicrosoftConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { instance, accounts } = useMsal()

  // Check if Microsoft auth is configured
  const isMicrosoftConfigured = isMsalConfigured()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const msalAccount = localStorage.getItem('msalAccount')
    
    if (token || msalAccount) {
      validateToken()
    } else {
      setIsLoading(false)
    }
  }, [])

  // Handle MSAL account changes
  useEffect(() => {
    if (accounts.length > 0 && !user) {
      const msalAccount = accounts[0]
      const msalUser: User = {
        id: msalAccount.localAccountId || msalAccount.homeAccountId || '',
        email: msalAccount.username || '',
        firstName: msalAccount.name?.split(' ')[0] || '',
        lastName: msalAccount.name?.split(' ').slice(1).join(' ') || '',
        role: 'user',
        provider: 'microsoft',
      }
      setUser(msalUser)
      setIsLoading(false)
    }
  }, [accounts, user])

  const validateToken = async () => {
    try {
      // Check if we have a Microsoft account first
      if (accounts.length > 0) {
        const msalAccount = accounts[0]
        const msalUser: User = {
          id: msalAccount.localAccountId || msalAccount.homeAccountId || '',
          email: msalAccount.username || '',
          firstName: msalAccount.name?.split(' ')[0] || '',
          lastName: msalAccount.name?.split(' ').slice(1).join(' ') || '',
          role: 'user',
          provider: 'microsoft',
        }
        setUser(msalUser)
        setIsLoading(false)
        return
      }

      // Fallback to email/password token validation
      const token = localStorage.getItem('authToken')
      if (token) {
        const userData = await authApi.getProfile()
        setUser(userData)
      }
    } catch (error) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('msalAccount')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)
      localStorage.setItem('authToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setUser({ ...response.user, provider: 'email' })
      toast.success('Login successful!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    }
  }

  const loginWithMicrosoft = async () => {
    if (!isMicrosoftConfigured) {
      toast.error('Microsoft authentication is not configured')
      return
    }

    try {
      // This will be handled by the MicrosoftLoginButton component
      // We just need to ensure the context is ready
      toast.success('Redirecting to Microsoft login...')
    } catch (error: any) {
      toast.error('Microsoft login failed')
      throw error
    }
  }

  const register = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => {
    try {
      const response = await authApi.register(userData)
      localStorage.setItem('authToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setUser({ ...response.user, provider: 'email' })
      toast.success('Registration successful!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    }
  }

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('msalAccount')
    
    // Clear MSAL cache if configured
    if (isMicrosoftConfigured && accounts.length > 0) {
      instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      })
    }
    
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await authApi.updateProfile(userData)
      setUser(response.user)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profile update failed')
      throw error
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
    isAuthenticated: !!user,
    loginWithMicrosoft,
    isMicrosoftConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
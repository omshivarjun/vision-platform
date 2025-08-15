import React from 'react'
import { motion } from 'framer-motion'
import { useMsal } from '@azure/msal-react'
import { loginRequest } from '../auth/msalConfig'
import { isMsalConfigured, msalErrorMessages } from '../auth/msalConfig'
import toast from 'react-hot-toast'

interface MicrosoftLoginButtonProps {
  onLoginSuccess?: (user: any) => void
  onLoginError?: (error: any) => void
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export default function MicrosoftLoginButton({
  onLoginSuccess,
  onLoginError,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
}: MicrosoftLoginButtonProps) {
  const { instance } = useMsal()

  const handleMicrosoftLogin = async () => {
    if (!isMsalConfigured()) {
      toast.error(msalErrorMessages.notConfigured)
      return
    }

    try {
      const response = await instance.loginPopup(loginRequest)
      
      if (response) {
        // Extract user information from the response
        const user = {
          id: response.account?.localAccountId || response.account?.homeAccountId,
          email: response.account?.username || '',
          firstName: response.account?.name?.split(' ')[0] || '',
          lastName: response.account?.name?.split(' ').slice(1).join(' ') || '',
          role: 'user' as const,
          provider: 'microsoft',
          accessToken: response.accessToken,
          idToken: response.idToken,
        }

        // Store tokens
        localStorage.setItem('authToken', response.accessToken)
        localStorage.setItem('refreshToken', response.idToken)
        localStorage.setItem('msalAccount', JSON.stringify(response.account))

        toast.success('Successfully logged in with Microsoft! 🎉')
        
        if (onLoginSuccess) {
          onLoginSuccess(user)
        }
      }
    } catch (error: any) {
      console.error('Microsoft login error:', error)
      
      let errorMessage = msalErrorMessages.loginFailed
      
      if (error.errorCode === 'popup_window_error') {
        errorMessage = 'Popup blocked. Please allow popups for this site and try again.'
      } else if (error.errorCode === 'user_cancelled') {
        errorMessage = 'Login was cancelled by the user.'
      } else if (error.errorCode === 'network_error') {
        errorMessage = msalErrorMessages.networkError
      } else if (error.errorMessage) {
        errorMessage = error.errorMessage
      }

      toast.error(errorMessage)
      
      if (onLoginError) {
        onLoginError(error)
      }
    }
  }

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
    }
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleMicrosoftLogin}
      disabled={disabled || !isMsalConfigured()}
      className={getButtonClasses()}
      aria-label="Sign in with Microsoft"
    >
      {/* Microsoft Logo */}
      <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
          <path d="M0 0h10v10H0z" fill="#F25022"/>
          <path d="M11 0h10v10H11z" fill="#7FBA00"/>
          <path d="M0 11h10v10H0z" fill="#00A4EF"/>
          <path d="M11 11h10v10H11z" fill="#FFB900"/>
        </g>
      </svg>
      
      <span>Sign in with Microsoft</span>
    </motion.button>
  )
}

// Hook for using Microsoft authentication
export function useMicrosoftAuth() {
  const { instance, accounts } = useMsal()

  const getMicrosoftUser = () => {
    if (accounts.length > 0) {
      const account = accounts[0]
      return {
        id: account.localAccountId || account.homeAccountId,
        email: account.username || '',
        name: account.name || '',
        provider: 'microsoft',
      }
    }
    return null
  }

  const logout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: window.location.origin,
    })
    
    // Clear local storage
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('msalAccount')
    
    toast.success('Logged out successfully')
  }

  const getAccessToken = async () => {
    try {
      const response = await instance.acquireTokenSilent({
        scopes: ['User.Read', 'email', 'profile', 'openid'],
        account: accounts[0],
      })
      return response.accessToken
    } catch (error) {
      console.error('Failed to acquire token silently:', error)
      return null
    }
  }

  return {
    user: getMicrosoftUser(),
    logout,
    getAccessToken,
    isAuthenticated: accounts.length > 0,
  }
}

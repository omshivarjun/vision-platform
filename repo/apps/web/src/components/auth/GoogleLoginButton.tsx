import React from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface GoogleLoginButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

export function GoogleLoginButton({ 
  onSuccess, 
  onError, 
  disabled = false 
}: GoogleLoginButtonProps) {
  const handleGoogleLogin = async () => {
    try {
      // Check if Google OAuth is properly configured
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Google OAuth not configured. Please contact support.');
      }

      // Initialize Google OAuth (this would need proper Google Identity Services setup)
      if (typeof window !== 'undefined' && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            toast.success('Google login successful!');
            onSuccess?.(response);
          },
        });
        
        (window as any).google.accounts.id.prompt();
      } else {
        throw new Error('Google Identity Services not loaded');
      }
    } catch (error: any) {
      console.error('Google login failed:', error);
      
      // Provide helpful error message
      if (error.message.includes('not configured')) {
        toast.error('Google login is temporarily unavailable. Please use Microsoft login or contact support.');
      } else {
        toast.error('Google login failed. Please try Microsoft login instead.');
      }
      
      onError?.(error);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGoogleLogin}
      disabled={disabled}
      className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Sign in with Google"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Continue with Google</span>
    </motion.button>
  );
}
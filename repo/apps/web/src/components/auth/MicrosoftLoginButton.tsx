import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../auth/msalConfig';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface MicrosoftLoginButtonProps {
  onSuccess?: (account: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

export function MicrosoftLoginButton({ 
  onSuccess, 
  onError, 
  disabled = false 
}: MicrosoftLoginButtonProps) {
  const { instance } = useMsal();

  const handleMicrosoftLogin = async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      
      if (response.account) {
        toast.success('Microsoft login successful!');
        onSuccess?.(response.account);
      }
    } catch (error: any) {
      console.error('Microsoft login failed:', error);
      toast.error('Microsoft login failed. Please try again.');
      onError?.(error);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleMicrosoftLogin}
      disabled={disabled}
      className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Sign in with Microsoft"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
      </svg>
      <span>Continue with Microsoft</span>
    </motion.button>
  );
}
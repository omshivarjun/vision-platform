import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { DNDProvider } from './contexts/DNDContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Components
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { AccessibilityAnnouncer } from './components/AccessibilityAnnouncer'

// Pages
import { HomePage } from './pages/HomePage'
import TranslationPage from './pages/TranslationPage'
import DocumentReaderPage from './pages/DocumentReaderPage'
import GeminiAssistantPage from './pages/GeminiAssistantPage'
import AnalyticsPage from './pages/AnalyticsPage'
import PaymentPage from './pages/PaymentPage'
import ProfilePage from './pages/ProfilePage'

import { AccessibilityPage } from './pages/AccessibilityPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WorkspacePage from './pages/WorkspacePage'
import MediaProcessingPage from './pages/MediaProcessingPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DNDProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/translation" element={<TranslationPage />} />
              <Route path="/documents" element={<DocumentReaderPage />} />
              <Route path="/assistant" element={<GeminiAssistantPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/media-processing" element={<MediaProcessingPage />} />
            </Routes>
          </main>
          <Footer />
          
          {/* Accessibility Announcer for screen readers */}
          <AccessibilityAnnouncer />
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: '1.4',
                maxWidth: '400px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
                style: {
                  background: '#065f46',
                  color: '#fff',
                  borderLeft: '4px solid #10B981',
                }
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
                style: {
                  background: '#7f1d1d',
                  color: '#fff',
                  borderLeft: '4px solid #EF4444',
                  fontWeight: '500',
                }
              },
              loading: {
                style: {
                  background: '#1e40af',
                  color: '#fff',
                  borderLeft: '4px solid #3b82f6',
                }
              }
            }}
            containerStyle={{
              top: 20,
              right: 20,
            }}
            gutter={8}
          />
        </div>
      </DNDProvider>
    </QueryClientProvider>
  )
}

export default App
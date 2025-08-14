import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

// Import all working components
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { GeminiAssistantPage } from './pages/GeminiAssistantPage'
import { DocumentReaderPage } from './pages/DocumentReaderPage'
import { VoiceAssistantPage } from './pages/VoiceAssistantPage'
import AnalyticsPage from './pages/AnalyticsPage'
import LoginPage from './pages/LoginPage'

// Create Query Client for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gemini-assistant" element={<GeminiAssistantPage />} />
            <Route path="/document-reader" element={<DocumentReaderPage />} />
            <Route path="/voice-assistant" element={<VoiceAssistantPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </QueryClientProvider>
  )
}

export default App
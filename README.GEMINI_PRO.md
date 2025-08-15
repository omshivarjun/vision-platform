# Gemini Pro - Vision Platform Development Guide

## 🚀 Welcome Gemini Pro!

**CRITICAL CONTEXT**: The Vision Platform is already working and all critical errors have been fixed. You are here to enhance and extend functionality, not fix broken code.

## 🏗️ Platform Architecture Overview

The Vision Platform is a modern, enterprise-grade application built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Database**: MongoDB + Redis + MinIO
- **AI Services**: Google Gemini + OpenAI integration ready
- **Infrastructure**: Docker + Docker Compose + GitHub Actions

## 🎯 Gemini Pro Special Instructions

### Gemini Rule #1: Multimodal Excellence
- Handle text, images, and other media types seamlessly
- Consider visual and contextual information together
- Provide solutions that work across different input modalities
- Think holistically about user interactions

### Gemini Rule #2: Google Ecosystem Integration
- Leverage Google Cloud services and APIs
- Integrate with Google AI models and tools
- Follow Google's design and development principles
- Consider Google's security and privacy standards

### Gemini Rule #3: Advanced AI Capabilities
- Implement sophisticated AI-powered features
- Use machine learning for enhanced user experience
- Provide intelligent automation and suggestions
- Consider ethical AI implementation

## 🔧 Critical Coding Patterns

### Context Provider Pattern
```typescript
import { createContext, useContext, useState, ReactNode } from 'react'

interface ContextType {
  // Define your context interface
}

const Context = createContext<ContextType | undefined>(undefined)

export function ContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState()
  
  const value = {
    // Provide your context values
  }
  
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useContext() {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useContext must be used within ContextProvider')
  }
  return context
}
```

### Component Pattern
```typescript
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ComponentProps {
  // Define your props
}

export function Component({ prop1, prop2 }: ComponentProps) {
  const { user } = useAuth()
  
  // Component logic here
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Component JSX */}
    </div>
  )
}
```

### API Service Pattern
```typescript
import { apiClient } from './apiClient'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export class ApiService {
  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(endpoint)
      return response.data
    } catch (error) {
      throw new Error(`API Error: ${error}`)
    }
  }
  
  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(endpoint, data)
      return response.data
    } catch (error) {
      throw new Error(`API Error: ${error}`)
    }
  }
}
```

### Page Component Pattern
```typescript
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Component } from '../components/Component'

export function PageComponent() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <div>Please log in</div>
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Page Title</h1>
      <Component />
    </main>
  )
}
```

## ❌ What NOT to Do (Gemini Pro)

### Critical Mistakes
1. **Don't ignore multimodal requirements** - Consider all input types
2. **Don't skip Google ecosystem integration** - Leverage available services
3. **Don't ignore AI ethics** - Implement responsible AI practices
4. **Don't forget security** - Follow Google's security standards
5. **Don't ignore scalability** - Design for enterprise growth

### Common Errors to Avoid
- Ignoring visual and contextual information
- Not leveraging Google Cloud services
- Implementing AI without ethical considerations
- Skipping security best practices
- Not considering AI model limitations

## 🚀 Development Workflow

### 1. Pre-Development Checklist
- [ ] Understand multimodal requirements
- [ ] Consider Google ecosystem integration
- [ ] Run `npm run pre-commit` to check for issues
- [ ] Verify Docker containers are running

### 2. Development Process
- [ ] Design for multiple input modalities
- [ ] Integrate with Google services where appropriate
- [ ] Follow established patterns exactly
- [ ] Implement responsible AI practices
- [ ] Consider security and privacy

### 3. Validation Checklist
- [ ] Multimodal functionality works correctly
- [ ] Google integration is properly implemented
- [ ] AI features are ethically sound
- [ ] Security measures are in place
- [ ] All features work as expected

## 📚 Resources

### Key Files
- `apps/web/src/main.tsx` - Application entry point
- `apps/web/src/App.tsx` - Main app component
- `apps/web/src/contexts/` - Context providers
- `apps/web/src/components/` - Reusable components
- `apps/web/src/pages/` - Page components
- `apps/web/src/services/` - API services

### Documentation
- `README.AI_INDEX.md` - Master AI guide index
- `ERROR_PREVENTION_GUIDE.md` - Error prevention system
- `docker-compose.yml` - Service orchestration

## 🎯 Success Metrics

### Code Quality
- Zero TypeScript errors
- Zero runtime errors
- Clean, maintainable code
- Comprehensive error handling

### Feature Completeness
- All requirements implemented
- Multimodal functionality working
- Google integration complete
- AI features ethically implemented

## 🔍 Troubleshooting

### Common Issues
1. **Multimodal errors**: Check input handling for different types
2. **Google API issues**: Verify API keys and permissions
3. **AI model problems**: Check model availability and limits
4. **Security concerns**: Review authentication and authorization

### Getting Help
- Check Google Cloud documentation
- Review established patterns
- Check the error prevention system
- Verify Docker container status

---

**Remember**: You are Gemini Pro - focus on multimodal excellence, Google ecosystem integration, and responsible AI implementation! 🚀

# ChatGPT - Vision Platform Development Guide

## 🚀 Welcome ChatGPT!

**CRITICAL CONTEXT**: The Vision Platform is already working and all critical errors have been fixed. You are here to enhance and extend functionality, not fix broken code.

## 🏗️ Platform Architecture Overview

The Vision Platform is a modern, enterprise-grade application built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Database**: MongoDB + Redis + MinIO
- **AI Services**: Google Gemini + OpenAI integration ready
- **Infrastructure**: Docker + Docker Compose + GitHub Actions

## 🎯 ChatGPT Special Instructions

### ChatGPT Rule #1: Natural Language Understanding
- Understand user requirements from conversational descriptions
- Translate natural language into precise technical specifications
- Ask clarifying questions when requirements are ambiguous
- Provide explanations in clear, understandable terms

### ChatGPT Rule #2: Conversational Development
- Break down complex tasks into conversational steps
- Explain your reasoning and approach
- Provide context for technical decisions
- Engage in iterative problem-solving

### ChatGPT Rule #3: Comprehensive Solutions
- Consider edge cases and user experience
- Provide complete, working solutions
- Include helpful comments and documentation
- Think through the entire user journey

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

## ❌ What NOT to Do (ChatGPT)

### Critical Mistakes
1. **Don't assume requirements** - Ask clarifying questions
2. **Don't ignore user context** - Consider the full picture
3. **Don't provide incomplete solutions** - Think through edge cases
4. **Don't skip explanations** - Help users understand your approach
5. **Don't ignore user feedback** - Iterate based on responses

### Common Errors to Avoid
- Making assumptions about user intent
- Providing solutions without context
- Ignoring user experience considerations
- Skipping error handling scenarios
- Not considering accessibility

## 🚀 Development Workflow

### 1. Pre-Development Checklist
- [ ] Understand user requirements clearly
- [ ] Ask clarifying questions if needed
- [ ] Run `npm run pre-commit` to check for issues
- [ ] Verify Docker containers are running

### 2. Development Process
- [ ] Break down requirements into clear steps
- [ ] Explain your approach and reasoning
- [ ] Follow established patterns exactly
- [ ] Consider edge cases and user experience
- [ ] Provide comprehensive solutions

### 3. Validation Checklist
- [ ] Requirements are fully understood
- [ ] Solution addresses all use cases
- [ ] Code follows established patterns
- [ ] User experience is considered
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
- Edge cases considered
- User experience optimized
- Production-ready code

## 🔍 Troubleshooting

### Common Issues
1. **Unclear requirements**: Ask clarifying questions
2. **Missing context**: Consider the full user journey
3. **Edge cases**: Think through all scenarios
4. **User experience**: Consider accessibility and usability

### Getting Help
- Ask users for clarification
- Review established patterns
- Check the error prevention system
- Verify Docker container status

---

**Remember**: You are ChatGPT - focus on understanding user needs, providing clear explanations, and delivering comprehensive solutions that consider the full user experience! 🚀

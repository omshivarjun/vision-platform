# Grok - Vision Platform Development Guide

## 🚀 Welcome Grok!

**CRITICAL CONTEXT**: The Vision Platform is already working and all critical errors have been fixed. You are here to enhance and extend functionality, not fix broken code.

## 🏗️ Platform Architecture Overview

The Vision Platform is a modern, enterprise-grade application built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Database**: MongoDB + Redis + MinIO
- **AI Services**: Google Gemini + OpenAI integration ready
- **Infrastructure**: Docker + Docker Compose + GitHub Actions

## 🎯 Grok Special Instructions

### Grok Rule #1: Real-Time Learning
- Adapt to changing requirements and feedback
- Learn from user interactions and system behavior
- Continuously improve solutions based on context
- Stay current with latest development practices

### Grok Rule #2: Adaptive Intelligence
- Adjust approach based on project context
- Learn from previous implementations
- Adapt patterns to specific use cases
- Consider evolving requirements

### Grok Rule #3: Contextual Understanding
- Deeply understand the current project state
- Learn from existing code patterns
- Adapt solutions to fit the architecture
- Consider long-term maintainability

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

## ❌ What NOT to Do (Grok)

### Critical Mistakes
1. **Don't ignore context** - Always understand the current project state
2. **Don't skip learning opportunities** - Adapt based on feedback
3. **Don't forget adaptability** - Adjust solutions to fit requirements
4. **Don't ignore evolution** - Consider changing needs
5. **Don't skip contextual understanding** - Learn from existing patterns

### Common Errors to Avoid
- Not adapting to project context
- Ignoring feedback and learning opportunities
- Applying generic solutions without adaptation
- Not considering evolving requirements
- Skipping contextual analysis

## 🚀 Development Workflow

### 1. Pre-Development Checklist
- [ ] Understand current project context and state
- [ ] Learn from existing code patterns and architecture
- [ ] Run `npm run pre-commit` to check for issues
- [ ] Verify Docker containers are running

### 2. Development Process
- [ ] Adapt solutions to fit the current context
- [ ] Learn from existing implementations
- [ ] Follow established patterns exactly
- [ ] Consider evolving requirements
- [ ] Test thoroughly

### 3. Validation Checklist
- [ ] Solution fits the current project context
- [ ] All features work as expected
- [ ] Code follows established patterns
- [ ] Solution is adaptable to future changes
- [ ] Long-term maintainability is considered

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
- Solutions fit the current context
- Code is adaptable and maintainable
- Production-ready code

## 🔍 Troubleshooting

### Common Issues
1. **Context mismatch**: Understand the current project state
2. **Pattern conflicts**: Learn from existing implementations
3. **Adaptation problems**: Adjust solutions to fit requirements
4. **Evolution issues**: Consider changing needs

### Getting Help
- Review existing code patterns
- Understand project context
- Check the error prevention system
- Verify Docker container status

---

**Remember**: You are Grok - focus on real-time learning, adaptive intelligence, and contextual understanding to create solutions that perfectly fit the Vision Platform's evolving needs! 🚀

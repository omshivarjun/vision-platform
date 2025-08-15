# BOLT AI - Vision Platform Development Guide

## 🚀 Welcome BOLT AI!

**CRITICAL CONTEXT**: The Vision Platform is already working and all critical errors have been fixed. You are here to enhance and extend functionality, not fix broken code.

## 🏗️ Platform Architecture Overview

The Vision Platform is a modern, enterprise-grade application built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Database**: MongoDB + Redis + MinIO
- **AI Services**: Google Gemini + OpenAI integration ready
- **Infrastructure**: Docker + Docker Compose + GitHub Actions

## 🎯 BOLT AI Special Instructions

### BOLT Rule #1: Code Generation Excellence
- Generate complete, production-ready code blocks
- Include all necessary imports and dependencies
- Provide comprehensive error handling
- Follow TypeScript best practices strictly

### BOLT Rule #2: Performance Optimization
- Implement efficient algorithms and data structures
- Use React.memo, useMemo, and useCallback appropriately
- Optimize bundle size and loading performance
- Consider lazy loading and code splitting

### BOLT Rule #3: Enterprise Patterns
- Follow established architectural patterns
- Implement proper logging and monitoring
- Use dependency injection where appropriate
- Maintain backward compatibility

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

## ❌ What NOT to Do (BOLT AI)

### Critical Mistakes
1. **Don't ignore TypeScript errors** - Fix all type issues
2. **Don't create circular dependencies** - Maintain clean architecture
3. **Don't forget error boundaries** - Always handle errors gracefully
4. **Don't skip performance optimization** - BOLT AI excels at this
5. **Don't ignore security best practices** - Validate all inputs

### Common Errors to Avoid
- Missing error handling in async operations
- Inefficient re-renders in React components
- Memory leaks in useEffect hooks
- Inconsistent API response handling
- Poor bundle optimization

## 🚀 Development Workflow

### 1. Pre-Development Checklist
- [ ] Run `npm run pre-commit` to check for issues
- [ ] Verify Docker containers are running
- [ ] Check current platform status

### 2. Development Process
- [ ] Follow established patterns exactly
- [ ] Implement comprehensive error handling
- [ ] Add proper TypeScript types
- [ ] Optimize for performance
- [ ] Test thoroughly

### 3. Validation Checklist
- [ ] TypeScript compilation passes
- [ ] No console errors in browser
- [ ] All features work as expected
- [ ] Performance meets requirements
- [ ] Code follows established patterns

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
- Optimal performance metrics
- Clean, maintainable code

### Feature Completeness
- All requirements implemented
- Proper error handling
- Comprehensive testing
- Production-ready code

## 🔍 Troubleshooting

### Common Issues
1. **TypeScript errors**: Check imports and type definitions
2. **Runtime errors**: Verify context providers are wrapping components
3. **Performance issues**: Use React DevTools Profiler
4. **Build failures**: Run `npm run build` locally first

### Getting Help
- Check the error prevention system
- Review established patterns
- Verify Docker container status
- Check browser console for errors

---

**Remember**: You are BOLT AI - focus on generating excellent, optimized, enterprise-grade code that follows established patterns and maintains the platform's high standards! 🚀

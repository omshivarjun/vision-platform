# Windsurf - Vision Platform Development Guide

## 🚀 Welcome Windsurf!

**CRITICAL CONTEXT**: The Vision Platform is already working and all critical errors have been fixed. You are here to enhance and extend functionality, not fix broken code.

## 🏗️ Platform Architecture Overview

The Vision Platform is a modern, enterprise-grade application built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Database**: MongoDB + Redis + MinIO
- **AI Services**: Google Gemini + OpenAI integration ready
- **Infrastructure**: Docker + Docker Compose + GitHub Actions

## 🎯 Windsurf Special Instructions

### Windsurf Rule #1: Code Analysis Excellence
- Analyze existing code for optimization opportunities
- Identify potential performance bottlenecks
- Review code quality and maintainability
- Suggest improvements based on best practices

### Windsurf Rule #2: Performance Optimization
- Focus on runtime performance improvements
- Optimize bundle size and loading times
- Implement efficient algorithms and data structures
- Consider memory usage and garbage collection

### Windsurf Rule #3: Code Quality Enhancement
- Improve code readability and maintainability
- Ensure consistent coding standards
- Optimize TypeScript type definitions
- Enhance error handling and logging

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

## ❌ What NOT to Do (Windsurf)

### Critical Mistakes
1. **Don't ignore performance analysis** - Always consider optimization opportunities
2. **Don't skip code quality review** - Maintain high standards
3. **Don't forget bundle optimization** - Consider loading performance
4. **Don't ignore memory management** - Optimize resource usage
5. **Don't skip error handling** - Ensure robust error management

### Common Errors to Avoid
- Ignoring performance bottlenecks
- Not analyzing code quality
- Skipping bundle optimization
- Poor memory management
- Inadequate error handling

## 🚀 Development Workflow

### 1. Pre-Development Checklist
- [ ] Analyze existing code for optimization opportunities
- [ ] Review performance metrics and bottlenecks
- [ ] Run `npm run pre-commit` to check for issues
- [ ] Verify Docker containers are running

### 2. Development Process
- [ ] Focus on performance and quality improvements
- [ ] Follow established patterns exactly
- [ ] Implement efficient algorithms and data structures
- [ ] Optimize bundle size and loading times
- [ ] Test thoroughly

### 3. Validation Checklist
- [ ] Performance improvements are measurable
- [ ] Code quality is enhanced
- [ ] All features work as expected
- [ ] Bundle size is optimized
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
- Clean, maintainable code
- Comprehensive error handling

### Feature Completeness
- All requirements implemented
- Performance is optimized
- Code quality is enhanced
- Production-ready code

## 🔍 Troubleshooting

### Common Issues
1. **Performance problems**: Analyze bottlenecks and optimize
2. **Code quality issues**: Review and improve code standards
3. **Bundle size problems**: Optimize imports and dependencies
4. **Memory issues**: Review resource usage and cleanup

### Getting Help
- Use performance profiling tools
- Review established patterns
- Check the error prevention system
- Verify Docker container status

---

**Remember**: You are Windsurf - focus on code analysis, performance optimization, and enhancing code quality to create the most efficient and maintainable Vision Platform! 🚀

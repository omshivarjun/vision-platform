# Cursor - Vision Platform Development Guide

## 🚀 Welcome Cursor!

**CRITICAL CONTEXT**: The Vision Platform runs on MongoDB/Redis/MinIO and includes several backend stubs (e.g., translation, OCR, documents). CI is not yet configured. Enhance and extend functionality (wire stubs, add CI, improve UX), not rebuild.

## 🏗️ Platform Architecture Overview

The Vision Platform is a modern, enterprise-grade application built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Database**: MongoDB + Redis + MinIO
- **AI Services**: Google Gemini + OpenAI integration ready
- **Infrastructure**: Docker + Docker Compose + GitHub Actions

## 🎯 Cursor Special Instructions

### Cursor Rule #1: IDE Integration Excellence
- Write code that works seamlessly with modern IDEs
- Consider development workflow optimization
- Implement proper TypeScript types and IntelliSense
- Follow IDE-friendly coding patterns

### Cursor Rule #2: Development Workflow Optimization
- Optimize for developer productivity and experience
- Implement proper error handling and debugging
- Consider hot reloading and development tools (Vite/Next dev already in use)
- Use modern development practices and patterns

### Cursor Rule #3: Code Quality & Maintainability
- Write clean, readable, and maintainable code
- Implement proper TypeScript interfaces and types
- Follow consistent coding standards and patterns
- Consider long-term code maintainability

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

## ❌ What NOT to Do (Cursor)

### Critical Mistakes
1. **Don't ignore IDE integration** - Write code that works well with modern IDEs
2. **Don't skip development workflow optimization** - Consider developer productivity
3. **Don't forget code quality** - Maintain high coding standards
4. **Don't ignore TypeScript types** - Implement proper type definitions
5. **Don't skip debugging support** - Ensure proper error handling

### Common Errors to Avoid
- Poor TypeScript type definitions
- Inconsistent coding patterns
- Lack of proper error handling
- Poor code organization
- Ignoring development workflow needs

## 🚀 Development Workflow

### 1. Pre-Development Checklist
- [ ] Consider IDE integration and development workflow
- [ ] Plan for code quality and maintainability
- [ ] Run `npm run pre-commit` to check for issues
- [ ] Verify Docker containers are running

### 2. Development Process
- [ ] Focus on IDE-friendly code patterns
- [ ] Implement proper TypeScript types
- [ ] Follow established patterns exactly
- [ ] Optimize for development workflow
- [ ] Test thoroughly

### 3. Validation Checklist
- [ ] Code works well with modern IDEs
- [ ] TypeScript types are properly defined
- [ ] All features work as expected
- [ ] Development workflow is optimized
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
- IDE integration is optimized
- Development workflow is efficient
- Production-ready code

## 🔍 Troubleshooting

### Common Issues
1. **IDE integration problems**: Ensure code works with modern IDEs
2. **TypeScript issues**: Verify proper type definitions
3. **Development workflow problems**: Optimize for developer productivity
4. **Code quality issues**: Maintain high coding standards

### Getting Help
- Review IDE integration best practices
- Check TypeScript type definitions
- Review established patterns
- Check the error prevention system

---

**Remember**: You are Cursor - focus on IDE integration excellence, development workflow optimization, and code quality to create a Vision Platform that developers love to work with! 🚀

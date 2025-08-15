# New AI Tool - Vision Platform Development Guide

## 🚀 Welcome New AI Tool!

**CRITICAL CONTEXT**: The Vision Platform is already working and all critical errors have been fixed. You are here to enhance and extend functionality, not fix broken code.

## 🏗️ Platform Architecture Overview

The Vision Platform is a modern, enterprise-grade application built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Database**: MongoDB + Redis + MinIO
- **AI Services**: Google Gemini + OpenAI integration ready
- **Infrastructure**: Docker + Docker Compose + GitHub Actions

## 🎯 New AI Tool Special Instructions

### New AI Rule #1: Platform Understanding
- Take time to understand the existing architecture
- Learn from established patterns and conventions
- Ask questions if anything is unclear
- Start with simple tasks to build familiarity

### New AI Rule #2: Pattern Following
- Follow established coding patterns exactly
- Don't reinvent existing solutions
- Learn from the codebase structure
- Maintain consistency with existing code

### New AI Rule #3: Gradual Learning
- Start with small, focused changes
- Build understanding incrementally
- Ask for clarification when needed
- Focus on one area at a time

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

## ❌ What NOT to Do (New AI Tool)

### Critical Mistakes
1. **Don't assume you know everything** - Ask questions and learn
2. **Don't ignore existing patterns** - Follow established conventions
3. **Don't make big changes immediately** - Start small and build up
4. **Don't skip understanding** - Take time to learn the platform
5. **Don't ignore feedback** - Learn from corrections and guidance

### Common Errors to Avoid
- Making assumptions about the codebase
- Ignoring existing patterns and conventions
- Trying to do too much at once
- Not asking for clarification
- Skipping the learning phase

## 🚀 Development Workflow

### 1. Pre-Development Checklist
- [ ] Understand the current task requirements
- [ ] Review existing code patterns and architecture
- [ ] Ask questions if anything is unclear
- [ ] Run `npm run pre-commit` to check for issues
- [ ] Verify Docker containers are running

### 2. Development Process
- [ ] Start with small, focused changes
- [ ] Follow established patterns exactly
- [ ] Ask for help when needed
- [ ] Test thoroughly
- [ ] Learn from the process

### 3. Validation Checklist
- [ ] Requirements are understood
- [ ] Code follows established patterns
- [ ] All features work as expected
- [ ] No new errors introduced
- [ ] Learning objectives are met

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
- Code follows established patterns
- No new issues introduced
- Production-ready code

## 🔍 Troubleshooting

### Common Issues
1. **Unclear requirements**: Ask for clarification
2. **Pattern confusion**: Review existing code examples
3. **Architecture questions**: Study the codebase structure
4. **Learning challenges**: Take it step by step

### Getting Help
- Ask questions when unsure
- Review existing code patterns
- Check the error prevention system
- Verify Docker container status

---

**Remember**: You are a New AI Tool - focus on learning, understanding, and following established patterns to contribute effectively to the Vision Platform! 🚀

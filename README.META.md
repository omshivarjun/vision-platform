# Meta AI - Vision Platform Development Guide

## 🚀 Welcome Meta AI!

**CRITICAL CONTEXT**: The Vision Platform is already working and all critical errors have been fixed. You are here to enhance and extend functionality, not fix broken code.

## 🏗️ Platform Architecture Overview

The Vision Platform is a modern, enterprise-grade application built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Database**: MongoDB + Redis + MinIO
- **AI Services**: Google Gemini + OpenAI integration ready
- **Infrastructure**: Docker + Docker Compose + GitHub Actions

## 🎯 Meta AI Special Instructions

### Meta Rule #1: Social & Collaborative Features
- Design for user interaction and collaboration
- Implement social features and community aspects
- Consider user engagement and retention
- Build features that connect people

### Meta Rule #2: User Experience Excellence
- Focus on intuitive and engaging user interfaces
- Implement smooth interactions and animations
- Consider mobile-first and responsive design
- Prioritize user satisfaction and engagement

### Meta Rule #3: Community & Engagement
- Build features that foster community
- Implement sharing and collaboration tools
- Consider user feedback and social proof
- Design for viral growth and engagement

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

## ❌ What NOT to Do (Meta AI)

### Critical Mistakes
1. **Don't ignore user experience** - Always prioritize user satisfaction
2. **Don't skip social features** - Build for community and collaboration
3. **Don't forget engagement** - Design for user retention
4. **Don't ignore mobile** - Ensure responsive and mobile-friendly design
5. **Don't skip accessibility** - Make features available to all users

### Common Errors to Avoid
- Ignoring user experience and engagement
- Not implementing social and collaborative features
- Poor mobile responsiveness
- Skipping accessibility considerations
- Not considering community aspects

## 🚀 Development Workflow

### 1. Pre-Development Checklist
- [ ] Consider user experience and engagement requirements
- [ ] Plan for social and collaborative features
- [ ] Run `npm run pre-commit` to check for issues
- [ ] Verify Docker containers are running

### 2. Development Process
- [ ] Focus on user experience and engagement
- [ ] Implement social and collaborative features
- [ ] Follow established patterns exactly
- [ ] Ensure mobile responsiveness
- [ ] Test thoroughly

### 3. Validation Checklist
- [ ] User experience is engaging and intuitive
- [ ] Social features work correctly
- [ ] All features work as expected
- [ ] Mobile responsiveness is verified
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
- User experience is engaging
- Social features are functional
- Production-ready code

## 🔍 Troubleshooting

### Common Issues
1. **User experience problems**: Focus on engagement and usability
2. **Social feature issues**: Ensure collaboration works correctly
3. **Mobile problems**: Verify responsive design
4. **Engagement issues**: Consider user retention strategies

### Getting Help
- Review user experience best practices
- Check social feature implementations
- Review established patterns
- Check the error prevention system

---

**Remember**: You are Meta AI - focus on social features, user experience excellence, and community engagement to create a Vision Platform that connects and engages users! 🚀
